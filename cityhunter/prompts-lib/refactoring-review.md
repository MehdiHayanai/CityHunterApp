# Codebase Refactoring Review

## Executive Summary
The application has a few "God Components" (specifically the main Dashboard) that handle too many responsibilities. While newer features like `Social` and `Profile` adhere to good separation of concerns, the core experience (`Dashboard` and `Experience` pages) requires refactoring to improve maintainability and performance.

---

## 1. Dashboard Page (`app/dashboard/page.tsx`)
**Current State**: 🔴 **CRITICAL** (~700+ lines)
This file is acting as the central controller for the entire game loop, map, sidebar, and modals.

### Issues
- **Mixed Concerns**: Handles UI layout, Map state, Quest logic, and Data fetching all in one file.
- **Render Bloat**: The `return` statement is massive, containing hardcoded Sidebar logic, multiple Modals, and the Map.
- **Duplicate Logic**: Some context logic is repeated or could be moved to custom hooks.

### Refactoring Plan
1.  **Extract Sidebar**: Move the complex conditional sidebar rendering (Monuments list, Walk creation, etc.) into a dedicated `<DashboardSidebar />` component.
2.  **Extract Modals**: Group `QuestCompletionModal`, `QuestEncounterModal`, and others into a single `<QuestOverlay />` or `<GameModals />` component to declutter the main render.
3.  **Map Logic**: Ensure `DashboardUrlListener` and other non-visual logic hooks are kept separate or moved to the Context provider if appropriate.

---

## 2. Experience Detail Page (`app/experience/[id]/page.tsx`)
**Current State**: 🟡 **MODERATE** (~240 lines)
Functional but starting to get "template heavy".

### Issues
- **Large JSX Structure**: The Hero section, Stats card, and Tabs are all inline.
- **Audio Logic**: `SpeechSynthesis` logic is mixed with UI code.

### Refactoring Plan
1.  **Extract Components**:
    - `<ExperienceHero />`: Image, Back button, Title.
    - `<ExperienceStats />`: The floating glassmorphism card.
    - `<ExperienceActions />`: The grid of buttons (Navigate, Audio, Plan).
    - `<ExperienceTabs />`: The Tab navigation and content switcher.
2.  **Custom Hook**: Move `toggleAudio` and speech synthesis logic to `useExperienceAudio()`.

---

## 3. Social Page (`app/social/page.tsx`)
**Current State**: 🟢 **GOOD** (~100 lines)
This page follows best practices. It imports `<ActivityFeed />` and `<TrendingWalks />` and handles layouting.
- **Recommendation**: Keep as is. Ensure `TrendingWalks` doesn't grow too large; if it does, split individual cards into `<WalkCard />`.

---

## 4. Profile Page (`app/dashboard/profile/page.tsx`)
**Current State**: 🟢 **EXCELLENT** (<20 lines)
Perfect wrapper. All logic is delegated to `UserProfile.tsx`.

---

## 5. General Recommendations

### Type Definitions
- **Issue**: Some interfaces are defined inline or scattered.
- **Fix**: Centralize remaining shared types (like `DraggableWalkStopProps` in `Cards.tsx`) into `app/types/` or `app/interfaces/`.

### Constants
- **Issue**: Mock data arrays (`WALKS`, `MONUMENTS`) are static in `constants/`.
- **Future-Proofing**: As we move to a real backend, create a clear "Service Layer" (e.g., `services/cityData.ts`) that fetches this data, so components don't import constants directly. This makes swapping Mock -> Real API easier.

### Styling
- **Issue**: Repetitive Tailwind classes for "Glassmorphism" cards (`bg-surface/60 backdrop-blur-xl...`).
- **Fix**: Define utility classes in `globals.css` (e.g., `.glass-card`, `.glass-panel`) to reduce class string length.

## Next Steps
1.  **Priority 1**: Refactor `app/dashboard/page.tsx` to extract the Sidebar and Modals.
2.  **Priority 2**: Refactor `app/experience/[id]/page.tsx` to componentize the UI.
3.  **Priority 3**: Define `Service Layer` for data fetching.
