from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import upload, usage, copilot, templates

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Cloud Cost Predictor API",
    description="Predict your cloud costs before deployment using Terraform, Infracost, and AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router)
app.include_router(usage.router)
app.include_router(copilot.router)
app.include_router(templates.router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Cloud Cost Predictor API",
        "docs": "/docs",
        "endpoints": {
            "upload": "POST /upload",
            "download": "GET /download/{uid}",
            "compare": "GET /compare",
            "usage-clarify": "POST /usage-clarify",
            "usage-generate": "POST /usage-generate",
            "copilot": "POST /copilot",
            "analyze-diff": "POST /analyze-diff",
            "templates": "GET /templates",
            "template-by-id": "GET /templates/{template_id}",
            "create-template": "POST /templates",
            "delete-template": "DELETE /templates/{template_id}",
            "apply-template": "POST /apply-template"
        }
    }