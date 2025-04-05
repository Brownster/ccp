import React from 'react';

/**
 * Component for displaying comparison between two scenarios
 */
export default function ComparisonView({ comparison, onExit }) {
  // Early return if no comparison data
  if (!comparison) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Comparison</h2>
          <button
            onClick={onExit}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close comparison view"
          >
            &times;
          </button>
        </div>
        <p className="text-gray-600">Please select two scenarios to compare.</p>
      </div>
    );
  }
  
  // Destructure comparison data
  const { baseline, proposed, summary, resources } = comparison;
  
  // Helper for status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'added':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'removed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'changed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  // Helper for difference styling
  const getDifferenceStyle = (difference) => {
    const value = parseFloat(difference);
    if (value > 0) return 'text-red-600';
    if (value < 0) return 'text-green-600';
    return 'text-gray-600';
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Comparison: {baseline.name} vs. {proposed.name}
          </h2>
          <button
            onClick={onExit}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close comparison view"
          >
            <svg 
              className="h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        </div>
        
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col">
            <h3 className="text-base font-medium text-gray-700 mb-2">Baseline</h3>
            <div className="bg-gray-50 p-4 rounded flex-1">
              <div className="text-lg font-bold text-gray-800">{baseline.name}</div>
              <div className="text-sm text-gray-500">Created: {new Date(baseline.date).toLocaleDateString()}</div>
              <div className="text-lg font-medium mt-2">${summary.totalBaseline}</div>
            </div>
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-base font-medium text-gray-700 mb-2">Proposed</h3>
            <div className="bg-gray-50 p-4 rounded flex-1">
              <div className="text-lg font-bold text-gray-800">{proposed.name}</div>
              <div className="text-sm text-gray-500">Created: {new Date(proposed.date).toLocaleDateString()}</div>
              <div className="text-lg font-medium mt-2">${summary.totalProposed}</div>
            </div>
          </div>
        </div>
        
        {/* Cost difference */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h3 className="text-base font-medium text-gray-700">Total Difference</h3>
              <div className={`text-2xl font-bold ${Number(summary.totalDifference) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {Number(summary.totalDifference) >= 0 ? '+' : ''}{summary.totalDifference}
                <span className="ml-2 text-base">
                  ({Number(summary.totalPercentChange) >= 0 ? '+' : ''}{summary.totalPercentChange}%)
                </span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Added</div>
                <div className="text-lg font-medium text-green-600">{summary.addedCount}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Changed</div>
                <div className="text-lg font-medium text-yellow-600">{summary.changedCount}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Removed</div>
                <div className="text-lg font-medium text-red-600">{summary.removedCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resource list */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Baseline</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Proposed</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resources.map((resource, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(resource.status)}`}>
                    {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={resource.name}>
                    {resource.name}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{resource.resourceType}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">${resource.baselineCost}</div>
                  <div className="text-xs text-gray-500">{resource.baselineAdjustment}%</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">${resource.proposedCost}</div>
                  <div className="text-xs text-gray-500">{resource.proposedAdjustment}%</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className={`text-sm font-medium ${getDifferenceStyle(resource.difference)}`}>
                    {parseFloat(resource.difference) > 0 ? '+' : ''}{resource.difference}
                  </div>
                  <div className="text-xs text-gray-500">
                    {resource.percentChange === 'N/A' ? 'N/A' : `${parseFloat(resource.percentChange) > 0 ? '+' : ''}${resource.percentChange}%`}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}