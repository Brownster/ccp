# Testing Strategy for Terraform Cost Estimator

This document outlines the testing approach for the Terraform Cost Estimator application, covering both backend and frontend components.

## Backend Testing

### Unit Tests

We've created comprehensive unit tests for the service layer:

- **InfracostService Tests** - Cover file processing, resource extraction, and comparison logic
- **LLMService Tests** - Cover model interactions, usage suggestions, and error handling
- **UsageService Tests** - Cover usage data parsing and transformation logic

### API Tests

We've implemented tests for the API routes:

- **Upload Router Tests** - Test file uploads, downloads, and comparison endpoints
- **Usage Router Tests** - Test usage suggestion, clarification, and generation endpoints
- **Copilot Router Tests** - Test AI assistant and diff analysis endpoints

### Fixtures

The test suite uses fixture files to simulate real-world data:

- `infracost_output.json` - Sample Infracost CLI output
- `llm_responses.json` - Mock LLM responses for various queries
- `terraform_zip_content/` - Sample Terraform files for testing

### Running Backend Tests

```bash
cd backend
python -m pytest
python -m pytest tests/services/  # Test services
python -m pytest tests/routers/   # Test routers
python -m pytest -v               # Verbose output
python -m pytest --cov=app        # Generate coverage report
```

## Frontend Testing

### Component Tests

We've created tests for key UI components:

- **ResourceCard** - Tests resource display and adjustment functionality
- **ResourceGroup** - Tests grouping and rendering of resources
- **UsageWizardModal** - Tests the wizard flow for gathering usage data
- **CopilotSidebar** - Tests the AI assistant sidebar

### Hook Tests

Custom React hooks are tested independently:

- **useResources** - Tests resource management and cost calculation
- **useUsageWizard** - Tests the wizard flow state management
- **useCopilot** - Tests the AI chatbot interaction

### Service Tests

The API service layer is tested with mocks:

- **api.js** - Tests all API interactions with mocked responses

### Running Frontend Tests

```bash
cd frontend
npm test                  # Run all tests
npm test -- --watch       # Watch mode
npm test -- --coverage    # Generate coverage report
```

## Integration Testing

Integration tests verify that the backend and frontend work together correctly:

1. Backend services interact correctly with external dependencies
2. API endpoints work with the service layer
3. Frontend components communicate properly with the backend

## End-to-End Testing

Manual testing scenarios to validate complete flows:

1. Upload a Terraform file and see cost breakdown
2. Use the wizard to adjust usage assumptions
3. Compare different cost estimates
4. Use the AI copilot to get insights

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install -r requirements-test.txt
      - name: Run tests
        run: |
          cd backend
          python -m pytest --cov=app

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      - name: Run tests
        run: |
          cd frontend
          npm test -- --coverage
```

## Testing Tools

- **Backend**: pytest, pytest-cov, pytest-asyncio, httpx, unittest.mock
- **Frontend**: Jest, React Testing Library, MSW (Mock Service Worker)

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Mocking External Services**: LLM API and Infracost CLI calls are mocked
3. **Comprehensive Coverage**: Aim for >80% test coverage across the codebase
4. **Readable Tests**: Tests should be clear and document expected behavior
5. **Fast Execution**: Tests should run quickly to encourage frequent testing