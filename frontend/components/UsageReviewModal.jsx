import { useState } from 'react';

export function UsageReviewModal({ usageData, onConfirm }) {
  const [isOpen, setIsOpen] = useState(true);

  const handleConfirm = (confirmed) => {
    setIsOpen(false);
    if (onConfirm) {
      onConfirm(confirmed);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Review Generated Usage</h2>
        
        <div className="max-h-60 overflow-y-auto mb-4">
          <pre className="text-sm bg-gray-100 p-3 rounded">
            {JSON.stringify(usageData, null, 2)}
          </pre>
        </div>
        
        <p className="mb-4">
          Does this usage data look accurate? If not, you can go back and adjust your answers.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => handleConfirm(false)}
            className="px-4 py-2 border border-gray-300 rounded shadow-sm"
          >
            Go Back
          </button>
          <button
            onClick={() => handleConfirm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}