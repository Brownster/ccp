
import json
import pytest
from fastapi.testclient import TestClient

def test_generate_usage(client, mock_resources):
    payload = {
        "resources": mock_resources,
        "answers": ["24/7", "about 2 million"]
    }
    response = client.post("/usage-generate", json=payload)
    assert response.status_code == 200
    usage = response.json()["usage"]
    assert "web_server" in usage
    assert usage["web_server"]["monthly_hours"] == 720
    assert "function_a" in usage
    assert usage["function_a"]["monthly_requests"] == 2000000

def test_copilot_response(client, mock_resources):
    payload = {
        "question": "Why is web_server so expensive?",
        "resources": mock_resources
    }
    response = client.post("/copilot", json=payload)
    assert response.status_code == 200
    assert "answer" in response.json()
    assert isinstance(response.json()["answer"], str)
