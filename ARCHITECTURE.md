# ☁️ Terraform Cost Estimator Application Architecture

This document describes the architecture of the Terraform Cost Estimator application, which has been restructured to be more modular, maintainable, and DRY (Don't Repeat Yourself).

## 🏗️ Architecture Overview

The application follows a clean, modular architecture with separation of concerns:

```
app/
├── services/         # Business logic and external integrations
├── routers/          # API routes organized by feature
├── dependencies.py   # Dependency injection
└── main.py           # Application entry point

frontend/
├── src/
│   ├── components/   # UI components
│   ├── hooks/        # Custom React hooks
│   ├── services/     # API interaction
│   └── App.jsx       # Application entry point
```

## 🔧 Backend Architecture

### Service Layer

The backend is organized around a service layer that encapsulates business logic:

- **InfracostService**: Handles terraform file processing and cost estimation
- **LLMService**: Manages LLM interactions with Google's Gemini model
- **UsageService**: Processes usage data and assumptions

### Router Layer

Endpoints are organized into feature-specific routers:

- **upload.py**: File upload and estimate management
- **usage.py**: Usage assumptions and wizard functionality
- **copilot.py**: AI assistant functionality

### Dependency Injection

Services are provided via dependency injection in FastAPI routes:

```python
@router.post("/suggest-usage")
async def suggest_usage(
    req: UsageRequest, 
    llm_service: LLMService = Depends(get_llm_service)
):
    # Implementation using the injected service
```

## 🎨 Frontend Architecture

### Component Hierarchy

Components are broken down into small, focused pieces:

- **UploadForm**: Handles file upload
- **ResourceGroup**: Displays resources by service type
- **ResourceCard**: Individual resource display and adjustment
- **UsageWizardModal**: Interactive wizard for usage assumptions
- **CopilotSidebar**: AI assistant sidebar

### Custom Hooks

Business logic is extracted into custom hooks:

- **useResources**: Manages resources and adjustments
- **useUsageWizard**: Handles the wizard flow
- **useCopilot**: Manages the copilot interaction

### API Service Layer

All API calls are centralized in a service layer:

```javascript
export async function uploadTerraform(file) {
  const formData = new FormData();
  formData.append('file', file);
  // Implementation
}
```

## 🔄 Data Flow

1. User uploads a Terraform file
2. Backend processes file with InfracostService
3. Resources are returned to frontend
4. Frontend displays resources with default usage assumptions
5. User can adjust assumptions or use wizard
6. Adjustments update the displayed cost in real-time

## 🔒 Error Handling

- **Backend**: Structured exceptions with appropriate HTTP status codes
- **Frontend**: Error states in hooks with user-friendly messages
- **API Layer**: Consistent error handling pattern with detailed messages

## 🚀 Improvements Made

1. **Modularity**: Split monolithic code into focused services and components
2. **DRY Principles**: Extracted repeated code patterns
3. **Error Handling**: Consistent approach with user feedback
4. **Environment Variables**: Used for configuration
5. **Type Safety**: Added proper typing throughout
6. **Documentation**: Added comprehensive documentation

## 💻 Running the Application

See the main README.md file for detailed instructions on running the application locally or with Docker.