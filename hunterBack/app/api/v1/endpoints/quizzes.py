import random
from typing import Any, List, Optional

from beanie import PydanticObjectId
from beanie.operators import In
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api import deps
from app.models.quiz import Quiz
from app.models.user import User

router = APIRouter()


class QuizResponse(BaseModel):
    id: str
    monument_id: str
    question: str
    options: List[str]
    xp_reward: int
    difficulty: str


class AnswerSubmission(BaseModel):
    quiz_id: str
    answer_index: int


class AnswerRequest(BaseModel):
    answer_index: int


class AnswerResponse(BaseModel):
    success: bool
    message: str
    correct_answer: int
    xp_earned: int
    new_total_xp: int
    leveled_up: bool = False
    new_level: Optional[int] = None


class ValidationResult(BaseModel):
    quiz_id: str
    correct: bool
    correct_answer: int  # Reveal correct answer after submission
    xp_earned: int


class ValidationResponse(BaseModel):
    total_xp: int
    results: List[ValidationResult]
    new_user_level: int
    new_user_xp: int


@router.get("/monument/{monument_id}", response_model=List[QuizResponse])
async def get_quizzes_by_monument(monument_id: str) -> Any:
    """
    Get all quizzes associated with a monument.
    Does not return the correct answer field.
    """
    quizzes = await Quiz.find(Quiz.monument_id == monument_id).to_list()

    # Map to response model to exclude correct_answer automatically
    return [
        QuizResponse(
            id=str(q.id),
            monument_id=q.monument_id,
            question=q.question,
            options=q.options,
            xp_reward=q.xp_reward,
            difficulty=q.difficulty,
        )
        for q in quizzes
    ]


@router.get("/monument/{monument_id}/next", response_model=Optional[QuizResponse])
async def get_next_quiz(
    monument_id: str,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get a random unanswered quiz for a specific monument.
    """
    quizzes = await Quiz.find(Quiz.monument_id == monument_id).to_list()
    if not quizzes:
        return None

    # Filter out quizzes already answered by the user
    answered_ids = set(current_user.quizzes_history)

    available_quizzes = [q for q in quizzes if str(q.id) not in answered_ids]

    if not available_quizzes:
        # User has answered all quizzes for this monument.
        # Optional: Reset history for this monument? Or just return None.
        return None

    # Pick a random quiz from the available ones
    selected_quiz = random.choice(available_quizzes)

    return QuizResponse(
        id=str(selected_quiz.id),
        monument_id=selected_quiz.monument_id,
        question=selected_quiz.question,
        options=selected_quiz.options,
        xp_reward=selected_quiz.xp_reward,
        difficulty=selected_quiz.difficulty,
    )


@router.post("/{quiz_id}/answer", response_model=AnswerResponse)
async def submit_answer(
    quiz_id: str,
    request: AnswerRequest,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Submit an answer for a single quiz.
    """
    quiz = await Quiz.get(quiz_id)
    if not quiz:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Quiz not found")

    is_correct = request.answer_index == quiz.correct_answer
    xp_earned = 0

    if is_correct:
        # Check if already answered to prevent double XP exploit
        if str(quiz.id) not in current_user.quizzes_history:
            xp_earned = quiz.xp_reward
            current_user.xp += xp_earned
            current_user.quizzes_history.append(str(quiz.id))
            await current_user.save()

            # Log Activity
            # (Assuming we might want to log this to ActivityLog if it exists and is used)
            # from app.models.user_domain import ActivityLog
            # await ActivityLog(
            #     user_id=current_user.id,
            #     action="QUIZ_ANSWERED",
            #     target_id=str(quiz.id),
            #     metadata={"xp": xp_earned, "correct": True}
            # ).insert()
        else:
            # Already answered, no XP but return success
            xp_earned = 0

        # Check for level up
        from app.services.gamification_service import GamificationService

        new_level_info = await GamificationService.get_level_info(current_user.xp)
        leveled_up = new_level_info.level > current_user.level

        if leveled_up:
            current_user.level = new_level_info.level
            await current_user.save()

        return AnswerResponse(
            success=True,
            message="Correct!",
            correct_answer=quiz.correct_answer,
            xp_earned=xp_earned,
            new_total_xp=current_user.xp,
            leveled_up=leveled_up,
            new_level=current_user.level,
        )
    else:
        return AnswerResponse(
            success=False,
            message="Incorrect.",
            correct_answer=quiz.correct_answer,
            xp_earned=0,
            new_total_xp=current_user.xp,
        )


@router.post("/validate", response_model=ValidationResponse)
async def validate_quizzes(
    submissions: List[AnswerSubmission],
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Validate answers, calculate XP, and update user profile.
    """
    if not submissions:
        return ValidationResponse(
            total_xp=0,
            results=[],
            new_user_level=current_user.level,
            new_user_xp=current_user.xp,
        )

    # Fetch all relevant quizzes
    quiz_ids = [PydanticObjectId(s.quiz_id) for s in submissions]
    quizzes = await Quiz.find(In(Quiz.id, quiz_ids)).to_list()
    quiz_map = {str(q.id): q for q in quizzes}

    total_xp = 0
    results = []

    for sub in submissions:
        quiz = quiz_map.get(sub.quiz_id)
        if not quiz:
            continue

        is_correct = sub.answer_index == quiz.correct_answer
        xp = quiz.xp_reward if is_correct else 0
        total_xp += xp

        results.append(
            ValidationResult(
                quiz_id=sub.quiz_id,
                correct=is_correct,
                correct_answer=quiz.correct_answer,
                xp_earned=xp,
            )
        )

    # Apply XP to user
    xp_to_add = 0
    newly_completed_quizzes = []

    for res in results:
        if res.xp_earned > 0:
            # Check if quiz already in history
            if res.quiz_id in current_user.quizzes_history:
                # Already answered correctly before. Use a flag or set xp=0.
                # For this response "xp_earned" shows what this SPECIFIC correct answer is worth "in theory"
                # But we won't add it to the user's total.
                # Alternatively, we set xp_earned to 0 in results and add a flag 'already_completed'
                pass
            else:
                xp_to_add += res.xp_earned
                newly_completed_quizzes.append(res.quiz_id)

    if xp_to_add > 0:
        current_user.xp += xp_to_add
        current_user.quizzes_history.extend(newly_completed_quizzes)
        await current_user.save()

    return ValidationResponse(
        total_xp=xp_to_add,  # Return ACTUAL added XP
        results=results,
        new_user_level=current_user.level,
        new_user_xp=current_user.xp,
    )
