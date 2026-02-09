# Chat Assistant

The CityHunter Chat Assistant is an AI-powered conversational guide that helps users discover, learn about, and navigate their city.

## Overview

Built with Google's Agentic Development Kit (ADK), the chat assistant provides:
- **Monument Information**: Detailed historical and architectural context
- **Walk Recommendations**: Personalized route suggestions
- **Location Search**: Find nearby points of interest
- **Interactive Q&A**: Conversational learning about the city

## Features

### Custom Tools

The assistant has access to specialized tools:

#### 1. Search Monuments
```typescript
search_monuments({
  lat: number,      // Required: User latitude
  lng: number,      // Required: User longitude
  radius?: number,  // Optional: Search radius in meters (default: 1000)
  query?: string    // Optional: Search term
})
```

Returns nearby monuments with:
- Name and description
- Architectural style
- Opening hours
- Distance from user

#### 2. Search Walks
```typescript
search_walks({
  difficulty?: "Easy" | "Medium" | "Hard",
  max_distance?: number  // In meters
})
```

Returns available walks matching criteria.

#### 3. Google Search & Wikipedia
- General information lookup
- Historical context
- Cultural background

### Conversation Capabilities

The assistant can:
- Answer questions about monuments
- Suggest walks based on interests
- Provide directions and navigation tips
- Explain historical context
- Recommend nearby attractions

## User Interface

### Chat Widget

**Location**: Floating button in bottom-right corner (dashboard only)

**Features**:
- Minimized: Pulsing icon with notification badge
- Expanded: Full chat interface
- Draggable and resizable
- Persists across page navigation

### Chat Interface

**Design**: Gemini-style modern UI

**Components**:
- Message history with timestamps
- User input field
- Send button
- Session reset option
- Typing indicators
- Source citations

**Styling**:
- Glassmorphism effects
- Dark/light mode support
- Smooth animations
- Mobile-responsive

## Technical Implementation

### Backend Architecture

```
User Message → Frontend → API Proxy → FastAPI Backend → Google ADK
                                                            ↓
                                                    Custom Tools
                                                    (MongoDB queries)
```

### API Endpoints

#### Create Session
```typescript
POST /api/v1/chat/sessions

Response:
{
  "session_id": "uuid"
}
```

#### Send Message
```typescript
POST /api/v1/chat/message

Body:
{
  "session_id": "uuid",
  "message": "Tell me about the Eiffel Tower",
  "lat": 48.8566,  // Optional: User location
  "lng": 2.3522
}

Response:
{
  "response": "The Eiffel Tower is...",
  "sources": [
    {
      "type": "monument",
      "id": "monument_123",
      "name": "Eiffel Tower"
    }
  ]
}
```

#### Get Session History
```typescript
GET /api/v1/chat/sessions/{session_id}

Response:
{
  "messages": [
    {
      "role": "user",
      "content": "Tell me about...",
      "timestamp": "2026-02-09T12:00:00Z"
    },
    {
      "role": "assistant",
      "content": "The monument is...",
      "timestamp": "2026-02-09T12:00:05Z"
    }
  ]
}
```

### State Management

#### Session Persistence
```typescript
// Store session ID in localStorage
localStorage.setItem('chat_session_id', sessionId);

// Restore on app load
const sessionId = localStorage.getItem('chat_session_id');
```

#### Message History
- Stored server-side per session
- Retrieved on session restoration
- Cleared on session reset

### Chat Agent Implementation

**File**: `hunterBack/app/services/chat_agent.py`

```python
from google.adk import Agent

# Define custom tools
@tool
def search_monuments(lat: float, lng: float, radius: int = 1000):
    """Search for monuments near a location"""
    # Query MongoDB with geospatial search
    monuments = Monument.find_near(lat, lng, radius)
    return monuments

# Create agent with tools
agent = Agent(
    model="gemini-2.0-flash-exp",
    tools=[search_monuments, search_walks],
    system_instruction="You are a knowledgeable city guide..."
)
```

## Usage Examples

### Example Conversations

#### Monument Information
```
User: "What can you tell me about the monument nearby?"
Assistant: "Based on your location, the nearest monument is the Arc de Triomphe, 
located 150m away. It's a famous triumphal arch built in 1836..."
```

#### Walk Recommendations
```
User: "I have 2 hours. What walk would you recommend?"
Assistant: "I'd suggest the 'Historic Paris' walk - it's a medium difficulty 
route that takes about 1.5 hours and covers 5 major monuments..."
```

#### Historical Context
```
User: "Why was the Eiffel Tower built?"
Assistant: "The Eiffel Tower was constructed for the 1889 World's Fair to 
commemorate the centennial of the French Revolution..."
```

## Configuration

### Environment Variables

```env
# Google API Key for ADK
GEMINI_API_KEY=your_google_api_key_here

# Model configuration
CHAT_MODEL=gemini-2.0-flash-exp
```

### Timeout Settings

**Frontend**: 60 seconds for chat requests
**Backend**: Configured in proxy settings

## UI Components

### ChatWidget Component
```typescript
interface ChatWidgetProps {
  // No props - uses global state
}

// Features:
// - Toggle open/close
// - Notification badge
// - Persistent position
```

### ChatInterface Component
```typescript
interface ChatInterfaceProps {
  sessionId: string;
  onClose: () => void;
}

// Features:
// - Message display
// - Input handling
// - Session management
// - Source citations
```

## Future Enhancements

### Planned Features
- [ ] Voice input/output
- [ ] Image recognition (upload monument photos)
- [ ] Multi-language support
- [ ] Conversation export
- [ ] Suggested questions
- [ ] Rich media responses (images, maps)

### Advanced Capabilities
- [ ] Personalized recommendations based on history
- [ ] Group chat for collaborative exploration
- [ ] AR integration (point camera, get info)
- [ ] Offline mode with cached responses

## Troubleshooting

### Chat Not Responding

1. Check backend is running
2. Verify `GEMINI_API_KEY` is set
3. Check browser console for errors
4. Verify session ID is valid

### Timeout Errors

- Increase timeout in proxy configuration
- Check backend logs for slow queries
- Verify Google ADK service status

### Location Not Working

- Ensure browser location permissions granted
- Check HTTPS (required for geolocation)
- Verify lat/lng are being sent in requests

## Related Documentation

- [Backend Integration](../architecture/backend-integration.md) - API details
- [Quick Start Guide](../getting-started/quick-start.md) - User tutorial
- [Walks Feature](walks.md) - Walk recommendations
