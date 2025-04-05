import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResourceCard } from '../ResourceCard';

describe('ResourceCard component', () => {
  const mockResource = {
    name: 'aws_instance.example',
    resource_type: 'aws_instance',
    monthlyCost: '10.00',
    index: 0
  };
  
  const mockOnAdjustmentChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders resource details correctly', () => {
    render(
      <ResourceCard 
        resource={mockResource} 
        adjustment={50} 
        onAdjustmentChange={mockOnAdjustmentChange} 
      />
    );
    
    // Check name and type are displayed
    expect(screen.getByText('aws_instance.example')).toBeInTheDocument();
    expect(screen.getByText('Type: aws_instance')).toBeInTheDocument();
    
    // Check base cost is displayed
    expect(screen.getByText('Base Monthly Cost: $10.00')).toBeInTheDocument();
    
    // Check adjusted cost is calculated and displayed (50% of $10.00 = $5.00)
    expect(screen.getByText('Adjusted Cost: $5.00')).toBeInTheDocument();
    
    // Check adjustment slider shows correct value
    expect(screen.getByText('Usage Assumption: 50%')).toBeInTheDocument();
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('50');
  });
  
  test('handles missing monthlyCost', () => {
    const resourceWithoutCost = { ...mockResource, monthlyCost: null };
    
    render(
      <ResourceCard 
        resource={resourceWithoutCost} 
        adjustment={50} 
        onAdjustmentChange={mockOnAdjustmentChange} 
      />
    );
    
    // Base cost should be $0.00
    expect(screen.getByText('Base Monthly Cost: $0.00')).toBeInTheDocument();
    
    // Adjusted cost should also be $0.00
    expect(screen.getByText('Adjusted Cost: $0.00')).toBeInTheDocument();
  });
  
  test('handles missing adjustment value', () => {
    render(
      <ResourceCard 
        resource={mockResource} 
        onAdjustmentChange={mockOnAdjustmentChange} 
      />
    );
    
    // Default adjustment should be 100%
    expect(screen.getByText('Usage Assumption: 100%')).toBeInTheDocument();
    
    // Adjusted cost should be same as base cost
    expect(screen.getByText('Adjusted Cost: $10.00')).toBeInTheDocument();
  });
  
  test('adjustment slider triggers change callback', () => {
    render(
      <ResourceCard 
        resource={mockResource} 
        adjustment={50} 
        onAdjustmentChange={mockOnAdjustmentChange} 
      />
    );
    
    const slider = screen.getByRole('slider');
    
    // Simulate changing slider to 75%
    fireEvent.change(slider, { target: { value: '75' } });
    
    // Check callback was called with correct parameters
    expect(mockOnAdjustmentChange).toHaveBeenCalledWith(0, '75');
  });
});
