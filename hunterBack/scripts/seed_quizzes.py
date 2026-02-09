import asyncio
import os
import sys

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.mongodb import init_db
from app.models.quiz import Quiz, QuizDifficulty

# Data provided by User
QUIZ_DATA = [
    {
        "monument_name": "Eiffel Tower",
        "monument_id": "69813295820ded6f97ac3f63",
        "question": "In which year was the Eiffel Tower officially inaugurated for the World's Fair?",
        "options": ["1887", "1889", "1900", "1878"],
        "correct_answer": 1,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Eiffel Tower",
        "monument_id": "69813295820ded6f97ac3f63",
        "question": "What is the nickname often given to the Eiffel Tower in French?",
        "options": [
            "La Dame de Fer",
            "Le Géant de Paris",
            "La Tour Grise",
            "L'Arc d'Acier",
        ],
        "correct_answer": 0,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Eiffel Tower",
        "monument_id": "69813295820ded6f97ac3f63",
        "question": "How many steps would you have to climb to reach the very top of the Eiffel Tower (though the public usually takes the lift from the 2nd floor)?",
        "options": ["1,024", "1,520", "1,665", "1,810"],
        "correct_answer": 2,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Eiffel Tower",
        "monument_id": "69813295820ded6f97ac3f63",
        "question": "The Eiffel Tower was originally intended to stand for only how many years?",
        "options": ["10 years", "20 years", "50 years", "Permanently"],
        "correct_answer": 1,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Eiffel Tower",
        "monument_id": "69813295820ded6f97ac3f63",
        "question": "Which famous French writer was part of a 'Committee of Three Hundred' that signed a manifesto protesting the tower's construction?",
        "options": [
            "Victor Hugo",
            "Émile Zola",
            "Guy de Maupassant",
            "Charles Baudelaire",
        ],
        "correct_answer": 2,
        "xp_reward": 500,
        "difficulty": "HARD",
    },
    {
        "monument_name": "Arc de Triomphe",
        "monument_id": "69813295820ded6f97ac3f64",
        "question": "Who commissioned the construction of the Arc de Triomphe in 1806?",
        "options": [
            "Louis XIV",
            "Napoleon Bonaparte",
            "Charles de Gaulle",
            "Louis-Philippe I",
        ],
        "correct_answer": 1,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Arc de Triomphe",
        "monument_id": "69813295820ded6f97ac3f64",
        "question": "What is the name of the famous avenue that leads directly to the Arc de Triomphe?",
        "options": [
            "Rue de Rivoli",
            "Avenue Montaigne",
            "Champs-Élysées",
            "Boulevard Haussmann",
        ],
        "correct_answer": 2,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Arc de Triomphe",
        "monument_id": "69813295820ded6f97ac3f64",
        "question": "What lies directly beneath the Arc de Triomphe?",
        "options": [
            "The Tomb of the Unknown Soldier",
            "A Metro station",
            "An ancient Roman crypt",
            "Napoleon's heart",
        ],
        "correct_answer": 0,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Arc de Triomphe",
        "monument_id": "69813295820ded6f97ac3f64",
        "question": "What is the name of the famous relief sculpture by François Rude on the right pillar of the arch?",
        "options": [
            "The Coronation",
            "The Resistance",
            "The Peace",
            "The Marseillaise",
        ],
        "correct_answer": 3,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Arc de Triomphe",
        "monument_id": "69813295820ded6f97ac3f64",
        "question": "How many different avenues radiate from the Place de l'Étoile, where the monument is located?",
        "options": ["8", "10", "12", "14"],
        "correct_answer": 2,
        "xp_reward": 500,
        "difficulty": "HARD",
    },
    {
        "monument_name": "Louvre Museum",
        "monument_id": "69813295820ded6f97ac3f65",
        "question": "Before it became a museum, what was the primary function of the Louvre building?",
        "options": ["A prison", "A royal palace", "A monastery", "A library"],
        "correct_answer": 1,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Louvre Museum",
        "monument_id": "69813295820ded6f97ac3f65",
        "question": "Who painted the 'Mona Lisa', the museum's most famous resident?",
        "options": ["Michelangelo", "Raphael", "Leonardo da Vinci", "Donatello"],
        "correct_answer": 2,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Louvre Museum",
        "monument_id": "69813295820ded6f97ac3f65",
        "question": "Which king was responsible for moving the royal residence from the Louvre to Versailles?",
        "options": ["Francis I", "Henry IV", "Louis XIV", "Louis XVI"],
        "correct_answer": 2,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Louvre Museum",
        "monument_id": "69813295820ded6f97ac3f65",
        "question": "The medieval foundations of the Louvre are still visible in the basement. What was its original purpose in the late 12th century?",
        "options": ["A palace wing", "A fortress", "An armory", "A royal stable"],
        "correct_answer": 1,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Louvre Museum",
        "monument_id": "69813295820ded6f97ac3f65",
        "question": "In what year did the Louvre officially open its doors to the public as a museum?",
        "options": ["1789", "1793", "1804", "1815"],
        "correct_answer": 1,
        "xp_reward": 500,
        "difficulty": "HARD",
    },
    {
        "monument_name": "Palais Garnier",
        "monument_id": "69813295820ded6f97ac3f66",
        "question": "The Palais Garnier is primarily home to which art form?",
        "options": ["Opera and Ballet", "Sculpture", "Cinema", "Symphonic Music"],
        "correct_answer": 0,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Palais Garnier",
        "monument_id": "69813295820ded6f97ac3f66",
        "question": "Which novel was inspired by the legends and layout of this opera house?",
        "options": [
            "Les Misérables",
            "The Phantom of the Opera",
            "The Hunchback of Notre Dame",
            "The Red and the Black",
        ],
        "correct_answer": 1,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Palais Garnier",
        "monument_id": "69813295820ded6f97ac3f66",
        "question": "Who painted the colorful, modern ceiling of the main auditorium in 1964?",
        "options": ["Pablo Picasso", "Henri Matisse", "Marc Chagall", "Claude Monet"],
        "correct_answer": 2,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Palais Garnier",
        "monument_id": "69813295820ded6f97ac3f66",
        "question": "What architectural style is most associated with Charles Garnier's design?",
        "options": [
            "Gothic Revival",
            "Neoclassical",
            "Beaux-Arts / Napoleon III",
            "Art Nouveau",
        ],
        "correct_answer": 2,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Palais Garnier",
        "monument_id": "69813295820ded6f97ac3f66",
        "question": "What is unique about the foundation of the Palais Garnier that inspired a key plot point in 'The Phantom of the Opera'?",
        "options": [
            "A hidden gold vault",
            "An underground lake (cistern)",
            "A secret tunnel to the Louvre",
            "A burial ground of monks",
        ],
        "correct_answer": 1,
        "xp_reward": 500,
        "difficulty": "HARD",
    },
    {
        "monument_name": "Panthéon",
        "monument_id": "69813295820ded6f97ac3f67",
        "question": "In which historic neighborhood is the Panthéon located?",
        "options": ["Le Marais", "Montmartre", "The Latin Quarter", "Saint-Germain"],
        "correct_answer": 2,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Panthéon",
        "monument_id": "69813295820ded6f97ac3f67",
        "question": "What is the primary purpose of the Panthéon today?",
        "options": [
            "A church",
            "A mausoleum for distinguished French citizens",
            "An art gallery",
            "A government office",
        ],
        "correct_answer": 1,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Panthéon",
        "monument_id": "69813295820ded6f97ac3f67",
        "question": "Who was the first woman to be interred in the Panthéon on her own merits?",
        "options": ["Marie Curie", "Simone Veil", "Joséphine Baker", "George Sand"],
        "correct_answer": 0,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Panthéon",
        "monument_id": "69813295820ded6f97ac3f67",
        "question": "What scientific experiment was famously demonstrated here in 1851 to prove the Earth's rotation?",
        "options": [
            "Tesla Coil",
            "Foucault Pendulum",
            "Galileo's Fall",
            "The Doppler Effect",
        ],
        "correct_answer": 1,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Panthéon",
        "monument_id": "69813295820ded6f97ac3f67",
        "question": "The Panthéon was originally built as a church dedicated to which saint?",
        "options": [
            "Saint Denis",
            "Saint Germain",
            "Saint Genevieve",
            "Saint Eustache",
        ],
        "correct_answer": 2,
        "xp_reward": 500,
        "difficulty": "HARD",
    },
    {
        "monument_name": "Les Invalides",
        "monument_id": "69813295820ded6f97ac3f68",
        "question": "Which famous French leader's tomb is located under the golden dome of Les Invalides?",
        "options": [
            "Louis XIV",
            "Charles de Gaulle",
            "Napoleon Bonaparte",
            "Charlemagne",
        ],
        "correct_answer": 2,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Les Invalides",
        "monument_id": "69813295820ded6f97ac3f68",
        "question": "What was the original purpose of Les Invalides when it was built by Louis XIV?",
        "options": [
            "A royal palace",
            "A hospital and home for aged/unwell soldiers",
            "A prison",
            "A parliament building",
        ],
        "correct_answer": 1,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Les Invalides",
        "monument_id": "69813295820ded6f97ac3f68",
        "question": "Les Invalides houses the largest collection of its kind in France. What is it?",
        "options": [
            "Coins",
            "Military history/Army Museum",
            "Religious relics",
            "Medical instruments",
        ],
        "correct_answer": 1,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Les Invalides",
        "monument_id": "69813295820ded6f97ac3f68",
        "question": "Napoleon's tomb is made of which material?",
        "options": ["White Marble", "Gold Leaf", "Red Quartzite", "Green Basalt"],
        "correct_answer": 2,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Les Invalides",
        "monument_id": "69813295820ded6f97ac3f68",
        "question": "Who was the architect of the Eglise du Dôme (The Dome Chapel)?",
        "options": [
            "Jules Hardouin-Mansart",
            "André Le Nôtre",
            "Claude Perrault",
            "Viollet-le-Duc",
        ],
        "correct_answer": 0,
        "xp_reward": 500,
        "difficulty": "HARD",
    },
    {
        "monument_name": "Luxembourg Palace",
        "monument_id": "69813295820ded6f97ac3f69",
        "question": "Which branch of the French government currently meets in the Luxembourg Palace?",
        "options": [
            "National Assembly",
            "The Senate",
            "The Supreme Court",
            "The Presidency",
        ],
        "correct_answer": 1,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Luxembourg Palace",
        "monument_id": "69813295820ded6f97ac3f69",
        "question": "For whom was the palace originally built in the early 17th century?",
        "options": [
            "Marie de' Medici",
            "Catherine de' Medici",
            "Anne of Austria",
            "Marie Antoinette",
        ],
        "correct_answer": 0,
        "xp_reward": 100,
        "difficulty": "EASY",
    },
    {
        "monument_name": "Luxembourg Palace",
        "monument_id": "69813295820ded6f97ac3f69",
        "question": "The design of the palace was intended to mimic which palace in Florence?",
        "options": ["Palazzo Vecchio", "Pitti Palace", "Uffizi", "Palazzo Strozzi"],
        "correct_answer": 1,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Luxembourg Palace",
        "monument_id": "69813295820ded6f97ac3f69",
        "question": "What was the palace used for during the French Revolution?",
        "options": ["A museum", "A prison", "A granary", "A stable"],
        "correct_answer": 1,
        "xp_reward": 200,
        "difficulty": "MEDIUM",
    },
    {
        "monument_name": "Luxembourg Palace",
        "monument_id": "69813295820ded6f97ac3f69",
        "question": "Who was the primary architect of the Luxembourg Palace?",
        "options": [
            "Salomon de Brosse",
            "François Mansart",
            "Louis Le Vau",
            "Jean Chalgrin",
        ],
        "correct_answer": 0,
        "xp_reward": 500,
        "difficulty": "HARD",
    },
]


# Initialize Beanie
async def init():
    await init_db()


async def seed_quizzes():
    await init()

    print("Clearing existing quizzes...")
    # NOTE: In production, we might want to be more selective, but for seeding fresh, this is fine.
    await Quiz.delete_all()

    print(f"Seeding {len(QUIZ_DATA)} quizzes...")

    count = 0
    for item in QUIZ_DATA:
        quiz = Quiz(
            monument_id=item["monument_id"],
            question=item["question"],
            options=item["options"],
            correct_answer=item["correct_answer"],
            xp_reward=item["xp_reward"],
            difficulty=QuizDifficulty(item["difficulty"]),
        )
        await quiz.insert()
        count += 1

    print(f"Successfully seeded {count} quizzes for {count // 5} monuments.")


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(seed_quizzes())
