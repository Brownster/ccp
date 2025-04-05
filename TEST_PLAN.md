# Test Plan for Terraform Cost Estimator

This document outlines the testing strategy for the Terraform Cost Estimator application, covering both backend and frontend components.

## Backend Tests

### Service Layer Tests

#### 1. InfracostService Tests

- [ ] **test_process_terraform_file_zip** - Test processing a ZIP file containing Terraform files
- [ ] **test_process_terraform_file_plan** - Test processing a plan file (JSON/tfplan)
- [ ] **test_extract_resources** - Test extracting resources from Infracost output
- [ ] **test_compare_estimates** - Test comparing two cost estimates
- [ ] **test_handle_invalid_file_type** - Test handling of unsupported file types
- [ ] **test_handle_missing_estimate** - Test error handling for missing estimates

#### 2. LLMService Tests

- [ ] **test_suggest_usage_percentage** - Test suggesting usage percentage for a resource
- [ ] **test_copilot_response** - Test generating copilot responses
- [ ] **test_analyze_diff** - Test analyzing terraform diffs
- [ ] **test_clarify_usage_questions** - Test generating usage questions
- [ ] **test_generate_usage_assumptions** - Test generating usage from answers
- [ ] **test_llm_error_handling** - Test handling LLM errors gracefully

#### 3. UsageService Tests

- [ ] **test_generate_usage_from_answers** - Test converting user answers to usage data
- [ ] **test_process_ec2_usage** - Test processing EC2 answers
- [ ] **test_process_lambda_usage** - Test processing Lambda answers
- [ ] **test_process_dynamodb_usage** - Test processing DynamoDB answers
- [ ] **test_extract_numeric_value** - Test extracting numbers from text
- [ ] **test_extract_numeric_value_near_keyword** - Test extracting numbers near keywords

### API Endpoint Tests

#### 1. Upload Router Tests

- [ ] **test_upload_terraform_zip** - Test ZIP file upload endpoint
- [ ] **test_upload_terraform_plan** - Test plan file upload endpoint
- [ ] **test_download_estimate** - Test downloading an estimate
- [ ] **test_compare_estimates_endpoint** - Test comparing estimates endpoint
- [ ] **test_compare_adjusted** - Test adjusted comparison endpoint

#### 2. Usage Router Tests

- [ ] **test_suggest_usage_endpoint** - Test usage suggestion endpoint
- [ ] **test_usage_wizard** - Test the usage wizard endpoint
- [ ] **test_usage_clarify** - Test usage clarify endpoint
- [ ] **test_usage_generate** - Test usage generate endpoint

#### 3. Copilot Router Tests

- [ ] **test_copilot_endpoint** - Test the copilot endpoint
- [ ] **test_analyze_diff_endpoint** - Test the diff analysis endpoint

### Integration Tests

- [ ] **test_end_to_end_flow** - Test entire flow from upload to usage generation
- [ ] **test_infracost_integration** - Test real Infracost CLI integration
- [ ] **test_llm_integration** - Test LLM service with real API

## Frontend Tests

### Hook Tests

#### 1. useResources Hook Tests

- [ ] **test_file_upload** - Test file upload functionality
- [ ] **test_resource_loading** - Test loading resources
- [ ] **test_adjustment_updates** - Test updating adjustments
- [ ] **test_total_cost_calculation** - Test cost calculation
- [ ] **test_error_handling** - Test error handling
- [ ] **test_apply_usage_data** - Test applying usage data to adjustments

#### 2. useUsageWizard Hook Tests

- [ ] **test_wizard_open_close** - Test opening and closing the wizard
- [ ] **test_question_loading** - Test loading questions
- [ ] **test_answer_updates** - Test updating answers
- [ ] **test_navigation** - Test navigation between questions
- [ ] **test_completion** - Test completing the wizard
- [ ] **test_wizard_error_handling** - Test wizard error handling

#### 3. useCopilot Hook Tests

- [ ] **test_sending_message** - Test sending a message
- [ ] **test_receive_response** - Test receiving a response
- [ ] **test_toggle_sidebar** - Test toggling the sidebar
- [ ] **test_copilot_error_handling** - Test copilot error handling

### Component Tests

#### 1. CostEstimator Component Tests

- [ ] **test_initial_render** - Test initial component rendering
- [ ] **test_resources_display** - Test displaying resources after upload
- [ ] **test_wizard_integration** - Test wizard integration with main component
- [ ] **test_copilot_integration** - Test copilot integration with main component

#### 2. Individual Component Tests

- [ ] **test_upload_form** - Test UploadForm component
- [ ] **test_resource_group** - Test ResourceGroup component
- [ ] **test_resource_card** - Test ResourceCard component
- [ ] **test_usage_wizard_modal** - Test UsageWizardModal component
- [ ] **test_copilot_sidebar** - Test CopilotSidebar component

### API Service Tests

- [ ] **test_upload_terraform** - Test uploadTerraform function
- [ ] **test_get_usage_assumption** - Test getUsageAssumption function
- [ ] **test_get_clarify_questions** - Test getClarifyQuestions function
- [ ] **test_generate_usage** - Test generateUsage function
- [ ] **test_ask_copilot** - Test askCopilot function
- [ ] **test_download_estimate** - Test downloadEstimate function
- [ ] **test_compare_estimates** - Test compareEstimates function
- [ ] **test_api_error_handling** - Test API error handling

## Testing Tools and Setup

### Backend Testing

- **pytest** - Test framework
- **pytest-cov** - Coverage reporting
- **unittest.mock** - Mocking dependencies
- **httpx** - Testing FastAPI endpoints
- **pytest-asyncio** - Testing async code

Setup:
```bash
cd backend
pip install -r requirements-test.txt
pytest --cov=app
```

### Frontend Testing

- **Jest** - Test framework
- **React Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking

Setup:
```bash
cd frontend
npm install --save-dev jest @testing-library/react @testing-library/jest-dom msw
npx jest --coverage
```

## Test Data

- Sample Terraform files in `/backend/tests/fixtures/`
- Mock Infracost output in `/backend/tests/fixtures/`
- Sample LLM responses in `/backend/tests/fixtures/`

## Mocking Strategy

### Backend Mocks

- Mock Infracost CLI calls using unittest.mock
- Mock LLM service using preset responses
- Mock file system operations for testing

### Frontend Mocks

- Mock API responses using MSW
- Mock file uploads using File API mocks
- Mock timers for testing loading states