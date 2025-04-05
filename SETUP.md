# Terraform Cost Estimator - Developer Setup Guide

This document provides step-by-step instructions for setting up the development environment for the Terraform Cost Estimator project.

## Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- Infracost CLI (for cost estimation)
- Git

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-test.txt  # For testing
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` to add your Google Gemini API key:

```
GOOGLE_API_KEY=your_api_key_here
```

### 3. Run Backend Server

```bash
uvicorn app.main:app --reload
```

The backend will be available at http://localhost:8000

### 4. Run Backend Tests

```bash
pytest --cov=app
```

## Frontend Setup

### 1. Install Node Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` to set the API URL:

```
VITE_API_URL=http://localhost:8000
```

### 3. Run Frontend Development Server

```bash
npm run dev
```

The frontend will be available at http://localhost:3000

### 4. Run Frontend Tests

```bash
npm test
```

## Docker Setup (Alternative)

For a containerized setup:

```bash
cp .env.example .env  # Configure as above
docker-compose up --build
```

## Infracost Setup

1. Install Infracost CLI following the [official instructions](https://www.infracost.io/docs/#quick-start)
2. Authenticate with your API key:

```bash
infracost auth login
```

## Project Structure

```
backend/
├── app/
│   ├── routers/      # API endpoints organized by feature
│   ├── services/     # Business logic
│   ├── dependencies.py  # Dependency injection
│   └── main.py       # Application entry point
├── tests/            # Test suites
└── requirements.txt  # Python dependencies

frontend/
├── src/
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks 
│   ├── services/     # API interaction
│   └── App.jsx       # Application entry point
├── public/           # Static assets
└── package.json      # Node dependencies
```

## Development Workflow

1. Make code changes
2. Run linting and tests:
   ```bash
   # Backend
   cd backend
   pytest --cov=app

   # Frontend
   cd frontend
   npm run lint
   npm test
   ```
3. Submit pull request

## Troubleshooting

### Backend Issues

- **Missing dependencies**: If you get import errors, try `pip install -r requirements.txt` again
- **Authentication errors**: Check your `.env` file has the correct API key
- **Database errors**: Ensure the uploads directory is writable

### Frontend Issues

- **API connection errors**: Verify the backend is running and `VITE_API_URL` is set correctly
- **Build errors**: Check for syntax issues with `npm run lint`

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Infracost Documentation](https://www.infracost.io/docs/)
- [Google Gemini API Documentation](https://ai.google.dev/docs/gemini_api_overview)