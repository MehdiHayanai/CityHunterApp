# CityHunter Project Recap

This document provides a comprehensive overview of the current state of the CityHunter application, including its structure, components, functionalities, and implemented design system.

## 1. Project Overview & Tech Stack
**CityHunter** is a "Smart Compass for the Urban Explorer" built with a modern Next.js stack, focusing on immersive visuals and interactive gameplay elements.

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (with native CSS variables and `@theme` support) & Vanilla CSS for animations.
- **Icons**: FontAwesome 6
- **Maps**: Leaflet (via `react-leaflet` / `leaflet`)
- **Drag & Drop**: `@dnd-kit`
- **State Management**: React Context (`ThemeContext`) + Local State

## 2. Project Structure
The project follows a standard Next.js App Router structure with feature-based organization.

```
app/
├── components/          # Shared and feature-specific components
│   ├── dashboard/       # Dashboard-specific components (Cards, Map, Sidebar)
│   ├── experience/      # Game/Quiz experience components
│   └── [Shared UIs]     # Hero, Navbar, ChatWidget, Toast, etc.
├── dashboard/           # Dashboard Page (Protected Area)
├── experience/[id]/     # Dynamic Experience/Game Pages
├── login/ & signup/     # Authentication Pages
├── constants/           # Mock data (Cities, Dashboard Stats, User info)
├── context/             # Global providers (ThemeContext)
├── global.css           # Global styles and Tailwind configuration
└── layout.tsx           # Roo layout with Font & Theme providers
```

## 3. Developed Components
### Core UI
- **[Navigation.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/Navigation.tsx)**: Responsive top navbar with mobile menu support.
- **[Footer.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/Footer.tsx)**: Standard multi-column footer.
- **[Hero.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/Hero.tsx)**: High-impact landing page hero with background video/image and glassmorphism.
- **[ChatWidget.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/ChatWidget.tsx)**: Draggable, floating chat interface (Gemini-style) that persists across pages.
- **[Toast.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/Toast.tsx)**: Custom notification system for success/error messages.

### Landing Page Features
- **[Marquee.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/Marquee.tsx)**: Infinite scrolling text band.
- **[Features.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/Features.tsx)**: Grid layout with interaction highlights.
- **[GameSection.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/GameSection.tsx)**: Preview of the gamified elements.
- **[Stats.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/Stats.tsx)**: Numerical social proof section.
- **[SpotlightCard.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/SpotlightCard.tsx)**: Cards with mouse-following hover glow effects.

### Dashboard & App
- **[SidebarComponents.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/dashboard/SidebarComponents.tsx)**: Navigation rail for the user dashboard.
- **[Cards.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/dashboard/Cards.tsx)**: Interactive data cards displaying missions/experiences.
- **[LeafletMap.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/dashboard/LeafletMap.tsx)**: Interactive map integration showing city points.
- **[ExperienceQuiz.tsx](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/components/experience/ExperienceQuiz.tsx)**: Interactive quiz logic for city missions.

## 4. Functionalities Implemented
1.  **Immersive Landing Page**:
    -   Full responsive layout with high-quality animations (`animate-on-scroll`, `float`, `marquee`).
    -   Dynamic visual breaks and spotlight interactions.
2.  **Authentication UI**:
    -   **Login Screen**: Email/Password form mock, "Continue with Google", Forgot Password toggle.
    -   **Signup Screen**: Multi-step registration flow (Name -> Email -> Password).
    -   **Feedback**: Success toast notifications on actions.
3.  **Theming System**:
    -   **Dark/Light Mode**: Full support via `theme` attribute on `<html>`. Toggled via floating button or UI controls.
    -   **System**: CSS variables (`--c-canvas`, `--c-accent`) handle instant color messaging without FOUC.
4.  **Dashboard Experience**:
    -   User view with sidebar navigation.
    -   Map visualization of available hunts.
5.  **Gamification (Experience)**:
    -   Quiz engine structure for answering trivia/location riddles.

## 5. Design Guide (System Definition)
The app uses a strict design token system defined in [globals.css](file:///c:/Users/Lenovo/GIT/cityHunter/vibe/cityhunter/app/globals.css) using Tailwind v4 `@theme`.

### Color Palette
| Token | Reference | Dark (Standard) | Light (Alt) | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas** | `bg-canvas` | #050505 | #F1F5F9 | Main Page Backgrounds |
| **Surface** | `bg-surface` | #121212 | #FAFAFA | Cards, Sidebars, Modals |
| **Accent** | `text-accent` | **#CCFF00** | #B4E600 | Buttons, Highlights, Glows (Lime Green) |
| **Primary** | `text-primary` | #FFFFFF | #0F172A | Main Headings, Body Text |
| **Secondary**| `text-secondary`| #9CA3AF | #475569 | Subtitles, Muted text |

### Typography
- **Headings**: `Inter` (Sans-serif) - Bold, Tight Tracking.
- **Code/Data**: `Roboto Mono` (Monospace) - Used for decorative elements or specific data points.

### Visual Effects
- **Glassmorphism**: `.glass` utility adds `backdrop-filter: blur(12px)` with a subtle border.
- **Grid Background**: `.bg-grid` creates a subtle coordinate system overlay.
- **Spotlight**: Mouse-tracking radial gradients on card hovers.
- **Neon/Glow**: Heavy use of colored shadows (`box-shadow: 0 0 10px accent`) in Dark Mode.

### Animations
The app feels "alive" through constant subtle motion:
- `animate-float`: Floating elements in Hero.
- `animate-pulse-slow`: Gentle breathing effect on accents.
- `animate-marquee`: Continuous movement of text banners.
