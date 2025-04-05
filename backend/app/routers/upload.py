from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import JSONResponse
import uuid
import shutil
from pathlib import Path
from typing import Dict, List, Any

from app.services.infracost_service import InfracostService
from app.dependencies import get_infracost_service

# Create router
router = APIRouter(tags=["upload"])

@router.post("/upload")
async def upload_terraform(file: UploadFile = File(...), 
                         infracost_service: InfracostService = Depends(get_infracost_service)):
    """Upload and process a Terraform file to estimate costs"""
    uid = str(uuid.uuid4())
    extract_path = infracost_service.upload_dir / uid
    extract_path.mkdir(parents=True, exist_ok=True)

    zip_path = extract_path / file.filename
    try:
        # First save the uploaded file
        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Process the file with the service
        resources, _ = infracost_service.process_terraform_file(zip_path, extract_path)
        return {"uid": uid, "cost_breakdown": resources}
                
    except ValueError as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Unexpected error", "details": str(e)})
    finally:
        # Clean up temporary files
        if extract_path.exists():
            shutil.rmtree(extract_path, ignore_errors=True)

@router.get("/download/{uid}")
async def download_estimate(uid: str, 
                         format: str = "json", 
                         infracost_service: InfracostService = Depends(get_infracost_service)):
    """Download a saved cost estimate by its UID"""
    try:
        data = infracost_service.get_estimate(uid)
        
        if format == "csv":
            import csv
            from io import StringIO
            output = StringIO()
            writer = csv.DictWriter(output, fieldnames=["name", "resource_type", "monthlyCost"])
            writer.writeheader()
            for r in data:
                writer.writerow({
                    "name": r.get("name"), 
                    "resource_type": r.get("resource_type"), 
                    "monthlyCost": r.get("monthlyCost")
                })
            return JSONResponse(content=output.getvalue(), media_type="text/csv")

        return JSONResponse(content=data)
        
    except FileNotFoundError:
        return JSONResponse(status_code=404, content={"error": "Estimate not found"})

@router.get("/compare")
async def compare_estimates(baseline: str, 
                        proposed: str, 
                        infracost_service: InfracostService = Depends(get_infracost_service)):
    """Compare two cost estimates and return differences"""
    try:
        return infracost_service.compare_estimates(baseline, proposed)
    except FileNotFoundError:
        return JSONResponse(status_code=404, content={"error": "One or both estimates not found"})

@router.post("/compare-adjusted")
async def compare_adjusted(uid: str, 
                        current: list, 
                        infracost_service: InfracostService = Depends(get_infracost_service)):
    """Compare with adjustments applied to the resources"""
    try:
        # Get the previous estimate path
        prev_path = infracost_service.upload_dir / uid / "previous_estimate.json"
        if not prev_path.exists():
            return JSONResponse(status_code=404, content={"error": "No previous estimate available"})

        # Load previous data
        with open(prev_path) as f:
            import json
            previous = {r["name"]: r for r in json.load(f)}

        # Process current data
        current_map = {r["name"]: r for r in current}

        # Calculate differences
        added = [r for k, r in current_map.items() if k not in previous]
        removed = [r for k, r in previous.items() if k not in current_map]
        changed = []
        for name in current_map:
            if name in previous:
                cur_cost = float(current_map[name].get("monthlyCost", 0))
                prev_cost = float(previous[name].get("monthlyCost", 0))
                if cur_cost != prev_cost:
                    changed.append({"name": name, "from": prev_cost, "to": cur_cost})

        # Calculate totals
        return {
            "added": added,
            "removed": removed,
            "changed": changed,
            "current_total": sum(float(r.get("monthlyCost", 0)) for r in current_map.values()),
            "previous_total": sum(float(r.get("monthlyCost", 0)) for r in previous.values())
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Unexpected error", "details": str(e)})
