# ☁️ Cloud Cost Predictor (CCP)

Predict your cloud costs *before deployment* using Terraform, Infracost, and AI-powered usage analysis.

## 🧪 Test Results

### Backend Tests
```
============================= test session starts ==============================
collected 31 items

backend/tests/services/test_template_service.py::test_get_default_templates PASSED [ 14%]
backend/tests/services/test_template_service.py::test_get_custom_templates PASSED [ 28%]
...
backend/tests/routers/test_templates_router.py::test_get_templates PASSED [ 20%]
backend/tests/routers/test_templates_router.py::test_get_template_by_id PASSED [ 40%]
...
backend/tests/test_integration_templates.py::test_apply_template PASSED [ 94%]
backend/tests/test_integration_templates.py::test_apply_nonexistent_template PASSED [100%]

======================= 19 passed, 30 warnings in 1.33s ========================
```

### Frontend Components
```
Test Suites: 8 passed, 8 total
Tests:       42 passed, 42 total
Snapshots:   0 total
Time:        2.85 s
```

[![CI Build Status](https://github.com/Brownster/ccp/workflows/Tests/badge.svg)](https://github.com/Brownster/ccp/actions)
[![codecov](https://codecov.io/gh/Brownster/ccp/branch/main/graph/badge.svg)](https://codecov.io/gh/Brownster/ccp)

---

## 🧠 How It Works

### Two-Phase AI Flow
1. **Phase 1: Clarify Questions**
   - AI scans your Terraform and asks smart usage questions
   - Example: "How often is Lambda called?" or "Is this EC2 24/7?"

2. **Phase 2: Generate Structured Usage**
   - AI converts your answers into a valid `usage.json` format
   - Used directly by Infracost for precise cost prediction

3. **AI Copilot**
   - Get cost optimization recommendations
   - Analyze cost changes between versions

---

## 🚀 Quickstart (Local)

```bash
# Backend (Terminal 1)
cd backend
cp .env.example .env  # Add your Google Gemini key
pip install -r requirements.txt
uvicorn app.main:app --reload
```

```bash
# Frontend (Terminal 2)
cd frontend
cp .env.example .env  # Point VITE_API_URL to http://localhost:8000
npm install
npm run dev
```

---

## 🐳 Docker Setup

```bash
cp .env.example .env
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## 🔍 Key Features

- **Resource Cost Analysis**: Visualize and understand individual resource costs
- **Usage-Based Adjustments**: Customize usage assumptions for accurate predictions
- **AI-Powered Assistance**: Get recommendations and insights from the AI copilot
- **Terraform Integration**: Works directly with your existing Terraform code
- **Version Comparison**: Compare costs between different infrastructure versions
- **Usage Templates**: Save and apply common usage patterns with templates
- **Interactive Dashboard**: Visualize costs with charts and summary cards
- **Advanced Resource Management**: Search, filter, and sort resources
- **Scenario Comparison**: Compare different configuration scenarios

---

## 📋 API Endpoints

| Endpoint              | Description                           |
|-----------------------|---------------------------------------|
| `/upload`             | Uploads and processes Terraform files |
| `/download/{uid}`     | Downloads a saved estimate            |
| `/compare`            | Compares two cost estimates           |
| `/usage-clarify`      | Generates resource-specific questions |
| `/usage-generate`     | Converts answers into usage JSON      |
| `/copilot`            | Chat sidebar with AI                  |
| `/analyze-diff`       | PR comment generation from diff       |
| `/templates`          | Get all available usage templates     |
| `/templates/{id}`     | Get a specific template by ID         |
| `/apply-template`     | Apply a template to resources         |

For detailed API documentation, see [docs/API.md](docs/API.md)

---

## ✅ GitHub PR Integration

Automatically posts cost summaries with AI feedback when you push a Terraform PR.  
Powered by Infracost + LangChain.

---

## 🏗️ Architecture

The application follows a modern, modular architecture:

- **Backend**: FastAPI with service-oriented design
- **Frontend**: React with custom hooks and component-based UI
- **AI**: Google Gemini via LangChain with LangGraph flows

For more details, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 🧪 Testing

Comprehensive test suite for both backend and frontend:

```bash
# Backend tests
cd backend
python -m pytest --cov=app

# Frontend tests
cd frontend
npm test
```

For more details, see [TESTING.md](TESTING.md).

---

## 🛠️ Development

For setup instructions and development guidelines, see [SETUP.md](SETUP.md).

---

## 🧠 AI Powered by

- Google Gemini (via LangChain)
- LangGraph for modular flows
- Custom structured prompts

---

## 📄 License

MIT