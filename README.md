# CityHunter App

A gamified city exploration application with a React/Next.js frontend and FastAPI backend.

## 📁 Project Structure

```
CityHunterApp/
├── .github/            # GitHub Actions workflows
│   └── workflows/     # CI/CD deployment pipelines
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
│
├── .agent/            # AI Agent workflows
│   └── workflows/     # Development workflow definitions
│
├── cityhunter/        # Frontend (Next.js/React)
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── features/     # Feature modules
│   └── docs/         # Frontend documentation
│
└── hunterBack/        # Backend (FastAPI/Python)
    ├── app/          # FastAPI application
    ├── scripts/      # Utility scripts
    ├── tests/        # Backend tests
    └── notebook/     # Jupyter notebooks
```

## 🚀 Quick Start

### Frontend (cityhunter)
```bash
cd cityhunter
npm install
npm run dev
```

See [cityhunter/README.md](./cityhunter/README.md) for detailed frontend documentation.

### Backend (hunterBack)
```bash
cd hunterBack
uv sync
uv run uvicorn app.main:app --reload
```

See [hunterBack/README.md](./hunterBack/README.md) for detailed backend documentation.

## 📚 Documentation

- **Frontend**: [cityhunter/docs/](./cityhunter/docs/)
- **Backend**: [hunterBack/](./hunterBack/)
  - [API Documentation](./hunterBack/API.md)
  - [Deployment Guide](./hunterBack/DEPLOYMENT.md)
  - [Project Overview](./hunterBack/PROJECT_OVERVIEW.md)

## 🔐 Security

This repository has been cleaned of all previous git history to protect against accidentally committed secrets. Please ensure:

1. Never commit `.env` files
2. Use `.env.example` files as templates
3. Store secrets in `loc_secrets/` (gitignored)
4. Review the `.gitignore` before committing sensitive files

## 🛠️ Development Workflows

AI-assisted workflows are available in [.agent/workflows/](./.agent/workflows/).

## 📝 License

See individual component READMEs for license information.
