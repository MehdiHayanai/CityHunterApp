---
description: Run tests for frontend and backend
---

# Run Tests

This workflow runs all tests for the CityHunter application.

## Backend Tests

### Run All Backend Tests
```bash
cd hunterBack
uv run pytest
```

### Run Specific Test File
```bash
cd hunterBack
uv run pytest tests/test_specific.py
```

### Run with Coverage
```bash
cd hunterBack
uv run pytest --cov=app --cov-report=html
```

### Run API Verification
```bash
cd hunterBack
uv run python verify_api.py
```

## Frontend Tests

### Run All Frontend Tests
```bash
cd cityhunter
npm test
```

### Run Tests in Watch Mode
```bash
cd cityhunter
npm test -- --watch
```

### Run Tests with Coverage
```bash
cd cityhunter
npm test -- --coverage
```

## Linting

### Backend Linting
```bash
cd hunterBack
uv run ruff check .
```

### Frontend Linting
```bash
cd cityhunter
npm run lint
```

## Type Checking

### Frontend Type Checking
```bash
cd cityhunter
npx tsc --noEmit
```

## Pre-commit Checks

Before committing, run:
```bash
# Backend
cd hunterBack
uv run ruff check .
uv run pytest

# Frontend
cd cityhunter
npm run lint
npm test
```
