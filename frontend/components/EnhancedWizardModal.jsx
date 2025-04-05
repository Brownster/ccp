import { useEffect, useState, useCallback } from 'react';
import { UsageReviewModal } from './UsageReviewModal';
import { UsageTemplateSelector } from './UsageTemplateSelector';

// Mock UI components for testing
const Dialog = ({ children, open }) => open ? <div>{children}</div> : null;
const DialogContent = ({ children }) => <div>{children}</div>;
const DialogHeader = ({ children }) => <div>{children}</div>;
const DialogTitle = ({ children }) => <div>{children}</div>;
const Button = ({ children, variant, onClick, disabled }) => (
  <button 
    className={`button ${variant || ''}`} 
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

// Components for an improved wizard experience
const WizardProgress = ({ currentStep, totalSteps }) => (
  <div className="mb-4">
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.round((currentStep / totalSteps) * 100)}%` }}
      />
    </div>
    <div className="text-xs text-gray-500 mt-1">
      Step {currentStep + 1} of {totalSteps}
    </div>
  </div>
);

const WizardQuestion = ({ question, answer, onChange }) => (
  <div className="mb-4">
    <div className="font-semibold mb-2">{question}</div>
    <input
      className="w-full border rounded p-2 mb-1"
      placeholder="Your answer"
      value={answer || ''}
      onChange={(e) => onChange(e.target.value)}
    />
    {question.includes('EC2') && (
      <div className="text-xs text-gray-500">
        Example: "24/7" or "8 hours per day on weekdays"
      </div>
    )}
    {question.includes('Lambda') && (
      <div className="text-xs text-gray-500">
        Example: "100,000 invocations" or "about 1 million per month"
      </div>
    )}
  </div>
);

const WizardNavigation = ({ 
  onPrevious, 
  onNext, 
  onSkip,
  applyTemplate, 
  canGoBack, 
  isLastStep,
  loading 
}) => (
  <div className="flex justify-between items-center mt-4">
    <div>
      {canGoBack && (
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
      )}
    </div>
    <div>
      <Button variant="outline" onClick={applyTemplate} className="mr-2">
        Use Template
      </Button>
      <Button variant="outline" onClick={onSkip} className="mr-2">
        Skip
      </Button>
      <Button onClick={onNext} disabled={loading}>
        {isLastStep ? 'Finish' : 'Next'}
      </Button>
    </div>
  </div>
);

export function EnhancedWizardModal({ resources, onFinish }) {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingUsage, setPendingUsage] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState(
    JSON.parse(localStorage.getItem('usageProfiles') || '[]')
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      
      // Next step: Alt + Right Arrow
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
      
      // Previous step: Alt + Left Arrow
      if (e.altKey && e.key === 'ArrowLeft' && step > 0) {
        e.preventDefault();
        handlePrevious();
      }
      
      // Use template: Alt + T
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        handleShowTemplates();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, step, questions.length]);

  // Fetch questions from API
  useEffect(() => {
    const fetchWizard = async () => {
      setLoading(true);
      try {
        // Get API URL from environment in a way that works with both Vite and Jest
        const API_URL = typeof import !== 'undefined' && import.meta?.env?.VITE_API_URL || 
                      process.env.VITE_API_URL || 
                      'http://localhost:8000';
                      
        const response = await fetch(API_URL + '/usage-wizard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resources }),
        });
        const data = await response.json();
        setQuestions(data.questions || []);
        setAnswers(Array(data.questions.length).fill(''));
      } catch (err) {
        console.error('Failed to fetch usage wizard:', err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (resources?.length) fetchWizard();
  }, [resources]);

  const handleNext = useCallback(() => {
    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  }, [step, questions.length]);

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    if (step + 1 < questions.length) {
      const updatedAnswers = [...answers];
      updatedAnswers[step] = 'default';
      setAnswers(updatedAnswers);
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const updateAnswer = (value) => {
    const updated = [...answers];
    updated[step] = value;
    setAnswers(updated);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Get API URL from environment in a way that works with both Vite and Jest
      const API_URL = typeof import !== 'undefined' && import.meta?.env?.VITE_API_URL || 
                    process.env.VITE_API_URL || 
                    'http://localhost:8000';
                    
      const response = await fetch(API_URL + '/usage-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resources, 
          questions, 
          answers 
        }),
      });
      const data = await response.json();
      if (data.usage) {
        setPendingUsage(data.usage);
      } else {
        onFinish({ answers });
        setOpen(false);
      }
    } catch (err) {
      console.error('Failed to generate usage data:', err);
      onFinish({ answers });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleShowTemplates = () => {
    setShowTemplateSelector(true);
  };

  const handleApplyTemplate = (templateData) => {
    setShowTemplateSelector(false);
    setPendingUsage(templateData);
  };

  const handleSaveProfile = () => {
    const profileName = prompt('Enter a name for this usage profile:');
    
    if (!profileName) return;
    
    const newProfile = {
      id: `profile-${Date.now()}`,
      name: profileName,
      answers,
      date: new Date().toISOString()
    };
    
    const updatedProfiles = [...savedProfiles, newProfile];
    setSavedProfiles(updatedProfiles);
    localStorage.setItem('usageProfiles', JSON.stringify(updatedProfiles));
  };

  const handleLoadProfile = () => {
    // Show profile selector
    if (savedProfiles.length === 0) {
      alert('No saved profiles found');
      return;
    }
    
    const profileId = prompt(
      'Enter profile number to load:\n' + 
      savedProfiles.map((p, i) => `${i+1}. ${p.name}`).join('\n')
    );
    
    const profileIndex = parseInt(profileId) - 1;
    if (isNaN(profileIndex) || profileIndex < 0 || profileIndex >= savedProfiles.length) {
      alert('Invalid profile selection');
      return;
    }
    
    const profile = savedProfiles[profileIndex];
    setAnswers(profile.answers);
  };

  if (showTemplateSelector) {
    return (
      <Dialog open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Usage Templates</DialogTitle>
          </DialogHeader>
          <UsageTemplateSelector 
            resources={resources}
            onSelectTemplate={handleApplyTemplate}
            onCancel={() => setShowTemplateSelector(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Usage Wizard</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <p>Scanning your infrastructure... putting on my thinking hat!</p>
        ) : questions.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm">
                <span className="text-blue-600 cursor-pointer" onClick={handleSaveProfile}>
                  Save Profile
                </span>
                {savedProfiles.length > 0 && (
                  <span className="mx-2">|</span>
                )}
                {savedProfiles.length > 0 && (
                  <span className="text-blue-600 cursor-pointer" onClick={handleLoadProfile}>
                    Load Profile
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Alt+→: Next | Alt+←: Previous | Alt+T: Templates
              </div>
            </div>
            
            <WizardProgress currentStep={step} totalSteps={questions.length} />
            
            <WizardQuestion 
              question={questions[step]}
              answer={answers[step]}
              onChange={updateAnswer}
            />
            
            <WizardNavigation
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSkip={handleSkip}
              applyTemplate={handleShowTemplates}
              canGoBack={step > 0}
              isLastStep={step === questions.length - 1}
              loading={loading}
            />
          </div>
        ) : (
          <div>
            <p>No questions needed! You're all set.</p>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setOpen(false)}>Close</Button>
            </div>
          </div>
        )}
        
        {pendingUsage && (
          <UsageReviewModal 
            usageData={pendingUsage} 
            onConfirm={(confirmed) => {
              if (confirmed) {
                onFinish({ usage: pendingUsage });
                setOpen(false);
              } else {
                setPendingUsage(null);
              }
            }} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}