import { useState, useEffect } from 'react';
import { getTemplates, applyTemplate } from '../src/services/api';

// Mock UI components for testing
const Card = ({ children, className, onClick }) => (
  <div className={className} onClick={onClick}>{children}</div>
);

const CardContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const Button = ({ children, variant, onClick, disabled }) => (
  <button 
    className={`button ${variant || ''}`} 
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

// Fallback templates in case API fails
const FALLBACK_TEMPLATES = [
  {
    id: 'dev-environment',
    name: 'Development Environment',
    description: 'Resources run during business hours (8 hours/day, weekdays)',
    template: {
      aws_instance: { monthly_hours: 160 },
      aws_lambda_function: { monthly_requests: 10000 },
      aws_s3_bucket: { monthly_storage_gb: 5, monthly_get_requests: 1000, monthly_put_requests: 500 },
      aws_rds_instance: { monthly_hours: 160, storage_gb: 20 }
    }
  },
  {
    id: 'prod-environment',
    name: 'Production Environment',
    description: '24/7 operation with moderate traffic',
    template: {
      aws_instance: { monthly_hours: 720 },
      aws_lambda_function: { monthly_requests: 1000000 },
      aws_s3_bucket: { monthly_storage_gb: 100, monthly_get_requests: 100000, monthly_put_requests: 50000 },
      aws_rds_instance: { monthly_hours: 720, storage_gb: 100 }
    }
  },
  {
    id: 'high-traffic',
    name: 'High Traffic Application',
    description: '24/7 operation with high traffic and usage',
    template: {
      aws_instance: { monthly_hours: 720 },
      aws_lambda_function: { monthly_requests: 10000000 },
      aws_s3_bucket: { monthly_storage_gb: 500, monthly_get_requests: 1000000, monthly_put_requests: 500000 },
      aws_rds_instance: { monthly_hours: 720, storage_gb: 500 }
    }
  },
  {
    id: 'custom',
    name: 'Custom Template',
    description: 'Start with a blank template and customize as needed',
    template: {}
  }
];

export function UsageTemplateSelector({ 
  resources, 
  onSelectTemplate, 
  onCancel,
  customTemplates = [] 
}) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch templates from the API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const apiTemplates = await getTemplates();
        setTemplates([...apiTemplates, ...customTemplates]);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
        // Fallback to default templates if API fails
        setTemplates([...FALLBACK_TEMPLATES, ...customTemplates]);
        setError('Could not load templates from server. Using default templates.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [customTemplates]);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;
    
    setLoading(true);
    
    try {
      if (selectedTemplate.id === 'custom') {
        // For custom template, just apply an empty usage object
        onSelectTemplate({});
      } else {
        // Try to apply template from the API
        try {
          const appliedUsage = await applyTemplate(selectedTemplate.id, resources);
          onSelectTemplate(appliedUsage);
        } catch (err) {
          console.error('Failed to apply template from API:', err);
          
          // Fallback to client-side application if API fails
          const appliedUsage = {};
          
          resources.forEach(resource => {
            const resourceType = resource.resource_type;
            const resourceName = resource.name;
            
            if (selectedTemplate.template[resourceType]) {
              appliedUsage[resourceName] = {...selectedTemplate.template[resourceType]};
            }
          });
          
          onSelectTemplate(appliedUsage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select a usage template</h3>
      <p className="text-sm text-gray-500">
        Choose a template to quickly set usage assumptions for your resources
      </p>
      
      {error && (
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800 text-sm">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className={`cursor-pointer hover:border-blue-500 transition-colors ${
                selectedTemplate?.id === template.id ? 'border-2 border-blue-600' : ''
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <CardContent className="p-4">
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-gray-500 mt-1">{template.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          disabled={!selectedTemplate || loading} 
          onClick={handleApplyTemplate}
        >
          {loading ? 'Applying...' : 'Apply Template'}
        </Button>
      </div>
    </div>
  );
}