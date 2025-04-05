import pytest
import json
from unittest.mock import patch, MagicMock
import os
from pathlib import Path

from app.services.llm_service import LLMService

# Load test fixtures
fixture_path = Path(__file__).parent.parent / 'fixtures' / 'llm_responses.json'
with open(fixture_path) as f:
    mock_responses = json.load(f)

# Tests for LLMService
class TestLLMService:
    
    @pytest.fixture
    def llm_service(self):
        """Create an LLMService instance for testing"""
        service = LLMService(model="gemini-pro", temperature=0.3)
        return service
    
    @pytest.fixture
    def mock_llm(self):
        """Create a mock LLM instance"""
        mock = MagicMock()
        mock_response = MagicMock()
        mock_response.content = mock_responses["suggest_usage_percentage"]["aws_instance.web_server"]
        mock.invoke.return_value = mock_response
        return mock
    
    @pytest.fixture
    def resource(self):
        """Sample resource for testing"""
        return {
            "name": "aws_instance.web_server",
            "resource_type": "aws_instance",
            "monthlyCost": "90.00"
        }
    
    def test_llm_lazy_initialization(self, llm_service):
        """Test that LLM is initialized only once when needed"""
        # Test that _llm is initially None
        assert llm_service._llm is None
        
        # Access the llm property, which should trigger initialization
        with patch('app.services.llm_service.ChatGoogleGenerativeAI') as mock_chat:
            llm = llm_service.llm
            mock_chat.assert_called_once_with(model="gemini-pro", temperature=0.3)
    
    def test_suggest_usage_percentage(self, llm_service, mock_llm, resource):
        """Test suggesting usage percentage for a resource"""
        # Replace the llm property with our mock
        llm_service._llm = mock_llm
        
        # Call the method
        result = llm_service.suggest_usage_percentage(resource)
        
        # Check that the result is as expected
        assert result == 75  # From our fixture: "75"
        
        # Verify the mock was called with the right prompt
        mock_llm.invoke.assert_called_once()
        args, _ = mock_llm.invoke.call_args
        assert "aws_instance.web_server" in str(args[0])
        assert "suggest a reasonable default monthly usage percentage" in str(args[0])
    
    def test_suggest_usage_percentage_error(self, llm_service, mock_llm, resource):
        """Test error handling in suggest_usage_percentage"""
        # Replace the llm property with our mock
        llm_service._llm = mock_llm
        
        # Set up the mock to raise an exception
        mock_llm.invoke.side_effect = Exception("Test error")
        
        # Call the method
        result = llm_service.suggest_usage_percentage(resource)
        
        # Check that the result is the default value
        assert result == 100
    
    def test_copilot_response(self, llm_service, mock_llm):
        """Test generating copilot responses"""
        # Replace the llm property with our mock
        llm_service._llm = mock_llm
        
        # Set up the mock response
        mock_response = MagicMock()
        mock_response.content = mock_responses["copilot_responses"]["explain_resources"]
        mock_llm.invoke.return_value = mock_response
        
        # Resources to include in the prompt
        resources = [
            {"name": "aws_instance.web_server", "resource_type": "aws_instance", "monthlyCost": "90.00"},
            {"name": "aws_lambda_function.processor", "resource_type": "aws_lambda_function", "monthlyCost": "25.37"}
        ]
        
        # Call the method
        result = llm_service.copilot_response("Explain my resources", resources)
        
        # Check that the result is as expected
        assert "EC2 web server" in result
        assert "Lambda function" in result
        
        # Verify the mock was called with appropriate context in the prompt
        mock_llm.invoke.assert_called_once()
        args, _ = mock_llm.invoke.call_args
        prompt_dict = args[0]
        assert "aws_instance.web_server" in prompt_dict["context"]
        assert "aws_lambda_function.processor" in prompt_dict["context"]
        assert "Explain my resources" in prompt_dict["question"]
    
    def test_format_resource_summary(self, llm_service):
        """Test formatting resources into a text summary"""
        resources = [
            {"name": "aws_instance.web_server", "resource_type": "aws_instance", "monthlyCost": "90.00"},
            {"name": "aws_lambda_function.processor", "resource_type": "aws_lambda_function", "monthlyCost": "25.37"}
        ]
        
        result = llm_service._format_resource_summary(resources)
        
        # Check the formatting
        assert "- aws_instance.web_server (aws_instance) costs approx $90.00/mo" in result
        assert "- aws_lambda_function.processor (aws_lambda_function) costs approx $25.37/mo" in result
    
    def test_analyze_diff(self, llm_service, mock_llm):
        """Test analyzing a diff"""
        # Replace the llm property with our mock
        llm_service._llm = mock_llm
        
        # Set up the mock response
        mock_response = MagicMock()
        mock_response.content = mock_responses["diff_analysis"]
        mock_llm.invoke.return_value = mock_response
        
        # Test diff text
        diff_text = """
        + aws_lambda_function.processor
        ~ aws_dynamodb_table.data_store
        """
        
        # Call the method
        result = llm_service.analyze_diff(diff_text)
        
        # Check that the result contains key elements from the fixture
        assert "Cost Change Analysis" in result
        assert "+$32.45/month" in result
        assert "aws_lambda_function.processor" in result
        
        # Verify the mock was called with the diff text
        mock_llm.invoke.assert_called_once()
        args, _ = mock_llm.invoke.call_args
        assert args[0]["diff"] == diff_text
    
    def test_clarify_usage_questions(self, llm_service, mock_llm):
        """Test generating clarifying questions for resources"""
        # Replace the llm property with our mock
        llm_service._llm = mock_llm
        
        # Set up the mock to return a JSON string
        mock_response = MagicMock()
        mock_response.content = json.dumps(mock_responses["clarify_questions"])
        mock_llm.invoke.return_value = mock_response
        
        # Resources for clarification
        resources = [
            {"name": "aws_instance.web_server", "resource_type": "aws_instance", "monthlyCost": "90.00"},
            {"name": "aws_lambda_function.processor", "resource_type": "aws_lambda_function", "monthlyCost": "25.37"}
        ]
        
        # Call the method
        result = llm_service.clarify_usage_questions(resources)
        
        # Check that we got back parsed JSON
        assert isinstance(result, list)
        assert len(result) == 3
        assert result[0]["resource_name"] == "aws_instance.web_server"
        assert "running 24/7" in result[0]["question"]
        
        # Verify the mock was called with the resources in JSON format
        mock_llm.invoke.assert_called_once()
        args, _ = mock_llm.invoke.call_args
        assert "aws_instance.web_server" in args[0]["resources"]
    
    def test_generate_usage_assumptions(self, llm_service, mock_llm):
        """Test generating usage assumptions from answers"""
        # Replace the llm property with our mock
        llm_service._llm = mock_llm
        
        # Set up the mock to return a JSON string
        mock_response = MagicMock()
        mock_response.content = json.dumps(mock_responses["usage_assumptions"])
        mock_llm.invoke.return_value = mock_response
        
        # Resources
        resources = [
            {"name": "aws_instance.web_server", "resource_type": "aws_instance", "monthlyCost": "90.00"},
            {"name": "aws_lambda_function.processor", "resource_type": "aws_lambda_function", "monthlyCost": "25.37"}
        ]
        
        # Answers to questions
        answers = [
            {"resource_name": "aws_instance.web_server", "answer": "Only during business hours (8 hours/day, 5 days/week)"},
            {"resource_name": "aws_lambda_function.processor", "answer": "Around 1.5 million requests per month"}
        ]
        
        # Call the method
        result = llm_service.generate_usage_assumptions(resources, answers)
        
        # Check that we got expected values from the fixture
        assert "aws_instance.web_server" in result
        assert result["aws_instance.web_server"]["monthly_hours"] == 480
        assert "aws_lambda_function.processor" in result
        assert result["aws_lambda_function.processor"]["monthly_requests"] == 1500000
        
        # Verify the mock was called with the resources and answers
        mock_llm.invoke.assert_called_once()
        args, _ = mock_llm.invoke.call_args
        assert "aws_instance.web_server" in args[0]["resources"]
        assert "business hours" in args[0]["answers"]