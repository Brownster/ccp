import React from 'react';

/**
 * Modal component for the usage wizard
 */
export function UsageWizardModal({ 
  isOpen, 
  questions, 
  answers, 
  currentStep, 
  isLoading, 
  error,
  onAnswerChange,
  onNext,
  onPrevious,
  onClose,
  getCurrentQuestion
}) {
  if (!isOpen) return null;
  
  const question = getCurrentQuestion();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Usage Wizard</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : questions.length === 0 ? (
          <p>No questions needed for these resources!</p>
        ) : (
          <div>
            <div className="mb-4">
              <p className="font-semibold mb-2">
                Question {currentStep + 1} of {questions.length}:
              </p>
              <p className="mb-2">{question?.question || 'No question available'}</p>
              <input
                className="w-full border rounded p-2"
                placeholder="Your answer"
                value={answers[currentStep] || ''}
                onChange={(e) => onAnswerChange(currentStep, e.target.value)}
              />
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={onPrevious}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded ${currentStep === 0 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                Previous
              </button>
              
              <button
                onClick={onNext}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {currentStep + 1 === questions.length ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
