import json
import pytest

def test_suggest_usage_fallback(client):
    # Should fallback to 100 if model call fails or response is mocked
    resource = {
        "name": "aws_instance.example",
        "resource_type": "aws_instance",
        "monthlyCost": "12.00"
    }
    response = client.post("/suggest-usage", json={"resource": resource, "llm": "unknown"})
    assert response.status_code == 200
    data = response.json()
    assert data["suggested_usage"] == 100

def test_upload_invalid_type(client):
    response = client.post("/upload", files={"file": ("bad.txt", b"not a valid format", "text/plain")})
    assert response.status_code == 400

def test_download_missing(client):
    response = client.get("/download/badid?format=json")
    assert response.status_code == 404

def test_compare_missing_previous(client):
    payload = {
        "uid": "doesnotexist",
        "current": [{"name": "aws_lambda", "adjustedCost": "20.00"}]
    }
    response = client.post("/compare-adjusted", json=payload)
    assert response.status_code == 404
