"""
AI Assistant API Routes
Handles AI chat and assistance features
"""

from fastapi import APIRouter, HTTPException, Depends, status
from app.models import ChatRequest, ChatResponse
from app.services.ai_assistant import ai_assistant
from app.auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    chat_request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Chat with AI assistant
    Provides technical help, code snippets, and learning guidance
    """
    try:
        # Convert Pydantic models to dicts
        messages = [msg.model_dump() for msg in chat_request.messages]
        
        # Add user context
        context = chat_request.context or {}
        context["user_id"] = current_user["id"]
        context["user_name"] = current_user.get("name", "User")
        
        # Get AI response
        response = await ai_assistant.chat_completion(messages, context)
        
        return ChatResponse(response=response)
    
    except Exception as e:
        logger.error(f"Error in AI chat: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get AI response: {str(e)}")
