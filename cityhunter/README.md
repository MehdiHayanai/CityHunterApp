# CityHunter

**Wander with Purpose.** 🗺️

CityHunter is an interactive urban exploration app that transforms sightseeing into an engaging quest-based experience. Discover your city through gamified walks, answer AI-powered quizzes, and earn XP as you explore.

## ✨ Features

- **🚶 Quest-Based Walks**: Follow curated routes or create your own custom walks
- **🎯 Gamification**: Earn XP, level up, and unlock achievements
- **🤖 AI Assistant**: Chat with an intelligent guide powered by Google ADK
- **📍 Location-Based Quizzes**: Unlock content when you reach monuments
- **👤 User Profiles**: Track your progress, stats, and collection
- **🗺️ Interactive Maps**: Explore with Leaflet-powered maps
- **🌓 Dark Mode**: Beautiful UI with light/dark themes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see [hunterBack](../hunterBack/))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cityhunter

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- **[Getting Started](docs/getting-started/)** - Installation and quick start guides
- **[Architecture](docs/architecture/)** - System design and technical details
- **[Features](docs/features/)** - Detailed feature documentation
- **[Deployment](docs/deployment/)** - Production deployment guides
- **[Development](docs/development/)** - Contributing and development guidelines

### Quick Links

- [Installation Guide](docs/getting-started/installation.md)
- [Quick Start Tutorial](docs/getting-started/quick-start.md)
- [Architecture Overview](docs/architecture/overview.md)
- [API Documentation](docs/reference/api-endpoints.md)
- [Deployment Guide](docs/deployment/cloud-run.md)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **State**: Zustand
- **Maps**: Leaflet
- **Styling**: CSS Modules with custom design system
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: Google ADK
- **Deployment**: Google Cloud Run

## 🎮 Key Concepts

### Walks
Quest-based routes through the city with ordered stops at monuments and events.

### Gamification
Earn XP by visiting locations and answering quizzes. Level up to unlock rewards and titles.

### Chat Assistant
AI-powered guide that helps you discover monuments, plan walks, and learn about your city.

## 📝 Project Structure

```
cityhunter/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (proxy)
│   ├── dashboard/         # Main application
│   ├── features/          # Feature modules
│   └── lib/               # Utilities
├── components/            # Reusable UI components
├── docs/                  # Documentation
├── features/              # Feature specs
├── store/                 # State management
└── public/                # Static assets
```

## 🚢 Deployment

The app is deployed to Google Cloud Run with automated CI/CD via GitHub Actions.

See [Deployment Guide](docs/deployment/cloud-run.md) for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/development/contributing.md).

## 📄 License

[Add your license here]

## 🔗 Links

- [Backend Repository](../hunterBack/)
- [Documentation](docs/)
- [Changelog](CHANGELOG.md)

---

**CityHunter** - Don't Just Visit. Play the City.
