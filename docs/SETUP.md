# Development Setup Guide

This guide provides step-by-step instructions for setting up the Cloud Cost Predictor application for development.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Running with Docker](#running-with-docker)
5. [Development Tools](#development-tools)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9+**
- **Node.js 16+**
- **npm 7+**
- **Git**
- **Docker and Docker Compose** (optional, for containerized development)

## Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/username/cloud-cost-predictor.git
cd cloud-cost-predictor
```

### 2. Set Up Python Environment

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt
pip install -r requirements-test.txt  # For development/testing
```

### 3. Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your API keys and configuration:

```env
# Google Gemini API Key
GOOGLE_API_KEY=your_api_key_here

# Infracost API Key
INFRACOST_API_KEY=your_infracost_api_key

# Environment
ENVIRONMENT=development

# Optional: Database configuration (if using)
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloud_cost_predictor
```

### 4. Run the Backend Server

```bash
cd backend
uvicorn app.main:app --reload
```

The backend server will be available at http://localhost:8000.

API documentation is available at http://localhost:8000/docs.

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
VITE_API_URL=http://localhost:8000
```

### 3. Run the Development Server

```bash
npm run dev
```

The frontend development server will be available at http://localhost:3000 or http://localhost:5173 (depending on Vite's configuration).

## Running with Docker

To run the entire application with Docker Compose:

### 1. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration.

### 2. Build and Run the Containers

```bash
docker-compose up --build
```

This will start both the backend and frontend services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### 3. Development with Docker

For development with Docker, you can use volume mounts to reflect code changes without rebuilding:

```yaml
# In docker-compose.yml
services:
  backend:
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --reload --host 0.0.0.0

  frontend:
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev
```

## Development Tools

### Backend Development Tools

#### Running Tests

```bash
cd backend
python -m pytest
```

#### Running Tests with Coverage

```bash
python -m pytest --cov=app --cov-report=html
```

Coverage report will be available in `htmlcov/index.html`.

#### Formatting Code

```bash
# Install Black
pip install black

# Format code
black app tests
```

#### Linting

```bash
# Install flake8
pip install flake8

# Run linting
flake8 app tests
```

### Frontend Development Tools

#### Running Tests

```bash
cd frontend
npm test
```

#### Running Tests with Coverage

```bash
npm test -- --coverage
```

Coverage report will be available in `coverage/lcov-report/index.html`.

#### Linting

```bash
npm run lint
```

#### Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Troubleshooting

### Backend Issues

#### Module Not Found Error

If you get a "Module not found" error, ensure your Python path is set correctly:

```bash
# From the backend directory
export PYTHONPATH=$PYTHONPATH:$(pwd)
```

#### API Key Issues

If you get authentication errors with Google Gemini or Infracost:
- Verify your API keys in the `.env` file
- Check that the keys have the correct permissions
- Ensure the environment variables are being loaded properly

#### Database Connection Issues

If using a database and experiencing connection issues:
- Check database credentials in the `.env` file
- Ensure the database server is running
- Check database connection string format

### Frontend Issues

#### API Connection Issues

If the frontend can't connect to the backend:
- Verify the `VITE_API_URL` in the frontend `.env` file
- Check that the backend server is running
- Check for CORS issues in the browser console

#### Build Errors

If you get build errors:
- Clear the node_modules directory and reinstall: `rm -rf node_modules && npm install`
- Check for outdated dependencies: `npm outdated`
- Update dependencies if needed: `npm update`

#### Hot Reload Not Working

If hot reload isn't working:
- Check for file watching limits on Linux: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
- Restart the development server

### Docker Issues

#### Container Build Fails

If the Docker build fails:
- Check Dockerfile syntax
- Ensure required files are in the correct locations
- Check network connectivity for downloading dependencies

#### Container Startup Issues

If containers fail to start:
- Check port conflicts with other applications
- Check environment variables in the `.env` file
- Check volume mounts in `docker-compose.yml`

#### Volume Mounting Issues

If changes aren't reflected when using volumes:
- Rebuild the container: `docker-compose up --build`
- Check volume paths in `docker-compose.yml`
- Check file permissions