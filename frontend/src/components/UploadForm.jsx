import React, { useRef } from 'react';

/**
 * Enhanced upload form with drag-and-drop support
 */
export function UploadForm({ file, isLoading, error, onFileChange, onUpload }) {
  const fileInputRef = useRef(null);
  
  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Create a synthetic event-like object with the target.files property
      onFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  // Trigger file input click
  const handleAreaClick = () => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Cloud Cost Predictor</h1>
      
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors duration-200 ease-in-out mb-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleAreaClick}
        role="button"
        tabIndex="0"
        aria-label="Upload area. Click or drag files here."
        onKeyDown={(e) => e.key === 'Enter' && handleAreaClick()}
      >
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48" 
            aria-hidden="true"
          >
            <path 
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8m36-12h-4m-4 0v4m-12-24v12m0 0l-4-4m4 4l4-4" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Click to upload
            </span> or drag and drop
          </p>
          <p className="mt-1 text-xs text-gray-500">
            ZIP, JSON, or TFPLAN files
          </p>
          
          {file && (
            <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
              <span className="font-medium">{file.name}</span>
              <span className="ml-2">({formatFileSize(file.size)})</span>
            </div>
          )}

          <input 
            ref={fileInputRef}
            type="file" 
            onChange={onFileChange} 
            className="hidden"
            accept=".zip,.json,.tfplan"
            disabled={isLoading}
            aria-label="Upload Terraform project file"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onUpload}
          disabled={!file || isLoading}
          className={`px-6 py-2 rounded-md font-medium flex items-center ${!file || isLoading
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition ease-in-out duration-150'}`}
          aria-disabled={!file || isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>Upload & Estimate</>
          )}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Supported file types: ZIP archives of Terraform files, Terraform plan files (.json or .tfplan)</p>
      </div>
    </div>
  );
}
