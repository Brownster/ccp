import { useState, useEffect } from 'react';
import { uploadTerraform, getUsageAssumption } from '../services/api';

/**
 * Hook for managing Terraform resources and their cost adjustments
 */
export function useResources() {
  const [file, setFile] = useState(null);
  const [resources, setResources] = useState([]);
  const [adjustments, setAdjustments] = useState({});
  const [totalCost, setTotalCost] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectId, setProjectId] = useState(null);

  // Group resources by service
  const groupedResources = resources.length > 0 
    ? resources.reduce((acc, res, idx) => {
        const type = res.resource_type || 'Other';
        acc[type] = acc[type] || [];
        acc[type].push({ ...res, index: idx });
        return acc;
      }, {})
    : {};

  // Calculate total cost whenever adjustments change
  useEffect(() => {
    const total = resources.reduce((sum, res, idx) => {
      const usage = adjustments[idx] || 0;
      const base = parseFloat(res.monthlyCost || 0);
      return sum + (base * usage / 100);
    }, 0);
    setTotalCost(total.toFixed(2));
  }, [adjustments, resources]);

  // Set file handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
  };

  // Upload and process file
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await uploadTerraform(file);
      setResources(data.cost_breakdown);
      setProjectId(data.uid);
      
      // Initialize adjustments with suggested values
      const initialAdjustments = {};
      for (let i = 0; i < data.cost_breakdown.length; i++) {
        try {
          const defaultUsage = await getUsageAssumption(data.cost_breakdown[i]);
          initialAdjustments[i] = defaultUsage;
        } catch (err) {
          console.error('Error getting usage assumption:', err);
          initialAdjustments[i] = 100; // Default to 100% on error
        }
      }
      setAdjustments(initialAdjustments);
    } catch (err) {
      setError(err.message || 'Failed to upload and process file');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a single adjustment
  const updateAdjustment = (index, value) => {
    setAdjustments(prev => ({
      ...prev,
      [index]: parseInt(value, 10)
    }));
  };

  // Update multiple adjustments at once
  const updateAdjustments = (newAdjustments) => {
    setAdjustments(prev => ({ ...prev, ...newAdjustments }));
  };

  // Convert structured usage format to percentage adjustments
  const applyUsageData = (usageData) => {
    const newAdjustments = {};
    
    resources.forEach((r, i) => {
      const u = usageData[r.name];
      if (r.resource_type === 'aws_instance') {
        newAdjustments[i] = u?.monthly_hours 
          ? Math.min(Math.round(u.monthly_hours / 7.2), 100) 
          : 100;
      } else if (r.resource_type === 'aws_lambda_function') {
        newAdjustments[i] = u?.monthly_requests 
          ? Math.min(Math.round(u.monthly_requests / 10000), 100) 
          : 100;
      } else {
        newAdjustments[i] = 100;
      }
    });
    
    updateAdjustments(newAdjustments);
  };

  return {
    file,
    resources,
    groupedResources,
    adjustments,
    totalCost,
    isLoading,
    error,
    projectId,
    handleFileChange,
    handleUpload,
    updateAdjustment,
    updateAdjustments,
    applyUsageData
  };
}
