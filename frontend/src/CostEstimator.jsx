import React from 'react';
import { UploadForm } from './components/UploadForm';
import { ResourceGroup } from './components/ResourceGroup';
import { UsageWizardModal } from './components/UsageWizardModal';
import { CopilotSidebar } from './components/CopilotSidebar';

import { useResources } from './hooks/useResources';
import { useUsageWizard } from './hooks/useUsageWizard';
import { useCopilot } from './hooks/useCopilot';

/**
 * Main component for the Terraform Cost Estimator
 */
export default function CostEstimator() {
  // Resource management hook
  const {
    file,
    resources,
    groupedResources,
    adjustments,
    totalCost,
    isLoading,
    error,
    handleFileChange,
    handleUpload,
    updateAdjustment,
    applyUsageData
  } = useResources();

  // Usage wizard hook
  const wizard = useUsageWizard(resources, ({ usage }) => {
    applyUsageData(usage);
  });

  // Copilot hook
  const copilot = useCopilot(resources);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      {/* Upload form */}
      <UploadForm
        file={file}
        isLoading={isLoading}
        error={error}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
      />

      {/* Cost summary */}
      {resources.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Total Adjusted Monthly Cost: ${totalCost}
            </h2>
            
            <button
              onClick={wizard.openWizard}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={resources.length === 0}
            >
              Usage Wizard
            </button>
          </div>

          {/* Resource groups */}
          {Object.entries(groupedResources).map(([type, resList], idx) => (
            <ResourceGroup
              key={idx}
              type={type}
              resources={resList}
              adjustments={adjustments}
              onAdjustmentChange={updateAdjustment}
            />
          ))}
        </>
      )}
      
      {/* Usage wizard modal */}
      <UsageWizardModal
        isOpen={wizard.isOpen}
        questions={wizard.questions}
        answers={wizard.answers}
        currentStep={wizard.currentStep}
        isLoading={wizard.isLoading}
        error={wizard.error}
        onAnswerChange={wizard.updateAnswer}
        onNext={wizard.handleNext}
        onPrevious={wizard.handlePrevious}
        onClose={wizard.closeWizard}
        getCurrentQuestion={wizard.getCurrentQuestion}
      />
      
      {/* Copilot sidebar */}
      <CopilotSidebar
        isOpen={copilot.isOpen}
        messages={copilot.messages}
        input={copilot.input}
        isLoading={copilot.isLoading}
        error={copilot.error}
        onToggle={copilot.toggleSidebar}
        onInputChange={copilot.setInput}
        onSendMessage={copilot.sendMessage}
      />
    </div>
  );
}