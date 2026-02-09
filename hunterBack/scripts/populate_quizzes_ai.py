import asyncio
import os
import sys
from typing import List

from dotenv import load_dotenv
from pydantic import BaseModel, Field

# Add the project root to sys.path to allow imports from app
# Assuming this script is run from project root or scripts/ dir
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.append(project_root)

import google.genai
from google.genai import types

from app.db.mongodb import init_db
from app.models.domain.poi import Monument
from app.models.quiz import Quiz, QuizDifficulty

# Load Environment
load_dotenv()

# Verify API Key
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

client = google.genai.Client(api_key=api_key)
print("Environment and AI Client initialized.")

# --- Models ---


class AIQuizItem(BaseModel):
    question: str = Field(description="The quiz question text")
    options: List[str] = Field(
        description="A list of 4 options", min_length=4, max_length=4
    )
    correct_answer_index: int = Field(
        description="The index (0-3) of the correct answer"
    )
    explanation: str = Field(
        description="Brief explanation of why the answer is correct"
    )
    difficulty: str = Field(description="Difficulty level: EASY, MEDIUM, or HARD")


class AIQuizResponse(BaseModel):
    quizzes: List[AIQuizItem]


# --- Functions ---


def generate_quizzes_with_ai(monument: Monument) -> List[Quiz]:
    print(f"Generating quizzes for: {monument.name}...")

    prompt = f"""
    Generate 3 distinct multiple-choice quizzes for the monument: "{monument.name}".
    
    Context:
    - Description: {monument.description}
    - Location: {monument.location}
    - Architectural Style: {monument.architectural_style}
    - Built Year: {monument.built_year}
    
    Requirements:
    1. Generate exactly 3 quizzes.
    2. Vary the difficulty (1 Easy, 1 Medium, 1 Hard).
    3. Ensure options are plausible but only one is correct.
    4. Provide the correct answer index (0-3).
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AIQuizResponse,
                temperature=0.7,
            ),
        )

        # Save raw AI response to JSON for inspection
        output_dir = "scripts/data/generated_quizzes"
        os.makedirs(output_dir, exist_ok=True)
        safe_name = "".join(
            x for x in monument.name if x.isalnum() or x in " _-"
        ).strip()

        raw_json_path = os.path.join(output_dir, f"{safe_name}.json")
        try:
            # We need to get the raw text or dict from the response to save it
            # response.text should contain the JSON string since we requested mime_type json
            with open(raw_json_path, "w", encoding="utf-8") as f:
                f.write(response.text)
                print(f"Saved generated JSON to {raw_json_path}")
        except Exception as save_err:
            print(f"Warning: Could not save JSON backup: {save_err}")

        # Parse response
        ai_response = response.parsed
        if not ai_response or not ai_response.quizzes:
            print(f"No quizzes generated for {monument.name}")
            return []

        quizzes = []
        for item in ai_response.quizzes:
            # Map complexity/difficulty string to Enum
            diff_str = item.difficulty.upper()
            if diff_str not in ["EASY", "MEDIUM", "HARD"]:
                diff_str = "MEDIUM"

            xp_map = {"EASY": 100, "MEDIUM": 200, "HARD": 500}

            quizzes.append(
                Quiz(
                    monument_id=str(monument.id),
                    question=item.question,
                    options=item.options,
                    correct_answer=item.correct_answer_index,
                    xp_reward=xp_map.get(diff_str, 200),
                    difficulty=QuizDifficulty(diff_str),
                )
            )

        print(f"Successfully generated {len(quizzes)} quizzes for {monument.name}")
        return quizzes

    except Exception as e:
        print(f"Error generating quizzes for {monument.name}: {e}")
        return []


async def repopulate_quizzes_ai():
    # Ensure DB is connected
    await init_db()

    # Delete old quizzes
    print("Deleting existing quizzes...")
    await Quiz.delete_all()

    # Fetch all monuments
    monuments = await Monument.find_all().to_list()
    print(f"Found {len(monuments)} monuments. Starting AI generation...")

    total_quizzes = 0

    # Process monuments
    for monument in monuments:
        new_quizzes = generate_quizzes_with_ai(monument)
        if new_quizzes:
            for q in new_quizzes:
                await q.insert()
            total_quizzes += len(new_quizzes)

        # Small delay to be nice to the API
        await asyncio.sleep(1)

    print(f"Total quizzes created: {total_quizzes}")


if __name__ == "__main__":
    asyncio.run(repopulate_quizzes_ai())
