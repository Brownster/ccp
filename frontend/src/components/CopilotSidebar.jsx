import React from 'react';

/**
 * Sidebar component for the AI copilot
 */
export function CopilotSidebar({ 
  isOpen, 
  messages, 
  input, 
  isLoading, 
  error,
  onToggle,
  onInputChange,
  onSendMessage
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSendMessage();
    }
  };
  
  return (
    <>
      <button
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={onToggle}
      >
        {isOpen ? 'Close Copilot' : 'Ask Copilot'}
      </button>
      
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg border-l z-40 flex flex-col">
          <div className="p-4 font-bold border-b flex justify-between items-center">
            <span>AI Copilot</span>
            <button className="text-gray-500 hover:text-gray-700" onClick={onToggle}>
              &times;
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                <span className={`inline-block p-2 rounded max-w-[90%] ${msg.role === 'user' 
                  ? 'bg-blue-100' 
                  : 'bg-gray-100'}`}>
                  {msg.text}
                </span>
              </div>
            ))}
            
            {isLoading && (
              <div className="text-left">
                <span className="inline-block p-2 rounded bg-gray-100">
                  Thinking...
                </span>
              </div>
            )}
            
            {error && (
              <div className="text-left">
                <span className="inline-block p-2 rounded bg-red-100 text-red-700">
                  {error}
                </span>
              </div>
            )}
          </div>
          
          <div className="p-2 border-t flex gap-2">
            <input
              className="flex-1 border rounded p-2"
              placeholder="Ask about costs..."
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={onSendMessage}
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
