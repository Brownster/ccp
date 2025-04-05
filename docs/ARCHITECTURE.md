# Architecture Overview

This document outlines the architecture of the Cloud Cost Predictor application, explaining the design choices, component relationships, and data flow.

## System Architecture

![Architecture Diagram](architecture.png)

The Cloud Cost Predictor follows a modern client-server architecture with clearly separated frontend and backend components, communicating via a RESTful API.

### High-Level Components

1. **Frontend**: React-based single-page application
2. **Backend**: FastAPI Python application
3. **AI Services**: Integration with Google Gemini via LangChain/LangGraph
4. **Cost Estimation**: Integration with Infracost for accurate pricing data

## Frontend Architecture

The frontend uses a component-based architecture with React, organized into several key layers:

### Component Structure

- **Page Components**: High-level components representing entire views
  - `CostEstimator`: Main application view
  
- **Feature Components**: Self-contained feature sets
  - Dashboard Components
  - Resource Management Components
  - Wizard Components
  - Comparison Components
  - Copilot Components

- **Shared UI Components**: Reusable UI elements
  - Cards, Buttons, Charts, etc.

### State Management

The application uses React's hooks for state management:

- **Custom Hooks**:
  - `useResources`: Manages resource data, adjustments, and cost calculations
  - `useEnhancedWizard`: Manages the usage wizard flow
  - `useScenarios`: Manages saved scenarios for comparison
  - `useCopilot`: Manages interaction with the AI copilot

### Data Flow

1. User uploads a Terraform file
2. Frontend sends file to backend for processing
3. Backend returns parsed resources with cost estimates
4. Frontend displays resources and allows adjustments
5. Usage wizard gathers information to refine cost estimates
6. Adjusted cost data is calculated and displayed

## Backend Architecture

The backend follows a service-oriented architecture with FastAPI:

### Layer Structure

1. **API Layer**: FastAPI routes/endpoints
2. **Service Layer**: Business logic services
3. **Integration Layer**: External service integrations
4. **Utility Layer**: Helper functions and utilities

### Key Services

- **Infracost Service**: Interfaces with Infracost for resource cost estimation
- **LLM Service**: Manages interactions with Google Gemini
- **Usage Service**: Handles usage data generation and processing
- **Template Service**: Manages usage templates
- **Storage Service**: Handles file and data persistence

### API Design

The API follows RESTful design principles:
- Resource-oriented endpoints
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JSON-based request/response formats
- Consistent error handling

## AI Integration

The AI integration is a core feature of the application, implemented using:

### LangChain and LangGraph

- **Prompt Engineering**: Carefully designed prompts for specific tasks
- **Chains**: Sequences of operations for complex logic
- **Graphs**: State machines for multi-step flows like the usage wizard

### AI-Powered Features

- **Usage Clarification**: Generating appropriate questions based on resource types
- **Usage Generation**: Converting user answers into structured usage data
- **Cost Optimization**: Providing recommendations for cost reduction
- **Diff Analysis**: Analyzing changes between infrastructure versions

## Data Flow Diagram

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │
│  Frontend  ├────►│  Backend   ├────►│ Infracost  │
│            │     │            │     │            │
└────────────┘     └─────┬──────┘     └────────────┘
                         │                  ▲
                         ▼                  │
                   ┌───────────┐     ┌──────┴─────┐
                   │           │     │            │
                   │  Google   │     │  Terraform │
                   │  Gemini   │     │  Parser    │
                   │           │     │            │
                   └───────────┘     └────────────┘
```

## Security Considerations

The architecture incorporates several security measures:

- **Input Validation**: All user inputs are validated on both client and server
- **CORS Policies**: Configured for API security
- **API Rate Limiting**: Prevents abuse of endpoints
- **Dependency Management**: Regular updates to dependencies
- **Error Handling**: Secure error handling to prevent information leakage

## Testing Strategy

The application employs a comprehensive testing strategy:

- **Unit Tests**: For individual functions and components
- **Integration Tests**: For service interactions
- **API Tests**: For endpoint behavior
- **UI Tests**: For user interface functionality
- **End-to-End Tests**: For complete user flows

## Deployment Architecture

The application is designed to be deployed using containerization:

```
┌─────────────────────────────────┐
│          Load Balancer          │
└───────────────┬─────────────────┘
                │
┌───────────────┼─────────────────┐
│               │                 │
▼               ▼                 ▼
┌─────────┐ ┌─────────┐     ┌─────────┐
│ Frontend │ │ Backend │ ... │ Backend │
│ Container│ │Container│     │Container│
└─────────┘ └─────────┘     └─────────┘
                │                 │
                ▼                 ▼
┌───────────────────────────────────┐
│             Database              │
└───────────────────────────────────┘
```

Each component is containerized using Docker, with services defined in `docker-compose.yml`:

- Frontend container (React)
- Backend container (FastAPI)
- Shared volumes for persistent data

## Scalability Considerations

The architecture is designed to scale horizontally:

- **Stateless Backend**: Allows adding more instances as needed
- **Caching**: Implemented for frequently accessed data
- **Async Processing**: For resource-intensive operations
- **Database Indexing**: For efficient data retrieval
- **Load Balancing**: Distributes traffic across instances

## Future Architecture Extensions

The architecture is designed to accommodate future enhancements:

- **User Authentication**: Adding user accounts and authentication
- **Team Collaboration**: Sharing and collaboration features
- **Real-time Updates**: WebSocket integration for live updates
- **Extended AI Features**: More sophisticated AI-powered analyses
- **Additional Cloud Providers**: Support for more cloud platforms

## Appendix: Technology Stack

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library

### Backend
- **Framework**: FastAPI
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Pytest

### AI/ML
- **LLM Framework**: LangChain, LangGraph
- **LLM Model**: Google Gemini

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Deployment**: Kubernetes (planned)

### Development Tools
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Black