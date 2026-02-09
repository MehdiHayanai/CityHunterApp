# Walks Feature

The Walks feature is the core quest system of CityHunter, allowing users to explore cities through curated or custom routes with gamified progression.

## Overview

Walks transform urban exploration into interactive quests. Users can either:
- **Join curated walks** created by the community or administrators
- **Create custom walks** by selecting their own route through monuments

Each walk consists of ordered stops (monuments or events) that users must visit in sequence, answering quizzes and earning XP along the way.

## User Experience

### Starting a Walk

1. Browse available walks in the dashboard sidebar
2. View walk details (difficulty, distance, estimated time)
3. Click "Start Mission" to begin
4. Quest interface activates with navigation to first stop

### Active Quest Flow

```
1. Navigate to Stop Location
   ↓
2. Get Within Range (75m)
   ↓
3. Unlock Stop Content
   ↓
4. Answer Quiz Question
   ↓
5. Earn XP for Correct Answer
   ↓
6. Move to Next Stop
   ↓
7. Repeat Until Complete
```

### Creating Custom Walks

1. Click "Create Walk" in sidebar
2. Enter walk name and description
3. Click monuments on map to add stops
4. Drag and drop to reorder stops
5. Save walk to local storage
6. (Future) Publish to community

## Technical Implementation

### Data Model

```typescript
interface Walk {
  id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  stops: string[];  // Ordered POI IDs
  estimated_time: number;  // minutes
  distance: number;  // meters
  metrics: {
    rating: number;
    visitors: number;
  };
  status: "DRAFT" | "PUBLISHED";
  creator_id?: string;
  created_at: string;
}

interface QuestState {
  activeWalkId: string;
  currentStopIndex: number;
  excludedStopIds: number[];  // Skipped stops
  xpGained: number;
  timestamp: number;
}
```

### State Management

#### Quest Persistence
Walks are automatically saved to `localStorage` using the `QuestPersistence` utility:

```typescript
// Save active quest
QuestPersistence.saveQuest(walkId, questState);

// Load on app startup
const savedQuest = QuestPersistence.loadQuest();

// Resume from saved state
if (savedQuest) {
  resumeQuest(savedQuest);
}
```

#### Multi-Walk Support
Users can pause one quest and start another:
- Current quest is saved with "PAUSED" status
- New quest becomes active
- Paused quests can be resumed later

### API Integration

#### Backend Endpoints

- `GET /api/v1/walks` - List available walks
- `GET /api/v1/walks/{id}` - Get walk details
- `POST /api/v1/walks` - Create new walk (admin/creator)
- `POST /api/v1/quests/start` - Start walk session
- `POST /api/v1/quests/unlock-stop` - Unlock stop content
- `POST /api/v1/quests/complete` - Finish walk

#### Proximity Validation

Stop unlocking requires proximity validation:

```typescript
// Frontend sends user location
const response = await fetch('/api/v1/quests/unlock-stop', {
  method: 'POST',
  body: JSON.stringify({
    poi_id: stopId,
    lat: userLat,
    lng: userLng
  })
});

// Backend validates distance (must be < 75m)
if (distance < 75) {
  return {
    success: true,
    hidden_description: monument.hidden_content,
    quiz: monument.quiz
  };
}
```

## UI Components

### Walk List
- **Location**: Dashboard sidebar
- **Features**: 
  - Scrollable list of available walks
  - Difficulty badges
  - Distance and time estimates
  - Active walk highlighting (green neon)
  - Paused walk styling (orange)

### Walk Creator
- **Layout**: Split-screen design
  - Left: Interactive map
  - Right: Stop list with drag-and-drop
- **Features**:
  - Click map to add stops
  - Reorder stops via drag-and-drop
  - Live path visualization
  - Auto-save to localStorage

### Quest View
- **Location**: Main dashboard area
- **Features**:
  - Current stop information
  - Distance to next stop
  - Progress indicator
  - Quiz modal
  - Completion celebration

### Dev Tools (Development)
- GPS simulation for testing
- Force proximity triggers
- Skip to specific stops
- Validate quest state

## Walk Validation

### Feasibility Checks

Before publishing, walks are validated for:

1. **Opening Hours Overlap**
   - Check if monument opening times allow sequential visits
   - Validate event time windows

2. **Travel Time Calculation**
   - Estimate walking time between stops
   - Ensure reasonable completion time

3. **Status Indicators**
   - 🟢 **GREEN**: Validated and feasible
   - 🟡 **YELLOW**: Warnings (tight timing)
   - 🔴 **RED**: Invalid (impossible to complete)

### Publishing Workflow

```
1. Create Draft Walk
   ↓
2. Add/Reorder Stops
   ↓
3. Validate Feasibility
   ↓
4. Fix Issues (if RED/YELLOW)
   ↓
5. Publish Walk
   ↓
6. Walk Becomes Immutable
```

## Visual Design

### Active Walk Styling
```css
/* Green neon "Uplink" effect */
.active-walk {
  border: 2px solid #CCFF00;
  box-shadow: 0 0 20px rgba(204, 255, 0, 0.3);
  background: linear-gradient(135deg, 
    rgba(204, 255, 0, 0.1), 
    transparent);
}
```

### Paused Walk Styling
```css
/* Orange "Mission Paused" effect */
.paused-walk {
  border: 2px solid #FF9500;
  opacity: 0.7;
}
```

### Map Markers
- **Active Walk Stops**: Numbered markers (1, 2, 3...)
- **Background Monuments**: Small dots
- **User Location**: Pulsing blue marker
- **Next Stop**: Highlighted with accent color

## Future Enhancements

### Planned Features
- [ ] Walk versioning (fork and improve)
- [ ] Community ratings and reviews
- [ ] Walk categories and tags
- [ ] Collaborative walk creation
- [ ] Offline map support
- [ ] AR navigation mode

### Social Integration
- [ ] Share walks with friends
- [ ] Walk leaderboards
- [ ] Group walks (multiplayer)
- [ ] Walk challenges and events

## Related Documentation

- [Gamification System](gamification.md) - XP and rewards
- [Dashboard](dashboard.md) - Main interface
- [Backend Integration](../architecture/backend-integration.md) - API details
- [Quick Start Guide](../getting-started/quick-start.md) - User tutorial
