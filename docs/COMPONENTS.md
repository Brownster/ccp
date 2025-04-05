# Component Reference Guide

This document provides detailed information about the frontend components used in the Cloud Cost Predictor application, including their purpose, props, and usage examples.

## Table of Contents

1. [Core Components](#core-components)
   - [CostEstimator](#costestimator)
   - [UploadForm](#uploadform)
   - [ResourceGroup](#resourcegroup)
2. [Dashboard Components](#dashboard-components)
   - [DashboardLayout](#dashboardlayout)
   - [CostSummaryCard](#costsummarycard)
   - [CostDistributionChart](#costdistributionchart)
   - [CostTrendChart](#costtrendchart)
3. [Resource Management Components](#resource-management-components)
   - [ResourceTable](#resourcetable)
   - [ResourceRow](#resourcerow)
   - [SearchBar](#searchbar)
   - [FilterControls](#filtercontrols)
   - [SortControls](#sortcontrols)
4. [Usage and Wizard Components](#usage-and-wizard-components)
   - [EnhancedWizardModal](#enhancedwizardmodal)
   - [UsageTemplateSelector](#usagetemplateselector)
   - [UsageReviewModal](#usagereviewmodal)
5. [Comparison Components](#comparison-components)
   - [ComparisonView](#comparisonview)
   - [ScenarioManager](#scenariomanager)
6. [AI Integration Components](#ai-integration-components)
   - [CopilotSidebar](#copilotsidebar)

## Core Components

### CostEstimator

The main component that serves as the entry point for the application.

**Props:** None

**Usage:**
```jsx
<CostEstimator />
```

**Description:**
The CostEstimator component orchestrates the entire application. It manages the state for resource data, usage adjustments, and various UI components. This component leverages several hooks to handle resource management, wizard functionality, and copilot interactions.

### UploadForm

Component for uploading Terraform files for cost analysis.

**Props:**
- `file`: Current file object
- `isLoading`: Boolean indicating if upload is in progress
- `error`: Error message if upload failed
- `onFileChange`: Function to handle file selection
- `onUpload`: Function to handle file upload

**Usage:**
```jsx
<UploadForm
  file={file}
  isLoading={isLoading}
  error={error}
  onFileChange={handleFileChange}
  onUpload={handleUpload}
/>
```

**Description:**
The UploadForm component provides a user interface for uploading Terraform files. It supports drag-and-drop functionality, displays file information, and handles the upload process. The component also provides feedback to the user during the upload process and displays any errors that occur.

### ResourceGroup

Component for displaying resources grouped by type.

**Props:**
- `type`: Resource type for the group
- `resources`: Array of resources belonging to the group
- `adjustments`: Object mapping resource indices to adjustment percentages
- `onAdjustmentChange`: Function to handle adjustment changes

**Usage:**
```jsx
<ResourceGroup
  type="aws_instance"
  resources={instanceResources}
  adjustments={adjustments}
  onAdjustmentChange={updateAdjustment}
/>
```

**Description:**
The ResourceGroup component displays a group of resources of the same type. It shows the resource name, monthly cost, and allows the user to adjust the usage percentage for each resource. The component calculates the adjusted cost based on the usage percentage.

## Dashboard Components

### DashboardLayout

Component for organizing the dashboard layout.

**Props:**
- `resources`: Array of resources
- `adjustments`: Object mapping resource indices to adjustment percentages
- `totalCost`: Total adjusted cost

**Usage:**
```jsx
<DashboardLayout
  resources={resources}
  adjustments={adjustments}
  totalCost={totalCost}
/>
```

**Description:**
The DashboardLayout component provides a responsive grid layout for organizing dashboard components. It includes sections for cost summary, distribution chart, and trend chart.

### CostSummaryCard

Component for displaying cost summary information.

**Props:**
- `totalCost`: Current total adjusted cost
- `previousCost`: Previous total cost (optional)
- `resourceCount`: Number of resources

**Usage:**
```jsx
<CostSummaryCard
  totalCost={totalCost}
  previousCost={previousCost}
  resourceCount={resources.length}
/>
```

**Description:**
The CostSummaryCard component displays a summary of the cost information, including the total cost, change from previous cost (if available), and resource count. It uses visual indicators to show whether costs have increased or decreased.

### CostDistributionChart

Component for visualizing cost distribution by resource type.

**Props:**
- `resources`: Array of resources
- `adjustments`: Object mapping resource indices to adjustment percentages

**Usage:**
```jsx
<CostDistributionChart
  resources={resources}
  adjustments={adjustments}
/>
```

**Description:**
The CostDistributionChart component uses an SVG-based donut chart to visualize the distribution of costs by resource type. It calculates the adjusted cost for each resource type and displays them as segments in the chart. Hovering over a segment shows details about the resource type.

### CostTrendChart

Component for visualizing cost trends over time.

**Props:**
- `resources`: Array of resources
- `adjustments`: Object mapping resource indices to adjustment percentages
- `timeframe`: Timeframe for the chart (e.g., "monthly", "weekly", "daily")

**Usage:**
```jsx
<CostTrendChart
  resources={resources}
  adjustments={adjustments}
  timeframe="monthly"
/>
```

**Description:**
The CostTrendChart component displays a bar chart showing the cost trends for the top resources over time. It can display trends for different timeframes and highlights resources with the highest costs.

## Resource Management Components

### ResourceTable

Component for displaying resources in a table with search, sort, and filter capabilities.

**Props:**
- `resources`: Array of resources
- `adjustments`: Object mapping resource indices to adjustment percentages
- `onAdjustmentChange`: Function to handle adjustment changes

**Usage:**
```jsx
<ResourceTable
  resources={resources}
  adjustments={adjustments}
  onAdjustmentChange={updateAdjustment}
/>
```

**Description:**
The ResourceTable component displays resources in a table format with advanced features like searching, sorting, and filtering. It allows users to find specific resources quickly and adjust their usage percentages.

### ResourceRow

Component for displaying a resource row in the table.

**Props:**
- `resource`: Resource object
- `adjustment`: Adjustment percentage for the resource
- `onAdjustmentChange`: Function to handle adjustment change

**Usage:**
```jsx
<ResourceRow
  resource={resource}
  adjustment={adjustmentValue}
  onAdjustmentChange={(value) => updateAdjustment(resource.index, value)}
/>
```

**Description:**
The ResourceRow component displays a row for a resource in the table. It shows the resource name, type, original cost, and adjusted cost. It also provides a slider for adjusting the usage percentage.

### SearchBar

Component for searching resources.

**Props:**
- `value`: Current search value
- `onChange`: Function to handle search value change
- `placeholder`: Placeholder text for the search input

**Usage:**
```jsx
<SearchBar
  value={searchValue}
  onChange={handleSearchChange}
  placeholder="Search resources..."
/>
```

**Description:**
The SearchBar component provides a search input for filtering resources. It includes a clear button to reset the search value and auto-focuses when mounted.

### FilterControls

Component for filtering resources.

**Props:**
- `filters`: Current filter object
- `onChange`: Function to handle filter changes
- `resourceTypes`: Array of available resource types

**Usage:**
```jsx
<FilterControls
  filters={filters}
  onChange={handleFilterChange}
  resourceTypes={availableTypes}
/>
```

**Description:**
The FilterControls component provides UI for filtering resources by various criteria like resource type, cost range, and name pattern. It uses dropdown menus and range sliders for intuitive filtering.

### SortControls

Component for sorting resources.

**Props:**
- `sortBy`: Current sort field
- `sortDirection`: Current sort direction ("asc" or "desc")
- `onChange`: Function to handle sort changes

**Usage:**
```jsx
<SortControls
  sortBy={sortBy}
  sortDirection={sortDirection}
  onChange={handleSortChange}
/>
```

**Description:**
The SortControls component provides UI for sorting resources by different fields like name, type, or cost. It allows toggling between ascending and descending sort order.

## Usage and Wizard Components

### EnhancedWizardModal

Component for the enhanced usage wizard with improved UX.

**Props:**
- `resources`: Array of resources
- `onFinish`: Function called when wizard is completed

**Usage:**
```jsx
<EnhancedWizardModal
  resources={resources}
  onFinish={({ usage }) => applyUsageData(usage)}
/>
```

**Description:**
The EnhancedWizardModal component provides an improved wizard experience for gathering usage information. It includes features like a progress indicator, keyboard shortcuts, template support, and profile management. The wizard asks questions about resource usage and generates structured usage data based on the answers.

### UsageTemplateSelector

Component for selecting usage templates.

**Props:**
- `resources`: Array of resources
- `onSelectTemplate`: Function called when a template is selected
- `onCancel`: Function called when the selection is canceled
- `customTemplates`: Array of custom templates (optional)

**Usage:**
```jsx
<UsageTemplateSelector
  resources={resources}
  onSelectTemplate={handleTemplateSelect}
  onCancel={handleCancel}
  customTemplates={customTemplates}
/>
```

**Description:**
The UsageTemplateSelector component displays a grid of template cards for selecting predefined usage patterns. It includes default templates for development, production, and high-traffic environments, and can also display custom templates. When a template is selected, it's applied to the resources based on their types.

### UsageReviewModal

Component for reviewing generated usage data.

**Props:**
- `usageData`: Generated usage data object
- `onConfirm`: Function called when the user confirms or rejects the data

**Usage:**
```jsx
<UsageReviewModal
  usageData={usageData}
  onConfirm={(confirmed) => {
    if (confirmed) {
      applyUsageData(usageData);
    }
  }}
/>
```

**Description:**
The UsageReviewModal component displays the generated usage data for review before applying it. It shows the structured JSON data and provides options to confirm or go back to adjust the answers.

## Comparison Components

### ComparisonView

Component for comparing different scenarios.

**Props:**
- `baseline`: Baseline scenario
- `proposed`: Proposed scenario

**Usage:**
```jsx
<ComparisonView
  baseline={baselineScenario}
  proposed={proposedScenario}
/>
```

**Description:**
The ComparisonView component displays a comparison between two scenarios. It shows resources that were added, removed, or changed between the scenarios, along with the cost differences. It also provides a summary of the overall cost impact.

### ScenarioManager

Component for managing saved scenarios.

**Props:**
- `scenarios`: Array of saved scenarios
- `onSave`: Function to save a new scenario
- `onLoad`: Function to load a scenario
- `onCompare`: Function to compare scenarios
- `currentResources`: Current resources

**Usage:**
```jsx
<ScenarioManager
  scenarios={savedScenarios}
  onSave={handleSaveScenario}
  onLoad={handleLoadScenario}
  onCompare={handleCompareScenarios}
  currentResources={resources}
/>
```

**Description:**
The ScenarioManager component provides UI for saving, loading, and comparing scenarios. It allows users to save the current state as a named scenario, load existing scenarios, and compare different scenarios to see the cost differences.

## AI Integration Components

### CopilotSidebar

Component for the AI copilot sidebar.

**Props:**
- `isOpen`: Boolean indicating if the sidebar is open
- `messages`: Array of chat messages
- `input`: Current input value
- `isLoading`: Boolean indicating if a request is in progress
- `error`: Error message if a request failed
- `onToggle`: Function to toggle the sidebar
- `onInputChange`: Function to handle input changes
- `onSendMessage`: Function to send a message

**Usage:**
```jsx
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
```

**Description:**
The CopilotSidebar component provides a chat interface for interacting with the AI copilot. It displays a conversation history, allows sending new messages, and provides feedback during loading. The copilot can answer questions about costs, provide optimization recommendations, and explain resource details.