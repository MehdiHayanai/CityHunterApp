import json
import re
import wikipediaapi
from typing import List, Dict, Any

# Initialize Wikipedia API (use a clear user agent as per Wiki policy)
wiki_wiki = wikipediaapi.Wikipedia(
    language="en",
    extract_format=wikipediaapi.ExtractFormat.WIKI,
    user_agent="ParisMonumentEnricher/1.0 (contact: your-email@example.com)",
)


def clean_wiki_text(text: str) -> str:
    """Removes citations like [1] and [note 1] from text."""
    return re.sub(r"\[.*?\]", "", text).strip()


def extract_infobox_details(page_title: str) -> Dict[str, Any]:
    """
    Attempts to find specific historical data.
    Note: Wikipedia-API doesn't parse infoboxes natively,
    so we look for keywords in the summary and page categories.
    """
    page = wiki_wiki.page(page_title)
    details = {
        "built_year": None,
        "architectural_style": None,
        "wiki_url": page.fullurl if page.exists() else None,
    }

    if not page.exists():
        return details

    # Logic: Search for years (4 digits) in the first paragraph
    year_match = re.search(r"\b(1[1-9]\d{2}|20[0-2]\d)\b", page.summary[:500])
    if year_match:
        details["built_year"] = int(year_match.group(1))

    # Logic: Search for common styles in the summary or categories
    styles = [
        "Gothic",
        "Renaissance",
        "Baroque",
        "Neoclassical",
        "Art Nouveau",
        "Art Deco",
        "Modernist",
        "Haussmann",
        "Romanesque",
        "Byzantine",
    ]

    # Check summary
    for style in styles:
        if style.lower() in page.summary.lower():
            details["architectural_style"] = style
            break

    return details


def enrich_monuments(monuments: List[Dict[str, Any]]):
    print(f"Enriching {len(monuments)} monuments from Wikipedia...")

    for monument in monuments:
        name = monument.get("name")
        print(f"Processing {name}...")

        # Try to get data
        wiki_data = extract_infobox_details(name)

        # Update the monument object
        monument["built_year"] = monument.get("built_year") or wiki_data["built_year"]
        monument["architectural_style"] = (
            monument.get("architectural_style") or wiki_data["architectural_style"]
        )
        monument["wikipedia_url"] = wiki_data["wiki_url"]

    return monuments


# Main Execution
if __name__ == "__main__":
    # Assuming your current JSON is stored in 'paris_monuments.json'
    with open("loc_assets/paris_monuments_full.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    enriched_data = enrich_monuments(data)

    with open("loc_assets/paris_monuments_enriched.json", "w", encoding="utf-8") as f:
        json.dump(enriched_data, f, indent=4, ensure_ascii=False)

    print("Enrichment complete! Saved to paris_monuments_enriched.json")
