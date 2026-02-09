import logging
from typing import Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.chat_agent import ChatService

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Schemas ---


class CreateSessionRequest(BaseModel):
    user_id: str
    session_id: Optional[str] = (
        None  # Client can provide ID or we generate (ADK handles)
    )


class SessionResponse(BaseModel):
    session_id: str
    status: str


class ChatMessageRequest(BaseModel):
    message: str
    location: Optional[Dict[str, float]] = None  # {lat, lon, radius}
    user_id: str = "user"


class ChatMessageResponse(BaseModel):
    response: str


# --- Endpoints ---


@router.post("/sessions", response_model=SessionResponse)
async def create_session(request: CreateSessionRequest):
    """
    Initialize a new chat session.
    """
    try:
        # If session_id not provided, we might iterate/generate one,
        # but for now we rely on client or basic string.
        # If client sends session_id, we use it.
        session_id = request.session_id or f"session_{request.user_id}_{id(request)}"

        await ChatService.create_session(user_id=request.user_id, session_id=session_id)
        return SessionResponse(session_id=session_id, status="created")
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(session_id: str, request: ChatMessageRequest):
    """
    Send a message to the agent and get the response.
    """
    try:
        # Contextual info (location) could be injected into the prompt
        # or passed via side-channels if ADK supports context.
        # For now, we append it to the message if present.

        full_message = request.message
        if request.location:
            full_message += f"\n\n[System Context: User Location: {request.location}]"

        # TODO: Handle async/blocking nature of ADK runner
        # Assuming run_in_threadpool logic or that ADK calls are fast enough/async handled internally
        response_text = await ChatService.send_message(
            session_id=session_id, user_text=full_message, user_id=request.user_id
        )

        return ChatMessageResponse(response=response_text)
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail=str(e))
