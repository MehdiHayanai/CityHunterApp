import logging
import os
from typing import Optional

from beanie.operators import Or, RegEx
from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.adk.tools.google_search_tool import GoogleSearchTool
from google.genai import types

from app.core.config import settings
from app.models.domain.poi import POI, Monument
from app.models.domain.walk import Walk

# Setup Logger
logger = logging.getLogger(__name__)

# Set API Key in environment for the SDK
os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY

# Configure Google Search to work with other tools
google_search = GoogleSearchTool(bypass_multi_tools_limit=True)

# --- Custom Tools ---


async def search_monuments(
    query: str,
    lat: float,
    lon: float,
    radius_m: int = 5000,
) -> str:
    """
    Searches for monuments in the database based on a text query and optional location.

    Args:
        query: The search term (e.g., "statue", "ancient", "castle").
        lat: Latitude of the search center.
        lon: Longitude of the search center.
        radius_m: Search radius in meters (default 5000m).

    Returns:
        A string summary of found monuments.
    """
    try:
        # Basic text search (regex for now, simple)
        # TODO: Improve with proper text index search if available
        search_filter = Or(
            RegEx(Monument.name, query, "i"), RegEx(Monument.description, query, "i")
        )

        # If location is provided, we could add a geo filter.
        # Beanie/MongoDB Geo support required '2dsphere' index on 'location'.
        # Assuming 'location' field is GeoJSON.
        # For simplicity in this first pass, we focus on text.
        # if lat is not None and lon is not None:
        #     location_filter = Near(Monument.location, [lon, lat], max_distance=radius_m)
        #     # Combine filters...

        monuments = await Monument.find(search_filter).limit(5).to_list()

        if not monuments:
            return f"No monuments found matching '{query}'."

        results = []
        for m in monuments:
            results.append(
                f"- {m.name}: {m.short_description or m.description[:100]}..."
            )

        return "\n".join(results)
    except Exception as e:
        logger.error(f"Error searching monuments: {e}")
        return "An error occurred while searching for monuments."


