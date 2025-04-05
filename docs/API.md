# Cloud Cost Predictor API Documentation

This document provides detailed information about the Cloud Cost Predictor API endpoints, including request formats, response structures, and examples.

## Table of Contents

1. [Authentication](#authentication)
2. [Base URL](#base-url)
3. [API Endpoints](#api-endpoints)
   - [Upload](#upload)
   - [Download](#download)
   - [Compare](#compare)
   - [Usage](#usage)
   - [Copilot](#copilot)
   - [Templates](#templates)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)

## Authentication

The API does not currently require authentication for development environments. For production deployments, authentication can be configured using API keys or OAuth2.

## Base URL

The base URL for all API endpoints is:

- Development: `http://localhost:8000`
- Production: `https://api.cloudcostpredictor.com` (example)

## API Endpoints

### Upload

#### `POST /upload`

Uploads and processes a Terraform file to generate cost estimates.

**Request:**
- Format: `multipart/form-data`
- Body:
  - `file`: Terraform file (required)

**Response:**
```json
{
  "uid": "abcd1234",
  "cost_breakdown": [
    {
      "name": "aws_instance.web_server",
      "resource_type": "aws_instance",
      "monthlyCost": "43.80",
      "details": {
        "instance_type": "t3.medium",
        "region": "us-east-1"
      }
    }
  ],
  "totalCost": "43.80"
}
```

### Download

#### `GET /download/{uid}`

Downloads a previously generated cost estimate.

**Parameters:**
- `uid`: Unique identifier of the estimate (path parameter, required)
- `format`: Output format, either `json` or `csv` (query parameter, optional, default: `json`)

**Response (JSON):**
```json
{
  "uid": "abcd1234",
  "created_at": "2023-06-15T10:30:00Z",
  "resources": [
    {
      "name": "aws_instance.web_server",
      "resource_type": "aws_instance",
      "monthlyCost": "43.80"
    }
  ],
  "totalCost": "43.80"
}
```

### Compare

#### `GET /compare`

Compares two cost estimates.

**Parameters:**
- `baseline`: UID of the baseline estimate (query parameter, required)
- `proposed`: UID of the proposed estimate (query parameter, required)

**Response:**
```json
{
  "diff": {
    "added": [
      {
        "name": "aws_s3_bucket.logs",
        "resource_type": "aws_s3_bucket",
        "monthlyCost": "2.30"
      }
    ],
    "removed": [],
    "changed": [
      {
        "name": "aws_instance.web_server",
        "baseline": { "monthlyCost": "43.80" },
        "proposed": { "monthlyCost": "87.60" },
        "diff": "43.80"
      }
    ]
  },
  "summary": {
    "baseline": "43.80",
    "proposed": "89.90",
    "diff": "46.10",
    "percentChange": "105.25%"
  }
}
```

#### `POST /compare-adjusted`

Compares an original estimate with an adjusted version (with usage assumptions).

**Request:**
```json
{
  "uid": "abcd1234",
  "current": [
    {
      "name": "aws_instance.web_server",
      "resource_type": "aws_instance",
      "monthlyCost": "43.80",
      "adjustment": 50
    }
  ]
}
```

**Response:**
```json
{
  "original": {
    "totalCost": "43.80"
  },
  "adjusted": {
    "totalCost": "21.90"
  },
  "diff": {
    "amount": "-21.90",
    "percent": "-50.00%"
  }
}
```

### Usage

#### `POST /usage-clarify`

Generates clarifying questions for resource usage.

**Request:**
```json
{
  "resources": [
    {
      "name": "aws_instance.web_server",
      "resource_type": "aws_instance"
    }
  ]
}
```

**Response:**
```json
{
  "questions": [
    {
      "resource_name": "aws_instance.web_server",
      "question": "Is this EC2 instance running 24/7 or only during business hours?"
    }
  ]
}
```

#### `POST /usage-generate`

Converts user answers into structured usage data.

**Request:**
```json
{
  "resources": [
    {
      "name": "aws_instance.web_server",
      "resource_type": "aws_instance"
    }
  ],
  "questions": [
    "Is this EC2 instance running 24/7 or only during business hours?"
  ],
  "answers": [
    "Only during business hours, 8 hours per day on weekdays"
  ]
}
```

**Response:**
```json
{
  "usage": {
    "aws_instance.web_server": {
      "monthly_hours": 160
    }
  }
}
```

### Copilot

#### `POST /copilot`

Asks a question to the AI copilot.

**Request:**
```json
{
  "question": "How can I reduce my EC2 costs?",
  "resources": [
    {
      "name": "aws_instance.web_server",
      "resource_type": "aws_instance",
      "monthlyCost": "43.80"
    }
  ]
}
```

**Response:**
```json
{
  "answer": "You could consider the following options to reduce your EC2 costs:\n\n1. Use Reserved Instances instead of On-Demand for a potential 40-60% cost reduction\n2. Right-size your instance - you're using a t3.medium but might be able to use a t3.small\n3. Implement auto-scaling to automatically shut down instances during off-hours"
}
```

#### `POST /analyze-diff`

Analyzes a Terraform diff to generate a cost impact comment.

**Request:**
```json
{
  "diff": "+ aws_instance.web_server\n- aws_lambda_function.processor"
}
```

**Response:**
```json
{
  "summary": "This change adds a new EC2 instance and removes a Lambda function. Overall cost impact: +$38.20/month (+87%)."
}
```

### Templates

#### `GET /templates`

Gets all available usage templates.

**Response:**
```json
{
  "templates": [
    {
      "id": "dev-environment",
      "name": "Development Environment",
      "description": "Resources run during business hours (8 hours/day, weekdays)",
      "template": {
        "aws_instance": { "monthly_hours": 160 },
        "aws_lambda_function": { "monthly_requests": 10000 }
      }
    },
    {
      "id": "prod-environment",
      "name": "Production Environment",
      "description": "24/7 operation with moderate traffic",
      "template": {
        "aws_instance": { "monthly_hours": 720 },
        "aws_lambda_function": { "monthly_requests": 1000000 }
      }
    }
  ]
}
```

#### `GET /templates/{template_id}`

Gets a specific template by ID.

**Parameters:**
- `template_id`: ID of the template (path parameter, required)

**Response:**
```json
{
  "id": "dev-environment",
  "name": "Development Environment",
  "description": "Resources run during business hours (8 hours/day, weekdays)",
  "template": {
    "aws_instance": { "monthly_hours": 160 },
    "aws_lambda_function": { "monthly_requests": 10000 }
  }
}
```

#### `POST /templates`

Creates a new custom template.

**Request:**
```json
{
  "id": "custom-template",
  "name": "My Custom Template",
  "description": "Custom template for specific workload",
  "template": {
    "aws_instance": { "monthly_hours": 400 },
    "aws_lambda_function": { "monthly_requests": 50000 }
  }
}
```

**Response:**
```json
{
  "id": "custom-template",
  "name": "My Custom Template",
  "description": "Custom template for specific workload",
  "template": {
    "aws_instance": { "monthly_hours": 400 },
    "aws_lambda_function": { "monthly_requests": 50000 }
  }
}
```

#### `DELETE /templates/{template_id}`

Deletes a custom template.

**Parameters:**
- `template_id`: ID of the template (path parameter, required)

**Response:**
```json
{
  "status": "deleted",
  "id": "custom-template"
}
```

#### `POST /apply-template`

Applies a template to a list of resources.

**Request:**
```json
{
  "template_id": "dev-environment",
  "resources": [
    {
      "name": "web-server",
      "resource_type": "aws_instance"
    },
    {
      "name": "api-function",
      "resource_type": "aws_lambda_function"
    }
  ]
}
```

**Response:**
```json
{
  "usage": {
    "web-server": { "monthly_hours": 160 },
    "api-function": { "monthly_requests": 10000 }
  }
}
```

## Error Handling

The API uses standard HTTP status codes for error responses:

- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Requested resource not found
- `422 Unprocessable Entity`: Request validation failed
- `500 Internal Server Error`: Server-side error

Error responses follow this format:

```json
{
  "detail": "Error message describing the issue"
}
```

## Rate Limiting

Rate limiting is not implemented in the development environment. In production, API requests are limited to 100 requests per minute per IP address.

When the rate limit is exceeded, the API returns a `429 Too Many Requests` status code.