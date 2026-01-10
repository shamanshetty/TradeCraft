"""
Sessions API Routes
Handles session scheduling and management
"""

from fastapi import APIRouter, HTTPException, Depends, status
from app.models import SessionCreate, SessionUpdate, SessionResponse
from app.database import db
from app.services.ai_assistant import ai_assistant
from app.auth import get_current_user
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("/match/{match_id}", response_model=List[SessionResponse])
async def get_match_sessions(
    match_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all sessions for a match"""
    # Verify user is part of this match
    matches = await db.get_user_matches(current_user["id"])
    match = next((m for m in matches if m["id"] == match_id), None)
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    sessions = await db.get_match_sessions(match_id)
    return sessions


@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session_data: SessionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new session"""
    # Verify user is part of this match
    matches = await db.get_user_matches(current_user["id"])
    match = next((m for m in matches if m["id"] == session_data.match_id), None)
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Create session
    session = await db.create_session(session_data.model_dump())
    if not session:
        raise HTTPException(status_code=500, detail="Failed to create session")
    
    return session


@router.patch("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str,
    session_data: SessionUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update session"""
    # TODO: Verify user has access to this session
    
    # Filter out None values
    update_data = {k: v for k, v in session_data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    session = await db.update_session(session_id, update_data)
    if not session:
        raise HTTPException(status_code=500, detail="Failed to update session")
    
    return session


@router.post("/generate-agenda", response_model=dict)
async def generate_session_agenda(
    match_id: str,
    duration_minutes: int,
    current_user: dict = Depends(get_current_user)
):
    """Generate AI-powered session agenda for a match"""
    try:
        # Verify user is part of this match
        matches = await db.get_user_matches(current_user["id"])
        match = next((m for m in matches if m["id"] == match_id), None)
        
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Determine who is teaching what
        # Assuming user1 teaches skill1 to user2, and user2 teaches skill2 to user1
        user1 = match.get("user1", {})
        user2 = match.get("user2", {})
        skill1 = match.get("skill1", {})
        skill2 = match.get("skill2", {})
        
        # Generate agenda for both directions
        agenda1 = await ai_assistant.generate_session_agenda(
            teacher_name=user1.get("name", "Teacher"),
            learner_name=user2.get("name", "Learner"),
            skill_name=skill1.get("name", "Skill"),
            skill_level=skill1.get("level", 3),
            duration_minutes=duration_minutes
        )
        
        agenda2 = await ai_assistant.generate_session_agenda(
            teacher_name=user2.get("name", "Teacher"),
            learner_name=user1.get("name", "Learner"),
            skill_name=skill2.get("name", "Skill"),
            skill_level=skill2.get("level", 3),
            duration_minutes=duration_minutes
        )
        
        return {
            "match_id": match_id,
            "duration_minutes": duration_minutes,
            "agendas": {
                f"{user1.get('name')} teaches {skill1.get('name')}": agenda1,
                f"{user2.get('name')} teaches {skill2.get('name')}": agenda2
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating agenda: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate agenda: {str(e)}")
