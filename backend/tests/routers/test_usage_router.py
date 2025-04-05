import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json

from app.main import app
from app.services.llm_service import LLMService
from app.services.usage_service import UsageService

# Load test fixtures
import os
from pathlib import Path
fixture_path = Path(__file__).parent.parent / 'fixtures' / 'llm_responses.json'
with open(fixture_path) as f:
    mock_responses = json.load(f)

# Test client
@pytest.fixture
def client():
    return TestClient(app)

# Mock services
@pytest.fixture
def mock_llm_service():
    service = MagicMock(spec=LLMService)
    return service

@pytest.fixture
def mock_usage_service():
    service = MagicMock(spec=UsageService)
    return service

# Patch the dependencies
@pytest.fixture
def patched_dependencies(mock_llm_service, mock_usage_service):
    with patch("app.dependencies.get_llm_service", return_value=mock_llm_service), \
         patch("app.dependencies.get_usage_service", return_value=mock_usage_service):
        yield

# Test data
@pytest.fixture
def sample_resource():
    return {
        "name": "aws_instance.web_server",
        "resource_type": "aws_instance",
        "monthlyCost": "90.00"
    }

@pytest.fixture
def sample_resources():
    return [
        {
            "name": "aws_instance.web_server",
            "resource_type": "aws_instance",
            "monthlyCost": "90.00"
        },
        {
            "name": "aws_lambda_function.processor",
            "resource_type": "aws_lambda_function",
            "monthlyCost": "25.37"
        }
    ]

# Tests
def test_suggest_usage_success(client, patched_dependencies, mock_llm_service, sample_resource):
    """Test successful usage suggestion"""
    # Setup mock
    mock_llm_service.suggest_usage_percentage.return_value = 75
    
    # Make request
    response = client.post(
        "/suggest-usage",
        json={"resource": sample_resource}
    )
    
    # Check response
    assert response.status_code == 200
    assert response.json() == {"suggested_usage": 75}
    
    # Verify service was called correctly
    mock_llm_service.suggest_usage_percentage.assert_called_once_with(sample_resource)

def test_suggest_usage_error(client, patched_dependencies, mock_llm_service, sample_resource):
    """Test error handling in usage suggestion"""
    # Setup mock to raise an exception
    mock_llm_service.suggest_usage_percentage.side_effect = Exception("Test error")
    
    # Make request
    response = client.post(
        "/suggest-usage",
        json={"resource": sample_resource}
    )
    
    # Check response - should return default value with status 200
    assert response.status_code == 200
    assert response.json() == {"suggested_usage": 100}

def test_usage_clarify(client, patched_dependencies, mock_llm_service, sample_resources):
    """Test usage clarification endpoint"""
    # Setup mock
    mock_questions = mock_responses["clarify_questions"]
    mock_llm_service.clarify_usage_questions.return_value = mock_questions
    
    # Make request
    response = client.post(
        "/usage-clarify",
        json={"resources": sample_resources}
    )
    
    # Check response
    assert response.status_code == 200
    assert response.json() == {"questions": mock_questions}
    
    # Verify service was called correctly
    mock_llm_service.clarify_usage_questions.assert_called_once_with(sample_resources)

def test_usage_clarify_error(client, patched_dependencies, mock_llm_service, sample_resources):
    """Test error handling in usage clarification"""
    # Setup mock to raise an exception
    mock_llm_service.clarify_usage_questions.side_effect = Exception("Test error")
    
    # Make request
    response = client.post(
        "/usage-clarify",
        json={"resources": sample_resources}
    )
    
    # Check response - should return empty list with error info
    assert response.status_code == 200
    assert "error" in response.json()
    assert response.json()["questions"] == []

def test_usage_generate(client, patched_dependencies, mock_llm_service, mock_usage_service, sample_resources):
    """Test usage generation endpoint with LLM"""
    # Setup mocks
    mock_usage = mock_responses["usage_assumptions"]
    mock_llm_service.generate_usage_assumptions.return_value = mock_usage
    
    # Answers to clarify questions
    answers = ["Only during business hours", "1.5 million invocations"]
    
    # Make request
    response = client.post(
        "/usage-generate",
        json={"resources": sample_resources, "answers": answers}
    )
    
    # Check response
    assert response.status_code == 200
    assert response.json() == {"usage": mock_usage}
    
    # Verify LLM service was called correctly
    mock_llm_service.generate_usage_assumptions.assert_called_once()
    
    # Verify the usage service was NOT called (since LLM succeeded)
    mock_usage_service.generate_usage_from_answers.assert_not_called()

def test_usage_generate_fallback(client, patched_dependencies, mock_llm_service, mock_usage_service, sample_resources):
    """Test usage generation endpoint falling back to rule-based when LLM fails"""
    # Setup mocks
    mock_llm_service.generate_usage_assumptions.return_value = {}  # Empty result
    
    fallback_usage = {
        "aws_instance.web_server": {"monthly_hours": 160},
        "aws_lambda_function.processor": {"monthly_requests": 1500000}
    }
    mock_usage_service.generate_usage_from_answers.return_value = fallback_usage
    
    # Answers to clarify questions
    answers = ["Only during business hours", "1.5 million invocations"]
    
    # Make request
    response = client.post(
        "/usage-generate",
        json={"resources": sample_resources, "answers": answers}
    )
    
    # Check response
    assert response.status_code == 200
    assert response.json() == {"usage": fallback_usage}
    
    # Verify both services were called
    mock_llm_service.generate_usage_assumptions.assert_called_once()
    mock_usage_service.generate_usage_from_answers.assert_called_once_with(sample_resources, answers)

def test_generate_usage_rule_based(client, patched_dependencies, mock_usage_service, sample_resources):
    """Test the rule-based generate-usage endpoint"""
    # Setup mock
    usage_result = {
        "aws_instance.web_server": {"monthly_hours": 160},
        "aws_lambda_function.processor": {"monthly_requests": 1500000}
    }
    mock_usage_service.generate_usage_from_answers.return_value = usage_result
    
    # Answers to process
    answers = ["Only during business hours", "1.5 million invocations"]
    
    # Make request
    response = client.post(
        "/generate-usage",
        json={"resources": sample_resources, "answers": answers}
    )
    
    # Check response
    assert response.status_code == 200
    assert response.json() == {"usage": usage_result}
    
    # Verify service was called correctly
    mock_usage_service.generate_usage_from_answers.assert_called_once_with(sample_resources, answers)

def test_generate_usage_error(client, patched_dependencies, mock_usage_service, sample_resources):
    """Test error handling in generate-usage endpoint"""
    # Setup mock to raise an exception
    mock_usage_service.generate_usage_from_answers.side_effect = Exception("Test error")
    
    # Answers to process
    answers = ["Only during business hours", "1.5 million invocations"]
    
    # Make request
    response = client.post(
        "/generate-usage",
        json={"resources": sample_resources, "answers": answers}
    )
    
    # Check response
    assert response.status_code == 200
    assert "error" in response.json()
    assert response.json()["usage"] == {}