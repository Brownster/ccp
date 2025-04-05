from typing import Dict, List, Any, Optional
import json

class UsageService:
    """
    Service for handling usage assumptions and conversions
    """
    
    def generate_usage_from_answers(self, 
                                  resources: List[Dict[str, Any]], 
                                  answers: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Convert user answers into structured usage assumptions
        
        Args:
            resources: List of terraform resources
            answers: User answers to usage questions, aligned with resources
            
        Returns:
            Dictionary mapping resource names to usage parameters
        """
        usage = {}
        
        for idx, res in enumerate(resources):
            if idx >= len(answers):
                continue
                
            name = res.get("name")
            if not name:
                continue
                
            # Convert based on resource type and answer
            if res.get("resource_type") == "aws_instance":
                usage[name] = self._process_ec2_usage(answers[idx])
            elif res.get("resource_type") == "aws_lambda_function":
                usage[name] = self._process_lambda_usage(answers[idx])
            elif res.get("resource_type") == "aws_dynamodb_table":
                usage[name] = self._process_dynamodb_usage(answers[idx])
            else:
                usage[name] = {}  # Default empty usage for unknown types
        
        return usage
    
    def _process_ec2_usage(self, answer: str) -> Dict[str, Any]:
        """
        Process EC2 instance usage from answer
        """
        # Look for 24/7 or similar indicators
        is_247 = any(term in answer.lower() for term in ["24/7", "24 7", "all day", "always", "constantly"])
        is_workday = any(term in answer.lower() for term in ["work", "business", "office", "weekday"])
        
        if is_247:
            return {"monthly_hours": 720}  # 24 * 30 = 720 hours in a month
        elif is_workday:
            return {"monthly_hours": 160}  # 8 hours * 20 work days = 160
        else:
            # Try to extract numeric values 
            hours = self._extract_numeric_value(answer)
            if hours:
                return {"monthly_hours": min(hours, 720)}  # Cap at maximum monthly hours
            return {"monthly_hours": 160}  # Default assumption
    
    def _process_lambda_usage(self, answer: str) -> Dict[str, Any]:
        """
        Process Lambda function usage from answer
        """
        requests = self._extract_numeric_value(answer) 
        
        if requests:
            return {"monthly_requests": requests}
        
        # Default moderate usage if no clear indication
        return {"monthly_requests": 1000000}
    
    def _process_dynamodb_usage(self, answer: str) -> Dict[str, Any]:
        """
        Process DynamoDB usage from answer
        """
        # Start with default values
        usage = {
            "monthly_read_request_units": 1000000,
            "monthly_write_request_units": 100000,
            "storage_gb": 10
        }
        
        # Try to extract specific values based on keywords
        if "read" in answer.lower():
            read_value = self._extract_numeric_value_near_keyword(answer, "read")
            if read_value:
                usage["monthly_read_request_units"] = read_value
                
        if "write" in answer.lower():
            write_value = self._extract_numeric_value_near_keyword(answer, "write")
            if write_value:
                usage["monthly_write_request_units"] = write_value
                
        if "storage" in answer.lower() or "gb" in answer.lower():
            storage_value = self._extract_numeric_value_near_keyword(answer, "storage", "gb")
            if storage_value:
                usage["storage_gb"] = storage_value
                
        return usage
    
    def _extract_numeric_value(self, text: str) -> Optional[int]:
        """
        Extract numeric values from text
        """
        import re
        # Look for common number patterns with K, M, B suffixes
        patterns = [
            r'(\d+)\s*million', # 5 million
            r'(\d+)\s*m\b',     # 5m 
            r'(\d+)\s*k\b',     # 50k
            r'(\d+),?(\d+)',    # 5,000 or 5000
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                value = match.group(1).replace(',', '')
                if 'million' in text.lower() or 'm' in text.lower():
                    return int(value) * 1000000
                elif 'k' in text.lower():
                    return int(value) * 1000
                else:
                    return int(value)
        
        # Last resort - extract any number
        numbers = re.findall(r'\d+', text)
        if numbers:
            return int(numbers[0])
            
        return None
    
    def _extract_numeric_value_near_keyword(self, text: str, *keywords) -> Optional[int]:
        """
        Extract numeric value near a specific keyword
        """
        import re
        
        # Look for patterns like "500 reads" or "reads: 500"
        for keyword in keywords:
            patterns = [
                rf'(\d+)[\s,]*{keyword}',      # 500 reads
                rf'{keyword}[\s:,]*(\d+)',     # reads: 500
                rf'{keyword}[\s:,]*(\d+)\s*k', # reads: 500k
                rf'{keyword}[\s:,]*(\d+)\s*m'  # reads: 5m
            ]
            
            for pattern in patterns:
                match = re.search(pattern, text.lower())
                if match:
                    value = match.group(1).replace(',', '')
                    if 'm' in text.lower():
                        return int(value) * 1000000
                    elif 'k' in text.lower():
                        return int(value) * 1000
                    else:
                        return int(value)
        
        return None
