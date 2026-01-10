"""
Messages API Routes
Handles messaging between matched users
"""

from fastapi import APIRouter, HTTPException, Depends, status
from app.models import MessageCreate, MessageResponse
from app.database import db
from app.auth import get_current_user
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.get("/match/{match_id}", response_model=List[MessageResponse])
async def get_match_messages(
    match_id: str,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    """Get all messages for a match"""
    # Verify user is part of this match
    matches = await db.get_user_matches(current_user["id"])
    match = next((m for m in matches if m["id"] == match_id), None)
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    messages = await db.get_match_messages(match_id, limit=limit)
    
    # Mark messages as read
    await db.mark_messages_read(match_id, current_user["id"])
    
    return messages


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Send a message in a match"""
    # Verify user is part of this match
    matches = await db.get_user_matches(current_user["id"])
    match = next((m for m in matches if m["id"] == message_data.match_id), None)
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Create message
    message_dict = {
        **message_data.model_dump(),
        "sender_id": current_user["id"]
    }
    
    message = await db.create_message(message_dict)
    if not message:
        raise HTTPException(status_code=500, detail="Failed to send message")
    
    return message
