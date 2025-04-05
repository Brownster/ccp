import { useState } from 'react';
import { getClarifyQuestions, generateUsage } from '../services/api';

/**
 * Hook for managing the usage wizard flow
 */
export function useUsageWizard(resources, onComplete) {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
  };

  // Update an answer
  const updateAnswer = (step, value) => {
    const updated = [...answers];
    updated[step] = value;
    setAnswers(updated);
  };

  // Move to next question or finish
  const handleNext = () => {
    if (currentStep + 1 < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      completeWizard();
    }
  };

  // Move to previous question
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Complete the wizard and generate usage data
  const completeWizard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Map answers to question format expected by API
      const answersWithResources = questions.map((q, i) => ({
        resource_name: q.resource_name,
        answer: answers[i]
      }));
      
      const usageData = await generateUsage(resources, answersWithResources);
      closeWizard();
      
      if (onComplete) {
        onComplete({ usage: usageData });
      }
    } catch (err) {
      setError(err.message || 'Failed to generate usage data');
      console.error('Usage generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    questions,
    answers,
    currentStep,
    isLoading,
    error,
    openWizard,
    closeWizard,
    updateAnswer,
    handleNext,
    handlePrevious,
    getCurrentQuestion: () => questions[currentStep]
  };
}
