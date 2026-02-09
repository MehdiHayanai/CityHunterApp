import json
import os
import time
from typing import Any, Dict

import requests
from dotenv import load_dotenv

# 1. Load config
load_dotenv(".env.local")

API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
# Ensure the URL is the correct v1 endpoint
TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"

MONUMENTS_LIST = [
    "Eiffel Tower",
    "Arc de Triomphe",
    "Louvre Palace",
    "Palais Garnier",
    "Panthéon Paris",
    "Les Invalides",
    "Palais du Luxembourg",
    "Conciergerie",
    "Palais-Royal",
    "Hôtel de Ville Paris",
    "Grand Palais",
    "Petit Palais",
    "Palais de Chaillot",
    "Institut de France",
    "École Militaire",
    "Palais Bourbon",
    "Paris Observatory",
    "Notre-Dame Cathedral",
    "Sacré-Cœur Basilica",
    "Sainte-Chapelle",
    "Église de la Madeleine",
    "Saint-Sulpice Church",
    "Saint-Germain-des-Prés Church",
    "Saint-Eustache Church",
    "Val-de-Grâce",
    "Grande Mosquée de Paris",
    "Saint-Jacques Tower",
    "Basilique de Saint-Denis",
    "Pont Alexandre III",
    "Pont Neuf",
    "Obelisk of Luxor",
    "July Column",
    "Vendôme Column",
    "Medici Fountain",
    "Fontaine des Innocents",
    "Arènes de Lutèce",
    "Paris Catacombs",
    "Père Lachaise Cemetery",
    "Arc de Triomphe du Carrousel",
    "Pont des Arts",
    "Centre Pompidou",
    "Montparnasse Tower",
    "Grande Arche de la Défense",
    "Bibliothèque Nationale de France",
    "Fondation Louis Vuitton",
    "Moulin Rouge",
    "Bourse de Commerce",
    "Pyramide du Louvre",
    "Maison de Radio France",
    "Statue of Liberty Paris",
]


def fetch_monument_details(query: str) -> Dict[str, Any]:
    """Queries Google Places for a specific monument by name."""
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        # FieldMask must be a comma-separated string of the fields you want
        "X-Goog-FieldMask": "places.id,places.displayName,places.editorialSummary,places.location,places.photos,places.types,places.formattedAddress,places.rating,places.userRatingCount",
    }

    payload = {"textQuery": f"{query}, Paris, France", "maxResultCount": 1}

    try:
        response = requests.post(TEXT_SEARCH_URL, json=payload, headers=headers)
        if response.status_code != 200:
            print(f"Error {response.status_code}: {response.text}")
            return None

        data = response.json()
        places = data.get("places", [])
        return places[0] if places else None
    except Exception as e:
        print(f"Request failed for {query}: {e}")
        return None


def map_to_project_model(google_place: Dict[str, Any]) -> Dict[str, Any]:
    if not google_place:
        return {}

    loc = google_place.get("location", {})
    lat = loc.get("latitude")
    lng = loc.get("longitude")

    summary = google_place.get("editorialSummary", {}).get("text", "")
    address = google_place.get("formattedAddress", "")

    return {
        "name": google_place.get("displayName", {}).get("text", "Unknown"),
        "description": summary or f"A historic monument located at {address}.",
        "short_description": address[:150],
        "location": {"type": "Point", "coordinates": [lng, lat]},
        "google_rating": google_place.get("rating"),
        "review_count": google_place.get("userRatingCount"),
        "tags": google_place.get("types", []),
        "images": [
            {
                "url": f"https://places.googleapis.com/v1/{p['name']}/media?key={API_KEY}&maxWidthPx=1000",
                "description": "Google Places Photo",
            }
            for p in google_place.get("photos", [])[:3]
        ],
    }


def main():
    if not API_KEY:
        print("ERROR: API Key is missing.")
        return

    all_data = []
    print(f"Starting extraction for {len(MONUMENTS_LIST)} monuments...")

    for i, monument in enumerate(MONUMENTS_LIST, 1):
        print(f"[{i}/50] Fetching: {monument}...")
        raw_place = fetch_monument_details(monument)

        if raw_place:
            all_data.append(map_to_project_model(raw_place))
        else:
            print(f"  -> Skipping {monument} (No data found)")

        # Slight sleep to avoid hitting per-second quota limits
        time.sleep(0.2)

    with open("paris_monuments_full.json", "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=4, ensure_ascii=False)

    print(f"\nDone! Saved {len(all_data)} monuments.")


if __name__ == "__main__":
    main()
