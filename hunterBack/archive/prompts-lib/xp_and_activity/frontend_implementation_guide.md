# Frontend Implementation Guide: XP & Gamification

This guide details how to integrate the new XP and Leveling system into the frontend application.

## 1. API Endpoints

### Fetching Levels
*   **Endpoint**: `GET /api/v1/gamification/levels`
*   **Usage**: Call this ONCE at app startup or when entering the profile/rewards screen to get the progression data.
*   **Response**: Array of Level objects (sorted 1-12).

### Registering a Visit (Awarding XP)
*   **Endpoint**: `POST /api/v1/gamification/visit?poi_id={poi_id}`
*   **Usage**: Call this when the user physically arrives at a POI (monument/stop).
*   **Response**:
    ```json
    {
        "success": true,
        "xp_awarded": 100,      // Amount gained (decayed if repeated)
        "total_xp": 1500,       // New total
        "leveled_up": false,    // Trigger level-up animation if true
        "level_info": { ... }   // Current level details
    }
    ```

## 2. Proposed Frontend Architecture

### Data Management (State)
We recommend creating a global store or context (e.g., `useGamificationStore`) to handle:
1.  **User XP**: Current total XP.
2.  **Current Level**: Derived from total XP.
3.  **Level Configs**: The static list of levels fetched from the API.

### Custom Hooks
**`useXP.ts`**
```typescript
const useXP = () => {
  const { user } = useAuth();
  
  const registerVisit = async (poiId: string) => {
    const response = await api.post(`/gamification/visit?poi_id=${poiId}`);
    if (response.data.leveled_up) {
      // Trigger Level Up Modal
    }
    // Update local user state with new total_xp
    return response.data;
  };

  return { registerVisit };
};
```

## 3. Recommended Components

### `LevelProgressBar`
*   **Input**: `currentXP`, `levels` (list).
*   **Logic**: Find current level. Calculate percentage to next level.
    ```
    Progress = (CurrentXP - CurrentLevel.XP) / (NextLevel.XP - CurrentLevel.XP)
    ```
*   **UI**: A bar filling up.

### `XPBadge` / `LevelShield`
*   **Input**: `level` (int).
*   **UI**: Displays the user's current level number (e.g., "Lvl 5") with the appropriate title ("Navigator") and frame (based on reward).

### `VisitRewardModal`
*   **Trigger**: After `registerVisit` returns success.
*   **UI**:
    *   "You visited [POI Name]!"
    *   "+100 XP" (Animated text).
    *   (If `leveled_up`) -> "LEVEL UP! You are now a [New Title]".

## 4. Implementation Checklist
- [ ] Create `Level` interface in frontend types.
- [ ] Add `fetchLevels` to API client.
- [ ] Add `registerVisit` to API client.
- [ ] Build `LevelProgressBar` component.
- [ ] Integrate `registerVisit` into the "I'm Here" button logic on the Walk/Explorer screen.
