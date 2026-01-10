"""
Skills API Routes
Handles skill creation, updates, and retrieval with embedding generation
"""

from fastapi import APIRouter, HTTPException, Depends, status
from app.models import SkillCreate, SkillUpdate, SkillResponse
from app.database import db
from app.services.embeddings import embeddings_service
from app.auth import get_current_user
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/skills", tags=["skills"])


@router.get("/", response_model=List[SkillResponse])
async def get_user_skills(
    mode: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get current user's skills, optionally filtered by mode (TEACH/LEARN)"""
    skills = await db.get_user_skills(current_user["id"], mode=mode)
    return skills


@router.post("/", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
async def create_skill(
    skill_data: SkillCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new skill with automatic embedding generation"""
    try:
        # Prepare skill data
        skill_dict = skill_data.model_dump()
        skill_dict["user_id"] = current_user["id"]
        
        # Convert availability to JSON format
        skill_dict["availability"] = [slot.model_dump() for slot in skill_data.availability]
        
        # Generate canonical text and embedding
        canonical_text, embedding = embeddings_service.generate_skill_embedding(skill_dict)
        skill_dict["canonical_text"] = canonical_text
        skill_dict["embedding"] = embedding
        
        # Create skill in database
        skill = await db.create_skill(skill_dict)
        if not skill:
            raise HTTPException(status_code=500, detail="Failed to create skill")
        
        logger.info(f"Created skill {skill['id']} for user {current_user['id']}")
        return skill
    
    except Exception as e:
        logger.error(f"Error creating skill: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create skill: {str(e)}")


@router.patch("/{skill_id}", response_model=SkillResponse)
async def update_skill(
    skill_id: str,
    skill_data: SkillUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update skill (regenerates embedding if name or level changed)"""
    try:
        # Get existing skill to verify ownership
        existing_skills = await db.get_user_skills(current_user["id"])
        existing_skill = next((s for s in existing_skills if s["id"] == skill_id), None)
        
        if not existing_skill:
            raise HTTPException(status_code=404, detail="Skill not found")
        
        # Filter out None values
        update_data = {k: v for k, v in skill_data.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        # If name or level changed, regenerate embedding
        if "name" in update_data or "level" in update_data:
            # Merge with existing data
            updated_skill_data = {**existing_skill, **update_data}
            
            # Regenerate embedding
            canonical_text, embedding = embeddings_service.generate_skill_embedding(updated_skill_data)
            update_data["canonical_text"] = canonical_text
            update_data["embedding"] = embedding
        
        # Update skill
        skill = await db.update_skill(skill_id, update_data)
        if not skill:
            raise HTTPException(status_code=500, detail="Failed to update skill")
        
        return skill
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating skill {skill_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update skill: {str(e)}")


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(
    skill_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete skill"""
    success = await db.delete_skill(skill_id, current_user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Skill not found or unauthorized")
    
    return None
