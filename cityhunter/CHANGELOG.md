# Changelog

All notable changes to this project will be documented in this file.

## [unreleased]

### Added
- **Sign Out Functionality**: Implemented working logout button in profile settings.
    - **Auth Integration**: Connected sign out button to auth store's logout function.
    - **Session Cleanup**: Properly removes access token and redirects to login page.

### Fixed
- **Autorestore Crash**: Resolved an `Uncaught TypeError: Cannot read properties of undefined (reading 'isActive')` crash that occurred dynamically during the auto-restore of saved quests. Added optional chaining (`?.`) when searching saved sessions.
- **Premature Location Prompts**: Restricted the geolocation prompt within `LocationInitializer` to fire exclusively when users are authenticated.
- **Session State Leakage**: Enhanced the `logout` function in `useAuthStore` to comprehensively clear application memory stored in `localStorage` (quest states, custom walks, maps coordinates, and chat history), preventing data contamination between different users utilizing the same browser.
- **Profile XP Bar**: Removed XP progress bar from friends' profiles.
    - **Conditional Rendering**: XP bar now only displays when viewing your own profile.
    - **Privacy Enhancement**: Friends can no longer see detailed XP progress of other users.
- **Friends Ranking**: Fixed duplicate key error and incorrect user display in friends list.
    - **Duplicate Prevention**: Profile owner is now filtered from friends list before being added back.
    - **Identity Logic**: Properly distinguishes between viewing your own profile vs someone else's.
    - **isMe Flag**: Correctly marks "You" only when viewing your own profile.
    - **User Data**: Fixed issue where viewing a friend's profile would incorrectly show "Alex Wanderer" instead of logged-in user.
- **Walks API**: Resolved Beanie aggregation cursor error in walks endpoints.
    - **fetch_links Removal**: Removed problematic `fetch_links=True` parameter causing AsyncIOMotorLatentCommandCursor errors.
    - **Simplified Queries**: Updated both `list_walks` and `get_walk` endpoints to fetch basic walk data without automatic link resolution.
    - **Performance**: Improved API response time by avoiding complex aggregation pipelines.

### Improved
- **User Experience**: Enhanced profile viewing with proper data isolation between users.
- **API Stability**: More reliable walks endpoint without aggregation-related crashes.

### Added (Previous)
- **Level-Up Animation System**: Implemented stunning full-screen celebration animation when users level up.
    - **LevelUpAnimation Component**: Created with Framer Motion featuring radial glow effects, rotating rings, pulsing inner glow, and 12-particle burst effects.
    - **Auto-Detection**: Auth store now tracks level changes and automatically triggers animation.
    - **Dashboard Integration**: Animation displays globally across entire dashboard.
    - **Cyberpunk Aesthetic**: Themed with accent colors, smooth spring animations, and 4-second auto-dismiss.
- **Monument Search Pricing**: Enhanced `search_monuments` to include pricing information from Events.
    - **POI Search**: Now searches all POI types (Monuments + Events) to capture pricing data.
    - **Formatted Output**: Pricing and ticket links displayed in monument search results.
    - **Gemini Integration**: Updated MonumentExpert agent to use Gemini 2.0 Flash and request pricing info.

### Fixed
- **Delete Functionality**: Completely overhauled delete operations for POIs and Walks.
    - **Frontend Loading State**: Fixed popup stuck in loading state after successful deletions using `finally` block.
    - **404 Handling**: Gracefully handle already-deleted items by treating 404 as success case.
    - **Backend Error Handling**: Added comprehensive try-catch blocks with detailed logging.
    - **Referential Integrity**: POI deletion now checks if POI is used in walks and provides informative error messages.
    - **API Proxy 204**: Fixed proxy to properly handle 204 No Content responses without body.
    - **fetchWithAuth 204**: Fixed JSON parse error by returning null for 204 status codes.
- **Walk Editor Loading**: Fixed existing walk data not loading correctly when editing.
    - **Backend Link Fetching**: Added `fetch_links=True` to `get_walk` and `list_walks` endpoints.
    - **POI Transformation**: Properly transform backend GeoJSON format to frontend `{lat, lng}` format.
    - **Duplicate Keys**: Fixed React duplicate key error by creating separate instances for pool and itinerary.
    - **Unique IDs**: Implemented index-based and timestamp-based unique ID generation.
- **WalkMap Location Safety**: Added comprehensive null/undefined checks for POI locations.
    - **Phase A & B Filtering**: Skip POIs without valid location data in grouping logic.
    - **Polyline Safety**: Filter out invalid stops before drawing route lines.
    - **Popup HTML**: Use optional chaining for location coordinates in popups.
    - **Console Warnings**: Log problematic POIs for debugging.
- **Chat Agent Geo-Proximity**: Rewrote `search_walks` to use location-first approach.
    - **Nearby POIs First**: Find POIs near user via `$nearSphere` geo query.
    - **Walk Matching**: Find walks containing those nearby POIs.
    - **Rich Summaries**: Return which stops are nearby and total stop count.
    - **Configurable Radius**: Added `radius_m` parameter (default 5000m).

### Improved
- **Backend Logging**: Added comprehensive debug logging to POI and Walk endpoints.
    - **Delete Operations**: Track deletion attempts, successes, and failures.
    - **POI Retrieval**: Log ObjectId conversion and polymorphism attempts.
    - **Walk Loading**: Log walk fetching and stop counts.
- **Error Messages**: Enhanced error messages throughout the application.
    - **POI Deletion**: Show which walks are using a POI when deletion fails.
    - **Walk Deletion**: Provide specific error details on failure.
    - **API Errors**: Better error propagation from backend to frontend.
- **TypeScript Safety**: Added proper type annotations to fix implicit 'any' errors.

### Technical
- **Dependencies**: Installed `framer-motion` for animation system.
- **ObjectId Handling**: Improved POI access with proper `PydanticObjectId` conversion.
- **API Response Handling**: Standardized 204 No Content handling across proxy and client.

## [Previous entries...]

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
- **Global Popup System**: Replaced all native browser `alert()` and `confirm()` dialogs with a themed, high-fidelity popup system.
    - **PopupContext**: Created global state management for alerts and confirmations with variant support (danger, warning, info, success).
    - **SystemPopup Component**: Implemented themed modal with cyberpunk aesthetic, loading states, and smooth animations.
    - **Loading State Support**: Added `setPopupLoading()` for async operations with spinner and disabled buttons.
    - **Components Updated**: Migrated 8 components including quest management (`DashboardSidebar`, `QuestEncounterModal`), experience pages (`ExperiencePage`, `ExperienceQuiz`), and admin interfaces (`PoiForm`, `WalkBuilder`, `AdminPage`).
    - **Admin Refactor**: Removed custom `ConfirmationModal` in favor of unified global system with themed deletion confirmations.
    - **UX Enhancement**: All user notifications now follow consistent visual language with no jarring native dialogs.

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
