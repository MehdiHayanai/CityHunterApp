---
description: Setup development environment from scratch
---

# Setup Development Environment

This workflow guides you through setting up the CityHunter development environment.

## Prerequisites

### Required Software
- **Git**: Version control
- **Node.js**: v18+ (for frontend)
- **Python**: 3.11+ (for backend)
- **uv**: Python package manager (`pip install uv`)
- **Docker** (optional): For containerized development

### Recommended Tools
- **VS Code**: With extensions for Python, TypeScript, and ESLint
- **MongoDB Compass**: For database management
- **Postman**: For API testing

## Setup Steps

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd CityHunterApp
```

### 2. Setup Backend

```bash
cd hunterBack

# Create virtual environment with uv
uv venv

# Install dependencies
uv sync

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - MONGODB_URI
# - API_KEY
# - GEMINI_API_KEY
```

### 3. Setup Frontend

```bash
cd ../cityhunter

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
# Required variables:
# - NEXT_PUBLIC_API_URL
# - NEXT_PUBLIC_API_KEY
```

### 4. Verify Setup

```bash
# Test backend
cd hunterBack
uv run pytest

# Test frontend
cd ../cityhunter
npm run build
```

### 5. Start Development Servers

See [start-app.md](./start-app.md) for instructions on starting the application.

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/cityhunter
API_KEY=your-api-key-here
GEMINI_API_KEY=your-gemini-key-here
FRONT_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=your-api-key-here
```

## Troubleshooting

### Backend Issues
- **Import errors**: Run `uv sync` to ensure all dependencies are installed
- **Database connection**: Verify MongoDB is running and URI is correct
- **Port conflicts**: Change port in uvicorn command if 8000 is in use

### Frontend Issues
- **Module not found**: Run `npm install` to install dependencies
- **Build errors**: Clear `.next` folder and rebuild
- **API connection**: Verify backend is running and URL is correct

## Next Steps

1. Review [hunterBack/PROJECT_OVERVIEW.md](../../hunterBack/PROJECT_OVERVIEW.md)
2. Check [cityhunter/docs/](../../cityhunter/docs/) for frontend documentation
3. Explore [hunterBack/API.md](../../hunterBack/API.md) for API reference
