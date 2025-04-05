import React, { useState, useEffect } from 'react';
import CostEstimator from './CostEstimator';
import { SettingsModal } from './components/SettingsModal';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Initialize settings on app load
  useEffect(() => {
    // Initialize environment variables from localStorage if available
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (!window.ENV) window.ENV = {};
      window.ENV.VITE_API_URL = settings.apiUrl || window.ENV.VITE_API_URL;
    }
    
    // Check if any required settings are missing
    const needsConfig = !window.ENV?.VITE_API_URL;
    if (needsConfig) {
      setIsSettingsOpen(true);
    }
    
    setInitialized(true);
  }, []);
  
  const handleSettingsClose = (settings) => {
    setIsSettingsOpen(false);
    // You could trigger a refresh/reload here if needed
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with settings button */}
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            Terraform Cost Predictor
          </h1>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Settings
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <div className="container mx-auto p-6">
        {initialized && <CostEstimator />}
      </div>
      
      {/* Settings modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
      />
    </div>
  );
}

export default App;
