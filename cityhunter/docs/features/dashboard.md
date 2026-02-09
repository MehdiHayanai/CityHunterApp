# Dashboard

The Dashboard is the main interface of CityHunter, providing an integrated view of the map, walks, user progress, and navigation.

## Overview

The Dashboard serves as the central hub where users:
- View the interactive map with monuments and events
- Browse and manage walks
- Track active quests
- Access their profile and settings
- Interact with the chat assistant

## Layout Structure

### Components

```
Dashboard Layout
├── Dashboard Navbar (Top)
│   ├── Logo
│   ├── XP Progress Bar
│   ├── Theme Toggle
│   └── User Avatar
├── Main Content Area
│   ├── Sidebar (Left)
│   │   ├── Walks Tab
│   │   └── Create Walk Tab
│   └── Map View (Center/Right)
│       ├── Leaflet Map
│       ├── Monument Markers
│       ├── Active Walk Path
│       └── Popups
└── Chat Widget (Bottom Right)
```

### Responsive Design

- **Desktop**: Full sidebar + map layout
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom sheet for walks, full-screen map

## State Management

### Dashboard Context

The `DashboardContext` provides persistent state across navigation:

```typescript
interface DashboardState {
  activeWalk: Walk | null;
  currentTab: "walks" | "create";
  mapFilters: {
    showMonuments: boolean;
    showEvents: boolean;
    radius: number;
  };
  mapCenter: [number, number];
  mapZoom: number;
}
```

**Benefits**:
- Prevents state loss during navigation
- Maintains map position when viewing details
- Preserves active walk across page changes

### Local Storage Persistence

Key data persisted to localStorage:

```typescript
// Active quest state
localStorage.setItem('activeQuest', JSON.stringify(questState));

// Custom walks
localStorage.setItem('customWalks', JSON.stringify(walks));

// User preferences
localStorage.setItem('dashboardPrefs', JSON.stringify(prefs));
```

## Map Integration

### Leaflet Map Component

**File**: `components/LeafletMap.tsx`

**Features**:
- Interactive pan and zoom
- GeoJSON marker rendering
- Custom marker icons
- Popup information windows
- Path drawing for active walks

### Marker Types

#### Monument Markers
- **Active Walk Stops**: Numbered markers (1, 2, 3...)
- **Background Monuments**: Small dots
- **Visited Stops**: Checkmark overlay

#### Event Markers
- **Live Events**: Pulsing red marker
- **Weekend Events**: Orange marker
- **Upcoming Events**: Gray marker

#### User Location
- Blue pulsing marker
- Accuracy circle
- Auto-center option

### Map Popups

When clicking a monument:

```typescript
interface PopupContent {
  name: string;
  description: string;
  architectural_style?: string;
  distance: string;  // "150m away"
  actions: [
    "View Details",
    "Add to Route",
    "Experience" // Opens detail view
  ];
}
```

**Navigation Preservation**:
- Uses `router.push` for soft navigation
- Context maintains map state
- Returns to same position after viewing details

## Sidebar

### Walks Tab

**Features**:
- Scrollable list of available walks
- Difficulty badges
- Distance and time estimates
- Active walk highlighting
- Paused walk indicators

**Walk Card**:
```typescript
interface WalkCard {
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  distance: string;
  estimatedTime: string;
  status: "available" | "active" | "paused";
  onClick: () => void;  // Start or resume
}
```

### Create Walk Tab

**Features**:
- Walk name input
- Map interaction for stop selection
- Drag-and-drop stop reordering
- Live path preview
- Save/cancel actions

**Workflow**:
1. Enter walk name
2. Click monuments on map
3. Reorder stops via drag-and-drop
4. Preview path on map
5. Save to localStorage

## Dashboard Navbar

### Components

#### Logo
- Links to dashboard home
- Consistent branding

#### XP Progress Bar
- Shows current level
- Progress to next level
- Hover for details
- Click to open profile

#### Theme Toggle
- Light/dark mode switch
- Smooth transition
- Persisted preference

#### User Avatar
- Profile picture
- Click to open profile
- Dropdown menu (planned)

## Data Flow

### Initial Load

```
1. Load user profile from API
   ↓
2. Restore dashboard state from localStorage
   ↓
3. Fetch nearby monuments (based on location)
   ↓
4. Fetch available walks
   ↓
5. Check for saved quest
   ↓
6. Render dashboard with data
```

### Active Quest Flow

```
1. User selects walk
   ↓
2. Quest state initialized
   ↓
3. Map centers on first stop
   ↓
4. Path drawn on map
   ↓
5. Geolocation tracking starts
   ↓
6. State saved to localStorage
```

### Navigation Flow

```
1. User clicks "Experience" in popup
   ↓
2. Context saves current map state
   ↓
3. Navigate to detail view
   ↓
4. User returns via back button
   ↓
5. Context restores map state
   ↓
6. Map returns to previous position
```

## Performance Optimizations

### Lazy Loading
- Map loads after initial render
- Monuments fetched in viewport only
- Infinite scroll for walks list

### Memoization
- Map markers memoized
- Walk cards memoized
- Context selectors optimized

### Debouncing
- Map move events debounced
- Search input debounced
- Auto-save debounced

## Accessibility

### Keyboard Navigation
- Tab through interactive elements
- Enter to activate buttons
- Escape to close modals

### Screen Readers
- Semantic HTML structure
- ARIA labels on map controls
- Alt text on images

### Mobile Gestures
- Pinch to zoom (map)
- Swipe to dismiss (modals)
- Pull to refresh (walks list)

## Future Enhancements

### Planned Features
- [ ] Filters for walks (difficulty, distance, rating)
- [ ] Search monuments by name
- [ ] Bookmarked walks
- [ ] Recent activity feed
- [ ] Quick actions menu

### Advanced Features
- [ ] Offline map support
- [ ] Route optimization
- [ ] Multi-day itineraries
- [ ] Collaborative walks

## Related Documentation

- [Walks Feature](walks.md) - Quest system details
- [Frontend Architecture](../architecture/frontend.md) - Technical implementation
- [Quick Start Guide](../getting-started/quick-start.md) - User tutorial
