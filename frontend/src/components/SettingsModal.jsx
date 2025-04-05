import React, { useState, useEffect } from 'react';

// Mock UI components for testing
const Dialog = ({ children, open, onClose }) => open ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
      {children}
      {onClose && (
        <button 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" 
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  </div>
) : null;

const DialogContent = ({ children }) => <div className="mt-4">{children}</div>;
const DialogHeader = ({ children }) => <div className="mb-4 border-b pb-2">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-xl font-semibold">{children}</h2>;

const Button = ({ children, variant, onClick, disabled }) => (
  <button 
    className={`px-4 py-2 rounded ${
      variant === 'outline' 
        ? 'border border-blue-500 text-blue-500 hover:bg-blue-50' 
        : 'bg-blue-500 text-white hover:bg-blue-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

const Input = ({ label, type, value, onChange, placeholder }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type || 'text'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

/**
 * Settings Modal Component
 * Allows configuration of API keys and endpoints
 */
export function SettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    apiUrl: '',
    geminiApiKey: '',
    infracostApiKey: ''
  });
  
  const [isSaved, setIsSaved] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      // Initialize with environment defaults if available
      const defaultApiUrl = window.ENV?.VITE_API_URL || '';
      setSettings(prev => ({
        ...prev,
        apiUrl: defaultApiUrl || prev.apiUrl
      }));
    }
  }, [isOpen]); // Reload when modal is opened

  const handleChange = (key) => (e) => {
    setSettings({
      ...settings,
      [key]: e.target.value
    });
    setIsSaved(false);
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Update window.ENV to make changes take effect immediately
    if (!window.ENV) window.ENV = {};
    window.ENV.VITE_API_URL = settings.apiUrl;
    
    setIsSaved(true);
    
    // Notify parent that settings were updated
    if (onClose) {
      setTimeout(() => {
        onClose(settings);
      }, 1500);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Application Settings</DialogTitle>
      </DialogHeader>
      
      <DialogContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">
            Configure your API endpoints and credentials. These settings will be saved in your browser.
          </p>
          
          <Input 
            label="Backend API URL" 
            value={settings.apiUrl} 
            onChange={handleChange('apiUrl')}
            placeholder="https://your-backend-api.com"
          />
          
          <Input 
            label="Gemini API Key" 
            type="password"
            value={settings.geminiApiKey} 
            onChange={handleChange('geminiApiKey')}
            placeholder="Your Gemini API key"
          />
          
          <Input 
            label="Infracost API Key (Optional)" 
            type="password"
            value={settings.infracostApiKey} 
            onChange={handleChange('infracostApiKey')}
            placeholder="Your Infracost API key"
          />
          
          {isSaved && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
              Settings saved successfully!
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}