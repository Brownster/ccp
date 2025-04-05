from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

from app.services.llm_service import LLMService
from app.dependencies import get_llm_service

# Create router
router = APIRouter(tags=["copilot"])

# Models
class CopilotRequest(BaseModel):
    question: str
    resources: List[Dict[str, Any]]

class DiffRequest(BaseModel):
    diff: str

@router.post("/copilot")
async def copilot_api(data: CopilotRequest, llm_service: LLMService = Depends(get_llm_service)):
    """Get AI assistance with resource questions"""
    if not data.question:
        return {"error": "Missing question"}
    
    try:
        response = llm_service.copilot_response(data.question, data.resources)
        return {"answer": response}
    except Exception as e:
        return {"error": str(e), "answer": "I'm sorry, I couldn't process your question at this time."}

@router.post("/analyze-diff")
async def analyze_diff_api(data: DiffRequest, llm_service: LLMService = Depends(get_llm_service)):
    """Analyze cost changes in Terraform diff"""
    if not data.diff:
        return {"error": "Missing diff content"}
    
    try:
        result = llm_service.analyze_diff(data.diff)
        return {"summary": result}
    except Exception as e:
        return {"error": str(e), "summary": "I couldn't analyze the diff at this time."}
