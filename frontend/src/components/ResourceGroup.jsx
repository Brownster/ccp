import React from 'react';
import { ResourceCard } from './ResourceCard';

/**
 * Component for displaying resources grouped by service
 */
export function ResourceGroup({ type, resources, adjustments, onAdjustmentChange }) {
  return (
    <div className="mt-4">
      <h3 className="text-md font-semibold mb-2">Service: {type}</h3>
      {resources.map((resource) => (
        <ResourceCard
          key={resource.index}
          resource={resource}
          adjustment={adjustments[resource.index]}
          onAdjustmentChange={onAdjustmentChange}
        />
      ))}
    </div>
  );
}
