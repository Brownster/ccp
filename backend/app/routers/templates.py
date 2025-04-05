"""
Router for template-related endpoints.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

from app.services import template_service

router = APIRouter()

class TemplateModel(BaseModel):
    id: str
    name: str
    description: str
    template: Dict[str, Dict[str, Any]]

class TemplateResponse(BaseModel):
    templates: List[TemplateModel]

class TemplateApplyRequest(BaseModel):
    template_id: str
    resources: List[Dict[str, Any]]

class UsageResponse(BaseModel):
    usage: Dict[str, Dict[str, Any]]

@router.get("/templates", response_model=TemplateResponse)
async def get_templates():
    """
    Get all available templates (both default and custom).
    """
    templates = template_service.get_all_templates()
    return {"templates": templates}

@router.get("/templates/{template_id}", response_model=TemplateModel)
async def get_template(template_id: str):
    """
    Get a specific template by ID.
    """
    template = template_service.get_template_by_id(template_id)
    if not template:
        raise HTTPException(status_code=404, detail=f"Template {template_id} not found")
    return template

@router.post("/templates", response_model=TemplateModel)
async def create_template(template: TemplateModel):
    """
    Create a new custom template.
    """
    try:
        # Use model_dump instead of dict (for Pydantic v2 compatibility)
        saved_template = template_service.save_custom_template(template.model_dump())
        return saved_template
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving template: {str(e)}")

@router.delete("/templates/{template_id}")
async def delete_template(template_id: str):
    """
    Delete a custom template.
    """
    # Check if the template exists
    template = template_service.get_template_by_id(template_id)
    if not template:
        raise HTTPException(status_code=404, detail=f"Template {template_id} not found")
    
    # Don't allow deleting default templates
    if any(t["id"] == template_id for t in template_service.get_default_templates()):
        raise HTTPException(status_code=403, detail="Cannot delete default templates")
    
    success = template_service.delete_custom_template(template_id)
    if not success:
        raise HTTPException(status_code=500, detail=f"Failed to delete template {template_id}")
    
    return {"status": "deleted", "id": template_id}

@router.post("/apply-template", response_model=UsageResponse)
async def apply_template(request: TemplateApplyRequest):
    """
    Apply a template to a list of resources.
    """
    try:
        usage = template_service.apply_template_to_resources(
            request.template_id, 
            request.resources
        )
        return {"usage": usage}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error applying template: {str(e)}")