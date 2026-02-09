# Feature: Social Hub Implementation

## Overview
Implemented a centralized "Social Hub" to foster community engagement. This feature allows users to keep up with their friends' activities and discover trending content.

## Key Components
- **`app/social/page.tsx`**: Main entry point for the social view.
- **`ActivityFeed.tsx`**: Component for rendering a timeline of friend actions (walks finished, badges earned).
- **`TrendingWalks.tsx`**: Component for displaying popular public walks in a grid.
- **`DashboardUrlListener.tsx`**: Utility component to handle "deep linking" from social cards to the main dashboard map.
- **`types/social.ts`**: TypeScript definitions for feed items and trending data.

## Features details

### 1. Activity Feed
- **Visuals**: Displays rich cards with user avatars, action descriptions, timestamps, and optional media (photos from walks).
- **Interactions**: read-only for now, but UI supports placeholders for likes/comments.
- **Data Source**: Mock data in `constants/social.ts`.

### 2. Trending Walks & Discovery
- **"Hot" Routes**: Shows high-rated user-created or official walks.
- **Deep Linking**: 
    - Clicking a walk card navigates to `/dashboard?walkId=...`
    - The `DashboardUrlListener` intercepts this parameter, sets the active walk in `DashboardContext`, and cleans the URL.
    - This allows for seamless transitions from "Social" discovery to "Active" gameplay.

### 3. Navigation
- Integrated a new **"SOCIAL"** tab in the `DashboardNavbar` with a "NEW" badge.
- Fully responsive layout:
    - **Desktop**: 3-column grid (Feed + Sidebar).
    - **Mobile**: Stacked layout with optimized touch targets.

## Data Structure
- `ActivityFeedItem`: Polymorphic structure handling different action types (`completed_walk`, `earned_badge`, `joined_event`).
- `TrendingWalkData`: Extended metadata for walks (visitors, rating).
