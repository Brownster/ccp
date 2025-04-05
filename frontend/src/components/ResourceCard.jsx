import React from 'react';

/**
 * Component for displaying and adjusting a single resource
 */
export function ResourceCard({ resource, adjustment = 100, onAdjustmentChange }) {
  const baseCost = parseFloat(resource.monthlyCost || 0);
  const adjustedCost = (baseCost * (adjustment || 0)) / 100;
  
  return (
    <div className="border p-4 rounded mb-2 bg-gray-50">
      <div className="font-semibold">{resource.name}</div>
      <div>Type: {resource.resource_type}</div>
      <div>Base Monthly Cost: ${baseCost.toFixed(2)}</div>
      <div className="pt-2">
        <label className="block mb-1">
          Usage Assumption: {adjustment}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={adjustment || 0}
          onChange={(e) => onAdjustmentChange(resource.index, e.target.value)}
          className="w-full"
        />
        <div>
          Adjusted Cost: ${adjustedCost.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
