# XP and Level System Backend Integration Plan

## Goal
Remove hardcoded level constants and integrate the frontend with the backend API for XP, levels, and user progression.

## User Review Required
> [!IMPORTANT]
> This change will replace local mock data with real backend data. Ensure the backend is running and the database is seeded with level data.

## Proposed Changes

### 1. Create Gamification Service
**File:** `app/services/gamification.ts` [NEW]
- Implement `getLevels()` to fetch level definitions from `/api/v1/gamification/levels`.
- Implement `awardXP(poiId: string)` (wrapper for `/api/v1/gamification/visit`).

### 2. Update User Profile Service/Types
**File:** `app/services/user-profile.ts` [NEW or UPDATE]
- Ensure `getUserProfile()` fetches `level` and `xp` from `/api/v1/users/profile/me`.

### 3. Refactor UserProfile Component
**File:** `app/components/dashboard/UserProfile.tsx` [MODIFY]
- Remove imports from `../constants/user-profile` (specifically `TEST_LEVELS`, `USER_PROFILE_DATA`).
- Use `useEffect` or React Query to fetch `levels` and `userData`.
- Replace `levelTree` usage with fetched levels.
- Handle loading states for levels and user data.

### 4. Remove Constants
**File:** `app/constants/user-profile.ts` [MODIFY]
- Remove `TEST_LEVELS`.
- Remove `USER_PROFILE_DATA` (or keep as fallback type definition, but remove value).

## Verification Plan

### Automated Tests
- None currently available for frontend components.

### Manual Verification
1. **Start Backend**: Ensure `hunterBack` is running.
2. **Start Frontend**: Run `npm run dev` in `cityhunter`.
3. **Login**: Log in as a user.
4. **Dashboard**: Navigate to `/dashboard/profile`.
    - Verify "Level Badge" shows correct level from backend.
    - Verify "XP Progress" bar matches backend data.
    - Verify "Progression Map" (Levels tab) loads levels from backend.
    - Click "Explore Future Level" to ensure pagination works with real data.
5. **Mock Data Check**: Ensure no hardcoded "Tourist" level 1 is forced if the user is higher level.
