"""
Pytest configuration file containing fixtures shared across tests.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """
    Create a FastAPI TestClient fixture for use in tests.
    """
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def mock_resources():
    """
    Return a list of mock resources for testing.
    """
    return [
        {"name": "web_server", "resource_type": "aws_instance", "monthlyCost": "50.00"},
        {"name": "function_a", "resource_type": "aws_lambda_function", "monthlyCost": "15.00"},
        {"name": "database", "resource_type": "aws_rds_instance", "monthlyCost": "100.00"}
    ]

@pytest.fixture
def mock_template():
    """
    Return a mock template for testing.
    """
    return {
        "id": "test-template",
        "name": "Test Template",
        "description": "A template for testing",
        "template": {
            "aws_instance": {
                "monthly_hours": 720,
                "cpu_utilization": 50
            },
            "aws_lambda_function": {
                "monthly_requests": 1000000,
                "avg_duration_ms": 200
            }
        }
    }