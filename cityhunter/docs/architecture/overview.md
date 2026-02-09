# CityHunter Architecture Overview

## Project Vision

**"The Smart Compass for the Solo Explorer."**

CityHunter transforms urban exploration into an interactive, gamified experience. It solves the two biggest problems of solo travel: loneliness and not knowing where to go. By replacing static guidebooks with an interactive quest system and conversational AI, CityHunter turns wandering walks into meaningful adventures.

## Brand Strategy

### Core Concept

CityHunter is a gamified utility that provides **direction with purpose** and **active sightseeing** through conversational AI. It validates the solo travel experience by creating a sense of achievement that replaces the need for a human travel companion.

### Strategic Pillars

#### 1. Direction with Purpose
**"Never wonder where to turn next."**

The app provides specific missions, giving users a concrete reason to move to specific locations, addressing the paralysis of choice.

- Stop scrolling maps. Start following the signal.
- Your next discovery is 200m away. We'll show you where.
- Wander without getting lost.

#### 2. Active Sightseeing (Conversational AI)
**"The City Talks Back."**

The app doesn't lecture; it converses. It asks questions to make users look closer at monuments and engage with their surroundings.

- Don't just look. Observe. Then answer.
- A guidebook tells you history. CityHunter challenges you to find it.
- Prove you're actually there. Answer the riddle to unlock the reward.

#### 3. Authentic Autonomy
**"Solo Travel, Gamified."**

Validating the solo travel experience through gamification creates achievement without requiring a travel buddy.

- Explore on your own terms, at your own pace.
- No tour groups. No umbrellas. Just you and the quest.
- Be a traveler, not a ticket holder.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser/Mobile)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │  Quest View  │  │  Chat Widget │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Frontend (Server-Side)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Proxy (/api/v1/[...path])                       │   │
│  │  - Injects x-api-key header                          │   │
│  │  - Forwards requests to backend                      │   │
│  │  - Preserves JWT tokens                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Service │  │ Quest Engine │  │ Chat Service │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ POI Service  │  │ Gamification │  │ Social Hub   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│  - Users & Profiles                                          │
│  - Monuments & Events (GeoJSON)                              │
│  - Walks & Quest States                                      │
│  - Achievements & XP History                                 │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **State Management**: Zustand
- **Maps**: Leaflet with React-Leaflet
- **Styling**: CSS Modules with custom design system
- **UI Components**: Custom components with glassmorphism effects
- **Drag & Drop**: @dnd-kit for walk creation

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Beanie ODM
- **Authentication**: JWT tokens
- **AI Integration**: Google ADK (Agentic Development Kit)
- **Geospatial**: MongoDB GeoJSON queries

### Infrastructure
- **Hosting**: Google Cloud Run
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Environment**: Cloud-native, serverless

## Design Philosophy

### User Experience Principles

1. **Immediate Engagement**: Users should feel immersed from the first interaction
2. **Progressive Discovery**: Features reveal themselves as users explore
3. **Visual Excellence**: Premium aesthetics with vibrant colors, glassmorphism, and smooth animations
4. **Mobile-First**: Optimized for on-the-go exploration
5. **Conversational Interaction**: AI that challenges and engages, not just informs

### Technical Principles

1. **Security First**: API keys never exposed to client
2. **State Persistence**: Seamless experience across sessions
3. **Real-time Updates**: Live quest progress and social features
4. **Scalability**: Cloud-native architecture that scales to zero
5. **Developer Experience**: Clear separation of concerns, type safety

## Target Audience

- **The Solo Wanderer**: Wants to explore safely and authentically without looking like a lost tourist
- **The Routine Breaker (Locals)**: People bored with their own city who want to turn daily walks into discovery games
- **The Active Learner**: People who learn by doing and discussing, not just reading plaques

## Taglines

- **Primary**: "Wander with Purpose."
- **Secondary**: "Your City. Your Game. Your Guide."
- **Functional**: "The Travel Guide That Talks Back."
- **Emotional**: "Never Walk Alone."

## Key Differentiators

| Traditional Approach | CityHunter Approach |
|---------------------|---------------------|
| Static guidebooks | Interactive quests |
| Passive reading | Active questioning |
| Getting lost | Guided discovery |
| Solo = lonely | Solo = empowered |
| Information dump | Conversational learning |

## Next Steps

- [Frontend Architecture](frontend.md) - Detailed frontend structure
- [Backend Integration](backend-integration.md) - API and data models
- [Security](security.md) - Authentication and protection mechanisms
