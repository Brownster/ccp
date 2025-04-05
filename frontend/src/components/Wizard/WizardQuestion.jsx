import React from 'react';

/**
 * Displays a single question with input for the usage wizard
 */
export default function WizardQuestion({ question, answer, onChange }) {
  if (!question) {
    return <div className="text-gray-500">No question available</div>;
  }
  
  const resourceName = question.resource_name;
  const questionText = question.question;
  
  return (
    <div className="bg-white p-4 rounded border">
      <div className="mb-2">
        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">
          {resourceName}
        </span>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800">{questionText}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Your answer helps us calculate more accurate cost estimates.
        </p>
      </div>
      
      <div>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="3"
          value={answer}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your answer..."
          aria-label={`Answer to: ${questionText}`}
        />
        
        <div className="mt-2 text-xs text-gray-500">
          <p>Example answers:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>For servers: "Running 24/7" or "Only during business hours"</li>
            <li>For functions: "About 1 million requests per month"</li>
            <li>For databases: "500k reads, 100k writes, 20GB storage"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}