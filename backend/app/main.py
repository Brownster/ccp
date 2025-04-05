from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import upload, usage, copilot

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Terraform Cost Estimator API",
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

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Terraform Cost Estimator API",
        "docs": "/docs",
        "endpoints": {
            "upload": "POST /upload",
            "download": "GET /download/{uid}",
            "compare": "GET /compare",
            "usage-clarify": "POST /usage-clarify",
            "usage-generate": "POST /usage-generate",
            "copilot": "POST /copilot",
            "analyze-diff": "POST /analyze-diff"
        }
    }