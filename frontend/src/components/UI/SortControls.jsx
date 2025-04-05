import React from 'react';

/**
 * Reusable sort control component
 */
export default function SortControls({ 
  options,
  selectedField,
  selectedDirection,
  onFieldChange,
  onDirectionChange,
  label = 'Sort by:',
  id = 'sort'
}) {
  return (
    <div className="flex items-center space-x-4">
      <div>
        <label htmlFor={id} className="mr-2 text-sm font-medium text-gray-700">
          {label}
        </label>
        <select
          id={id}
          value={selectedField}
          onChange={(e) => onFieldChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          aria-label={label}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => onDirectionChange('asc')}
          className={`px-3 py-2 border rounded-md text-sm ${
            selectedDirection === 'asc'
              ? 'bg-blue-100 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          aria-pressed={selectedDirection === 'asc'}
          aria-label="Sort ascending"
        >
          <svg 
            className="h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDirectionChange('desc')}
          className={`px-3 py-2 border rounded-md text-sm ${
            selectedDirection === 'desc'
              ? 'bg-blue-100 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          aria-pressed={selectedDirection === 'desc'}
          aria-label="Sort descending"
        >
          <svg 
            className="h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}