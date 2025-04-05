# Custom Hooks Reference

This document provides detailed information about the custom React hooks used in the Cloud Cost Predictor application. These hooks encapsulate complex state logic and side effects to make components cleaner and more maintainable.

## Table of Contents

1. [Resource Management](#resource-management)
   - [useResources](#useresources)
2. [Wizard and Usage](#wizard-and-usage)
   - [useEnhancedWizard](#useenhancedwizard)
   - [useUsageWizard](#useusagewizard)
3. [Scenarios and Comparison](#scenarios-and-comparison)
   - [useScenarios](#usescenarios)
4. [AI Integration](#ai-integration)
   - [useCopilot](#usecopilot)
5. [UI and Interaction](#ui-and-interaction)
   - [useSearchAndFilter](#usesearchandfilter)
   - [useSorting](#usesorting)

## Resource Management

### useResources

Manages the state of resources, adjustments, and cost calculations.

**Returns:**
- `file`: Current file object
- `resources`: Array of resources
- `groupedResources`: Resources grouped by type
- `adjustments`: Object mapping resource indices to adjustment percentages
- `totalCost`: Total adjusted cost
- `isLoading`: Boolean indicating if upload is in progress
- `error`: Error message if upload failed
- `projectId`: ID of the current project
- `handleFileChange`: Function to handle file selection
- `handleUpload`: Function to handle file upload
- `updateAdjustment`: Function to update adjustment for a resource
- `applyUsageData`: Function to apply usage data to resources

**Usage:**
```jsx
const {
  file, resources, groupedResources, adjustments,
  totalCost, isLoading, error, projectId,
  handleFileChange, handleUpload, updateAdjustment, applyUsageData
} = useResources();
```

**Implementation Details:**
The hook manages the state of uploaded resources and provides functions for interacting with them. It handles file uploads via API calls, processes the returned resources, calculates adjusted costs based on usage assumptions, and organizes resources by type for easier display.

### Internal Flow:

1. User selects a file (tracked by `file` state)
2. `handleUpload` sends the file to the API
3. Resources are returned and stored in `resources` state
4. Initial usage adjustments are fetched for each resource
5. Resource groups are generated automatically from the resource types
6. Cost calculations are updated whenever resources or adjustments change

## Wizard and Usage

### useEnhancedWizard

Manages the enhanced wizard flow for gathering usage information, with templates and profiles.

**Parameters:**
- `resources`: Array of resources to gather usage information for
- `onComplete`: Callback function called when the wizard is completed with usage data

**Returns:**
- `isOpen`: Boolean indicating if the wizard is open
- `questions`: Array of questions for the wizard
- `answers`: Array of answers to the questions
- `currentStep`: Current step in the wizard
- `isLoading`: Boolean indicating if an API request is in progress
- `error`: Error message if an API request failed
- `showTemplateSelector`: Boolean indicating if the template selector is shown
- `savedProfiles`: Array of saved usage profiles
- `openWizard`: Function to open the wizard
- `closeWizard`: Function to close the wizard
- `updateAnswer`: Function to update an answer
- `handleNext`: Function to move to the next question
- `handlePrevious`: Function to move to the previous question
- `handleSkip`: Function to skip the current question
- `openTemplateSelector`: Function to show the template selector
- `closeTemplateSelector`: Function to hide the template selector
- `applyTemplate`: Function to apply a template to resources
- `saveProfile`: Function to save a profile
- `loadProfile`: Function to load a profile
- `getCurrentQuestion`: Function to get the current question

**Usage:**
```jsx
const wizard = useEnhancedWizard(resources, ({ usage }) => {
  applyUsageData(usage);
});

// To open the wizard
wizard.openWizard();

// To show the template selector
wizard.openTemplateSelector();
```

**Implementation Details:**
This hook manages a multi-step wizard flow for gathering usage information. It fetches questions from the API based on the resources, tracks answers, and provides navigation functions. It also supports templates and profiles for saving and reusing usage patterns.

### Internal Flow:

1. User opens the wizard
2. Hook fetches questions from the API
3. User navigates through questions and provides answers
4. On completion, answers are sent to the API to generate usage data
5. Generated usage data is passed to the onComplete callback
6. Alternatively, user can apply a template to skip the wizard

### useUsageWizard

Legacy hook for managing the basic wizard flow.

**Parameters:**
- `resources`: Array of resources to gather usage information for
- `onComplete`: Callback function called when the wizard is completed with usage data

**Returns:**
Similar to `useEnhancedWizard` but without template and profile functionality.

**Usage:**
```jsx
const wizard = useUsageWizard(resources, ({ usage }) => {
  applyUsageData(usage);
});
```

**Implementation Details:**
This is the original wizard hook, which provides basic functionality for gathering usage information. It has been largely superseded by `useEnhancedWizard`, but is maintained for backward compatibility.

## Scenarios and Comparison

### useScenarios

Manages saved scenarios for comparison.

**Returns:**
- `scenarios`: Array of saved scenarios
- `saveScenario`: Function to save the current state as a scenario
- `loadScenario`: Function to load a saved scenario
- `deleteScenario`: Function to delete a saved scenario
- `compareScenarios`: Function to compare two scenarios
- `currentComparison`: Current comparison result (if any)
- `clearComparison`: Function to clear the current comparison

**Usage:**
```jsx
const {
  scenarios, saveScenario, loadScenario,
  deleteScenario, compareScenarios,
  currentComparison, clearComparison
} = useScenarios();

// Save current state as a scenario
saveScenario("Production v1", "Production environment with 3 instances", resources, adjustments);

// Compare two scenarios
compareScenarios(scenarios[0], scenarios[1]);
```

**Implementation Details:**
This hook manages saved scenarios for comparison. Scenarios are stored in local storage and include resources, adjustments, and metadata like name, description, and date. The hook provides functions for saving, loading, and comparing scenarios.

### Internal Flow:

1. User saves current state as a named scenario
2. Scenario is stored in local storage
3. User can load a scenario to restore its state
4. User can compare two scenarios to see differences
5. Comparison results highlight added, removed, and changed resources

## AI Integration

### useCopilot

Manages interaction with the AI copilot.

**Parameters:**
- `resources`: Array of resources to provide context for the copilot

**Returns:**
- `isOpen`: Boolean indicating if the copilot sidebar is open
- `messages`: Array of chat messages
- `input`: Current input value
- `isLoading`: Boolean indicating if a request is in progress
- `error`: Error message if a request failed
- `toggleSidebar`: Function to toggle the sidebar
- `setInput`: Function to update the input value
- `sendMessage`: Function to send a message to the copilot
- `clearMessages`: Function to clear the message history

**Usage:**
```jsx
const copilot = useCopilot(resources);

// Toggle the sidebar
copilot.toggleSidebar();

// Send a message
copilot.sendMessage("How can I reduce my EC2 costs?");
```

**Implementation Details:**
This hook manages the chat interaction with the AI copilot. It maintains a message history, handles sending messages to the API, and processes responses. The copilot has access to the current resources for context-aware responses.

### Internal Flow:

1. User toggles the copilot sidebar to open it
2. User types a message and sends it
3. Message is sent to the API along with resource context
4. Response is received and added to the message history
5. User can continue the conversation with follow-up questions

## UI and Interaction

### useSearchAndFilter

Manages search and filter state for resource tables.

**Parameters:**
- `resources`: Array of resources to search and filter

**Returns:**
- `searchTerm`: Current search term
- `filters`: Current filters object
- `filteredResources`: Resources filtered by search and filters
- `setSearchTerm`: Function to update the search term
- `setFilters`: Function to update the filters
- `resetFilters`: Function to reset all filters
- `availableTypes`: Array of available resource types

**Usage:**
```jsx
const {
  searchTerm, filters, filteredResources,
  setSearchTerm, setFilters, resetFilters,
  availableTypes
} = useSearchAndFilter(resources);
```

**Implementation Details:**
This hook manages search and filter functionality for resource tables. It applies search terms and filters to the resources and returns the filtered subset. It supports filtering by resource type, cost range, and other criteria.

### useSorting

Manages sorting state for resource tables.

**Parameters:**
- `resources`: Array of resources to sort
- `initialSortBy`: Initial sort field
- `initialSortDirection`: Initial sort direction ("asc" or "desc")

**Returns:**
- `sortedResources`: Sorted resources
- `sortBy`: Current sort field
- `sortDirection`: Current sort direction
- `setSortBy`: Function to update the sort field
- `setSortDirection`: Function to update the sort direction
- `toggleSortDirection`: Function to toggle the sort direction

**Usage:**
```jsx
const {
  sortedResources, sortBy, sortDirection,
  setSortBy, setSortDirection, toggleSortDirection
} = useSorting(resources, "name", "asc");
```

**Implementation Details:**
This hook manages sorting functionality for resource tables. It sorts resources by the specified field and direction, and provides functions for changing the sort parameters. It handles sorting for different data types (strings, numbers) appropriately.

## Hook Composition

The hooks are designed to be composable, allowing complex state management to be built from simpler building blocks. For example, the `ResourceTable` component uses both `useSearchAndFilter` and `useSorting` to provide a complete resource management interface:

```jsx
function ResourceTable({ resources, adjustments, onAdjustmentChange }) {
  const {
    searchTerm, filters, filteredResources,
    setSearchTerm, setFilters, resetFilters
  } = useSearchAndFilter(resources);
  
  const {
    sortedResources, sortBy, sortDirection,
    setSortBy, setSortDirection
  } = useSorting(filteredResources, "monthlyCost", "desc");
  
  // Render table with sortedResources
}
```

## Data Flow Between Hooks

The hooks interact to create a cohesive application state:

1. `useResources` manages the core resource data
2. `useEnhancedWizard` gathers usage information for resources
3. `useResources.applyUsageData` applies the usage data from the wizard
4. `useScenarios` can save and compare different states from `useResources`
5. `useCopilot` provides AI assistance based on the resources

This modular approach allows for flexible state management that can evolve with the application's needs.