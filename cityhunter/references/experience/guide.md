CityHunter Discovery Page - User & Developer Guide

1. Overview

The Discovery Page (discovery.html) is the core interaction layer of the CityHunter application. It represents the view a user sees when they have successfully "unlocked" or navigated to a specific monument. It is designed to be immersive, media-rich, and interactive, serving as a digital guide for urban exploration.

File: discovery.html (Self-contained with CSS/JS)

2. Key Features

A. Immersive Hero Gallery

Visuals: A full-width, scrollable image gallery at the top.

Overlay: Gradient overlays ensure text readability (Title, Tags) regardless of the image brightness.

Navigation: Floating "Back" button and "Language/Favorite" toggles.

B. Floating Info Card

Data at a Glance: A glass-morphic card that floats over the content, displaying key metrics:

Rating: User review score.

Distance: Real-time distance from the user.

Price: Entry cost (or "Free").

C. Action Bar (Primary CTAs)

Navigate: Main call-to-action to open external maps.

Audio: Toggles the Text-to-Speech (TTS) feature.

Plan: Placeholder for adding to a calendar/itinerary.

D. Content Tabs

The page uses a tabbed interface to organize dense information without clutter:

Overview: Historical description, address, opening hours, and ticket links.

Quiz: A gamified challenge to earn XP.

Chat: A simulated AI guide interface for asking questions.

3. User Interactions

🎧 Listening to Audio Guide (TTS)

Click the Audio button in the Action Bar.

Visual Feedback: A progress bar appears at the top of the Overview tab, and the button icon changes to "Stop".

Behavior: The app reads the monument's description aloud using the browser's native Speech Synthesis API.

🧠 Taking the Quiz

Switch to the Quiz tab.

Click "Start Quiz".

Select an answer.

Correct: The button turns green (accent color), and you advance to the next question.

Incorrect: The button turns red.

Completion: Finishing the quiz shows a "Challenge Complete" screen with XP rewards.

💬 Using the AI Chat

Switch to the Chat tab.

Type a question in the input field (or press Enter).

Simulation: The user message appears immediately. After a 1-second delay, a mock AI response is generated and displayed.

🌗 Switching Themes

The page respects the localStorage theme setting ('light' or 'dark') set by the landing page or dashboard.

Dev Note: You can manually toggle this in the console via document.documentElement.setAttribute('data-theme', 'light').

4. Technical Implementation

Architecture

Single File Component: All HTML, CSS, and JS are contained within discovery.html for portability during the prototype phase.

Vanilla JS: No framework dependencies. State is managed via a simple appState object.

Theming System

Uses CSS Variables defined in the <style> block.

--c-canvas: Background color.

--c-surface: Card/Overlay background.

--c-accent: The signature "Electric Lime" (#CCFF00) for interactive elements.

Data Injection

The content is not hardcoded in the HTML structure. It is injected dynamically via the loadMonumentData() function in the script section.

Mock Data Source: The monumentData constant contains the title, images, description HTML, and quiz questions. This makes it easy to swap out content or connect to an API later.

5. How to Use / Test

Open: Double-click discovery.html to open it in any modern browser (Chrome, Firefox, Safari).

Mobile View: For the best experience, open Developer Tools (F12) and toggle the Device Toolbar (Ctrl+Shift+M) to simulate a mobile screen (e.g., iPhone 12/Pixel 5).

Test TTS: Ensure your volume is up and click "Audio". Note: TTS support depends on your OS/Browser voices.

Test Logic: Try answering the quiz questions (Correct answers are mapped in the monumentData object).