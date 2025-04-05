import React, { useState } from 'react';
import WizardProgress from './WizardProgress';
import WizardQuestion from './WizardQuestion';
import WizardNavigation from './WizardNavigation';
import UsageTemplateSelector from './UsageTemplateSelector';

/**
 * Enhanced wizard modal with templates, keyboard shortcuts and profile management
 */
export default function EnhancedWizardModal({
  isOpen,
  questions,
  answers,
  currentStep,
  isLoading,
  error,
  onAnswerChange,
  onNext,
  onPrevious,
  onClose,
  onSaveProfile,
  onLoadProfile,
  onApplyTemplate,
  savedProfiles = [],
  templates = []
}) {
  const [showProfiles, setShowProfiles] = useState(false);
  const [profileName, setProfileName] = useState('');
  const totalSteps = questions.length;
  const progress = totalSteps ? ((currentStep + 1) / totalSteps) * 100 : 0;
  
  // Current question being displayed
  const currentQuestion = questions[currentStep];
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Ignore if modal is not open or if inside textarea
    if (!isOpen || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
      return;
    }
    
    // Next on right arrow or N key
    if ((e.key === 'ArrowRight' || e.key === 'n') && currentStep < totalSteps - 1) {
      e.preventDefault();
      onNext();
    }
    
    // Previous on left arrow or P key
    if ((e.key === 'ArrowLeft' || e.key === 'p') && currentStep > 0) {
      e.preventDefault();
      onPrevious();
    }
    
    // Close on Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };
  
  // Save profile handler
  const handleSaveProfile = () => {
    if (!profileName.trim()) return;
    onSaveProfile(profileName, answers);
    setProfileName('');
    setShowProfiles(false);
  };
  
  // If modal is not open, return null
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 z-10 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 id="wizard-title" className="text-xl font-bold text-gray-800">
              Resource Usage Wizard
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Close dialog"
            >
              <svg 
                className="h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
          
          <div className="mt-4">
            <WizardProgress 
              progress={progress} 
              currentStep={currentStep + 1} 
              totalSteps={totalSteps} 
            />
          </div>
        </div>
        
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading questions...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <div className="flex">
                <svg 
                  className="h-5 w-5 text-red-400 mr-2" 
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p className="mt-2 text-lg text-gray-600">No questions needed for these resources!</p>
            </div>
          ) : (
            <>
              {/* Template selector */}
              {templates.length > 0 && (
                <div className="mb-6">
                  <UsageTemplateSelector 
                    templates={templates}
                    onApplyTemplate={(template) => onApplyTemplate(template, currentStep)}
                  />
                </div>
              )}
              
              {/* Current question */}
              <WizardQuestion
                question={currentQuestion}
                answer={answers[currentStep] || ''}
                onChange={(value) => onAnswerChange(currentStep, value)}
              />
              
              {/* Navigation */}
              <div className="mt-8 flex justify-between items-center">
                <div>
                  <button
                    type="button" 
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => setShowProfiles(!showProfiles)}
                  >
                    {showProfiles ? 'Hide Profiles' : 'Profiles'}
                  </button>
                </div>
                
                <WizardNavigation
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={onNext}
                  onPrevious={onPrevious}
                  canGoNext={!!answers[currentStep]}
                  canGoBack={currentStep > 0}
                />
              </div>
              
              {/* Profile management */}
              {showProfiles && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Usage Profiles</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mb-2 text-sm font-medium text-gray-700">Save Current Answers</div>
                      <div className="flex">
                        <input
                          type="text"
                          className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Profile name"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                        />
                        <button
                          type="button"
                          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                          onClick={handleSaveProfile}
                          disabled={!profileName.trim()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-2 text-sm font-medium text-gray-700">Load Profile</div>
                      {savedProfiles.length === 0 ? (
                        <div className="text-sm text-gray-500">No saved profiles</div>
                      ) : (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {savedProfiles.map((profile) => (
                            <div 
                              key={profile.id} 
                              className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100"
                            >
                              <span className="text-sm">{profile.name}</span>
                              <button
                                type="button"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                                onClick={() => onLoadProfile(profile.id)}
                              >
                                Load
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Keyboard shortcuts help */}
        <div className="bg-gray-50 px-6 py-3 border-t">
          <div className="flex justify-between text-xs text-gray-500">
            <div>Keyboard shortcuts: Left/Right arrows or P/N to navigate</div>
            <div>ESC to close</div>
          </div>
        </div>
      </div>
    </div>
  );
}