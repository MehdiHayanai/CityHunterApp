# Installation Guide

This guide will help you set up the CityHunter frontend development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm** (comes with Node.js)
  - Verify installation: `npm --version`

- **Git**
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

## Frontend Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cityhunter
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- TypeScript
- Leaflet (for maps)
- Zustand (state management)
- And other dependencies

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Backend API URL (for local development)
BACKEND_API_URL=http://127.0.0.1:8000/api/v1

# API Key for backend authentication
API_BASE_KEY=your_api_key_here

# Optional: Google API Key for chat functionality
GEMINI_API_KEY=your_google_api_key_here
```

> [!IMPORTANT]
> **Security Note**: The `API_BASE_KEY` is only used server-side and never exposed to the client. See [Security Documentation](../architecture/security.md) for details.

### 4. Verify Installation

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the CityHunter application.

## Backend Setup

The CityHunter frontend requires a running backend API. The backend is located in a separate directory:

```
c:\Users\Lenovo\GIT\cityHunter\vibe\hunterBack
```

For backend setup instructions, refer to the backend repository's README.

### Quick Backend Start

If the backend is already configured:

```bash
cd ../hunterBack
# Follow backend-specific installation steps
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can specify a different port:

```bash
PORT=3001 npm run dev
```

### Module Not Found Errors

Clear the cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

Ensure your `.env.local` file is in the root directory (same level as `package.json`) and restart the development server.

### Backend Connection Issues

Verify that:
1. The backend is running
2. `BACKEND_API_URL` in `.env.local` matches the backend URL
3. `API_BASE_KEY` matches the backend's expected key

## Next Steps

- [Quick Start Guide](quick-start.md) - Learn how to use the application
- [Architecture Overview](../architecture/overview.md) - Understand the system design
- [Contributing Guide](../development/contributing.md) - Start contributing
