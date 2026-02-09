CityHunter Dashboard Integration Guide

This document outlines the step-by-step architecture and integration logic for the CityHunter Urban Operations Dashboard. The application is a single-file React application (dashboard.html) that combines geospatial data, gamification elements, and a cyberpunk aesthetic.

1. Environment & Dependencies

The application runs entirely in the browser without a build step, utilizing CDN links for key libraries.

React & ReactDOM (v18): UI Component library.

Babel: Compiles JSX in the browser.

Tailwind CSS: Utility-first styling framework.

Leaflet (v1.9.4): Open-source interactive maps.

FontAwesome (v6.4): Iconography.

Google Fonts: Inter & Roboto Mono for typography.

2. Theme Architecture

The visual identity (Dark/Cyberpunk) is managed through a hybrid of Tailwind configuration and CSS Variables.

Tailwind Config: Extends the default theme to include semantic colors like canvas, surface, and accent (#B4E600).

CSS Variables: Defined in <style>, allowing dynamic switching between Light and Dark modes.

--bg-canvas: Main background.

--color-accent: The signature neon green.

Global Styles: Custom scrollbars and Leaflet overrides are applied here to match the dark theme.

3. Data Structure

The application uses static constant arrays to simulate a database.

Core Data Models

Monuments: Standard locations with xp, likes, visitors, and img.

Events: Similar to monuments but reward swagg (pins) instead of XP and have statuses like "TONIGHT" or "LIVE".

Walks: Predefined routes containing metadata (difficulty, estTime) and an array of stopIds.

Key Logic: The stopIds in a Walk reference the IDs found in the Monuments and Events arrays.

4. Component Logic

4.1. Helper Functions

window.copyToClipboard: A robust utility that attempts to use the modern Clipboard API, falling back to document.execCommand('copy') if permissions are blocked (common in iframe environments).

4.2. Navigation & UI Components

Navbar: Handles theme toggling and displays User Data (Level, XP). It manages the top-level navigation state (activeTab).

CategoryPill: A reusable filter button.

MonumentCard: A versatile component that renders differently based on the layout prop ('grid' vs 'list'). It conditionally renders XP rewards or Swagg Pins based on the item type.

4.3. The Walk Module Components

WalkCard: Displays route summaries in the "Available Routes" list.

WalkStopItem: Represents a single stop in the Walk Editor. It includes logic to handle "exclusions" (toggling a stop on/off), which visually dims the item and strikes through the text.

4.4. The Map Component (LeafletMap)

This is the most complex component, bridging React state with the imperative Leaflet API.

Initialization: Uses a useRef to ensure the map is only instantiated once.

Tile Layers: Dynamically switches between CartoDB Dark and Light tiles based on the isDark prop.

Markers:

Clears and redraws markers whenever the items prop changes.

Uses L.divIcon to create custom CSS-animated pins.

Injects HTML strings for Popups, including the "Copy Address" button.

Polylines (Routes):

Checks if walkPath is provided.

Draws a dashed, neon-colored polyline connecting the active stops.

Automatically fits the map bounds to the route using map.fitBounds().

4.5. The Dashboard Container

The Dashboard component acts as the controller.

State Management:

activeTab: Switches between 'Monument', 'Event', and 'Walk'.

activeWalk: Stores the currently selected walk object.

excludedStopIds: An array tracking which stops the user has disabled in the Walk Editor.

Filtering Logic (useMemo):

Standard Mode: Filters Monuments/Events based on Category (Cyberpunk, Legacy, etc.) and Search Query.

Walk Mode: If a walk is active, it fetches the full item objects using stopIds, filters out any that are in excludedStopIds, and passes the result to the map.

5. Integration Steps

To extend or integrate this code:

Add New Data: Simply append new objects to the MONUMENTS or EVENTS arrays. Ensure IDs are unique.

Create a Walk: Add an entry to WALKS with a unique ID and a list of stopIds matching existing locations.

Adjust Theme: Modify the tailwind.config script block and the :root CSS variables to change the color palette.

Backend Connection: Replace the static arrays with useEffect hooks that fetch data from an API, then set the corresponding state variables.

6. CSS Animations

Pulse: Used on map markers to draw attention.

Copy Feedback: A specialized keyframe animation (copy-feedback) provides visual confirmation when the address copy button is clicked inside a popup.