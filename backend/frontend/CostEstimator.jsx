import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export default function CostEstimator() {
  const [file, setFile] = useState(null);
  const [resources, setResources] = useState([]);
  const [adjustments, setAdjustments] = useState({});
  const [totalCost, setTotalCost] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    setResources(data.cost_breakdown);

    const initialAdjustments = {};
    for (let i = 0; i < data.cost_breakdown.length; i++) {
      const defaultUsage = await getDefaultUsageAssumption(data.cost_breakdown[i]);
      initialAdjustments[i] = defaultUsage;
    }
    setAdjustments(initialAdjustments);
  };

  const getDefaultUsageAssumption = async (resource) => {
    const response = await fetch('http://localhost:8000/suggest-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource, llm: 'gemini' })
    });
    const data = await response.json();
    return data.suggested_usage || 100;
  };

  const handleSliderChange = (index, value) => {
    const newAdjustments = {
      ...adjustments,
      [index]: value,
    };
    setAdjustments(newAdjustments);
  };

  useEffect(() => {
    const total = resources.reduce((sum, res, idx) => {
      const usage = adjustments[idx] || 0;
      const base = parseFloat(res.monthlyCost || 0);
      return sum + (base * usage / 100);
    }, 0);
    setTotalCost(total.toFixed(2));
  }, [adjustments, resources]);

  const groupByService = (resources) => {
    return resources.reduce((acc, res, idx) => {
      const type = res.resource_type || 'Other';
      acc[type] = acc[type] || [];
      acc[type].push({ ...res, index: idx });
      return acc;
    }, {});
  };

  const groupedResources = groupByService(resources);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Terraform Cost Estimator</h1>
      <Input type="file" onChange={handleFileChange} />
      <Button onClick={handleUpload}>Upload & Estimate</Button>

      <h2 className="text-lg font-semibold mt-6">Total Adjusted Monthly Cost: ${totalCost}</h2>

      {Object.entries(groupedResources).map(([type, resList], idx) => (
        <div key={idx} className="space-y-2">
          <h3 className="text-md font-semibold">Service: {type}</h3>
          {resList.map((res) => (
            <Card key={res.index}>
              <CardContent className="p-4 space-y-2">
                <div className="font-semibold">{res.name}</div>
                <div>Type: {res.resource_type}</div>
                <div>Base Monthly Cost: ${parseFloat(res.monthlyCost || 0).toFixed(2)}</div>
                <div className="pt-2">
                  <label className="block mb-1">Usage Assumption: {adjustments[res.index]}%</label>
                  <Slider
                    min={0}
                    max={100}
                    value={[adjustments[res.index]]}
                    onValueChange={(val) => handleSliderChange(res.index, val[0])}
                  />
                  <div>
                    Adjusted Cost: ${((parseFloat(res.monthlyCost || 0) * (adjustments[res.index] || 0)) / 100).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
