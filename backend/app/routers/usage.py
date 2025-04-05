from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

from app.services.llm_service import LLMService
from app.services.usage_service import UsageService
from app.dependencies import get_llm_service, get_usage_service

# Create router
router = APIRouter(tags=["usage"])

# Models
class UsageRequest(BaseModel):
    resource: Dict[str, Any]
    llm: str = "gemini"

class UsageWizardRequest(BaseModel):
    resources: List[Dict[str, Any]]

class UsageGenerateRequest(BaseModel):
    resources: List[Dict[str, Any]]
    answers: List[str]

@router.post("/suggest-usage")
async def suggest_usage(req: UsageRequest, 
                      llm_service: LLMService = Depends(get_llm_service)):
    """Suggest a reasonable usage percentage for a resource"""
    try:
        percentage = llm_service.suggest_usage_percentage(req.resource)
        return {"suggested_usage": percentage}
    except Exception as e:
        print(f"LLM error: {e}")
        return {"suggested_usage": 100}

@router.post("/usage-wizard")
async def usage_wizard_api(data: UsageWizardRequest, 
                        llm_service: LLMService = Depends(get_llm_service)):
    """Get usage questions for resources"""
    try:
        questions = llm_service.clarify_usage_questions(data.resources)
        return {"questions": questions}
    except Exception as e:
        return {"error": str(e), "questions": []}

@router.post("/usage-clarify")
async def usage_clarify(data: UsageWizardRequest, 
                     llm_service: LLMService = Depends(get_llm_service)):
    """Generate clarifying questions for resource usage"""
    try:
        questions = llm_service.clarify_usage_questions(data.resources)
        return {"questions": questions}
    except Exception as e:
        return {"error": str(e), "questions": []}

@router.post("/usage-generate")
async def usage_generate(data: UsageGenerateRequest, 
                      llm_service: LLMService = Depends(get_llm_service),
                      usage_service: UsageService = Depends(get_usage_service)):
    """Generate structured usage data from user answers"""
    try:
        # First try using LLM generation
        answers_dict = [{"resource": r.get("name", ""), "answer": a} 
                        for r, a in zip(data.resources, data.answers)]
        usage = llm_service.generate_usage_assumptions(data.resources, answers_dict)
        
        # If LLM generation fails or returns empty, use rule-based approach
        if not usage:
            usage = usage_service.generate_usage_from_answers(data.resources, data.answers)
            
        return {"usage": usage}
    except Exception as e:
        # Fallback to rule-based approach on any error
        try:
            usage = usage_service.generate_usage_from_answers(data.resources, data.answers)
            return {"usage": usage}
        except Exception as e2:
            return {"error": str(e2), "usage": {}}

@router.post("/generate-usage")
async def generate_usage(data: UsageGenerateRequest, 
                       usage_service: UsageService = Depends(get_usage_service)):
    """Generate usage data from answers using simple rules"""
    try:
        usage = usage_service.generate_usage_from_answers(data.resources, data.answers)
        return {"usage": usage}
    except Exception as e:
        return {"error": str(e), "usage": {}}
