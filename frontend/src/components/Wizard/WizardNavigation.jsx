import React from 'react';

/**
 * Navigation controls for multi-step wizard
 */
export default function WizardNavigation({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrevious,
  canGoNext = true,
  canGoBack = true 
}) {
  return (
    <div className="flex justify-between items-center">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoBack}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
          canGoBack
            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Previous step"
      >
        <svg 
          className="-ml-1 mr-2 h-5 w-5" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" 
            clipRule="evenodd" 
          />
        </svg>
        Previous
      </button>
      
      <div className="text-sm text-gray-600">
        {currentStep + 1} of {totalSteps}
      </div>
      
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
          canGoNext
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-blue-300 text-white cursor-not-allowed'
        }`}
        aria-label={currentStep === totalSteps - 1 ? "Finish" : "Next step"}
      >
        {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
        <svg 
          className="-mr-1 ml-2 h-5 w-5" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
    </div>
  );
}