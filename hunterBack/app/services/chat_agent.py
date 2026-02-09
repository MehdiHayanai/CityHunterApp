import logging
import os
from typing import Optional

from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.adk.tools.google_search_tool import GoogleSearchTool
from google.genai import types

# Assuming these models exist in your app structure
from app.core.config import settings
from app.models.domain.poi import POI, Monument
from app.models.domain.walk import Walk

# Setup Logger
logger = logging.getLogger(__name__)

# Environment Configuration for Gemini 3
# Note: Gemini 3 often requires the 'global' location for preview endpoints
os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY

# Configure Google Search Tool
google_search = GoogleSearchTool(bypass_multi_tools_limit=True)

# --- Updated Custom Tools ---


async def search_monuments(
    lat: float,
    lon: float,
    radius_m: int = 5000,
) -> str:
    """
    Searches for monuments in the local database using strictly location data.

    Args:
        lat: Latitude of the search center.
        lon: Longitude of the search center.
        radius_m: Search radius in meters.

    Returns:
        A text summary of monuments found in the database.
    """
    try:
        # Strict Geospatial filter using MongoDB/Beanie syntax
        geo_filter = {
            "location": {
                "$nearSphere": {
                    "$geometry": {"type": "Point", "coordinates": [lon, lat]},
                    "$maxDistance": radius_m,
                }
            }
        }

        # Query the database
        monuments = await Monument.find(geo_filter).limit(10).to_list()

        if not monuments:
            return f"No local monuments found within {radius_m}m of these coordinates. you can increase the radius to find more monuments."

        results = [f"Found {len(monuments)} monuments in our database:"]
        for m in monuments:
            desc = m.short_description or (m.description[:100] + "...")
            results.append(f"- {m.name}: {desc}")

        return "\n".join(results)
    except Exception as e:
        logger.error(f"Error in search_monuments: {e}")
        return "The local monument database is currently unavailable."


async def search_walks(query: str, lat: float, lon: float, radius_m: int = 5000) -> str:
    """
    Searches for walks near the user that include local POIs.
    """
    try:
        geo_filter = {
            "location": {
                "$nearSphere": {
                    "$geometry": {"type": "Point", "coordinates": [lon, lat]},
                    "$maxDistance": radius_m,
                }
            }
        }

        nearby_pois = await POI.find(geo_filter).limit(20).to_list()
        if not nearby_pois:
            return f"No points of interest found within {radius_m}m."

        poi_lookup = {poi.id: poi.name for poi in nearby_pois}
        poi_ids = list(poi_lookup.keys())

        walks = await Walk.find(
            {"stops.$id": {"$in": poi_ids}},
            fetch_links=True,
        ).to_list()

        if not walks:
            return "Nearby POIs found, but no curated walks include them yet."

        results = []
        for w in walks:
            duration = (
                f"{w.estimated_duration_minutes} min"
                if w.estimated_duration_minutes
                else "N/A"
            )
            results.append(
                f"- **{w.title}** ({w.difficulty.value}, ~{duration})\n  {w.description[:100]}..."
            )

        return "Curated walks found near you:\n" + "\n".join(results)
    except Exception as e:
        logger.error(f"Error in search_walks: {e}")
        return "An error occurred while retrieving walking routes."


# --- Agent Configuration (Gemini 3) ---

# The Monument Expert - Now uses Gemini 3
monument_expert = LlmAgent(
    model="gemini-3-flash-preview",
    name="MonumentExpert",
    description="Scholarly guide for monuments, history, and architectural heritage.",
    instruction="""You are a scholarly guide. 
    1. ALWAYS use 'search_monuments' first to find local data. Use ONLY 'lat' and 'lon' parameters.
    2. Do NOT try to pass a text 'query' to the local search tool; it only accepts coordinates.
    3. If local results are empty, use 'google_search' to provide broader historical context.
    4. Provide construction dates, architectural styles, and cultural significance.""",
    tools=[google_search, search_monuments],
)

# The Travel Manager
travel_manager = LlmAgent(
    model="gemini-3-flash-preview",
    name="TravelManager",
    description="Logistics expert for walking routes and regional travel plans.",
    instruction="""You find curated walking routes. 
    Use 'search_walks' with the user's 'lat' and 'lon'. 
    Focus on difficulty, estimated time, and nearby activities.""",
    tools=[search_walks],
)

# The Concierge (Root)
root_agent = LlmAgent(
    model="gemini-2.0-flash",
    name="Monumentum",
    description="The primary conversational gateway for the Monumentum system.",
    instruction="""You are 'Monumentum'.
    - Transfer to 'MonumentExpert' for history or specific site inquiries.
    - Transfer to 'TravelManager' for walks and planning.
    - Handle greetings and general conversation yourself.
    - Be polite and scholarly.""",
    sub_agents=[monument_expert, travel_manager],
)

# --- Service Class ---


class ChatService:
    _runner: Optional[InMemoryRunner] = None

    @classmethod
    def get_runner(cls) -> InMemoryRunner:
        if cls._runner is None:
            cls._runner = InMemoryRunner(agent=root_agent, app_name="MonumentumApp")
        return cls._runner

    @classmethod
    async def create_session(cls, user_id: str, session_id: str):
        runner = cls.get_runner()
        try:
            await runner.session_service.create_session(
                app_name="MonumentumApp", user_id=user_id, session_id=session_id
            )
        except Exception as e:
            logger.info(f"Session note: {e}")

    @classmethod
    async def send_message(cls, session_id: str, user_text: str, user_id: str = "user"):
        runner = cls.get_runner()
        content = types.Content(
            role="user", parts=[types.Part.from_text(text=user_text)]
        )

        try:
            response_text = ""
            # ADK 2026 uses run_async for true non-blocking streams
            async for event in runner.run_async(
                user_id=user_id,
                session_id=session_id,
                new_message=content,
            ):
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text:
                            response_text += part.text

            return response_text

        except Exception as e:
            logger.error(f"Chat processing error: {e}")
            return "I'm having trouble connecting to my knowledge base right now."
