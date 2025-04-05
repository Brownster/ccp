from pathlib import Path

from app.services.infracost_service import InfracostService
from app.services.llm_service import LLMService
from app.services.usage_service import UsageService

# Global constants
UPLOAD_DIR = Path("terraform_projects")
UPLOAD_DIR.mkdir(exist_ok=True)

# Service dependencies
def get_infracost_service() -> InfracostService:
    """Dependency provider for InfracostService"""
    return InfracostService(UPLOAD_DIR)

def get_llm_service() -> LLMService:
    """Dependency provider for LLMService"""
    return LLMService(model="gemini-pro", temperature=0.3)

def get_usage_service() -> UsageService:
    """Dependency provider for UsageService"""
    return UsageService()
