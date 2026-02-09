# Changelog

All notable changes to this project will be documented in this file.
## [unreleased]
### Fixed
- **Quest Simulation**: Fixed "Frozen GPS" issue where simulation mode would block real GPS if dev tools were inactive.
- **Quest Data**: Fixed `getItemById` failure for backend-loaded quests, ensuring proximity triggers work for database quests.
- **Dev Tools**: Fixed "Dev SIM" not working due to ID type mismatches (string vs number).

### Improved
- **Dev Tools UX**:
    - Removed intrusive browser alerts, replaced with inline status messages.
    - "Validate" action now directly opens the quiz modal if the user is in range.
- **Quiz Interaction**:
    - Implemented a **"Select -> Confirm -> Reveal"** flow to prevent accidental answers.
    - Added immediate feedback delay (Green/Red only shows *after* confirmation).
### Added
- **Navigation Update**: Added a prominent "Login" button to the main navigation bar.
- **Access Control**: Implemented a "Registration Closed" warning on the Signup page (`/signup`) to restrict new user registrations.
    - **Warning System**: Enhanced `ComingSoonWrapper` to support configurable icons and colors (e.g., Red/Lock for warnings).
    - **Restriction**: Signup form is now disabled with an explicit message: "This application is currently available to pre-approved users only."


## [0.0.6] - 2026-02-04
### Added
- **Proportional XP Level Bar**: Implemented a new visual progress bar that accurately reflects progress *within* the current level.
    - **Reusable Component**: Created `LevelProgressBar` which internally fetches level definitions to determine the correct start and end points for the bar.
    - **Integration**: Deployed to Dashboard Navbar, User Profile Header, and Level Map tab.
- **Dynamic XP Calculation**:
    - **True Progression**: Updated `useAuthStore` to fetch level rules from the backend (via `GamificationService`) and dynamically calculate `nextLevelXp`.
    - **Data Integrity**: The frontend no longer relies on hardcoded defaults for level progression limits.


## [0.0.5] - 2026-02-04

### Added
- **Coming Soon State**: Implemented a visual disabled state for future features.
    - **Wrapper Component**: Created `ComingSoonWrapper` to overlay content with a blurred, non-interactive "Coming Soon" badge.
    - **Profile Integration**: Applied the wrapper to "Recent Swagg", "Recent Activity", "Mission Log", and "Achievements" sections in the user profile.


## [0.0.4] - 2026-01-03
### Added
- **Social Page**: A new social hub (`/social`) to connect with friends and discover walks.
    - **Activity Feed**: Real-time mock feed of friends' completed walks, badges, and event joins.
    - **Trending Walks**: "Hot" list of popular walks with visitor counts and ratings.
    - **Navigation**: Added "Social" link to the Dashboard Navbar.
    - **Deep Linking**: Clicking a trending walk now redirects to the Dashboard and automatically opens that route.

## [0.0.3] - 2026-01-03
### Added
- **Custom Walk Creation**: users can now create their own routes directly from the dashboard.
    - **Creation UI**: Dedicated sidebar mode with name input and stop selection.
    - **Map Integration**: "Add to Route" buttons in popups, live path drawing, and smart marker numbering.
    - **Drag-and-Drop**: Selected stops list is reorderable using `dnd-kit`.
- **Enhanced Map Visualization**: 
    - **Context-Aware Markers**: Numbered markers for active walk stops, small dots for background monuments.
    - **Full Visibility**: Map now always shows all monuments as background dots in Walk mode.
- **Persistence**: Custom walks are automatically saved to `localStorage` and restored on app launch.

## [0.0.2] - 2025-12-28
### Added
- **Walk Persistence**: 
    - Implemented robust save/load system using `localStorage` via `QuestPersistence` utility.
    - Added **Resume Mission** capability for interrupted quests.
    - Added **Multi-Walk Support**: Users can now pause one quest and start another.
    - **Auto-Restore**: App now automatically reloads the last active quest session on startup.
- **Visuals**:
    - **Active Walk Highlight**: Green neon "Uplink" style for the currently active walk in the list.
    - **Paused Walk Style**: Orange "Mission Paused" style for saved but inactive walks.
    - **Confetti Removal**: Removed `canvas-confetti` for a cleaner, more serious aesthetic.
- **Bug Fixes**:
    - Fixed `excludedStopIds` logic ensuring skipped stops are correctly ignored in quest progression.
    - Fixed `QuestCompletionModal` crash due to missing variable.

## [0.0.1] - 2025-12-28

### Added
- **User Profile**: Complete implementation of user profile page with mock data.
- **Generic Profiles**: Support for viewing other users' profiles via dynamic routes (`/dashboard/profile/[id]`).
- **Theme Support**: Added Light/Dark mode toggle and fixed color contrast issues across the profile.
- **Mobile Optimizations**: Enhanced mobile layout, specifically for friend lists and stat cards.

### Changed
- **Navigation**:
    - Integrated `DashboardNavbar` into the Profile page for consistent top-level navigation.
    - Switched Profile layout to a single-column design with **sticky horizontal tabs**.
    - Removed legacy sidebar from Profile to maximize content area.
- **UI/UX**:
    - "Level Map" tab is now hidden when viewing other users.
    - Reduced vertical spacing in "Overview" for a tighter, more cohesive look.
    - "Stats Cards" are now part of the Overview tab instead of a separate sidebar.
    - **Global Layout**: Removed `ChatWidget` from the root layout to prevent it from appearing on Login/Signup pages. It is now exclusively rendered in the `DashboardLayout`.
- **Data**: Refactored profile data into strict TypeScript interfaces (`Achievement`, `Mission`, `User`) and separate constants for better maintainability.
- **Persistence**: functionality added to `LeafletMap` and `Dashboard`.
    - Implemented `DashboardContext` to persist state (active walk, filters, tabs) navigating between views.
    - Updated Map Popups to use `router.push` for seamless "soft" navigation, preventing state loss on "Experience" click-throughs.
