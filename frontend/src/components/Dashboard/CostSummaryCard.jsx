import React from 'react';

/**
 * Displays a summary of current, previous, and difference in costs
 */
export default function CostSummaryCard({ totalCost, previousCost }) {
  const hasComparison = previousCost !== undefined && previousCost !== null;
  const difference = hasComparison ? (totalCost - previousCost).toFixed(2) : null;
  const percentChange = hasComparison ? ((totalCost - previousCost) / previousCost * 100).toFixed(1) : null;
  const isIncrease = hasComparison && difference > 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-5">Cost Summary</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Current Estimated Cost</p>
          <p className="text-3xl font-bold text-blue-600">${Number(totalCost).toFixed(2)}/mo</p>
        </div>
        
        {hasComparison && (
          <>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-500">Previous Estimate</p>
              <p className="text-xl font-medium text-gray-700">${Number(previousCost).toFixed(2)}/mo</p>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-500">Difference</p>
              <div className="flex items-center">
                <p className={`text-xl font-bold ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                  {isIncrease ? '+' : ''}{difference}
                </p>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${isIncrease ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {isIncrease ? '+' : ''}{percentChange}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button 
          className="w-full py-2 px-4 border border-blue-300 rounded-md text-blue-600 text-sm font-medium hover:bg-blue-50 transition ease-in-out duration-150"
          onClick={() => window.alert('Download feature coming soon')}
        >
          Download Report
        </button>
      </div>
    </div>
  );
}