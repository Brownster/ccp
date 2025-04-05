from pathlib import Path
import os
from fastapi import Header, Request

from app.services.infracost_service import InfracostService
from app.services.llm_service import LLMService
from app.services.usage_service import UsageService

# Global constants
UPLOAD_DIR = Path("terraform_projects")
UPLOAD_DIR.mkdir(exist_ok=True)

# Service dependencies
def get_infracost_service(
    request: Request = None,
    x_infracost_key: str = Header(None)
) -> InfracostService:
    """
    Dependency provider for InfracostService
    
    Accepts Infracost API key from:
    1. Request header
    2. Environment variable
    """
    # Try to get API key from header first
    api_key = x_infracost_key or os.environ.get("INFRACOST_API_KEY")
    
    return InfracostService(UPLOAD_DIR, api_key=api_key)

def get_llm_service(
    request: Request = None,
    x_gemini_key: str = Header(None)
) -> LLMService:
    """
    Dependency provider for LLMService
    
    Accepts Gemini API key from:
    1. Request header
    2. Environment variable
    """
    # Try to get API key from header first
    api_key = x_gemini_key or os.environ.get("GEMINI_API_KEY")
    
    return LLMService(
        model="gemini-pro", 
        temperature=0.3,
        api_key=api_key
    )

def get_usage_service() -> UsageService:
    """Dependency provider for UsageService"""
    return UsageService()
