import React from 'react';

/**
 * Component for displaying a resource in the table
 */
export default function ResourceRow({ resource, adjustment = 100, onAdjustmentChange }) {
  const baseCost = parseFloat(resource.monthlyCost || 0);
  const adjustedCost = (baseCost * (adjustment || 0)) / 100;
  
  // Format cost for visual indicators
  const costLevel = 
    baseCost > 100 ? 'high' : 
    baseCost > 10 ? 'medium' : 
    'low';
  
  // Color by cost level
  const getCostColor = (level) => {
    switch(level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={resource.name}>
          {resource.name}
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {resource.resource_type}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className={`text-sm font-medium ${getCostColor(costLevel)}`}>
          ${baseCost.toFixed(2)}
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={adjustment || 0}
            onChange={(e) => onAdjustmentChange(resource.index, e.target.value)}
            className="w-24 mr-2"
            aria-label={`Set usage for ${resource.name}`}
          />
          <span className="text-sm text-gray-700 w-10">{adjustment || 0}%</span>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          ${adjustedCost.toFixed(2)}
          
          {adjustment < 100 && (
            <span className="ml-2 text-xs text-green-600">
              (save ${(baseCost - adjustedCost).toFixed(2)})
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}