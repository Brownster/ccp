import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UsageTemplateSelector } from '../UsageTemplateSelector';

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }) => (
    <div data-testid="card" className={className} onClick={onClick}>{children}</div>
  ),
  CardContent: ({ children, className }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }) => (
    <button 
      data-testid="button" 
      disabled={disabled} 
      onClick={onClick}
      className={variant}
    >
      {children}
    </button>
  ),
}));

describe('UsageTemplateSelector component', () => {
  const mockResources = [
    { name: 'ec2-instance', resource_type: 'aws_instance' },
    { name: 'lambda-function', resource_type: 'aws_lambda_function' },
    { name: 's3-bucket', resource_type: 'aws_s3_bucket' }
  ];
  
  const mockOnSelectTemplate = jest.fn();
  const mockOnCancel = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders template cards', () => {
    render(
      <UsageTemplateSelector 
        resources={mockResources}
        onSelectTemplate={mockOnSelectTemplate}
        onCancel={mockOnCancel}
      />
    );
    
    // Check that template cards are rendered
    expect(screen.getByText('Development Environment')).toBeInTheDocument();
    expect(screen.getByText('Production Environment')).toBeInTheDocument();
    expect(screen.getByText('High Traffic Application')).toBeInTheDocument();
    expect(screen.getByText('Custom Template')).toBeInTheDocument();
  });
  
  test('handles template selection', () => {
    render(
      <UsageTemplateSelector 
        resources={mockResources}
        onSelectTemplate={mockOnSelectTemplate}
        onCancel={mockOnCancel}
      />
    );
    
    // Select a template
    fireEvent.click(screen.getByText('Development Environment'));
    
    // Apply button should be enabled
    expect(screen.getByText('Apply Template')).not.toBeDisabled();
  });
  
  test('applies selected template', async () => {
    jest.useFakeTimers();
    
    render(
      <UsageTemplateSelector 
        resources={mockResources}
        onSelectTemplate={mockOnSelectTemplate}
        onCancel={mockOnCancel}
      />
    );
    
    // Select a template
    fireEvent.click(screen.getByText('Development Environment'));
    
    // Click apply
    fireEvent.click(screen.getByText('Apply Template'));
    
    // Advance timers for the setTimeout in applyTemplate
    jest.advanceTimersByTime(600);
    
    // Check onSelectTemplate was called with applied template data
    expect(mockOnSelectTemplate).toHaveBeenCalled();
    
    // Check that the template data was mapped to resources correctly
    const templateCall = mockOnSelectTemplate.mock.calls[0][0];
    expect(templateCall).toHaveProperty('ec2-instance');
    expect(templateCall).toHaveProperty('lambda-function');
    expect(templateCall).toHaveProperty('s3-bucket');
    
    // Verify some specific usage values
    expect(templateCall['ec2-instance'].monthly_hours).toBe(160);
    expect(templateCall['lambda-function'].monthly_requests).toBe(10000);
    
    jest.useRealTimers();
  });
  
  test('handles cancel', () => {
    render(
      <UsageTemplateSelector 
        resources={mockResources}
        onSelectTemplate={mockOnSelectTemplate}
        onCancel={mockOnCancel}
      />
    );
    
    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
  });
  
  test('displays custom templates when provided', () => {
    const customTemplates = [
      {
        id: 'custom-1',
        name: 'My Custom Template',
        description: 'Custom template for specific workload',
        template: {
          aws_instance: { monthly_hours: 400 }
        }
      }
    ];
    
    render(
      <UsageTemplateSelector 
        resources={mockResources}
        onSelectTemplate={mockOnSelectTemplate}
        onCancel={mockOnCancel}
        customTemplates={customTemplates}
      />
    );
    
    // Check that custom template is rendered
    expect(screen.getByText('My Custom Template')).toBeInTheDocument();
    expect(screen.getByText('Custom template for specific workload')).toBeInTheDocument();
  });
});