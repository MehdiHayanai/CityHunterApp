# Walk Persistence & Multi-Quest Support

## Overview
This feature ensures that user progress on quests (Walks) is saved locally, allowing users to:
1.  **Resume** walks after closing the app or navigating away.
2.  **Pause** an active walk to start a different one.
3.  **Switch** between multiple "paused" walks without losing progress.

## User Experience
- **Auto-Save**: Progress (XP, Stops Visited, Current Target) is saved automatically whenever the state changes.
- **Auto-Restore**: Opening the app automatically restores the last active quest session.
- **Pause/Resume**: Users can "PAUSE" a quest from the dashboard. This saves the state and clears the active slot.
- **Visual Feedback**:
    - **Active Quest**: Highlighted with a **Green Neon Pulse** and "ACTIVE UPLINK" badge.
    - **Paused Quest**: Highlighted with an **Orange Pulse** and "MISSION PAUSED" badge.

## Technical Implementation

### 1. `QuestPersistence` Utility (`utils/quest-persistence.ts`)
A dedicated utility for managing `localStorage` interactions.
- `saveQuestState(walkId, state)`: Saves individual walk states keyed by ID.
- `loadQuestState(walkId)`: Retrieves state for a specific walk.
- `getAllSavedQuests()`: Returns all persisted quest dictionary.
- `clearQuestState(walkId)`: Removes state upon quest completion.

### 2. `DashboardContext` Integration
- **Mount Logic**: Checks `QuestPersistence` on app load. If an active quest is found, it automatically restores the `activeWalk` and `questState`.
- **State Updates**: Wraps state changes to trigger auto-saves.
- **Persistence Handling**: Manages the flow of pausing (clearing active state but keeping storage) vs finishing (clearing both).

### 3. UI Updates (`Cards.tsx`, `page.tsx`)
- **WalkCard**: Updated to accept `isActiveQuest` and `isPaused` props.
- **Styling**: Applied distinct CSS classes (Canvas/Neon styled) for active/paused states to improve visibility in the mock interface.

## Limitations
- **Local Only**: Persistence is currently utilizing `localStorage` and is device-specific. It does not sync to a backend database yet.
