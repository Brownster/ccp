import { useState } from 'react';
import { askCopilot } from '../services/api';

/**
 * Hook for managing the copilot chat sidebar
 */
export function useCopilot(resources) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Send a message to the copilot
  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!resources || resources.length === 0) {
      setError('No resources available for the copilot');
      return;
    }
    
    const question = input;
    setInput('');
    setError(null);
    
    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setIsLoading(true);
    
    try {
      const answer = await askCopilot(question, resources);
      setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    } catch (err) {
      setError(err.message || 'Failed to get an answer');
      console.error('Copilot error:', err);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    messages,
    input,
    isLoading,
    error,
    toggleSidebar,
    sendMessage,
    setInput
  };
}
