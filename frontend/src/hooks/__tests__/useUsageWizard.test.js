import { renderHook, act } from '@testing-library/react-hooks';
import { useUsageWizard } from '../useUsageWizard';
import { getClarifyQuestions, generateUsage } from '../../services/api';

// Mock the API functions
jest.mock('../../services/api', () => ({
  getClarifyQuestions: jest.fn(),
  generateUsage: jest.fn(),
}));

describe('useUsageWizard hook', () => {
  // Mock resources
  const mockResources = [
    { name: 'resource1', resource_type: 'aws_instance', monthlyCost: '10.00' },
    { name: 'resource2', resource_type: 'aws_lambda_function', monthlyCost: '5.25' },
  ];
  
  // Mock questions
  const mockQuestions = [
    { resource_name: 'resource1', question: 'Is this EC2 instance running 24/7?' },
    { resource_name: 'resource2', question: 'How many requests per month?' },
  ];
  
  // Mock usage data
  const mockUsage = {
    resource1: { monthly_hours: 720 },
    resource2: { monthly_requests: 1000000 },
  };
  
  // Mock callback
  const mockOnComplete = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    getClarifyQuestions.mockResolvedValue(mockQuestions);
    generateUsage.mockResolvedValue(mockUsage);
  });
  
  test('initial state is correct', () => {
    const { result } = renderHook(() => useUsageWizard(mockResources, mockOnComplete));
    
    expect(result.current.isOpen).toBe(false);
    expect(result.current.questions).toEqual([]);
    expect(result.current.answers).toEqual([]);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
  
  test('openWizard fetches questions and updates state', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useUsageWizard(mockResources, mockOnComplete)
    );
    
    // Open the wizard
    act(() => {
      result.current.openWizard();
    });
    
    // Loading state should be true immediately
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isOpen).toBe(true);
    
    // Wait for the API request to complete
    await waitForNextUpdate();
    
    // Check the updated state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.questions).toEqual(mockQuestions);
    expect(result.current.answers).toEqual(['', '']);
    expect(result.current.currentStep).toBe(0);
    
    // Verify API was called with resources
    expect(getClarifyQuestions).toHaveBeenCalledWith(mockResources);
  });
  
  test('openWizard handles API error', async () => {
    // Mock API error
    getClarifyQuestions.mockRejectedValue(new Error('API error'));
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useUsageWizard(mockResources, mockOnComplete)
    );
    
    // Open the wizard
    act(() => {
      result.current.openWizard();
    });
    
    // Wait for the API request to complete
    await waitForNextUpdate();
    
    // Check the updated state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('API error');
    expect(result.current.questions).toEqual([]);
  });
  
  test('closeWizard resets the state', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useUsageWizard(mockResources, mockOnComplete)
    );
    
    // Open the wizard and wait for questions
    act(() => {
      result.current.openWizard();
    });
    await waitForNextUpdate();
    
    // Verify questions were loaded
    expect(result.current.questions.length).toBeGreaterThan(0);
    
    // Close the wizard
    act(() => {
      result.current.closeWizard();
    });
    
    // Check state is reset
    expect(result.current.isOpen).toBe(false);
    expect(result.current.questions).toEqual([]);
    expect(result.current.answers).toEqual([]);
    expect(result.current.currentStep).toBe(0);
  });
  
  test('updateAnswer updates a specific answer', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useUsageWizard(mockResources, mockOnComplete)
    );
    
    // Open the wizard and wait for questions
    act(() => {
      result.current.openWizard();
    });
    await waitForNextUpdate();
    
    // Update an answer
    act(() => {
      result.current.updateAnswer(0, 'Test answer');
    });
    
    // Check that only the specified answer was updated
    expect(result.current.answers[0]).toBe('Test answer');
    expect(result.current.answers[1]).toBe('');
  });
  
  test('handleNext advances to next question', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useUsageWizard(mockResources, mockOnComplete)
    );
    
    // Open the wizard and wait for questions
    act(() => {
      result.current.openWizard();
    });
    await waitForNextUpdate();
    
    // Move to the next question
    act(() => {
      result.current.handleNext();
    });
    
    // Check current step advanced
    expect(result.current.currentStep).toBe(1);
  });
  
  test('handleNext completes wizard on last question', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useUsageWizard(mockResources, mockOnComplete)
    );
    
    // Open the wizard and wait for questions
    act(() => {
      result.current.openWizard();
    });
    await waitForNextUpdate();
    
    // Fill in answers
    act(() => {
      result.current.updateAnswer(0, 'Answer 1');
      result.current.updateAnswer(1, 'Answer 2');
    });
    
    // Move to the last question
    act(() => {
      result.current.handleNext();
    });
    expect(result.current.currentStep).toBe(1);
    
    // Complete the wizard
    act(() => {
      result.current.handleNext();
    });
    
    // Wait for the generate API call to complete
    await waitForNextUpdate();
    
    // Check wizard is closed
    expect(result.current.isOpen).toBe(false);
    
    // Check API was called with correct parameters
    expect(generateUsage).toHaveBeenCalledWith(
      mockResources,
      expect.arrayContaining([
        expect.objectContaining({ resource_name: 'resource1', answer: 'Answer 1' }),
        expect.objectContaining({ resource_name: 'resource2', answer: 'Answer 2' })
      ])
    );
    
    // Check callback was called with usage data
    expect(mockOnComplete).toHaveBeenCalledWith({ usage: mockUsage });
  });
  
  test('handlePrevious goes back to previous question', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useUsageWizard(mockResources, mockOnComplete)
    );
    
    // Open the wizard and wait for questions
    act(() => {
      result.current.openWizard();
    });
    await waitForNextUpdate();
    
    // Move to the next question
    act(() => {
      result.current.handleNext();
    });
    expect(result.current.currentStep).toBe(1);
    
    // Go back to previous question
    act(() => {
      result.current.handlePrevious();
    });
    
    // Check current step went back
    expect(result.current.currentStep).toBe(0);
  });
  
  test('handlePrevious does nothing on first question', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useUsageWizard(mockResources, mockOnComplete)
    );
    
    // Open the wizard and wait for questions
    act(() => {
      result.current.openWizard();
    });
    await waitForNextUpdate();
    
    // Try to go to previous question from first question
    act(() => {
      result.current.handlePrevious();
    });
    
    // Check current step didn't change
    expect(result.current.currentStep).toBe(0);
  });
  
  test('getCurrentQuestion returns the current question', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useUsageWizard(mockResources, mockOnComplete)
    );
    
    // Open the wizard and wait for questions
    act(() => {
      result.current.openWizard();
    });
    await waitForNextUpdate();
    
    // Check current question is correct
    expect(result.current.getCurrentQuestion()).toEqual(mockQuestions[0]);
    
    // Move to next question
    act(() => {
      result.current.handleNext();
    });
    
    // Check current question updated
    expect(result.current.getCurrentQuestion()).toEqual(mockQuestions[1]);
  });
});