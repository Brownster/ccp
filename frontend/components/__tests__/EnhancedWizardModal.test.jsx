import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedWizardModal } from '../EnhancedWizardModal';

// We don't need to mock the UI components anymore since they're mocked in the component file

// Create mock components for testing
const mockUsageReviewModal = ({ usageData, onConfirm }) => (
  <div data-testid="usage-review-modal">
    <button onClick={() => onConfirm(true)}>Confirm</button>
    <button onClick={() => onConfirm(false)}>Cancel</button>
  </div>
);

const mockUsageTemplateSelector = ({ resources, onSelectTemplate, onCancel }) => (
  <div data-testid="template-selector">
    <button onClick={() => onSelectTemplate({})}>Apply Template</button>
    <button onClick={onCancel}>Cancel</button>
  </div>
);

// Replace imports in the file being tested
jest.mock('../UsageReviewModal', () => {
  return {
    UsageReviewModal: mockUsageReviewModal
  };
}, { virtual: true });

jest.mock('../UsageTemplateSelector', () => {
  return {
    UsageTemplateSelector: mockUsageTemplateSelector
  };
}, { virtual: true });

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      questions: [
        'Is this EC2 instance running 24/7?',
        'How many requests per month for Lambda?'
      ]
    }),
  })
);

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('EnhancedWizardModal component', () => {
  const mockResources = [
    { name: 'ec2-instance', resource_type: 'aws_instance' },
    { name: 'lambda-function', resource_type: 'aws_lambda_function' }
  ];
  
  const mockOnFinish = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Mock initial empty profiles
    localStorage.getItem.mockReturnValue(JSON.stringify([]));
  });

  test('renders loading state initially', () => {
    render(
      <EnhancedWizardModal
        resources={mockResources}
        onFinish={mockOnFinish}
      />
    );
    
    expect(screen.getByText(/scanning your infrastructure/i)).toBeInTheDocument();
  });
  
  test('renders questions after loading', async () => {
    render(
      <EnhancedWizardModal
        resources={mockResources}
        onFinish={mockOnFinish}
      />
    );
    
    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText('Is this EC2 instance running 24/7?')).toBeInTheDocument();
    });
    
    // Check progress indicator
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument();
    
    // Check navigation buttons
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Skip')).toBeInTheDocument();
    expect(screen.getByText('Use Template')).toBeInTheDocument();
  });
  
  test('navigates to next question', async () => {
    render(
      <EnhancedWizardModal
        resources={mockResources}
        onFinish={mockOnFinish}
      />
    );
    
    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText('Is this EC2 instance running 24/7?')).toBeInTheDocument();
    });
    
    // Enter an answer and click next
    fireEvent.change(screen.getByPlaceholderText('Your answer'), {
      target: { value: '24/7' }
    });
    
    fireEvent.click(screen.getByText('Next'));
    
    // Should show the second question
    expect(screen.getByText('How many requests per month for Lambda?')).toBeInTheDocument();
    
    // Progress should update
    expect(screen.getByText('Step 2 of 2')).toBeInTheDocument();
    
    // Previous button should now be available
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });
  
  test('navigates to previous question', async () => {
    render(
      <EnhancedWizardModal
        resources={mockResources}
        onFinish={mockOnFinish}
      />
    );
    
    // Wait for questions to load and navigate to second question
    await waitFor(() => {
      expect(screen.getByText('Is this EC2 instance running 24/7?')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('How many requests per month for Lambda?')).toBeInTheDocument();
    
    // Go back to previous question
    fireEvent.click(screen.getByText('Previous'));
    
    // Should show the first question again
    expect(screen.getByText('Is this EC2 instance running 24/7?')).toBeInTheDocument();
  });
  
  test('completes wizard and generates usage data', async () => {
    // Mock the usage generation API
    global.fetch.mockImplementation((url) => {
      if (url.includes('/usage-generate')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            usage: {
              'ec2-instance': { monthly_hours: 720 },
              'lambda-function': { monthly_requests: 1000000 }
            }
          }),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          questions: [
            'Is this EC2 instance running 24/7?',
            'How many requests per month for Lambda?'
          ]
        }),
      });
    });
    
    render(
      <EnhancedWizardModal
        resources={mockResources}
        onFinish={mockOnFinish}
      />
    );
    
    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText('Is this EC2 instance running 24/7?')).toBeInTheDocument();
    });
    
    // Fill in answers and navigate to the end
    fireEvent.change(screen.getByPlaceholderText('Your answer'), {
      target: { value: '24/7' }
    });
    
    fireEvent.click(screen.getByText('Next'));
    
    fireEvent.change(screen.getByPlaceholderText('Your answer'), {
      target: { value: '1 million' }
    });
    
    // Click Finish (since we're on the last question)
    fireEvent.click(screen.getByText('Finish'));
    
    // Should call the usage generate API
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/usage-generate'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String)
        })
      );
    });
    
    // Should render the review modal
    await waitFor(() => {
      expect(screen.getByTestId('usage-review-modal')).toBeInTheDocument();
    });
    
    // Confirm the usage data
    fireEvent.click(screen.getByText('Confirm'));
    
    // Check onFinish was called with the usage data
    expect(mockOnFinish).toHaveBeenCalledWith({
      usage: {
        'ec2-instance': { monthly_hours: 720 },
        'lambda-function': { monthly_requests: 1000000 }
      }
    });
  });
  
  test('saves and loads profile', async () => {
    render(
      <EnhancedWizardModal
        resources={mockResources}
        onFinish={mockOnFinish}
      />
    );
    
    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText('Is this EC2 instance running 24/7?')).toBeInTheDocument();
    });
    
    // Add answer
    fireEvent.change(screen.getByPlaceholderText('Your answer'), {
      target: { value: '24/7' }
    });
    
    // Mock the window.prompt for profile name
    const originalPrompt = window.prompt;
    window.prompt = jest.fn(() => 'Test Profile');
    
    // Click save profile
    fireEvent.click(screen.getByText('Save Profile'));
    
    // Check localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'usageProfiles',
      expect.stringContaining('Test Profile')
    );
    
    // Restore original prompt
    window.prompt = originalPrompt;
  });
});