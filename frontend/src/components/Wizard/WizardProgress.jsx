import React from 'react';

/**
 * Displays progress through a multi-step wizard
 */
export default function WizardProgress({ progress, currentStep, totalSteps }) {
  return (
    <div className="relative pt-1">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-blue-600">
          Step {currentStep} of {totalSteps}
        </div>
        <div className="text-sm font-medium text-blue-600">
          {Math.round(progress)}%
        </div>
      </div>
      <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-blue-100">
        <div
          style={{ width: `${progress}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300 ease-in-out"
        ></div>
      </div>
    </div>
  );
}