async def search_walks(query: str, lat: float, lon: float, radius_m: int = 5000) -> str:
    """
    Searches for walks near the user by first finding nearby monuments/events,
    then returning walks that include those points of interest.

    Args:
        query: Optional search term to filter POIs (e.g., "historic", "museum"). Pass empty string to find all nearby.
        lat: Latitude of the user's current position.
        lon: Longitude of the user's current position.
        radius_m: Search radius in meters (default 5000m).

    Returns:
        A string summary of found walks and the nearby stops they contain.
    """
    try:
        # Step 1: Find POIs near the user using MongoDB $nearSphere
        geo_filter = {
            "location": {
                "$nearSphere": {
                    "$geometry": {"type": "Point", "coordinates": [lon, lat]},
                    "$maxDistance": radius_m,
                }
            }
        }

        # Optionally filter by text query on name/description
        if query and query.strip():
            geo_filter["$or"] = [
                {"name": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
            ]

        nearby_pois = await POI.find(geo_filter).limit(20).to_list()

        if not nearby_pois:
            return (
                f"No monuments or events found within {radius_m}m of your location"
                + (f" matching '{query}'." if query else ".")
            )

        # Build a quick lookup: poi_id -> poi_name
        poi_lookup = {poi.id: poi.name for poi in nearby_pois}
        nearby_poi_ids = list(poi_lookup.keys())

        # Step 2: Find walks that contain at least one of these nearby POIs
        # Walk.stops is List[Link[POI]] — stored as DBRef or ObjectId in MongoDB
        walks = await Walk.find(
            {"stops.$id": {"$in": nearby_poi_ids}},
            fetch_links=True,
        ).to_list()

        if not walks:
            poi_names = ", ".join([p.name for p in nearby_pois[:5]])
            return (
                f"Found {len(nearby_pois)} nearby point(s) of interest ({poi_names}), "
                f"but no curated walks include them yet."
            )

        # Step 3: Build a rich summary for the LLM
        results = []
        for w in walks:
            # Identify which of the nearby POIs are in this walk
            walk_stop_ids = set()
            for stop in w.stops or []:
                stop_id = stop.id if hasattr(stop, "id") else stop
                walk_stop_ids.add(stop_id)

            matching_names = [
                poi_lookup[pid] for pid in nearby_poi_ids if pid in walk_stop_ids
            ]

            stops_info = ", ".join(matching_names[:4])
            if len(matching_names) > 4:
                stops_info += f" (+{len(matching_names) - 4} more)"

            total_stops = len(w.stops) if w.stops else 0
            duration = (
                f"{w.estimated_duration_minutes} min"
                if w.estimated_duration_minutes
                else "N/A"
            )
            distance = f"{w.distance_km} km" if w.distance_km else "N/A"

            results.append(
                f"- **{w.title}** ({w.difficulty.value}, {distance}, ~{duration})\n"
                f"  {w.description[:120]}...\n"
                f"  Nearby stops: {stops_info} ({len(matching_names)}/{total_stops} stops near you)"
            )

        header = f"Found {len(walks)} walk(s) with stops near your location:\n"
        return header + "\n".join(results)

    except Exception as e:
        logger.error(f"Error searching walks: {e}")
        return "An error occurred while searching for walks."


# --- Agent Configuration ---

# The Monument Expert
monument_expert = LlmAgent(
    model="gemini-2.0-flash",
    name="MonumentExpert",
    description="An expert in global monuments, history, and heritage sites.",
    instruction="""You are a scholarly guide. Use 'search_monuments' to find specific local data from our database first.
    You MUST provide 'lat' and 'lon' when calling 'search_monuments'. This data comes from the user's current location context.
    If you do not have the location, ASK the user for it.
    If not found locally, use 'google_search' for broader factual queries about monuments.
    Provide details on architectural style, construction dates, and historical significance. 
    Be descriptive and engaging.""",
    tools=[google_search, search_monuments],
)

# The Travel Manager
travel_manager = LlmAgent(
    model="gemini-2.0-flash",
    name="TravelManager",
    description="Specialist in travel logistics, routes, and suggestion of activities.",
    instruction="""You help with 'how-to' travel. Use 'search_walks' to find curated routes in our system.
    You MUST provide 'lat' and 'lon' for 'search_walks'. Obtain this from the user's context or ask them.
    Suggest local activities near monuments. Focus on transportation, regional routes, and visitor tips.""",
    tools=[search_walks],
)

# The Concierge (Root)
root_agent = LlmAgent(
    model="gemini-2.0-flash",
    name="Monumentum",
    description="The primary conversational concierge for the Monumentum system.",
    instruction="""You are 'Monumentum', a helpful travel assistant.
    - If the user asks about monuments, history, or specific sites, transfer to MonumentExpert.
    - If the user asks for walks, routes, plans, or things to do, transfer to TravelManager.
    - For general greetings, handle them yourself.
    - Be polite and maintain the persona of a well-traveled person.""",
    sub_agents=[monument_expert, travel_manager],
)


# --- Service Class ---


class ChatService:
    _runner: Optional[InMemoryRunner] = None

    @classmethod
    def get_runner(cls) -> InMemoryRunner:
        if cls._runner is None:
            # Initialize the runner
            cls._runner = InMemoryRunner(agent=root_agent, app_name="MonumentumApp")
        return cls._runner

    @classmethod
    async def create_session(cls, user_id: str, session_id: str):
        """
        Explicitly creates a session in the runner.
        Note: InMemoryRunner might create it on fly, but `session_service.create_session` is safer.
        """
        runner = cls.get_runner()
        # Verify if session exists or create new
        # InMemoryRunner persistence is essentially the session object in memory.
        # unique_id collision handling is up to caller or ADK.
        try:
            await runner.session_service.create_session(
                app_name="MonumentumApp", user_id=user_id, session_id=session_id
            )
        except Exception as e:
            # If session already exists, we might get an error or it might be idempotent.
            # We'll log and assume it's fine if it exists.
            logger.info(f"Session creation note (might already exist): {e}")

    @classmethod
    async def send_message(cls, session_id: str, user_text: str, user_id: str = "user"):
        """
        Sends a message to the agent and yields responses.
        """
        runner = cls.get_runner()

        content = types.Content(
            role="user", parts=[types.Part.from_text(text=user_text)]
        )

        # Run the agent
        # The runner.run() returns an event stream (likely synchronous generator or async generator)
        # The user snippet used `for event in runner.run(...)`.
        # We need to verify if `runner.run` is async or sync.
        # Looking at snippet: `for event in runner.run(...)`.
        # But `asyncio.run(run_cli())` was the wrapper.
        # If `runner.run` is non-blocking/generator, we can iterate.

        try:
            # Ensure session exists (lazy creation if needed, though we have create_session)
            # We'll just call run.

            # Capture the events
            response_text = ""

            # Using list(runner.run(...)) if it's sync, or async for if async.
            # Snippet: `for event in runner.run(...)` inside `async def run_cli`.
            # This implies `runner.run` is a synchronous iterator OR the snippet was simplifying.
            # However, given tool calls are async (likely), `runner.run` might block if not async?
            # Actually, `InMemoryRunner` in ADK usually handles async tools.
            # Let's assume standard sync iterator that pumps the event loop or async iterator.
            # Safest bet: Check if it's awaitable or iterator.
            # User snippet: `for event in runner.run(...)`

            events = runner.run(
                user_id=user_id,
                session_id=session_id,
                new_message=content,
            )

            for event in events:
                # We are interested in the final response or chunks.
                # event.content.parts[0].text
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text:
                            response_text += part.text

            return response_text

        except Exception as e:
            logger.error(f"Error in chat processing: {e}")
            return "Sorry, I encountered an error processing your request."
