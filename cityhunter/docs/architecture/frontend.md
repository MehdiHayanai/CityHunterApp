# Frontend Architecture

## Overview

The CityHunter frontend is built with Next.js 15 using the App Router architecture, TypeScript for type safety, and a custom design system for consistent, premium aesthetics.

## Project Structure

```
cityhunter/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (server-side)
│   │   └── v1/[...path]/        # Backend proxy route
│   ├── dashboard/               # Authenticated pages
│   │   ├── profile/[id]/       # User profiles
│   │   └── page.tsx            # Main dashboard
│   ├── features/               # Feature-specific code
│   │   ├── explorer/           # Quest/walk exploration
│   │   ├── poi-manager/        # POI management
│   │   ├── quiz/               # Quiz system
│   │   └── xp_and_games/       # Gamification
│   ├── lib/                    # Utilities and helpers
│   │   └── api.ts              # API client
│   ├── login/                  # Login page
│   ├── signup/                 # Signup page
│   └── globals.css             # Global styles
├── components/                  # Reusable UI components
│   ├── dashboard/              # Dashboard-specific
│   ├── ChatInterface.tsx       # Chat UI
│   ├── ChatWidget.tsx          # Floating chat button
│   └── SpotlightCard.tsx       # Hover effect card
├── features/                    # Feature documentation
├── store/                       # Zustand state stores
│   └── authStore.ts            # Authentication state
├── middleware.ts               # Next.js middleware
└── next.config.ts              # Next.js configuration
```

## Technology Stack

### Core Framework
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety and developer experience

### State Management
- **Zustand**: Lightweight state management
- **React Context**: Theme and dashboard state
- **localStorage**: Quest persistence

### UI & Styling
- **CSS Modules**: Scoped styling
- **Custom Design System**: CSS variables for theming
- **Glassmorphism**: Modern visual effects
- **Google Fonts**: Inter (UI), Roboto Mono (data)

### Maps & Geolocation
- **Leaflet**: Interactive maps
- **React-Leaflet**: React bindings
- **GeoJSON**: Location data format

### Additional Libraries
- **@dnd-kit**: Drag and drop for walk creation
- **date-fns**: Date manipulation
- **Jest**: Testing framework

## Design System

### Color Tokens

CSS variables enable seamless light/dark mode switching:

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--canvas` | `#050505` | `#F1F5F9` | Main background |
| `--surface` | `#121212` | `#FAFAFA` | Cards, panels |
| `--primary` | `#FFFFFF` | `#0F172A` | Headings, main text |
| `--secondary` | `#9CA3AF` | `#475569` | Subtitles, metadata |
| `--accent` | `#CCFF00` | `#B4E600` | Buttons, highlights |
| `--divider` | `rgba(255,255,255,0.05)` | `rgba(0,0,0,0.05)` | Borders |

### Typography

- **Primary Font**: Inter (variable) - UI text and headings
- **Data Font**: Roboto Mono (variable) - Stats, XP, distances

### Visual Effects

- **Glassmorphism**: Backdrop blur with semi-transparent backgrounds
- **Spotlight Cards**: Radial gradient that follows mouse cursor
- **Text Gradients**: Primary to secondary color transitions
- **Animations**: Float, pulse, marquee effects

## State Management

### Zustand Stores

#### Auth Store (`store/authStore.ts`)
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateXP: (newXP: number) => void;
}
```

### React Context

#### Theme Context
- Light/dark mode toggle
- Persisted to localStorage
- System preference detection

#### Dashboard Context
- Active walk state
- Map filters
- Tab selection
- Prevents state loss during navigation

### Local Storage

#### Quest Persistence
```typescript
interface QuestState {
  activeWalkId: string;
  currentStopIndex: number;
  excludedStopIds: number[];
  xpGained: number;
  timestamp: number;
}
```

## Routing Strategy

### Public Routes
- `/` - Landing page
- `/login` - Authentication
- `/signup` - Registration (restricted)

### Protected Routes
- `/dashboard` - Main dashboard
- `/dashboard/profile/[id]` - User profiles
- `/social` - Social features (coming soon)

### API Routes
- `/api/v1/[...path]` - Backend proxy (server-side only)

## Component Architecture

### Component Hierarchy

```
App Layout
├── Navigation
├── Page Content
│   ├── Dashboard Layout
│   │   ├── Dashboard Navbar
│   │   ├── Sidebar
│   │   ├── Map View
│   │   └── Chat Widget
│   └── Profile Layout
│       ├── Dashboard Navbar
│       └── Profile Content
└── Footer
```

### Key Components

#### Dashboard Components
- **LeafletMap**: Interactive map with monuments and walks
- **Sidebar**: Walk browser and creator
- **QuestView**: Active quest interface
- **DevTools**: Development utilities

#### Shared Components
- **SpotlightCard**: Reusable card with hover effects
- **ChatWidget**: Floating chat button
- **ChatInterface**: Full chat UI
- **ComingSoonWrapper**: Feature placeholder overlay

## Data Flow

### Authentication Flow

```
1. User submits credentials
2. Frontend calls /api/v1/auth/login
3. Proxy injects x-api-key header
4. Backend validates and returns JWT
5. Frontend stores JWT in authStore
6. JWT included in subsequent requests via cookies
```

### Quest Flow

```
1. User selects/creates walk
2. Quest state initialized in memory
3. User navigates to stops
4. Geolocation triggers proximity checks
5. Quiz completion updates XP
6. State persisted to localStorage
7. Completion synced to backend
```

### Map Interaction Flow

```
1. Map loads monuments from backend
2. User clicks monument
3. Popup displays info
4. "Experience" button opens detail view
5. Context preserves map state
6. User returns without losing position
```

## Performance Optimizations

### Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting via Next.js

### Image Optimization
- Next.js Image component
- WebP format with fallbacks
- Lazy loading

### State Optimization
- Zustand for minimal re-renders
- React.memo for expensive components
- useMemo/useCallback for computed values

### Caching
- API response caching
- Static asset caching
- Service worker (planned)

## Security Considerations

### API Key Protection
- API keys never exposed to client
- Server-side proxy injects headers
- Environment variables server-only

### Authentication
- JWT tokens in HTTP-only cookies
- Token refresh mechanism
- Protected route middleware

### Input Validation
- Client-side validation for UX
- Server-side validation for security
- TypeScript for type safety

## Development Workflow

### Local Development
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code
```

### Environment Variables
- `.env.local` for local development
- `.env.example` as template
- Server-only variables prefixed with `BACKEND_`

### Testing Strategy
- Unit tests with Jest
- Component tests with React Testing Library
- Integration tests for critical flows

## Next Steps

- [Backend Integration](backend-integration.md) - API structure and data models
- [Security](security.md) - Detailed security implementation
- [Styling Guide](../development/styling.md) - Design system details
