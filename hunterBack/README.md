# CityHunter Backend 🏙️

> Transform urban exploration into an engaging RPG-like adventure where every monument tells a story and every walk earns rewards.

**CityHunter** is a gamified urban exploration platform that turns city sightseeing into an interactive experience. Users discover monuments, complete walking quests, answer trivia, and level up while exploring their city.

[![Deploy to Cloud Run](https://github.com/yourusername/cityhunter/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/cityhunter/actions)

## ✨ Features

- 🗺️ **Geospatial Discovery** - Find monuments and points of interest near you
- 🚶 **Walking Quests** - Complete curated walks connecting multiple locations
- 🎯 **Gamification** - Earn XP, level up, and unlock achievements
- 🧠 **Interactive Quizzes** - Test your knowledge about monuments
- 🔐 **Secure Authentication** - OAuth2 with JWT tokens
- 📱 **RESTful API** - Clean, documented endpoints for mobile/web clients

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- MongoDB (local or Atlas)
- Docker (optional, for containerized deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/cityhunter-backend.git
cd cityhunter-backend

# Install dependencies with uv (recommended)
pip install uv
uv sync

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# Run the development server
uv run uvicorn app.main:app --reload

# Access the API
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker compose up --build -d

# View logs
docker compose logs -f

# Access at http://localhost:8080
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📚 Documentation

- **[Project Overview](PROJECT_OVERVIEW.md)** - Architecture and technical details
- **[API Reference](API.md)** - Complete API documentation
- **[Deployment Guide](DEPLOYMENT.md)** - Docker and Cloud Run deployment
- **[Contributing](CONTRIBUTING.md)** - Development guidelines
- **[Changelog](CHANGELOG.md)** - Version history

## 🏗️ Tech Stack

- **Framework**: FastAPI (async Python web framework)
- **Database**: MongoDB with Beanie ODM
- **Authentication**: OAuth2 + JWT
- **Testing**: Pytest with async support
- **Deployment**: Docker, Google Cloud Run
- **CI/CD**: GitHub Actions

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/access-token` - OAuth2 token endpoint

### Content
- `GET /api/v1/pois/` - List points of interest
- `GET /api/v1/walks/` - List walking quests
- `GET /api/v1/content/dashboard/items` - Nearby discoveries

### Gamification
- `POST /api/v1/gamification/visit` - Register monument visit
- `POST /api/v1/gamification/walk/finish` - Complete a walk
- `POST /api/v1/quizzes/validate` - Submit quiz answer
- `GET /api/v1/gamification/levels` - Get level progression

### User
- `GET /api/v1/users/profile/me` - Get current user profile
- `PATCH /api/v1/users/profile/me` - Update profile

See [API.md](API.md) for complete endpoint documentation.

## 🧪 Testing

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app --cov-report=html

# Run specific test file
uv run pytest tests/integration/test_auth.py
```

## 🔧 Configuration

Key environment variables (see `.env.example`):

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | ✅ |
| `DB_NAME` | Database name | ✅ |
| `SECRET_KEY` | JWT signing key | ✅ |
| `API_KEY` | API key for protected endpoints | ✅ |
| `RESEND_API_KEY` | Email service API key | ❌ |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | ❌ |
| `FRONT_URL` | Frontend URL for CORS | ❌ |

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Database powered by [MongoDB](https://www.mongodb.com/)
- Deployed on [Google Cloud Run](https://cloud.google.com/run)

## 📞 Support

- 📧 Email: support@cityhunter.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/cityhunter-backend/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/cityhunter-backend/discussions)

---

**Made with ❤️ for urban explorers**
