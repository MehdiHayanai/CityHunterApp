# CityHunter - Project Reference & Guide

## 1. Project Overview
CityHunter is an interactive "Urban Tech-Noir" web application that encourages users to explore their cities, earn XP, and rank up. It combines the sleek precision of fintech apps with the excitement of urban exploration.

**Core Philosophy**: "Don't Just Visit. Play the City."

---

## 2. Technology Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (using CSS variables for theming)
- **Icons**: FontAwesome 6 (CDN in layout)
- **Fonts**: Inter (UI) & Roboto Mono (Data/Stats)

---

## 3. Style Guide & Design System

### A. Colors (CSS Variables)
The system uses semantic CSS variables mapped in `globals.css` to support Light/Dark modes easily.

| Token | Dark Mode (Default) | Light Mode | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas** | `#050505` | `#F1F5F9` | Main background |
| **Surface** | `#121212` | `#FAFAFA` | Cards, panels |
| **Primary** | `#FFFFFF` | `#0F172A` | Headings, main text |
| **Secondary** | `#9CA3AF` | `#475569` | Subtitles, metadata |
| **Accent** | `#CCFF00` (Electric Lime) | `#B4E600` | Buttons, highlights, active states |
| **Divider** | White (opacity 0.05) | Black (opacity 0.05) | Borders |

### B. Typography
- **Primary Font**: `Inter` (Variable). Used for headings (`font-black`, `tracking-tight`) and body.
- **Data Font**: `Roboto Mono` (Variable). Used for stats, ranks, distances, and XP.

### C. Visual Effects (Classes)
- **Glassmorphism**: `.glass` (Backdrop blur, semi-transparent bg, subtle border).
- **Spotlight Card**: `.spotlight-card` (Radial gradient accent glow that follows mouse cursor).
- **Text Gradient**: `.text-gradient` (Primary to Secondary gradient).
- **Animations**:
  - `animate-float`: Floating vertical motion.
  - `animate-pulse-slow`: Subtle pulsing opacity.
  - `animate-marquee`: Infinite horizontal scrolling.

---

## 4. File Structure
```
app/
├── components/          # Reusable UI components
│   ├── dashboard/       # Dashboard-specific components (RankCard, etc.)
│   ├── ChatInterface.tsx # The Gemini-style chat interactions
│   ├── ChatWidget.tsx   # The floating toggle button
│   ├── SpotlightCard.tsx # Reusable card with hover effect
│   └── [Layout Components: Navigation, Footer, Hero, etc.]
├── constants/
│   └── user.ts          # Mock user data (Alex Hunter)
├── context/
│   └── ThemeContext.tsx # Light/Dark mode provider
├── dashboard/           # Authenticated User Sections
│   ├── layout.tsx       # Layout with ChatWidget override
│   └── page.tsx         # Dashboard Grid (Stats, Leaderboard, Trending)
├── login/               # Login Page
├── signup/              # Signup Page
└── globals.css          # Global styles & Tailwind Configuration
```

---

## 5. Implemented Features

### A. Landing Page (`/`)
- **Hero**: Large typograhpy, "Enter the City" CTA.
- **Marquee**: Infinite scroll of city names ("TOKYO", "NEW YORK", "BERLIN").
- **Features Grid**: Cards explaining "Urban Quests", "Live Map", "Rewards".
- **Game Section**: "Start your legacy" call to action.

### B. Authentication
- **Signup/Login**: Multi-step forms with "Glass" design.
- **OTP Verification**: Mock logic (Code "111111" verifies).
- **Validation**: Error messages and disabled buttons for invalid inputs.

### C. Dashboard (`/dashboard`)
- **Layout**: Dedicated `DashboardNavbar` (Logo + Avatar) and `DashboardLayout` (w/ ChatWidget).
- **Design Pattern**: Grid-based layout.
  - **Rank Card**: Visual leaderboard with neon accents and rank/XP stats.
  - **Level Ring**: Circular progress indicator.
  - **Trending Section**: Grid of exploring spots with images and XP values.
- **Chatbot Companion**:
  - **Widget**: Floating button (Bottom Right). Pops open with animation.
  - **Interface**: "Gemini-style" modern UI.
    - Drag & Drop inputs.
    - Persistent History (localStorage).
    - Session Reset functionality.

---

## 6. How to Generate New Pages
1.  **Layout**: Use `DashboardLayout` for authenticated pages, or standard `layout` for public.
2.  **Container**: Use `max-w-7xl mx-auto p-6 md:p-10`.
3.  **Components**: Reuse `SpotlightCard` for content listings.
4.  **Styling**:
    - Use `bg-surface border border-divider/10` for panels.
    - Use `text-accent` for KPIs and interactive elements.
    - Use `font-mono` for any numbers/data.
5.  **Interactivity**: Ensure specific animations (`animate-in fade-in`) are added to main containers.
