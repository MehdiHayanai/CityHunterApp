# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-02-09

### 🎉 Release Highlights

This is the first major release of CityHunter Backend, marking the completion of core features and production-ready documentation.

**Key Achievements**:
- ✅ Complete API documentation
- ✅ Developer-friendly contribution guidelines
- ✅ Secure authentication with public/protected route separation
- ✅ Production-ready deployment configuration
- ✅ Organized, maintainable documentation structure

**Breaking Changes**: None

**Migration Guide**: No migration required for this release.

**Contributors**: Thank you to all contributors who made this release possible (Antigravity and I)!

---

### Added

#### Authentication & Security
- **Public Auth Routes**: Removed API key requirement from authentication endpoints (`/auth/register`, `/auth/login`, `/auth/access-token`)
- **Router Separation**: Split routers into `public_router` and `api_router` for better security control
- **API Key Test Endpoint**: Added `/api/v1/test-api-key` for debugging API key validation

#### Configuration & Deployment
- **CORS Enhancement**: Dynamic CORS configuration with `FRONT_URL` environment variable
- **Automatic Origin Management**: Frontend URL automatically added to allowed CORS origins
- **Cloud Run Integration**: Added `FRONT_URL` to GitHub Actions deployment pipeline
- **Environment Variables**: Enhanced configuration with frontend URL support

#### Documentation
- **Comprehensive README.md**: Complete project overview with quick start guide, features, and navigation
- **CONTRIBUTING.md**: Developer guidelines covering setup, code style, testing, and PR process
- **API.md**: Complete API reference with all endpoints, authentication, and examples
- **Archive System**: Moved historical development docs to `archive/` directory with explanatory README

### Changed

#### Architecture & Security
- **Router Structure**: Reorganized API routers to separate public and protected endpoints
- **API Key Header**: Standardized to `X-API-Key` with `apiKey` security scheme
- **Authentication Flow**: Improved separation between public and protected routes
- **CORS Configuration**: Updated to use field validator with automatic frontend URL inclusion
- **Documentation Structure**: Reorganized 31 markdown files into clear, navigable structure

### Fixed
- **API Key Validation**: Resolved 401/403 errors in authentication flow
- **CORS Issues**: Fixed frontend communication with dynamic origin configuration
- **Documentation Discoverability**: Improved organization and navigation

### Deprecated
- Historical development documentation in `prompts-lib/` (moved to `archive/`)

---

## [0.1.0] - 2026-02-07

### Added
- **XP System**: Implemented full gamification logic with exponential decay for repeated visits
- **Levels**: Added Database-driven Level system (Models, Population Script, Service)
- **API Endpoints**:
    - `POST /api/v1/gamification/visit`: Register visits and award XP
    - `GET /api/v1/gamification/levels`: Fetch all available levels
- **Models**: Added `Activity` and `Level` Beanie models
- **Scripts**: Added `scripts/populate_levels.py` to seed level data
- **RBAC**: Implemented Role-Based Access Control with `role` field ('user' or 'admin')
- **Dependencies**: Added `h3` library for hexagonal hierarchical spatial indexing

### Changed
- Refactored `GamificationService` to be async and fetch levels from MongoDB
- Updated `QuestState` to track visit history via `Activity` log

### Fixed
- **Testing**: Resolved `RuntimeError` in async fixtures for `pytest`
- **Validation**: Fixed Pydantic validation errors in `Walk` model creation
- **CORS**: Configured CORS to allow frontend requests from local development ports
