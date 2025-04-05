"""
Tests for the templates router.
"""
import json
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app

client = TestClient(app)

@pytest.fixture
def mock_templates():
    return [
        {
            "id": "test-template-1",
            "name": "Test Template 1",
            "description": "Template for testing",
            "template": {
                "aws_instance": {"monthly_hours": 100}
            }
        },
        {
            "id": "test-template-2",
            "name": "Test Template 2",
            "description": "Another template for testing",
            "template": {
                "aws_lambda_function": {"monthly_requests": 1000}
            }
        }
    ]

def test_get_templates(mock_templates):
    """Test getting all templates"""
    with patch("app.services.template_service.get_all_templates", return_value=mock_templates):
        response = client.get("/templates")
        assert response.status_code == 200
        data = response.json()
        assert "templates" in data
        assert len(data["templates"]) == 2
        assert data["templates"][0]["id"] == "test-template-1"
        assert data["templates"][1]["id"] == "test-template-2"

def test_get_template_by_id(mock_templates):
    """Test getting a template by ID"""
    with patch("app.services.template_service.get_template_by_id", return_value=mock_templates[0]):
        response = client.get("/templates/test-template-1")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "test-template-1"
        assert data["name"] == "Test Template 1"
    
    # Test getting a non-existent template
    with patch("app.services.template_service.get_template_by_id", return_value=None):
        response = client.get("/templates/non-existent")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

def test_create_template():
    """Test creating a new template"""
    new_template = {
        "id": "new-template",
        "name": "New Template",
        "description": "A brand new template",
        "template": {
            "aws_instance": {"monthly_hours": 200}
        }
    }
    
    with patch("app.services.template_service.save_custom_template", return_value=new_template):
        response = client.post("/templates", json=new_template)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "new-template"
        assert data["name"] == "New Template"
    
    # Test creating with missing required fields
    invalid_template = {
        "id": "invalid",
        "name": "Invalid"
        # Missing description and template
    }
    
    with patch("app.services.template_service.save_custom_template", side_effect=ValueError("Missing required fields")):
        response = client.post("/templates", json=invalid_template)
        # FastAPI returns 422 for validation errors by default
        assert response.status_code == 422
        # Check for validation error in the response
        assert "detail" in response.json()

def test_delete_template(mock_templates):
    """Test deleting a template"""
    # Mock the get_template_by_id and delete_custom_template functions
    with patch("app.services.template_service.get_template_by_id", return_value=mock_templates[0]), \
         patch("app.services.template_service.get_default_templates", return_value=[]), \
         patch("app.services.template_service.delete_custom_template", return_value=True):
        response = client.delete("/templates/test-template-1")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "deleted"
        assert data["id"] == "test-template-1"
    
    # Test deleting a non-existent template
    with patch("app.services.template_service.get_template_by_id", return_value=None):
        response = client.delete("/templates/non-existent")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]
    
    # Test deleting a default template
    with patch("app.services.template_service.get_template_by_id", return_value=mock_templates[0]), \
         patch("app.services.template_service.get_default_templates", return_value=[mock_templates[0]]):
        response = client.delete("/templates/test-template-1")
        assert response.status_code == 403
        assert "Cannot delete default templates" in response.json()["detail"]

def test_apply_template():
    """Test applying a template to resources"""
    resources = [
        {"name": "web-server", "resource_type": "aws_instance"},
        {"name": "api-function", "resource_type": "aws_lambda_function"}
    ]
    
    expected_usage = {
        "web-server": {"monthly_hours": 100},
        "api-function": {"monthly_requests": 1000}
    }
    
    request_data = {
        "template_id": "test-template",
        "resources": resources
    }
    
    with patch("app.services.template_service.apply_template_to_resources", return_value=expected_usage):
        response = client.post("/apply-template", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert "usage" in data
        assert data["usage"] == expected_usage
    
    # Test applying a non-existent template
    with patch("app.services.template_service.apply_template_to_resources", 
               side_effect=ValueError("Template not found")):
        response = client.post("/apply-template", json=request_data)
        assert response.status_code == 404
        assert "Template not found" in response.json()["detail"]