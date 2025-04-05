"""
Tests for the template service.
"""
import os
import json
import pytest
import tempfile
from pathlib import Path
from unittest.mock import patch

from app.services import template_service

@pytest.fixture
def mock_templates_dir():
    """Create a temporary directory for templates"""
    with tempfile.TemporaryDirectory() as temp_dir:
        with patch("app.services.template_service.TEMPLATES_DIR", Path(temp_dir)):
            yield temp_dir

def test_get_default_templates():
    """Test getting default templates"""
    templates = template_service.get_default_templates()
    assert len(templates) == 3
    assert templates[0]["id"] == "dev-environment"
    assert templates[1]["id"] == "prod-environment"
    assert templates[2]["id"] == "high-traffic"

def test_get_custom_templates(mock_templates_dir):
    """Test getting custom templates"""
    # Create some test templates
    custom_template = {
        "id": "custom-test",
        "name": "Custom Test",
        "description": "A custom template for testing",
        "template": {
            "aws_instance": {"monthly_hours": 200}
        }
    }
    
    with open(os.path.join(mock_templates_dir, "custom-test.json"), "w") as f:
        json.dump(custom_template, f)
    
    # Test invalid template (missing required field)
    invalid_template = {
        "id": "invalid",
        "name": "Invalid"
        # Missing description and template
    }
    
    with open(os.path.join(mock_templates_dir, "invalid.json"), "w") as f:
        json.dump(invalid_template, f)
    
    templates = template_service.get_custom_templates()
    assert len(templates) == 1
    assert templates[0]["id"] == "custom-test"

def test_get_all_templates(mock_templates_dir):
    """Test getting all templates"""
    # Create a custom template
    custom_template = {
        "id": "custom-test",
        "name": "Custom Test",
        "description": "A custom template for testing",
        "template": {
            "aws_instance": {"monthly_hours": 200}
        }
    }
    
    with open(os.path.join(mock_templates_dir, "custom-test.json"), "w") as f:
        json.dump(custom_template, f)
    
    templates = template_service.get_all_templates()
    assert len(templates) == 4  # 3 default + 1 custom
    
    # Check that both default and custom templates are included
    template_ids = [t["id"] for t in templates]
    assert "dev-environment" in template_ids
    assert "custom-test" in template_ids

def test_get_template_by_id(mock_templates_dir):
    """Test getting a template by ID"""
    # Test getting a default template
    template = template_service.get_template_by_id("dev-environment")
    assert template is not None
    assert template["id"] == "dev-environment"
    
    # Test getting a custom template
    custom_template = {
        "id": "custom-test",
        "name": "Custom Test",
        "description": "A custom template for testing",
        "template": {
            "aws_instance": {"monthly_hours": 200}
        }
    }
    
    with open(os.path.join(mock_templates_dir, "custom-test.json"), "w") as f:
        json.dump(custom_template, f)
    
    template = template_service.get_template_by_id("custom-test")
    assert template is not None
    assert template["id"] == "custom-test"
    
    # Test getting a non-existent template
    template = template_service.get_template_by_id("non-existent")
    assert template is None

def test_save_custom_template(mock_templates_dir):
    """Test saving a custom template"""
    custom_template = {
        "id": "new-template",
        "name": "New Template",
        "description": "A new template",
        "template": {
            "aws_instance": {"monthly_hours": 300}
        }
    }
    
    saved_template = template_service.save_custom_template(custom_template)
    assert saved_template == custom_template
    
    # Check that the file was created
    template_path = os.path.join(mock_templates_dir, "new-template.json")
    assert os.path.exists(template_path)
    
    # Check that the content is correct
    with open(template_path, "r") as f:
        loaded_template = json.load(f)
    
    assert loaded_template == custom_template
    
    # Test saving with missing fields
    invalid_template = {
        "id": "invalid",
        "name": "Invalid"
        # Missing description and template
    }
    
    with pytest.raises(ValueError):
        template_service.save_custom_template(invalid_template)

def test_delete_custom_template(mock_templates_dir):
    """Test deleting a custom template"""
    # Create a template to delete
    custom_template = {
        "id": "template-to-delete",
        "name": "Template to Delete",
        "description": "This template will be deleted",
        "template": {
            "aws_instance": {"monthly_hours": 100}
        }
    }
    
    template_path = os.path.join(mock_templates_dir, "template-to-delete.json")
    with open(template_path, "w") as f:
        json.dump(custom_template, f)
    
    # Delete the template
    result = template_service.delete_custom_template("template-to-delete")
    assert result is True
    assert not os.path.exists(template_path)
    
    # Test deleting a non-existent template
    result = template_service.delete_custom_template("non-existent")
    assert result is False

def test_apply_template_to_resources():
    """Test applying a template to resources"""
    resources = [
        {"name": "web-server", "resource_type": "aws_instance"},
        {"name": "api-function", "resource_type": "aws_lambda_function"},
        {"name": "data-bucket", "resource_type": "aws_s3_bucket"},
        {"name": "unknown-resource", "resource_type": "unknown_type"}
    ]
    
    # Apply the development environment template
    usage = template_service.apply_template_to_resources("dev-environment", resources)
    
    # Check that the template was applied correctly
    assert "web-server" in usage
    assert "api-function" in usage
    assert "data-bucket" in usage
    assert "unknown-resource" not in usage
    
    assert usage["web-server"]["monthly_hours"] == 160
    assert usage["api-function"]["monthly_requests"] == 10000
    assert usage["data-bucket"]["monthly_storage_gb"] == 5
    
    # Test applying a non-existent template
    with pytest.raises(ValueError):
        template_service.apply_template_to_resources("non-existent", resources)