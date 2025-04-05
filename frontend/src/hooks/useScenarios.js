import { useState, useEffect } from 'react';

/**
 * Hook for managing cost scenarios and comparisons
 */
export function useScenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonIds, setComparisonIds] = useState({
    baseline: null,
    proposed: null
  });
  
  // Load scenarios from localStorage on mount
  useEffect(() => {
    try {
      const savedScenarios = localStorage.getItem('ccp_scenarios');
      if (savedScenarios) {
        setScenarios(JSON.parse(savedScenarios));
      }
    } catch (err) {
      console.error('Error loading scenarios:', err);
    }
  }, []);
  
  // Save scenarios to localStorage when changed
  useEffect(() => {
    if (scenarios.length > 0) {
      try {
        localStorage.setItem('ccp_scenarios', JSON.stringify(scenarios));
      } catch (err) {
        console.error('Error saving scenarios:', err);
      }
    }
  }, [scenarios]);
  
  /**
   * Save current resources and adjustments as a named scenario
   */
  const saveScenario = (name, resources, adjustments, description = '') => {
    const now = new Date();
    const id = `scenario_${now.getTime()}`;
    
    // Calculate total cost for the scenario
    const totalCost = resources.reduce((sum, res, idx) => {
      const usage = adjustments[res.index] || 0;
      const base = parseFloat(res.monthlyCost || 0);
      return sum + (base * usage / 100);
    }, 0);
    
    const newScenario = {
      id,
      name,
      description,
      date: now.toISOString(),
      resources: resources.map(r => ({
        name: r.name,
        resource_type: r.resource_type,
        monthlyCost: r.monthlyCost,
        index: r.index,
        adjustment: adjustments[r.index] || 0
      })),
      totalCost: totalCost.toFixed(2)
    };
    
    setScenarios(prev => [...prev, newScenario]);
    return id;
  };
  
  /**
   * Delete a scenario by ID
   */
  const deleteScenario = (id) => {
    setScenarios(prev => prev.filter(scenario => scenario.id !== id));
    
    if (activeScenarioId === id) {
      setActiveScenarioId(null);
    }
    
    if (comparisonIds.baseline === id || comparisonIds.proposed === id) {
      setComparisonIds(prev => ({
        baseline: prev.baseline === id ? null : prev.baseline,
        proposed: prev.proposed === id ? null : prev.proposed
      }));
      
      if (comparisonMode && (comparisonIds.baseline === id || comparisonIds.proposed === id)) {
        setComparisonMode(false);
      }
    }
  };
  
  /**
   * Retrieve a scenario by ID
   */
  const getScenario = (id) => {
    return scenarios.find(scenario => scenario.id === id);
  };
  
  /**
   * Load a scenario's adjustments
   */
  const loadScenario = (id) => {
    const scenario = getScenario(id);
    if (!scenario) return null;
    
    // Create an adjustments object from the saved resources
    const adjustments = {};
    scenario.resources.forEach(resource => {
      adjustments[resource.index] = resource.adjustment;
    });
    
    setActiveScenarioId(id);
    return { resources: scenario.resources, adjustments };
  };
  
  /**
   * Set up a comparison between two scenarios
   */
  const setComparison = (baselineId, proposedId) => {
    setComparisonIds({
      baseline: baselineId,
      proposed: proposedId
    });
    setComparisonMode(true);
  };
  
  /**
   * Generate a comparison between two scenarios
   */
  const compareScenarios = () => {
    const baselineScenario = getScenario(comparisonIds.baseline);
    const proposedScenario = getScenario(comparisonIds.proposed);
    
    if (!baselineScenario || !proposedScenario) {
      return null;
    }
    
    // Find common and unique resources
    const baselineMap = baselineScenario.resources.reduce((map, r) => {
      map[r.name] = r;
      return map;
    }, {});
    
    const proposedMap = proposedScenario.resources.reduce((map, r) => {
      map[r.name] = r;
      return map;
    }, {});
    
    // Create resource comparisons
    const resourceComparisons = [];
    
    // Check all baseline resources
    Object.keys(baselineMap).forEach(name => {
      const baseResource = baselineMap[name];
      const proposedResource = proposedMap[name];
      
      if (proposedResource) {
        // Resource exists in both scenarios
        const baseCost = parseFloat(baseResource.monthlyCost || 0) * baseResource.adjustment / 100;
        const proposedCost = parseFloat(proposedResource.monthlyCost || 0) * proposedResource.adjustment / 100;
        const difference = proposedCost - baseCost;
        const percentChange = baseCost > 0 ? (difference / baseCost) * 100 : 0;
        
        resourceComparisons.push({
          name,
          resourceType: baseResource.resource_type,
          status: 'changed',
          baselineCost: baseCost.toFixed(2),
          proposedCost: proposedCost.toFixed(2),
          difference: difference.toFixed(2),
          percentChange: percentChange.toFixed(1),
          baselineAdjustment: baseResource.adjustment,
          proposedAdjustment: proposedResource.adjustment
        });
      } else {
        // Resource only exists in baseline
        const baseCost = parseFloat(baseResource.monthlyCost || 0) * baseResource.adjustment / 100;
        
        resourceComparisons.push({
          name,
          resourceType: baseResource.resource_type,
          status: 'removed',
          baselineCost: baseCost.toFixed(2),
          proposedCost: '0.00',
          difference: (-baseCost).toFixed(2),
          percentChange: '-100.0',
          baselineAdjustment: baseResource.adjustment,
          proposedAdjustment: 0
        });
      }
    });
    
    // Check for resources only in proposed
    Object.keys(proposedMap).forEach(name => {
      if (!baselineMap[name]) {
        const proposedResource = proposedMap[name];
        const proposedCost = parseFloat(proposedResource.monthlyCost || 0) * proposedResource.adjustment / 100;
        
        resourceComparisons.push({
          name,
          resourceType: proposedResource.resource_type,
          status: 'added',
          baselineCost: '0.00',
          proposedCost: proposedCost.toFixed(2),
          difference: proposedCost.toFixed(2),
          percentChange: 'N/A',
          baselineAdjustment: 0,
          proposedAdjustment: proposedResource.adjustment
        });
      }
    });
    
    // Calculate summary
    const totalBaseline = parseFloat(baselineScenario.totalCost);
    const totalProposed = parseFloat(proposedScenario.totalCost);
    const totalDifference = totalProposed - totalBaseline;
    const totalPercentChange = totalBaseline > 0 ? (totalDifference / totalBaseline) * 100 : 0;
    
    // Count changes by type
    const addedCount = resourceComparisons.filter(r => r.status === 'added').length;
    const removedCount = resourceComparisons.filter(r => r.status === 'removed').length;
    const changedCount = resourceComparisons.filter(r => r.status === 'changed').length;
    
    return {
      baseline: baselineScenario,
      proposed: proposedScenario,
      summary: {
        totalBaseline: totalBaseline.toFixed(2),
        totalProposed: totalProposed.toFixed(2),
        totalDifference: totalDifference.toFixed(2),
        totalPercentChange: totalPercentChange.toFixed(1),
        addedCount,
        removedCount,
        changedCount
      },
      resources: resourceComparisons.sort((a, b) => {
        // Sort by status first (added, changed, removed), then by impact (difference amount)
        if (a.status !== b.status) {
          const statusOrder = { added: 1, changed: 2, removed: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        }
        
        return Math.abs(parseFloat(b.difference)) - Math.abs(parseFloat(a.difference));
      })
    };
  };
  
  return {
    scenarios,
    activeScenarioId,
    comparisonMode,
    comparisonIds,
    saveScenario,
    deleteScenario,
    getScenario,
    loadScenario,
    setActiveScenarioId,
    setComparison,
    compareScenarios
  };
}