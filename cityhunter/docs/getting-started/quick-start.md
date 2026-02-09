# Quick Start Guide

Get up and running with CityHunter in minutes!

## Starting the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## First-Time User Flow

### 1. Login / Registration

> [!WARNING]
> **Registration Closed**: New user registration is currently restricted to pre-approved users only. Contact the administrator for access.

If you have credentials:
1. Navigate to the login page
2. Enter your email and password
3. Click "Login"

### 2. Explore the Dashboard

After logging in, you'll see the main dashboard with:

- **Interactive Map**: Shows monuments, events, and points of interest
- **Sidebar**: Browse available walks and create custom routes
- **Navigation Bar**: Access your profile, settings, and other features

### 3. Start Your First Walk

#### Option A: Join a Curated Walk

1. Click on the **Walks** tab in the sidebar
2. Browse available walks
3. Click on a walk to see details
4. Click **"Start Mission"** to begin

#### Option B: Create a Custom Walk

1. Click **"Create Walk"** in the sidebar
2. Give your walk a name
3. Click monuments on the map to add them to your route
4. Drag and drop to reorder stops
5. Click **"Save Walk"** when ready

### 4. Complete a Quest

When you're on an active walk:

1. **Navigate to the first stop** using the map
2. **Get within range** (approximately 75m) of the monument
3. **Answer the quiz** when prompted
4. **Earn XP** for correct answers
5. **Move to the next stop** and repeat

### 5. Track Your Progress

- **XP Bar**: See your current level and progress in the navigation bar
- **Profile**: Click your avatar to view detailed stats
- **Achievements**: Check your collected badges and milestones

## Key Features to Try

### Chat Assistant

Click the chat icon to interact with the AI assistant:
- Ask about nearby monuments
- Get historical information
- Search for specific locations
- Plan your next adventure

### Dev Tools (Development Mode)

For testing and development:
1. Open the **Dev Tools** panel
2. Use **GPS Simulation** to test location-based features
3. **Validate** proximity triggers without physically moving

### Dark Mode

Toggle between light and dark themes using the theme switcher in the navigation bar.

## Common Tasks

### Pause and Resume a Walk

- Walks are automatically saved to local storage
- Close the app and reopen to resume where you left off
- Start a new walk to pause the current one

### View Other Users' Profiles

Navigate to `/dashboard/profile/[userId]` to view public profiles (feature in development).

### Check Your Stats

1. Click your profile avatar
2. View the **Overview** tab for:
   - Total distance traveled
   - Cities explored
   - Secrets discovered
   - Current level and XP

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close modals |
| `/` | Focus search (when available) |

## Tips for Best Experience

1. **Enable Location Services**: For the best experience, allow location access in your browser
2. **Use Mobile for Walks**: The quest system works best on mobile devices with GPS
3. **Check Opening Hours**: Some monuments have restricted access times
4. **Save Custom Walks**: Your custom routes are saved locally - export them if needed

## Troubleshooting

### Map Not Loading

- Check your internet connection
- Refresh the page
- Clear browser cache

### GPS Not Working

- Ensure location permissions are enabled
- Use the Dev Tools GPS simulator for testing
- Check that you're using HTTPS (required for geolocation)

### Quiz Not Appearing

- Ensure you're within range of the monument (check the distance indicator)
- Try the "Validate" button in Dev Tools to force trigger

## Next Steps

- [Feature Documentation](../features/README.md) - Learn about all features
- [Architecture Overview](../architecture/overview.md) - Understand how it works
- [API Reference](../reference/api-endpoints.md) - Explore the backend API

---

**Ready to explore?** Start your first quest and discover your city! 🗺️
