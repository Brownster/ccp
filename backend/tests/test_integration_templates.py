"""
Integration tests for the templates API endpoints.
"""
import pytest
import os
import json
from fastapi.testclient import TestClient
from pathlib import Path

from app.main import app
from app.services import template_service

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_and_teardown():
    """Setup and teardown for tests"""
    # Create temp directory for templates
    temp_templates_dir = Path("./temp_templates")
    os.makedirs(temp_templates_dir, exist_ok=True)
    
    # Store original directory
    original_dir = template_service.TEMPLATES_DIR
    
    # Set templates directory to temp directory
    template_service.TEMPLATES_DIR = temp_templates_dir
    
    yield
    
    # Restore original directory
    template_service.TEMPLATES_DIR = original_dir
    
    # Clean up temp directory
    for file in temp_templates_dir.glob("*.json"):
        os.remove(file)
    
    os.rmdir(temp_templates_dir)

def test_get_templates():
    """Test getting all templates"""
    response = client.get("/templates")
    assert response.status_code == 200
    
    data = response.json()
    assert "templates" in data
    
    # Should at least have default templates
    assert len(data["templates"]) >= 3
    
    # Check some default template IDs
    template_ids = [t["id"] for t in data["templates"]]
    assert "dev-environment" in template_ids
    assert "prod-environment" in template_ids
    assert "high-traffic" in template_ids

def test_get_template_by_id():
    """Test getting a specific template"""
    # Get a default template
    response = client.get("/templates/dev-environment")
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == "dev-environment"
    assert data["name"] == "Development Environment"
    assert "template" in data
    
    # Get a non-existent template
    response = client.get("/templates/non-existent")
    assert response.status_code == 404

def test_create_and_delete_template():
    """Test creating and deleting a template"""
    # Create a new template
    new_template = {
        "id": "test-template",
        "name": "Test Template",
        "description": "Template for testing",
        "template": {
            "aws_instance": {"monthly_hours": 200}
        }
    }
    
    response = client.post("/templates", json=new_template)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == "test-template"
    
    # Get the created template
    response = client.get("/templates/test-template")
    assert response.status_code == 200
    assert response.json()["id"] == "test-template"
    
    # Delete the template
    response = client.delete("/templates/test-template")
    assert response.status_code == 200
    assert response.json()["status"] == "deleted"
    
    # Verify it's gone
    response = client.get("/templates/test-template")
    assert response.status_code == 404

def test_create_template_invalid():
    """Test creating an invalid template"""
    # Missing required fields
    invalid_template = {
        "id": "invalid",
        "name": "Invalid"
        # Missing description and template
    }
    
    response = client.post("/templates", json=invalid_template)
    # FastAPI returns 422 for validation errors by default
    assert response.status_code == 422
    # Check for validation error in the response
    assert "detail" in response.json()

def test_delete_default_template():
    """Test that default templates cannot be deleted"""
    response = client.delete("/templates/dev-environment")
    assert response.status_code == 403
    assert "cannot delete default templates" in response.json()["detail"].lower()

def test_apply_template():
    """Test applying a template to resources"""
    resources = [
        {"name": "web-server", "resource_type": "aws_instance"},
        {"name": "api-function", "resource_type": "aws_lambda_function"},
        {"name": "unknown-resource", "resource_type": "unknown_type"}
    ]
    
    request_data = {
        "template_id": "dev-environment",
        "resources": resources
    }
    
    response = client.post("/apply-template", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "usage" in data
    
    # Check that template was applied to matching resources
    assert "web-server" in data["usage"]
    assert "api-function" in data["usage"]
    assert "unknown-resource" not in data["usage"]
    
    # Check specific values
    assert data["usage"]["web-server"]["monthly_hours"] == 160
    assert data["usage"]["api-function"]["monthly_requests"] == 10000

def test_apply_nonexistent_template():
    """Test applying a non-existent template"""
    resources = [
        {"name": "web-server", "resource_type": "aws_instance"}
    ]
    
    request_data = {
        "template_id": "non-existent",
        "resources": resources
    }
    
    response = client.post("/apply-template", json=request_data)
    assert response.status_code == 404
    assert "template not found" in response.json()["detail"].lower()