import React, { useMemo } from 'react';

/**
 * Displays a horizontal bar chart showing the cost of each resource
 */
export default function CostTrendChart({ resources }) {
  // Find the top N resources by cost
  const topResources = useMemo(() => {
    return resources
      .slice()
      .sort((a, b) => parseFloat(b.monthlyCost || 0) - parseFloat(a.monthlyCost || 0))
      .slice(0, 10) // Show top 10 resources
      .map(resource => ({
        name: resource.name,
        type: resource.resource_type,
        cost: parseFloat(resource.monthlyCost || 0).toFixed(2),
        percentage: resources.length > 0 
          ? (parseFloat(resource.monthlyCost || 0) / resources.reduce((sum, r) => sum + parseFloat(r.monthlyCost || 0), 0) * 100).toFixed(1)
          : 0
      }));
  }, [resources]);
  
  // Find the maximum cost to scale bars
  const maxCost = topResources.length > 0 
    ? Math.max(...topResources.map(r => parseFloat(r.cost)))
    : 0;
  
  // Generate type-based colors
  const getTypeColor = (type) => {
    const typeColorMap = {
      'aws_instance': 'bg-blue-500',
      'aws_lambda_function': 'bg-green-500',
      'aws_dynamodb_table': 'bg-yellow-500',
      'aws_s3_bucket': 'bg-purple-500',
      'aws_rds_instance': 'bg-red-500',
      'aws_elasticache_cluster': 'bg-indigo-500',
      'aws_eks_cluster': 'bg-pink-500',
      'aws_ec2_instance': 'bg-blue-500', // Alias for aws_instance
    };
    
    return typeColorMap[type] || 'bg-gray-500';
  };
  
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Resources by Cost</h2>
      
      {resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p>No cost data available</p>
        </div>
      ) : (
        <div className="overflow-y-auto">
          <div className="space-y-4">
            {topResources.map((resource, index) => (
              <div key={index} className="bg-white rounded-md">
                <div className="flex justify-between mb-1">
                  <div className="truncate max-w-xs" title={resource.name}>
                    <span className="text-sm font-medium">{resource.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">${resource.cost}</span>
                    <span className="ml-2 text-xs text-gray-500">({resource.percentage}%)</span>
                  </div>
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        {resource.type}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${(parseFloat(resource.cost) / maxCost) * 100}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getTypeColor(resource.type)}`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}