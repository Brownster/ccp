import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import os
from io import BytesIO
from pathlib import Path
import json

from app.main import app
from app.services.infracost_service import InfracostService

# Test client
@pytest.fixture
def client():
    return TestClient(app)

# Mock service
@pytest.fixture
def mock_infracost_service():
    service = MagicMock(spec=InfracostService)
    return service

# Patch the dependency
@pytest.fixture
def patched_dependencies(mock_infracost_service):
    with patch("app.dependencies.get_infracost_service", return_value=mock_infracost_service):
        yield

# Test data
@pytest.fixture
def sample_resources():
    return [
        {
            "name": "aws_instance.example",
            "resource_type": "aws_instance",
            "monthlyCost": "10.00"
        },
        {
            "name": "aws_lambda_function.test",
            "resource_type": "aws_lambda_function",
            "monthlyCost": "5.25"
        }
    ]

# Tests
def test_upload_terraform_success(client, patched_dependencies, mock_infracost_service, sample_resources):
    """Test successful file upload"""
    # Setup the mock
    mock_infracost_service.process_terraform_file.return_value = (sample_resources, "test-uid")
    
    # Create a test ZIP file
    file_content = BytesIO(b"test file content")
    file_content.name = "test.zip"
    
    # Make the request
    response = client.post(
        "/upload",
        files={"file": ("test.zip", file_content, "application/zip")}
    )
    
    # Assertions
    assert response.status_code == 200
    assert response.json() == {"uid": "test-uid", "cost_breakdown": sample_resources}
    mock_infracost_service.process_terraform_file.assert_called_once()

def test_upload_terraform_error(client, patched_dependencies, mock_infracost_service):
    """Test file upload with processing error"""
    # Setup the mock to raise an error
    mock_infracost_service.process_terraform_file.side_effect = ValueError("Test error")
    
    # Create a test ZIP file
    file_content = BytesIO(b"test file content")
    file_content.name = "test.zip"
    
    # Make the request
    response = client.post(
        "/upload",
        files={"file": ("test.zip", file_content, "application/zip")}
    )
    
    # Assertions
    assert response.status_code == 400
    assert "error" in response.json()
    assert response.json()["error"] == "Test error"

def test_download_estimate_success(client, patched_dependencies, mock_infracost_service, sample_resources):
    """Test downloading an estimate"""
    # Setup the mock
    mock_infracost_service.get_estimate.return_value = sample_resources
    
    # Make the request
    response = client.get("/download/test-uid")
    
    # Assertions
    assert response.status_code == 200
    assert response.json() == sample_resources
    mock_infracost_service.get_estimate.assert_called_once_with("test-uid")

def test_download_estimate_not_found(client, patched_dependencies, mock_infracost_service):
    """Test downloading a non-existent estimate"""
    # Setup the mock
    mock_infracost_service.get_estimate.side_effect = FileNotFoundError("Not found")
    
    # Make the request
    response = client.get("/download/non-existent")
    
    # Assertions
    assert response.status_code == 404
    assert "error" in response.json()
    assert response.json()["error"] == "Estimate not found"

def test_download_estimate_csv(client, patched_dependencies, mock_infracost_service, sample_resources):
    """Test downloading an estimate in CSV format"""
    # Setup the mock
    mock_infracost_service.get_estimate.return_value = sample_resources
    
    # Make the request
    response = client.get("/download/test-uid?format=csv")
    
    # Assertions
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv"
    assert "name,resource_type,monthlyCost" in response.text
    assert "aws_instance.example,aws_instance,10.00" in response.text
    assert "aws_lambda_function.test,aws_lambda_function,5.25" in response.text

def test_compare_estimates(client, patched_dependencies, mock_infracost_service):
    """Test comparing estimates"""
    # Setup the mock
    comparison_result = {
        "increased": [{"name": "resource1", "delta": 5.0}],
        "decreased": [],
        "unchanged": [],
        "added": [{"name": "resource2", "delta": 10.0}],
        "removed": []
    }
    mock_infracost_service.compare_estimates.return_value = comparison_result
    
    # Make the request
    response = client.get("/compare?baseline=base-uid&proposed=prop-uid")
    
    # Assertions
    assert response.status_code == 200
    assert response.json() == comparison_result
    mock_infracost_service.compare_estimates.assert_called_once_with("base-uid", "prop-uid")

def test_compare_estimates_not_found(client, patched_dependencies, mock_infracost_service):
    """Test comparing non-existent estimates"""
    # Setup the mock
    mock_infracost_service.compare_estimates.side_effect = FileNotFoundError("Not found")
    
    # Make the request
    response = client.get("/compare?baseline=base-uid&proposed=prop-uid")
    
    # Assertions
    assert response.status_code == 404
    assert "error" in response.json()
    assert response.json()["error"] == "One or both estimates not found"
