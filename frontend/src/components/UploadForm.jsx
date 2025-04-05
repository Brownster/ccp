import React from 'react';

/**
 * Component for uploading Terraform files
 */
export function UploadForm({ file, isLoading, error, onFileChange, onUpload }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-4">Terraform Cost Estimator</h1>
      
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Terraform Project File (ZIP or Plan)
          </label>
          <input 
            type="file" 
            onChange={onFileChange} 
            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
            accept=".zip,.json,.tfplan"
            disabled={isLoading}
          />
        </div>
        
        <button
          onClick={onUpload}
          disabled={!file || isLoading}
          className={`px-4 py-2 rounded ${!file || isLoading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {isLoading ? 'Processing...' : 'Upload & Estimate'}
        </button>
      </div>
      
      {error && (
        <div className="text-red-500 mt-2">{error}</div>
      )}
    </div>
  );
}
