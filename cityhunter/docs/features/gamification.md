# Gamification System

CityHunter's gamification system transforms urban exploration into an engaging progression experience through XP, levels, achievements, and rewards.

## Overview

The gamification system provides:
- **XP (Experience Points)**: Earned through activities
- **Levels**: Progressive tiers with titles and rewards
- **Achievements**: Unlockable milestones
- **Swagg**: Collectible digital items

## XP System

### Earning XP

Users earn XP through various activities:

| Activity | Base XP | Notes |
|----------|---------|-------|
| Visit Monument | 100 XP | First visit to a POI |
| Complete Quiz (Easy) | 50 XP | Correct answer |
| Complete Quiz (Medium) | 100 XP | Correct answer |
| Complete Quiz (Hard) | 150 XP | Correct answer |
| Complete Walk | 200-500 XP | Based on difficulty |
| Discover Hidden Spot | 75 XP | Off-path exploration |

### XP Decay

To prevent farming, the system implements visit decay:

```typescript
// First visit: 100% XP
// Second visit (same POI): 50% XP
// Third+ visit: 25% XP
```

Backend automatically tracks visit counts per user per POI.

### XP Calculation

```typescript
interface XPAward {
  base_xp: number;
  multiplier: number;  // Decay factor
  bonus_xp?: number;   // Special events
  total_xp: number;
}
```

## Level System

### Level Progression

Levels are defined server-side and fetched dynamically:

```typescript
interface Level {
  level: number;
  xp_required: number;  // Cumulative XP needed
  title: string;
  reward?: string;
}
```

### Example Level Progression

| Level | XP Required | Title | Reward |
|-------|-------------|-------|--------|
| 1 | 0 | Tourist | Basic Map Access |
| 2 | 500 | Wanderer | Custom Avatar Frame |
| 3 | 1,200 | Explorer | Badge Collection |
| 4 | 2,500 | Pathfinder | Walk Creator Access |
| 5 | 5,000 | Navigator | Premium Themes |
| 10 | 20,000 | Legend | Exclusive Swagg |

### Level-Up Flow

```
1. User earns XP
   ↓
2. Backend checks if XP >= next level threshold
   ↓
3. If yes: Level up triggered
   ↓
4. Frontend receives level_up: true
   ↓
5. Show celebration animation
   ↓
6. Update user profile
   ↓
7. Display new title and rewards
```

## Visual Progression

### Level Progress Bar

The `LevelProgressBar` component shows accurate progress within the current level:

```typescript
// Calculate progress within current level
const currentLevelXP = currentLevel.xp_required;
const nextLevelXP = nextLevel.xp_required;
const progressInLevel = userXP - currentLevelXP;
const xpNeededForLevel = nextLevelXP - currentLevelXP;
const percentage = (progressInLevel / xpNeededForLevel) * 100;
```

**Locations**:
- Dashboard navbar (compact)
- User profile header (detailed)
- Level map tab (full visualization)

### Level Ring

Circular progress indicator showing:
- Current level number
- Progress percentage
- Next level preview

## API Integration

### Fetch Levels

```typescript
GET /api/v1/gamification/levels

Response:
[
  {
    "level": 1,
    "xp": 0,
    "title": "Tourist",
    "reward": "Basic Map Access"
  },
  ...
]
```

### Fetch User Profile

```typescript
GET /api/v1/users/profile/me

Response:
{
  "id": "user_uuid",
  "handle": "UserHandle",
  "level": 5,
  "xp": 5100,
  "title": "Explorer"
}
```

### Award XP (Visit POI)

```typescript
POST /api/v1/gamification/visit?poi_id={poi_id}

Response:
{
  "success": true,
  "xp_awarded": 100,
  "total_xp": 1500,
  "visit_count": 1,
  "leveled_up": false,
  "level_info": {
    "level": 3,
    "title": "Explorer"
  }
}
```

## State Management

### Auth Store Integration

The `authStore` manages user gamification data:

```typescript
interface AuthState {
  user: {
    level: number;
    xp: number;
    title: string;
    nextLevelXp: number;  // Calculated from level definitions
  };
  updateXP: (newXP: number) => void;
}
```

### XP Refresh After Quest

After completing a walk or quiz:

```typescript
// Refresh user profile to get updated XP
const updatedProfile = await api.get('/users/profile/me');
authStore.updateUser(updatedProfile);
```

## Achievements System

> [!NOTE]
> Achievements are currently in development (Coming Soon state).

### Planned Achievement Categories

- **Explorer**: Visit X monuments
- **Completionist**: Finish X walks
- **Scholar**: Answer X quizzes correctly
- **Social**: Share X walks with friends
- **Collector**: Obtain X swagg items

### Achievement Structure

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "explorer" | "completionist" | "scholar" | "social" | "collector";
  requirement: {
    type: string;
    count: number;
  };
  reward: {
    xp?: number;
    swagg?: string;
    title?: string;
  };
  unlocked: boolean;
  progress: number;  // Current progress toward requirement
}
```

## Swagg Collection

Digital collectibles earned through exploration:

### Swagg Types
- **Badges**: Visual achievements
- **Frames**: Avatar borders
- **Themes**: UI color schemes
- **Items**: Virtual souvenirs from monuments

### Swagg Display
- User profile "Recent Swagg" section (coming soon)
- Collection gallery
- Equipped items shown on profile

## UI Components

### Level Progress Bar
- **Component**: `LevelProgressBar.tsx`
- **Props**: None (fetches from authStore)
- **Features**:
  - Fetches level definitions from backend
  - Calculates accurate progress
  - Smooth animation
  - Responsive design

### XP Notification
- Toast notification on XP gain
- Shows amount earned
- Level-up celebration animation

### Level Map (Profile Tab)
- Visual representation of all levels
- Current level highlighted
- Locked/unlocked indicators
- Rewards preview

## Gamification Service

Frontend service for gamification API calls:

```typescript
// app/services/gamification.ts
export const gamificationService = {
  getLevels: async () => {
    return api.get('/gamification/levels');
  },
  
  visitPOI: async (poiId: string) => {
    return api.post(`/gamification/visit?poi_id=${poiId}`);
  },
  
  getUserProfile: async () => {
    return api.get('/users/profile/me');
  }
};
```

## Future Enhancements

### Planned Features
- [ ] Daily/weekly challenges
- [ ] Seasonal events with bonus XP
- [ ] Leaderboards (global, friends, city)
- [ ] XP multiplier events
- [ ] Achievement showcase
- [ ] Swagg trading system

### Advanced Mechanics
- [ ] Skill trees (different exploration paths)
- [ ] Prestige system (reset for bonuses)
- [ ] Guild/team mechanics
- [ ] Competitive seasons

## Related Documentation

- [Walks Feature](walks.md) - Quest system
- [User Profile](user-profile.md) - Profile display
- [Backend Integration](../architecture/backend-integration.md) - API details
