# Contributing to CityHunter Backend

Thank you for your interest in contributing to CityHunter! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cityhunter-backend.git
   cd cityhunter-backend
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/cityhunter-backend.git
   ```

## Development Setup

### Prerequisites

- Python 3.12 or higher
- MongoDB (local or Atlas)
- Git
- uv (recommended) or pip

### Installation

```bash
# Install uv (recommended)
pip install uv

# Install dependencies
uv sync

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required: MONGO_URI, DB_NAME, SECRET_KEY, API_KEY
```

### Database Setup

```bash
# Seed levels data
uv run python scripts/populate_levels.py

# (Optional) Seed monuments and walks
uv run python scripts/populate_monuments.py
```

### Running the Development Server

```bash
# Start with auto-reload
uv run uvicorn app.main:app --reload --port 8000

# Access Swagger UI at http://localhost:8000/docs
```

## Development Workflow

### Creating a Feature Branch

```bash
# Update your local main
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Write code** following our style guidelines
2. **Add tests** for new functionality
3. **Update documentation** if needed
4. **Run tests** to ensure nothing breaks
5. **Commit changes** with clear messages

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example**:
```
feat(gamification): add badge system for achievements

Implemented a new badge system that awards users for completing
specific milestones like visiting 10 monuments or finishing 5 walks.

Closes #123
```

## Code Style

### Python Style Guide

We follow **PEP 8** with some modifications:

- **Line length**: 88 characters (Black default)
- **Imports**: Organized with `isort`
- **Type hints**: Required for all function signatures
- **Docstrings**: Google style for public APIs

### Formatting Tools

```bash
# Format code with Black
uv run black app/ tests/

# Sort imports
uv run isort app/ tests/

# Lint with Ruff
uv run ruff check app/ tests/

# Type check with mypy
uv run mypy app/
```

### Code Examples

**Good**:
```python
from typing import Optional
from uuid import UUID

async def get_user_profile(user_id: UUID) -> Optional[UserProfile]:
    """Fetch user profile by ID.
    
    Args:
        user_id: The unique identifier for the user
        
    Returns:
        UserProfile if found, None otherwise
    """
    return await UserProfile.find_one(UserProfile.user_id == user_id)
```

**Bad**:
```python
def get_user(id):  # Missing type hints and async
    return UserProfile.find_one(UserProfile.user_id == id)  # Missing await
```

## Testing

### Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app --cov-report=html

# Run specific test file
uv run pytest tests/integration/test_auth.py

# Run with verbose output
uv run pytest -v
```

### Writing Tests

- **Unit tests**: Test individual functions/methods in isolation
- **Integration tests**: Test API endpoints and database interactions
- **Use fixtures**: Leverage pytest fixtures for setup/teardown

**Example Test**:
```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    """Test user registration endpoint."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "securepass123",
            "handle": "testuser"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
```

### Test Coverage

- Aim for **>80% code coverage**
- All new features must include tests
- Bug fixes should include regression tests

## Pull Request Process

### Before Submitting

1. ✅ All tests pass
2. ✅ Code is formatted (Black, isort)
3. ✅ No linting errors (Ruff)
4. ✅ Documentation is updated
5. ✅ CHANGELOG.md is updated (if applicable)

### Submitting a PR

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference to related issues (e.g., "Closes #123")
   - Screenshots (if UI changes)

3. **Wait for review**:
   - Address reviewer feedback
   - Make requested changes
   - Push updates to the same branch

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
```

## Project Structure

```
cityhunter-backend/
├── app/
│   ├── api/
│   │   ├── deps.py              # Dependencies (auth, etc.)
│   │   └── v1/
│   │       ├── endpoints/       # API route handlers
│   │       └── router.py        # API router configuration
│   ├── core/
│   │   ├── config.py            # Settings and configuration
│   │   └── security.py          # Auth utilities
│   ├── db/
│   │   └── mongodb.py           # Database initialization
│   ├── models/                  # Pydantic/Beanie models
│   ├── repositories/            # Data access layer
│   ├── services/                # Business logic
│   └── main.py                  # FastAPI application
├── tests/
│   ├── integration/             # Integration tests
│   └── unit/                    # Unit tests
├── scripts/                     # Utility scripts
├── .env.example                 # Environment template
├── pyproject.toml               # Project dependencies
└── README.md                    # Project documentation
```

## Questions or Need Help?

- 💬 Open a [Discussion](https://github.com/yourusername/cityhunter-backend/discussions)
- 🐛 Report bugs via [Issues](https://github.com/yourusername/cityhunter-backend/issues)
- 📧 Email: dev@cityhunter.app

Thank you for contributing to CityHunter! 🎉
