# User Profile

The User Profile displays comprehensive information about a user's progress, stats, achievements, and collection in CityHunter.

## Overview

The profile page provides:
- User stats and progression
- Level visualization
- Achievement showcase
- Mission history
- Social features

## Profile Structure

### Header Section

**Components**:
- Avatar image
- Username/handle
- Current level and title
- XP progress bar
- Edit profile button (own profile only)

### Navigation Tabs

The profile uses sticky horizontal tabs:

1. **Overview** - Stats and highlights
2. **Level Map** - Progression visualization (own profile only)
3. **Achievements** - Unlocked badges (coming soon)
4. **Mission Log** - Quest history (coming soon)

## Overview Tab

### Stats Cards

Four key metrics displayed prominently:

```typescript
interface UserStats {
  distance: string;      // "42km"
  cities: number;        // 3
  secrets: number;       // 12
  walksCompleted: number; // 8
}
```

**Visual Design**:
- Glassmorphic cards
- Large numbers in Roboto Mono
- Icons for each stat
- Responsive grid layout

### Recent Activity

> [!NOTE]
> This section is currently in "Coming Soon" state with a blurred overlay.

Planned features:
- Recent walks completed
- Recent monuments visited
- Recent achievements unlocked
- Timeline view

### Recent Swagg

> [!NOTE]
> This section is currently in "Coming Soon" state.

Planned features:
- Latest collected items
- Badges earned
- Avatar frames unlocked
- Showcase carousel

## Level Map Tab

**Visibility**: Only shown on own profile (hidden for other users)

### Features

- Visual representation of all levels
- Current level highlighted
- Locked/unlocked indicators
- XP requirements displayed
- Rewards preview
- Progress path visualization

### Level Node Display

```typescript
interface LevelNode {
  level: number;
  xp_required: number;
  title: string;
  reward?: string;
  unlocked: boolean;
  current: boolean;
}
```

**Styling**:
- Unlocked: Full color with accent glow
- Current: Pulsing animation
- Locked: Grayscale with lock icon

## Achievements Tab

> [!NOTE]
> Coming Soon - Currently shows placeholder with wrapper

Planned structure:

### Achievement Categories
- Explorer (visit monuments)
- Completionist (finish walks)
- Scholar (quiz master)
- Social (friend interactions)
- Collector (swagg items)

### Achievement Display
- Grid layout
- Badge icons
- Progress bars
- Unlock dates
- Rarity indicators

## Mission Log Tab

> [!NOTE]
> Coming Soon - Currently shows placeholder

Planned features:

### Walk History
- Completed walks list
- Completion dates
- XP earned
- Time taken
- Photos/memories

### Statistics
- Total walks completed
- Favorite routes
- Most visited monuments
- Completion rate

## Generic Profiles

Users can view other users' profiles via dynamic routes:

```
/dashboard/profile/[userId]
```

### Differences from Own Profile

**Hidden Elements**:
- Edit profile button
- Level Map tab
- Private achievements

**Visible Elements**:
- Public stats
- Completed walks (if public)
- Public achievements
- Friend status

## Data Models

### User Profile

```typescript
interface UserProfile {
  id: string;
  handle: string;
  avatar?: string;
  level: number;
  xp: number;
  title: string;
  stats: {
    distance: string;
    cities: number;
    secrets: number;
    walksCompleted: number;
  };
  achievements: Achievement[];
  collection: string[];  // Swagg item IDs
  friends: string[];     // User IDs
  created_at: string;
}
```

### Achievement

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlocked_at?: string;
  progress: number;
  requirement: number;
}
```

## UI Components

### ComingSoonWrapper

Overlay component for features in development:

```typescript
interface ComingSoonWrapperProps {
  children: React.ReactNode;
  icon?: "lock" | "clock";
  color?: "default" | "warning";
}
```

**Features**:
- Blurred content
- Non-interactive overlay
- "Coming Soon" badge
- Customizable icon and color

### LevelProgressBar

Reusable progress bar component:

**Features**:
- Fetches level definitions from backend
- Calculates accurate progress within current level
- Smooth animations
- Responsive sizing

**Usage Locations**:
- Dashboard navbar (compact)
- Profile header (detailed)
- Level map (full visualization)

## Theme Support

### Dark Mode
- Default theme
- High contrast
- Neon accents (#CCFF00)
- Glassmorphism effects

### Light Mode
- Clean and minimal
- Softer accent color (#B4E600)
- Maintains readability
- Consistent glassmorphism

### Theme Toggle
- Available in dashboard navbar
- Smooth transition
- Persisted to localStorage
- System preference detection

## Mobile Optimizations

### Responsive Layout
- Single column on mobile
- Sticky tabs for easy navigation
- Touch-friendly tap targets
- Optimized card sizes

### Friend Lists
- Horizontal scroll on mobile
- Avatar grid layout
- Quick actions

### Stat Cards
- Stack vertically on small screens
- Larger touch targets
- Simplified layout

## API Integration

### Fetch Profile

```typescript
GET /api/v1/users/profile/me  // Own profile
GET /api/v1/users/profile/{id}  // Other user

Response:
{
  "id": "user_uuid",
  "handle": "UserHandle",
  "level": 5,
  "xp": 5100,
  "title": "Explorer",
  "stats": {
    "distance": "42km",
    "cities": 3,
    "secrets": 12,
    "walksCompleted": 8
  }
}
```

### Update Profile

```typescript
PUT /api/v1/users/profile

Body:
{
  "avatar": "url",
  "bio": "text",
  "privacy_settings": {}
}
```

## Future Enhancements

### Planned Features
- [ ] Profile customization (themes, backgrounds)
- [ ] Privacy settings
- [ ] Friend system integration
- [ ] Activity feed
- [ ] Profile badges
- [ ] Custom bio/description

### Social Features
- [ ] Follow/unfollow users
- [ ] View friend profiles
- [ ] Compare stats
- [ ] Share achievements

## Related Documentation

- [Gamification System](gamification.md) - XP and levels
- [Walks Feature](walks.md) - Quest history
- [Dashboard](dashboard.md) - Main interface
- [Backend Integration](../architecture/backend-integration.md) - API details
