import pytest
from app.services.usage_service import UsageService

class TestUsageService:
    
    @pytest.fixture
    def usage_service(self):
        """Create a UsageService instance for testing"""
        return UsageService()
    
    @pytest.fixture
    def test_resources(self):
        """Sample resources for testing"""
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
            },
            {
                "name": "aws_dynamodb_table.data_store",
                "resource_type": "aws_dynamodb_table",
                "monthlyCost": "51.30"
            }
        ]
    
    def test_generate_usage_from_answers(self, usage_service, test_resources):
        """Test converting user answers into structured usage assumptions"""
        answers = [
            "24/7 operation",
            "About 2 million requests per month",
            "500k reads, 100k writes, and 50GB storage"
        ]
        
        result = usage_service.generate_usage_from_answers(test_resources, answers)
        
        # Check EC2 instance result
        assert "aws_instance.web_server" in result
        assert result["aws_instance.web_server"]["monthly_hours"] == 720  # 24 * 30 = 720 hours in a month
        
        # Check Lambda function result
        assert "aws_lambda_function.processor" in result
        assert result["aws_lambda_function.processor"]["monthly_requests"] == 2000000
        
        # Check DynamoDB table result
        assert "aws_dynamodb_table.data_store" in result
        assert "monthly_read_request_units" in result["aws_dynamodb_table.data_store"]
        assert "monthly_write_request_units" in result["aws_dynamodb_table.data_store"]
        assert "storage_gb" in result["aws_dynamodb_table.data_store"]
        assert result["aws_dynamodb_table.data_store"]["monthly_read_request_units"] == 500000
        assert result["aws_dynamodb_table.data_store"]["monthly_write_request_units"] == 100000
        assert result["aws_dynamodb_table.data_store"]["storage_gb"] == 50
    
    def test_process_ec2_usage(self, usage_service):
        """Test processing EC2 instance usage from answers"""
        # Test 24/7 detection
        assert usage_service._process_ec2_usage("Running 24/7") == {"monthly_hours": 720}
        assert usage_service._process_ec2_usage("Running all day, every day") == {"monthly_hours": 720}
        assert usage_service._process_ec2_usage("constant operation") == {"monthly_hours": 720}
        
        # Test business hours detection
        assert usage_service._process_ec2_usage("Only during work hours") == {"monthly_hours": 160}
        assert usage_service._process_ec2_usage("business hours only") == {"monthly_hours": 160}
        assert usage_service._process_ec2_usage("weekday operation") == {"monthly_hours": 160}
        
        # Test numeric extraction
        assert usage_service._process_ec2_usage("300 hours per month") == {"monthly_hours": 300}
        assert usage_service._process_ec2_usage("about 400 hours") == {"monthly_hours": 400}
        
        # Test extreme values
        assert usage_service._process_ec2_usage("1000 hours") == {"monthly_hours": 720}  # Should cap at 720
    
    def test_process_lambda_usage(self, usage_service):
        """Test processing Lambda function usage from answers"""
        assert usage_service._process_lambda_usage("100000 requests") == {"monthly_requests": 100000}
        assert usage_service._process_lambda_usage("about 2 million invocations") == {"monthly_requests": 2000000}
        assert usage_service._process_lambda_usage("3M requests") == {"monthly_requests": 3000000}
        assert usage_service._process_lambda_usage("500k invocations") == {"monthly_requests": 500000}
        
        # Test default when no number is found
        assert usage_service._process_lambda_usage("some requests") == {"monthly_requests": 1000000}
    
    def test_process_dynamodb_usage(self, usage_service):
        """Test processing DynamoDB usage from answers"""
        # Test with all values specified
        result = usage_service._process_dynamodb_usage("500k reads, 100k writes, 20GB storage")
        assert result["monthly_read_request_units"] == 500000
        assert result["monthly_write_request_units"] == 100000
        assert result["storage_gb"] == 20
        
        # Test with only some values specified
        result = usage_service._process_dynamodb_usage("2M reads only")
        assert result["monthly_read_request_units"] == 2000000
        assert result["monthly_write_request_units"] == 100000  # Default
        assert result["storage_gb"] == 10  # Default
        
        # Test default values when nothing is specified
        result = usage_service._process_dynamodb_usage("not sure yet")
        assert result["monthly_read_request_units"] == 1000000
        assert result["monthly_write_request_units"] == 100000
        assert result["storage_gb"] == 10
    
    def test_extract_numeric_value(self, usage_service):
        """Test extracting numeric values from text"""
        assert usage_service._extract_numeric_value("500 requests") == 500
        assert usage_service._extract_numeric_value("about 2,000 users") == 2000
        assert usage_service._extract_numeric_value("3 million records") == 3000000
        assert usage_service._extract_numeric_value("5k items") == 5000
        assert usage_service._extract_numeric_value("2m requests") == 2000000
        
        # Test with no numeric value
        assert usage_service._extract_numeric_value("some text") is None
    
    def test_extract_numeric_value_near_keyword(self, usage_service):
        """Test extracting numeric values near specific keywords"""
        assert usage_service._extract_numeric_value_near_keyword(
            "500 reads and 200 writes", "reads") == 500
        assert usage_service._extract_numeric_value_near_keyword(
            "reads: 500, writes: 200", "reads") == 500
        assert usage_service._extract_numeric_value_near_keyword(
            "storage: 50GB", "storage") == 50
        assert usage_service._extract_numeric_value_near_keyword(
            "5k reads per second", "reads") == 5000
        
        # Test with no match
        assert usage_service._extract_numeric_value_near_keyword(
            "some text", "keyword") is None
        
        # Test with multiple keywords
        assert usage_service._extract_numeric_value_near_keyword(
            "50GB of storage space", "storage", "gb") == 50