
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

mock_resources = [
    {"name": "web_server", "resource_type": "aws_instance", "monthlyCost": "50.00"},
    {"name": "function_a", "resource_type": "aws_lambda_function", "monthlyCost": "15.00"}
]

def test_generate_usage():
    payload = {
        "resources": mock_resources,
        "answers": ["24/7", "about 2 million"]
    }
    response = client.post("/generate-usage", json=payload)
    assert response.status_code == 200
    usage = response.json()["usage"]
    assert "web_server" in usage
    assert usage["web_server"]["monthly_hours"] == 720
    assert "function_a" in usage
    assert usage["function_a"]["monthly_requests"] == 2000000

def test_copilot_response():
    payload = {
        "question": "Why is web_server so expensive?",
        "resources": mock_resources
    }
    response = client.post("/copilot", json=payload)
    assert response.status_code == 200
    assert "answer" in response.json()
    assert isinstance(response.json()["answer"], str)
