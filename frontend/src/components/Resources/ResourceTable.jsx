import React, { useState, useMemo } from 'react';
import ResourceRow from './ResourceRow';
import SearchBar from '../UI/SearchBar';
import SortControls from '../UI/SortControls';
import FilterControls from '../UI/FilterControls';

/**
 * Enhanced resource table with search, sort, and filter capabilities
 */
export default function ResourceTable({ resources, adjustments, onAdjustmentChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('cost');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  
  // Get all unique resource types for filter
  const resourceTypes = useMemo(() => {
    const types = new Set(resources.map(r => r.resource_type));
    return Array.from(types);
  }, [resources]);
  
  // Filter and sort resources
  const filteredResources = useMemo(() => {
    return resources
      .filter(resource => {
        // Filter by search term
        if (searchTerm && !resource.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Filter by resource type
        if (filterType !== 'all' && resource.resource_type !== filterType) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by selected field
        if (sortField === 'name') {
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name);
        }
        
        if (sortField === 'type') {
          return sortDirection === 'asc' 
            ? a.resource_type.localeCompare(b.resource_type) 
            : b.resource_type.localeCompare(a.resource_type);
        }
        
        if (sortField === 'cost') {
          const aValue = parseFloat(a.monthlyCost || 0);
          const bValue = parseFloat(b.monthlyCost || 0);
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        if (sortField === 'adjustedCost') {
          const aValue = (parseFloat(a.monthlyCost || 0) * (adjustments[a.index] || 0)) / 100;
          const bValue = (parseFloat(b.monthlyCost || 0) * (adjustments[b.index] || 0)) / 100;
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
  }, [resources, searchTerm, sortField, sortDirection, filterType, adjustments]);
  
  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (field === sortField) {
      // Toggle direction if clicking same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending for costs, ascending for text
      if (field === 'cost' || field === 'adjustedCost') {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
      setSortField(field);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (type) => {
    setFilterType(type);
  };
  
  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Resource Explorer</h2>
      
      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search resources..."
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <FilterControls
            options={[{ value: 'all', label: 'All Types' }, ...resourceTypes.map(type => ({ value: type, label: type }))]}
            selectedValue={filterType}
            onChange={handleFilterChange}
            label="Filter by type:"
          />
          
          <div className="ml-auto">
            <span className="text-sm text-gray-600">
              {filteredResources.length} of {resources.length} resources
            </span>
          </div>
        </div>
      </div>
      
      {resources.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No resources available</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No resources match your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('name')}
                >
                  <div className="flex items-center">
                    <span>Resource Name</span>
                    {sortField === 'name' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('type')}
                >
                  <div className="flex items-center">
                    <span>Type</span>
                    {sortField === 'type' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('cost')}
                >
                  <div className="flex items-center">
                    <span>Base Cost</span>
                    {sortField === 'cost' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage (%)
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('adjustedCost')}
                >
                  <div className="flex items-center">
                    <span>Adjusted Cost</span>
                    {sortField === 'adjustedCost' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResources.map((resource) => (
                <ResourceRow
                  key={resource.index}
                  resource={resource}
                  adjustment={adjustments[resource.index]}
                  onAdjustmentChange={onAdjustmentChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}