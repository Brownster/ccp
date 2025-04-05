import subprocess
import json
import os
import zipfile
from pathlib import Path
from typing import Dict, List, Any, Tuple, Optional

class InfracostService:
    """
    Service for handling Infracost operations and Terraform cost estimations
    """
    def __init__(self, upload_dir: Path, api_key: str = None):
        self.upload_dir = upload_dir
        self.upload_dir.mkdir(exist_ok=True)
        self.api_key = api_key
    
    def process_terraform_file(self, 
                             file_path: Path, 
                             extract_path: Path) -> Tuple[List[Dict[str, Any]], str]:
        """
        Process a terraform file (zip or plan) and return the cost breakdown
        
        Args:
            file_path: Path to the uploaded file
            extract_path: Path where to extract contents (for zip files)
            
        Returns:
            Tuple of (resources list, uid string)
        """
        is_zip = file_path.suffix == ".zip"
        is_plan = file_path.suffix in [".json", ".tfplan"]

        if not (is_zip or is_plan):
            raise ValueError(f"Unsupported file type: {file_path.suffix}")

        if is_zip:
            self._extract_zip(file_path, extract_path)
            cmd = ["infracost", "breakdown", "--path", str(extract_path), "--format", "json"]
        else:  # is_plan
            cmd = ["infracost", "breakdown", "--path", str(file_path), 
                  "--terraform-plan-flags=--json", "--format", "json"]

        # Run infracost command
        output = subprocess.check_output(cmd)
        data = json.loads(output)

        # Validate and extract resources
        resources = self._extract_resources(data)
        
        # Save resources for future reference
        self._save_estimate(extract_path, resources)
        
        return resources, extract_path.name
    
    def _extract_zip(self, zip_path: Path, extract_path: Path) -> None:
        """
        Extract zip file and handle baseline estimates if present
        """
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
            # Check for existing estimate.json inside the ZIP and treat it as a baseline
            if 'estimate.json' in zip_ref.namelist():
                zip_ref.extract('estimate.json', extract_path)
                os.rename(extract_path / 'estimate.json', extract_path / 'previous_estimate.json')
    
    def _extract_resources(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract resources from infracost output data
        """
        projects = data.get("projects")
        if not projects:
            raise ValueError("No projects found in Infracost output")

        breakdown = projects[0].get("breakdown")
        if not breakdown:
            raise ValueError("No cost breakdown found for the project")

        return breakdown.get("resources", [])
    
    def _save_estimate(self, path: Path, resources: List[Dict[str, Any]]) -> None:
        """
        Save resources to estimate.json file
        """
        with open(path / "estimate.json", "w") as f:
            json.dump(resources, f, indent=2)
    
    def get_estimate(self, uid: str) -> List[Dict[str, Any]]:
        """
        Get saved estimate by uid
        """
        path = self.upload_dir / uid / "estimate.json"
        if not path.exists():
            raise FileNotFoundError(f"Estimate not found for uid: {uid}")
            
        with open(path) as f:
            return json.load(f)
    
    def compare_estimates(self, 
                        baseline_uid: str, 
                        proposed_uid: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Compare two estimates and return the differences
        """
        base_path = self.upload_dir / baseline_uid / "estimate.json"
        prop_path = self.upload_dir / proposed_uid / "estimate.json"
        
        if not base_path.exists() or not prop_path.exists():
            raise FileNotFoundError("One or both estimates not found")

        with open(base_path) as f:
            base_data = {r["name"]: r for r in json.load(f)}
        with open(prop_path) as f:
            prop_data = {r["name"]: r for r in json.load(f)}

        diff = {
            "increased": [],
            "decreased": [],
            "unchanged": [],
            "added": [],
            "removed": []
        }

        # Find changes in proposed compared to baseline
        for name, r in prop_data.items():
            old = base_data.get(name)
            new_cost = float(r.get("monthlyCost") or 0)
            if old:
                old_cost = float(old.get("monthlyCost") or 0)
                delta = new_cost - old_cost
                r["delta"] = round(delta, 2)
                if delta > 0:
                    diff["increased"].append(r)
                elif delta < 0:
                    diff["decreased"].append(r)
                else:
                    diff["unchanged"].append(r)
            else:
                r["delta"] = new_cost
                diff["added"].append(r)

        # Find removed resources
        for name, r in base_data.items():
            if name not in prop_data:
                removed = r.copy()
                removed["delta"] = -float(r.get("monthlyCost") or 0)
                diff["removed"].append(removed)

        return diff
