import { useState, useCallback, useEffect } from 'react';
import { getClarifyQuestions, generateUsage } from '../services/api';

/**
 * Enhanced hook for managing the usage wizard flow with templates
 */
export function useEnhancedWizard(resources, onComplete) {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState([]);
  
  // Load saved profiles from localStorage
  useEffect(() => {
    const profiles = JSON.parse(localStorage.getItem('usageProfiles') || '[]');
    setSavedProfiles(profiles);
  }, []);

  // Open the wizard and fetch questions
  const openWizard = async () => {
    if (!resources || resources.length === 0) {
      setError('No resources available for the wizard');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsOpen(true);
    
    try {
      const fetchedQuestions = await getClarifyQuestions(resources);
      setQuestions(fetchedQuestions);
      setAnswers(Array(fetchedQuestions.length).fill(''));
      setCurrentStep(0);
    } catch (err) {
      setError(err.message || 'Failed to fetch questions');
      console.error('Question fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Close the wizard
  const closeWizard = () => {
    setIsOpen(false);
    setQuestions([]);
    setAnswers([]);
    setCurrentStep(0);
    setError(null);
    setShowTemplateSelector(false);
  };

  // Update an answer
  const updateAnswer = (value) => {
    const updated = [...answers];
    updated[currentStep] = value;
    setAnswers(updated);
  };

  // Move to next question or finish
  const handleNext = useCallback(() => {
    if (currentStep + 1 < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      completeWizard();
    }
  }, [currentStep, questions.length]);

  // Move to previous question
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Skip current question
  const handleSkip = () => {
    const updated = [...answers];
    updated[currentStep] = 'default';
    setAnswers(updated);
    handleNext();
  };

  // Complete the wizard and generate usage data
  const completeWizard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare data for the API
      const answersData = {
        resources,
        questions: questions.map(q => q.question),
        answers
      };
      
      const usageData = await generateUsage(answersData);
      
      if (onComplete) {
        onComplete({ usage: usageData });
      }
      
      closeWizard();
    } catch (err) {
      setError(err.message || 'Failed to generate usage data');
      console.error('Usage generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show template selector
  const openTemplateSelector = () => {
    setShowTemplateSelector(true);
  };
  
  // Hide template selector
  const closeTemplateSelector = () => {
    setShowTemplateSelector(false);
  };
  
  // Apply a template and skip the wizard
  const applyTemplate = (templateData) => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (onComplete) {
        onComplete({ usage: templateData });
      }
      
      closeWizard();
      setIsLoading(false);
    }, 500);
  };
  
  // Save current answers as a profile
  const saveProfile = (profileName) => {
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
  
  // Load a saved profile
  const loadProfile = (profileId) => {
    const profile = savedProfiles.find(p => p.id === profileId);
    if (profile) {
      setAnswers(profile.answers);
    }
  };

  return {
    isOpen,
    questions,
    answers,
    currentStep,
    isLoading,
    error,
    showTemplateSelector,
    savedProfiles,
    openWizard,
    closeWizard,
    updateAnswer,
    handleNext,
    handlePrevious,
    handleSkip,
    openTemplateSelector,
    closeTemplateSelector,
    applyTemplate,
    saveProfile,
    loadProfile,
    getCurrentQuestion: () => questions[currentStep]?.question || ''
  };
}