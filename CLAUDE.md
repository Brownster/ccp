# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Frontend: `npm run dev` (run dev server), `npm run build` (build for production)
- Backend: `uvicorn app.main:app --reload` (run dev server)
- Tests: `pytest --cov=app` (all tests with coverage)
- Single test: `pytest path/to/test.py::test_function_name`
- Lint: No specific linting commands identified

## Code Style
- Python: Use type hints and follow PEP 8 conventions
- React: Functional components with named exports
- CSS: Use Tailwind classes for styling
- Imports: Group standard library, third-party, and local imports
- Error handling: Use try/except in Python, try/catch in JS
- Naming: snake_case for Python, camelCase for JavaScript
- Components: One component per file, named after functionality