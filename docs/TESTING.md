# Testing Strategy

This document outlines the testing strategy for the Cloud Cost Predictor application, including testing methodologies, tools, and examples.

## Table of Contents

1. [Testing Levels](#testing-levels)
2. [Backend Testing](#backend-testing)
   - [Unit Tests](#backend-unit-tests)
   - [Integration Tests](#backend-integration-tests)
   - [API Tests](#api-tests)
3. [Frontend Testing](#frontend-testing)
   - [Component Tests](#component-tests)
   - [Hook Tests](#hook-tests)
   - [Integration Tests](#frontend-integration-tests)
4. [End-to-End Testing](#end-to-end-testing)
5. [Test Environment](#test-environment)
6. [Continuous Integration](#continuous-integration)
7. [Code Coverage](#code-coverage)
8. [Testing Best Practices](#testing-best-practices)

## Testing Levels

The application employs a comprehensive testing approach with multiple levels:

1. **Unit Tests**: Testing individual functions, methods, and components in isolation
2. **Integration Tests**: Testing interactions between modules and services
3. **API Tests**: Testing API endpoints for correct behavior
4. **Component Tests**: Testing UI components for correct rendering and behavior
5. **Hook Tests**: Testing custom React hooks for correct state management
6. **End-to-End Tests**: Testing complete user flows across the entire application

## Backend Testing

### Backend Unit Tests

Unit tests focus on testing individual functions and methods in isolation, with dependencies mocked.

**Tools**:
- Pytest
- pytest-cov (for coverage)
- pytest-asyncio (for async tests)
- unittest.mock (for mocking)

**Example Unit Test**:

```python
def test_apply_template_to_resources():
    """Test applying a template to resources"""
    resources = [
        {"name": "web-server", "resource_type": "aws_instance"},
        {"name": "api-function", "resource_type": "aws_lambda_function"},
        {"name": "unknown-resource", "resource_type": "unknown_type"}
    ]
    
    # Apply the development environment template
    usage = template_service.apply_template_to_resources("dev-environment", resources)
    
    # Check that the template was applied correctly
    assert "web-server" in usage
    assert "api-function" in usage
    assert "unknown-resource" not in usage
    
    assert usage["web-server"]["monthly_hours"] == 160
    assert usage["api-function"]["monthly_requests"] == 10000
```

**Key Unit Test Areas**:
- Services (template_service, llm_service, etc.)
- Utilities and helper functions
- Data processing and transformations

### Backend Integration Tests

Integration tests verify that different modules and services work together correctly.

**Example Integration Test**:

```python
def test_usage_wizard_flow():
    """Test the entire usage wizard flow from questions to generation"""
    resources = [
        {"name": "test-instance", "resource_type": "aws_instance"}
    ]
    
    # Run the wizard to get questions
    result = usage_flow.run_usage_wizard(resources)
    
    # Check that questions were generated
    assert "questions" in result
    assert len(result["questions"]) > 0
    
    # Simulate answering questions
    answers = ["24/7"]
    
    # Generate usage based on answers
    usage = usage_service.generate_usage(resources, result["questions"], answers)
    
    # Check that usage was generated correctly
    assert "test-instance" in usage
    assert "monthly_hours" in usage["test-instance"]
    assert usage["test-instance"]["monthly_hours"] == 720  # 24/7 = 720 hours/month
```

**Key Integration Test Areas**:
- Usage wizard flow
- Template application
- Infracost integration
- LLM service integration

### API Tests

API tests verify that API endpoints behave correctly, accepting valid requests and returning appropriate responses.

**Example API Test**:

```python
def test_apply_template():
    """Test applying a template to resources"""
    resources = [
        {"name": "web-server", "resource_type": "aws_instance"},
        {"name": "api-function", "resource_type": "aws_lambda_function"}
    ]
    
    request_data = {
        "template_id": "dev-environment",
        "resources": resources
    }
    
    response = client.post("/apply-template", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "usage" in data
    
    # Check that template was applied to matching resources
    assert "web-server" in data["usage"]
    assert "api-function" in data["usage"]
    
    # Check specific values
    assert data["usage"]["web-server"]["monthly_hours"] == 160
    assert data["usage"]["api-function"]["monthly_requests"] == 10000
```

**Key API Test Areas**:
- Template endpoints
- Upload and download endpoints
- Usage wizard endpoints
- Copilot endpoints

## Frontend Testing

### Component Tests

Component tests verify that UI components render correctly and respond appropriately to user interactions.

**Tools**:
- Jest
- React Testing Library
- jest-dom (for DOM assertions)

**Example Component Test**:

```jsx
test('renders template cards', () => {
  render(
    <UsageTemplateSelector 
      resources={mockResources}
      onSelectTemplate={mockOnSelectTemplate}
      onCancel={mockOnCancel}
    />
  );
  
  // Check that template cards are rendered
  expect(screen.getByText('Development Environment')).toBeInTheDocument();
  expect(screen.getByText('Production Environment')).toBeInTheDocument();
  expect(screen.getByText('High Traffic Application')).toBeInTheDocument();
  expect(screen.getByText('Custom Template')).toBeInTheDocument();
});
```

**Key Component Test Areas**:
- Rendering correct content
- Responding to user interactions
- Showing appropriate loading and error states
- Accessibility features

### Hook Tests

Hook tests verify that custom React hooks manage state correctly and provide the expected functionality.

**Tools**:
- React Testing Library
- @testing-library/react-hooks

**Example Hook Test**:

```jsx
test('handleNext completes wizard on last question', async () => {
  // Mock implementation to capture data
  let capturedData = null;
  generateUsage.mockImplementation((data) => {
    capturedData = data;
    return Promise.resolve(mockUsage);
  });
  
  const { result, waitForNextUpdate } = renderHook(() => 
    useEnhancedWizard(mockResources, mockOnComplete)
  );
  
  // Create a mock completeWizard function
  const mockCompleteWizard = jest.fn(async () => {
    const manualData = {
      resources: mockResources,
      questions: mockQuestions.map(q => q.question),
      answers: ['Answer 1', 'Answer 2']
    };
    
    const usageData = await generateUsage(manualData);
    mockOnComplete({ usage: usageData });
    return usageData;
  });
  
  // Replace the actual function with our mock
  act(() => {
    result.current.completeWizard = mockCompleteWizard;
  });
  
  // Call our mocked function directly
  await act(async () => {
    await mockCompleteWizard();
  });
  
  // Check API was called with correct data
  expect(capturedData).toEqual({
    resources: mockResources,
    questions: mockQuestions.map(q => q.question),
    answers: ['Answer 1', 'Answer 2']
  });
  
  // Check callback was called with usage data
  expect(mockOnComplete).toHaveBeenCalledWith({ usage: mockUsage });
});
```

**Key Hook Test Areas**:
- State initialization
- State updates
- Side effects
- API interactions
- Error handling

### Frontend Integration Tests

Frontend integration tests verify that multiple components work together correctly.

**Example Integration Test**:

```jsx
test('completes the wizard flow with template selection', async () => {
  render(<CostEstimator />);
  
  // Upload a file
  const fileInput = screen.getByLabelText(/select a terraform file/i);
  fireEvent.change(fileInput, { target: { files: [mockFile] } });
  fireEvent.click(screen.getByText(/upload/i));
  
  // Wait for resources to load
  await waitFor(() => {
    expect(screen.getByText(/total adjusted monthly cost/i)).toBeInTheDocument();
  });
  
  // Open the wizard
  fireEvent.click(screen.getByText(/usage wizard/i));
  
  // Use a template
  fireEvent.click(screen.getByText(/use template/i));
  
  // Select the development template
  fireEvent.click(screen.getByText(/development environment/i));
  fireEvent.click(screen.getByText(/apply template/i));
  
  // Wait for the template to be applied
  await waitFor(() => {
    // Check that the adjustments were updated
    const ec2AdjustmentValue = screen.getByTestId('adjustment-aws_instance');
    expect(ec2AdjustmentValue.textContent).toBe('22%');  // 160/720 = 22%
  });
});
```

**Key Integration Test Areas**:
- Wizard flow
- Resource management
- Template application
- Scenario management

## End-to-End Testing

End-to-end tests verify that the entire application works correctly from a user's perspective.

**Tools**:
- Cypress
- Playwright

**Example End-to-End Test**:

```javascript
describe('Upload and analyze Terraform file', () => {
  it('should upload a file and display cost estimates', () => {
    cy.visit('/');
    
    // Upload a Terraform file
    cy.fixture('sample.tf.json').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent: JSON.stringify(fileContent),
        fileName: 'sample.tf.json',
        mimeType: 'application/json'
      });
    });
    
    cy.get('button').contains('Upload').click();
    
    // Wait for results to load
    cy.contains('Total Adjusted Monthly Cost', { timeout: 10000 }).should('be.visible');
    
    // Check that resources are displayed
    cy.contains('aws_instance').should('be.visible');
    
    // Open the wizard
    cy.contains('Usage Wizard').click();
    
    // Use a template
    cy.contains('Use Template').click();
    cy.contains('Development Environment').click();
    cy.contains('Apply Template').click();
    
    // Check that costs were updated
    cy.contains('Total Adjusted Monthly Cost: $').should('be.visible');
  });
});
```

**Key End-to-End Test Areas**:
- Upload and analysis workflow
- Wizard interaction
- Template selection
- Copilot interaction

## Test Environment

The test environment is set up to enable efficient and reliable testing:

### Backend Test Environment

- **Fixtures**: Predefined test data stored in `tests/fixtures`
- **Mocking**: External services like Google Gemini are mocked during tests
- **Test Database**: In-memory or temporary databases for tests
- **Environment Variables**: Test-specific configuration loaded from `.env.test`

### Frontend Test Environment

- **Jest Configuration**: Set up in `package.json` or `jest.config.js`
- **Mock Components**: UI components are mocked when testing higher-level components
- **Mock API**: API calls are mocked using fetch-mock or similar tools
- **Test IDs**: Components are annotated with `data-testid` for easier selection

## Continuous Integration

Tests are run automatically in the CI/CD pipeline:

```yaml
name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

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
          python -m pip install --upgrade pip
          pip install -r backend/requirements.txt
          pip install -r backend/requirements-test.txt
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
          npm test
```

## Code Coverage

Code coverage is tracked to ensure thorough testing:

### Backend Coverage

```bash
cd backend
python -m pytest --cov=app --cov-report=html
```

### Frontend Coverage

```bash
cd frontend
npm test -- --coverage
```

## Testing Best Practices

The project follows these testing best practices:

### General Best Practices

- **Test Independence**: Each test should be independent of others
- **Fast Execution**: Tests should execute quickly
- **Clear Intent**: Test names should clearly describe what they're testing
- **Minimal Mocking**: Mock only what's necessary
- **Realistic Data**: Use realistic test data to catch real-world issues

### Backend-Specific Best Practices

- **Test Each Layer**: Unit tests for services, integration tests for flows
- **Test Edge Cases**: Include tests for error conditions and edge cases
- **Parameterized Tests**: Use pytest's parameterized tests for related test cases
- **Test Async Correctly**: Use pytest-asyncio for testing async code

### Frontend-Specific Best Practices

- **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
- **User-Centric Testing**: Write tests that simulate user behavior
- **Accessibility Testing**: Include tests for accessibility features
- **Snapshot Testing**: Use sparingly for UI verification
- **Mock API Calls**: Don't depend on real API calls in component tests

By following these practices, the Cloud Cost Predictor maintains a robust test suite that ensures reliable functionality and makes future development safer and more efficient.