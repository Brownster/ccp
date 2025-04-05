"""
Service for managing usage templates.
"""
import os
import json
from pathlib import Path
from typing import Dict, List, Optional, Any

# Templates directory path
TEMPLATES_DIR = Path(__file__).parent.parent.parent / "templates" / "usage"

# Ensure templates directory exists
os.makedirs(TEMPLATES_DIR, exist_ok=True)

# Default templates
DEFAULT_TEMPLATES = [
    {
        "id": "dev-environment",
        "name": "Development Environment",
        "description": "Resources run during business hours (8 hours/day, weekdays)",
        "template": {
            "aws_instance": {"monthly_hours": 160},
            "aws_lambda_function": {"monthly_requests": 10000},
            "aws_s3_bucket": {"monthly_storage_gb": 5, "monthly_get_requests": 1000, "monthly_put_requests": 500},
            "aws_rds_instance": {"monthly_hours": 160, "storage_gb": 20}
        }
    },
    {
        "id": "prod-environment",
        "name": "Production Environment",
        "description": "24/7 operation with moderate traffic",
        "template": {
            "aws_instance": {"monthly_hours": 720},
            "aws_lambda_function": {"monthly_requests": 1000000},
            "aws_s3_bucket": {"monthly_storage_gb": 100, "monthly_get_requests": 100000, "monthly_put_requests": 50000},
            "aws_rds_instance": {"monthly_hours": 720, "storage_gb": 100}
        }
    },
    {
        "id": "high-traffic",
        "name": "High Traffic Application",
        "description": "24/7 operation with high traffic and usage",
        "template": {
            "aws_instance": {"monthly_hours": 720},
            "aws_lambda_function": {"monthly_requests": 10000000},
            "aws_s3_bucket": {"monthly_storage_gb": 500, "monthly_get_requests": 1000000, "monthly_put_requests": 500000},
            "aws_rds_instance": {"monthly_hours": 720, "storage_gb": 500}
        }
    }
]

def get_default_templates() -> List[Dict[str, Any]]:
    """
    Returns the list of default templates.
    """
    return DEFAULT_TEMPLATES

def get_custom_templates() -> List[Dict[str, Any]]:
    """
    Loads and returns all custom templates saved by users.
    """
    custom_templates = []
    
    try:
        # Get all JSON files in the templates directory
        template_files = list(TEMPLATES_DIR.glob("*.json"))
        
        for template_file in template_files:
            try:
                with open(template_file, "r") as f:
                    template_data = json.load(f)
                    # Ensure the template has the required fields
                    if all(key in template_data for key in ["id", "name", "description", "template"]):
                        custom_templates.append(template_data)
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Error loading template {template_file}: {e}")
                continue
    except Exception as e:
        print(f"Error getting custom templates: {e}")
    
    return custom_templates

def get_all_templates() -> List[Dict[str, Any]]:
    """
    Returns both default and custom templates.
    """
    return get_default_templates() + get_custom_templates()

def get_template_by_id(template_id: str) -> Optional[Dict[str, Any]]:
    """
    Find and return a template by its ID.
    """
    # Look in default templates first
    for template in DEFAULT_TEMPLATES:
        if template["id"] == template_id:
            return template
    
    # Look in custom templates
    template_path = TEMPLATES_DIR / f"{template_id}.json"
    if template_path.exists():
        try:
            with open(template_path, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error loading template {template_id}: {e}")
    
    return None

def save_custom_template(template_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Save a custom template.
    
    Args:
        template_data: Dictionary containing template data with id, name, description, and template
        
    Returns:
        The saved template data
    """
    # Ensure the template has the required fields
    required_fields = ["id", "name", "description", "template"]
    for field in required_fields:
        if field not in template_data:
            raise ValueError(f"Template is missing required field: {field}")
    
    template_id = template_data["id"]
    template_path = TEMPLATES_DIR / f"{template_id}.json"
    
    with open(template_path, "w") as f:
        json.dump(template_data, f, indent=2)
    
    return template_data

def delete_custom_template(template_id: str) -> bool:
    """
    Delete a custom template.
    
    Args:
        template_id: ID of the template to delete
        
    Returns:
        True if deleted successfully, False otherwise
    """
    template_path = TEMPLATES_DIR / f"{template_id}.json"
    
    if template_path.exists():
        try:
            os.remove(template_path)
            return True
        except Exception as e:
            print(f"Error deleting template {template_id}: {e}")
            return False
    
    return False

def apply_template_to_resources(template_id: str, resources: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Apply a template to a list of resources.
    
    Args:
        template_id: ID of the template to apply
        resources: List of resources to apply the template to
        
    Returns:
        Dictionary mapping resource names to their usage parameters
    """
    template = get_template_by_id(template_id)
    if not template:
        raise ValueError(f"Template not found: {template_id}")
    
    template_data = template["template"]
    applied_usage = {}
    
    for resource in resources:
        resource_type = resource.get("resource_type")
        resource_name = resource.get("name")
        
        if resource_type in template_data:
            applied_usage[resource_name] = template_data[resource_type].copy()
    
    return applied_usage