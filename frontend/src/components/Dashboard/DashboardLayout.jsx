import React from 'react';
import CostSummaryCard from './CostSummaryCard';
import CostDistributionChart from './Charts/CostDistributionChart';
import CostTrendChart from './Charts/CostTrendChart';
import ResourceTable from '../Resources/ResourceTable';

/**
 * Main dashboard layout component that arranges visualizations and data tables
 */
export default function DashboardLayout({ 
  resources, 
  totalCost, 
  previousCost,
  adjustments,
  onAdjustmentChange 
}) {
  // Get resources with numeric costs for chart consistency
  const resourcesWithCosts = resources.map(r => ({
    ...r,
    monthlyCost: parseFloat(r.monthlyCost || 0)
  }));

  return (
    <div className="space-y-6">
      {/* Top row: Summary and distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost summary card */}
        <div className="lg:col-span-1">
          <CostSummaryCard 
            totalCost={totalCost} 
            previousCost={previousCost}
          />
        </div>
        
        {/* Cost distribution chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 h-full">
            <CostDistributionChart resources={resourcesWithCosts} />
          </div>
        </div>
      </div>
      
      {/* Middle row: Resource rankings */}
      <div className="bg-white rounded-lg shadow p-6">
        <CostTrendChart resources={resourcesWithCosts} />
      </div>
      
      {/* Bottom row: Resource table */}
      <div className="bg-white rounded-lg shadow p-6">
        <ResourceTable 
          resources={resources}
          adjustments={adjustments}
          onAdjustmentChange={onAdjustmentChange}
        />
      </div>
    </div>
  );
}