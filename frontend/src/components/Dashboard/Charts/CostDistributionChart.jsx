import React, { useMemo } from 'react';

/**
 * Displays a donut chart showing cost distribution by resource type
 */
export default function CostDistributionChart({ resources }) {
  // Group costs by resource type
  const costByType = useMemo(() => {
    const grouped = {};
    
    resources.forEach(resource => {
      const type = resource.resource_type || 'Unknown';
      const cost = parseFloat(resource.monthlyCost || 0);
      
      if (!grouped[type]) {
        grouped[type] = { type, cost: 0, count: 0 };
      }
      
      grouped[type].cost += cost;
      grouped[type].count += 1;
    });
    
    // Convert to array and sort by cost
    return Object.values(grouped)
      .sort((a, b) => b.cost - a.cost)
      .map(item => ({
        ...item,
        cost: Number(item.cost.toFixed(2)),
        percentage: resources.length > 0 
          ? Number((item.cost / resources.reduce((sum, r) => sum + parseFloat(r.monthlyCost || 0), 0) * 100).toFixed(1))
          : 0
      }));
  }, [resources]);
  
  // Generate colors for each type
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-red-500', 'bg-indigo-500',
    'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 
    'bg-gray-500'
  ];
  
  // Total cost
  const totalCost = costByType.reduce((sum, item) => sum + item.cost, 0);
  
  // Create SVG segments for the donut chart
  const segments = useMemo(() => {
    const radius = 60;
    const center = { x: 75, y: 75 }; // SVG center
    let currentAngle = 0;
    
    return costByType.map((item, index) => {
      const startAngle = currentAngle;
      const angle = (item.percentage / 100) * Math.PI * 2;
      currentAngle += angle;
      const endAngle = currentAngle;
      
      // Calculate path for arc
      const startX = center.x + radius * Math.sin(startAngle);
      const startY = center.y - radius * Math.cos(startAngle);
      const endX = center.x + radius * Math.sin(endAngle);
      const endY = center.y - radius * Math.cos(endAngle);
      
      // Create path - use large arc if > 180 degrees
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      
      const pathData = [
        `M ${center.x} ${center.y}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        'Z'
      ].join(' ');
      
      return {
        path: pathData,
        color: colors[index % colors.length]
      };
    });
  }, [costByType]);
  
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Cost Distribution</h2>
      
      {resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p>No cost data available</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0">
          {/* SVG Donut Chart */}
          <div className="relative w-40 h-40">
            <svg width="150" height="150" viewBox="0 0 150 150">
              {segments.map((segment, i) => (
                <path
                  key={i}
                  d={segment.path}
                  className={segment.color}
                  stroke="#fff"
                  strokeWidth="1"
                />
              ))}
              {/* Inner circle (creates donut hole) */}
              <circle cx="75" cy="75" r="40" fill="white" />
              <text x="75" y="70" textAnchor="middle" className="text-lg font-bold">${totalCost.toFixed(2)}</text>
              <text x="75" y="85" textAnchor="middle" className="text-xs text-gray-500">Total</text>
            </svg>
          </div>
          
          {/* Legend */}
          <div className="flex-1 ml-4 overflow-auto max-h-48">
            <ul className="space-y-2">
              {costByType.map((item, index) => (
                <li key={index} className="flex items-center">
                  <span className={`inline-block w-3 h-3 mr-2 rounded-sm ${colors[index % colors.length]}`}></span>
                  <span className="text-sm flex-1 truncate">{item.type}</span>
                  <span className="text-sm font-medium">${item.cost}</span>
                  <span className="text-xs text-gray-500 ml-2 w-12 text-right">{item.percentage}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}