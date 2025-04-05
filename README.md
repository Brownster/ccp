# ☁️ Cloud Cost Predictor (CCP)

Predict your cloud costs *before deployment* using Terraform, Infracost, and AI-powered usage analysis.

[![Tests](https://github.com/Brownster/ccp/workflows/Tests/badge.svg)](https://github.com/Brownster/ccp/actions)

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