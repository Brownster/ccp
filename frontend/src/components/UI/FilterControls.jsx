import React from 'react';

/**
 * Reusable filter control dropdown
 */
export default function FilterControls({ 
  options,
  selectedValue,
  onChange,
  label = 'Filter:',
  id = 'filter'
}) {
  return (
    <div className="flex items-center">
      <label htmlFor={id} className="mr-2 text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
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
  );
}