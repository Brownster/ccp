import React, { useState } from 'react';

/**
 * Component for managing scenarios (save, load, compare)
 */
export default function ScenarioManager({ 
  scenarios, 
  activeScenarioId,
  onSaveScenario,
  onLoadScenario,
  onDeleteScenario,
  onCompareScenarios
}) {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [showCompareOptions, setShowCompareOptions] = useState(false);
  const [comparisonIds, setComparisonIds] = useState({ baseline: null, proposed: null });
  
  // Handle save form submission
  const handleSaveSubmit = (e) => {
    e.preventDefault();
    
    if (!scenarioName.trim()) {
      return; // Don't save without a name
    }
    
    onSaveScenario(scenarioName, scenarioDescription);
    
    // Reset form
    setScenarioName('');
    setScenarioDescription('');
    setShowSaveForm(false);
  };
  
  // Handle comparison submission
  const handleCompareSubmit = (e) => {
    e.preventDefault();
    
    if (!comparisonIds.baseline || !comparisonIds.proposed) {
      return; // Don't compare without both scenarios
    }
    
    onCompareScenarios(comparisonIds.baseline, comparisonIds.proposed);
    setShowCompareOptions(false);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // If no scenarios saved yet
  if (scenarios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Scenarios</h2>
          <button 
            onClick={() => setShowSaveForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Current
          </button>
        </div>
        
        {showSaveForm ? (
          <form onSubmit={handleSaveSubmit} className="border rounded-md p-4 bg-gray-50">
            <div className="mb-4">
              <label htmlFor="scenario-name" className="block text-sm font-medium text-gray-700 mb-1">
                Scenario Name
              </label>
              <input
                id="scenario-name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="E.g., Production Baseline"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="scenario-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="scenario-description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={scenarioDescription}
                onChange={(e) => setScenarioDescription(e.target.value)}
                placeholder="Describe this scenario..."
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowSaveForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Scenario
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No scenarios saved yet. Save your current configuration as a scenario to compare different usage patterns.
          </p>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Saved Scenarios</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowCompareOptions(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              disabled={scenarios.length < 2}
            >
              Compare
            </button>
            <button 
              onClick={() => setShowSaveForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Current
            </button>
          </div>
        </div>
        
        {showSaveForm && (
          <form onSubmit={handleSaveSubmit} className="border rounded-md p-4 bg-gray-50 mb-6">
            <div className="mb-4">
              <label htmlFor="scenario-name" className="block text-sm font-medium text-gray-700 mb-1">
                Scenario Name
              </label>
              <input
                id="scenario-name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="E.g., Production Baseline"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="scenario-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="scenario-description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={scenarioDescription}
                onChange={(e) => setScenarioDescription(e.target.value)}
                placeholder="Describe this scenario..."
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowSaveForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Scenario
              </button>
            </div>
          </form>
        )}
        
        {showCompareOptions && (
          <form onSubmit={handleCompareSubmit} className="border rounded-md p-4 bg-gray-50 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="baseline-scenario" className="block text-sm font-medium text-gray-700 mb-1">
                  Baseline Scenario
                </label>
                <select
                  id="baseline-scenario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={comparisonIds.baseline || ''}
                  onChange={(e) => setComparisonIds({ ...comparisonIds, baseline: e.target.value })}
                  required
                >
                  <option value="">Select baseline...</option>
                  {scenarios.map(scenario => (
                    <option 
                      key={scenario.id} 
                      value={scenario.id}
                      disabled={scenario.id === comparisonIds.proposed}
                    >
                      {scenario.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="proposed-scenario" className="block text-sm font-medium text-gray-700 mb-1">
                  Proposed Scenario
                </label>
                <select
                  id="proposed-scenario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={comparisonIds.proposed || ''}
                  onChange={(e) => setComparisonIds({ ...comparisonIds, proposed: e.target.value })}
                  required
                >
                  <option value="">Select proposed...</option>
                  {scenarios.map(scenario => (
                    <option 
                      key={scenario.id} 
                      value={scenario.id}
                      disabled={scenario.id === comparisonIds.baseline}
                    >
                      {scenario.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setShowCompareOptions(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!comparisonIds.baseline || !comparisonIds.proposed}
              >
                Compare Scenarios
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* Scenario list */}
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scenarios.map((scenario) => (
              <tr 
                key={scenario.id} 
                className={`hover:bg-gray-50 ${activeScenarioId === scenario.id ? 'bg-blue-50' : ''}`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {scenario.name}
                    {activeScenarioId === scenario.id && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Active
                      </span>
                    )}
                  </div>
                  {scenario.description && (
                    <div className="text-xs text-gray-500">{scenario.description}</div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(scenario.date)}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">${scenario.totalCost}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onLoadScenario(scenario.id)}
                      className="text-blue-600 hover:text-blue-900"
                      aria-label={`Load scenario ${scenario.name}`}
                      disabled={activeScenarioId === scenario.id}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => onDeleteScenario(scenario.id)}
                      className="text-red-600 hover:text-red-900"
                      aria-label={`Delete scenario ${scenario.name}`}
                    >
                      Delete
                    </button>
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