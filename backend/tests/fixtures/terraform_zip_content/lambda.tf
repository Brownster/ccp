resource "aws_lambda_function" "processor" {
  function_name = "data-processor"
  handler       = "index.handler"
  runtime       = "nodejs14.x"
  memory_size   = 512
  timeout       = 30
  
  role = aws_iam_role.lambda_role.arn
  
  environment {
    variables = {
      ENVIRONMENT = "test"
    }
  }
  
  tags = {
    Name = "DataProcessor"
    Environment = "Test"
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "lambda-execution-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}