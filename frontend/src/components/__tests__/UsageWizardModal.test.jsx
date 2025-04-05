import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UsageWizardModal } from '../UsageWizardModal';

describe('UsageWizardModal component', () => {
  // Mock props
  const mockQuestions = [
    { question: 'Question 1?' },
    { question: 'Question 2?' }
  ];
  
  const mockAnswers = ['Answer 1', ''];
  const mockCurrentStep = 0;
  
  const mockHandlers = {
    onAnswerChange: jest.fn(),
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onClose: jest.fn(),
    getCurrentQuestion: jest.fn().mockReturnValue(mockQuestions[0])
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders nothing when not open', () => {
    const { container } = render(
      <UsageWizardModal 
        isOpen={false}
        questions={mockQuestions}
        answers={mockAnswers}
        currentStep={mockCurrentStep}
        isLoading={false}
        error={null}
        {...mockHandlers}
      />
    );
    
    expect(container).toBeEmptyDOMElement();
  });
  
  test('renders loading state', () => {
    render(
      <UsageWizardModal 
        isOpen={true}
        questions={[]}
        answers={[]}
        currentStep={0}
        isLoading={true}
        error={null}
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
  
  test('renders error message', () => {
    const errorMessage = 'Test error message';
    
    render(
      <UsageWizardModal 
        isOpen={true}
        questions={[]}
        answers={[]}
        currentStep={0}
        isLoading={false}
        error={errorMessage}
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
  
  test('renders "no questions" message when questions array is empty', () => {
    render(
      <UsageWizardModal 
        isOpen={true}
        questions={[]}
        answers={[]}
        currentStep={0}
        isLoading={false}
        error={null}
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText(/No questions needed/i)).toBeInTheDocument();
  });
  
  test('renders current question and answer input', () => {
    render(
      <UsageWizardModal 
        isOpen={true}
        questions={mockQuestions}
        answers={mockAnswers}
        currentStep={mockCurrentStep}
        isLoading={false}
        error={null}
        {...mockHandlers}
      />
    );
    
    // Check if question and step indicator are displayed
    expect(screen.getByText(/Question 1 of 2/i)).toBeInTheDocument();
    expect(screen.getByText('Question 1?')).toBeInTheDocument();
    
    // Check if answer input has the correct value
    const input = screen.getByPlaceholderText('Your answer');
    expect(input).toHaveValue('Answer 1');
  });
  
  test('calls onAnswerChange when input changes', () => {
    render(
      <UsageWizardModal 
        isOpen={true}
        questions={mockQuestions}
        answers={mockAnswers}
        currentStep={mockCurrentStep}
        isLoading={false}
        error={null}
        {...mockHandlers}
      />
    );
    
    const input = screen.getByPlaceholderText('Your answer');
    fireEvent.change(input, { target: { value: 'New answer' } });
    
    expect(mockHandlers.onAnswerChange).toHaveBeenCalledWith(0, 'New answer');
  });
  
  test('calls onNext when Next button is clicked', () => {
    render(
      <UsageWizardModal 
        isOpen={true}
        questions={mockQuestions}
        answers={mockAnswers}
        currentStep={mockCurrentStep}
        isLoading={false}
        error={null}
        {...mockHandlers}
      />
    );
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(mockHandlers.onNext).toHaveBeenCalled();
  });
  
  test('shows "Finish" instead of "Next" on last question', () => {
    render(
      <UsageWizardModal 
        isOpen={true}
        questions={mockQuestions}
        answers={mockAnswers}
        currentStep={1} // Last question
        isLoading={false}
        error={null}
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText('Finish')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });
  
  test('Previous button is disabled on first question', () => {
    render(
      <UsageWizardModal 
        isOpen={true}
        questions={mockQuestions}
        answers={mockAnswers}
        currentStep={0} // First question
        isLoading={false}
        error={null}
        {...mockHandlers}
      />
    );
    
    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
    
    // Verify it doesn't call the handler when clicked
    fireEvent.click(previousButton);
    expect(mockHandlers.onPrevious).not.toHaveBeenCalled();
  });
  
  test('Previous button is enabled on second question', () => {
    render(
      <UsageWizardModal 
        isOpen={true}
        questions={mockQuestions}
        answers={mockAnswers}
        currentStep={1} // Second question
        isLoading={false}
        error={null}
        {...mockHandlers}
      />
    );
    
    const previousButton = screen.getByText('Previous');
    expect(previousButton).not.toBeDisabled();
    
    // Verify it calls the handler when clicked
    fireEvent.click(previousButton);
    expect(mockHandlers.onPrevious).toHaveBeenCalled();
  });
  
  test('calls onClose when close button is clicked', () => {
    render(
      <UsageWizardModal 
        isOpen={true}
        questions={mockQuestions}
        answers={mockAnswers}
        currentStep={mockCurrentStep}
        isLoading={false}
        error={null}
        {...mockHandlers}
      />
    );
    
    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);
    
    expect(mockHandlers.onClose).toHaveBeenCalled();
  });
});