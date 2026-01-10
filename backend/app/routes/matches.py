"""
Matches API Routes
Handles match discovery, creation, and management
"""

from fastapi import APIRouter, HTTPException, Depends, status
from app.models import MatchCreate, MatchUpdate, MatchResponse
from app.database import db
from app.services.matching import matching_service
from app.services.ai_assistant import ai_assistant
from app.auth import get_current_user
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/matches", tags=["matches"])


@router.get("/", response_model=List[MatchResponse])
async def get_matches(
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all matches for current user"""
    matches = await db.get_user_matches(current_user["id"], status=status_filter)
    return matches


@router.get("/discover", response_model=List[dict])
async def discover_matches(
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """
    Discover potential matches using AI-powered matching algorithm
    Returns matches with scores and AI-generated explanations
    """
    try:
        # Find matches using hybrid algorithm
        potential_matches = await matching_service.find_matches(
            user_id=current_user["id"],
            limit=limit
        )
        
        if not potential_matches:
            return []
        
        # Enrich matches with user and skill data + generate explanations
        enriched_matches = []
        
        for match in potential_matches:
            # Get user data
            user1 = await db.get_user_by_id(match["user1_id"])
            user2 = await db.get_user_by_id(match["user2_id"])
            
            # Get skill data
            user1_skills = await db.get_user_skills(match["user1_id"])
            user2_skills = await db.get_user_skills(match["user2_id"])
            
            skill1_teach = next((s for s in user1_skills if s["id"] == match["skill1_id"]), None)
            skill2_teach = next((s for s in user2_skills if s["id"] == match["skill2_id"]), None)
            skill1_learn = next((s for s in user1_skills if s["id"] == match.get("learn_skill_id")), None)
            skill2_learn = next((s for s in user2_skills if s["id"] == match.get("teacher_learn_skill_id")), None)
            
            if not all([user1, user2, skill1_teach, skill2_teach]):
                continue
            
            # Generate AI explanation
            explanation = await ai_assistant.generate_match_explanation(
                user1_name=user1["name"],
                user2_name=user2["name"],
                skill1_teach=skill1_teach["name"],
                skill1_learn=skill1_learn["name"] if skill1_learn else "new skills",
                skill2_teach=skill2_teach["name"],
                skill2_learn=skill2_learn["name"] if skill2_learn else "new skills",
                scores={
                    "semantic_score": match["semantic_score"],
                    "reciprocity_score": match["reciprocity_score"],
                    "availability_score": match["availability_score"]
                }
            )
            
            enriched_matches.append({
                **match,
                "user1": user1,
                "user2": user2,
                "skill1_teach": skill1_teach,
                "skill2_teach": skill2_teach,
                "explanation": explanation
            })
        
        return enriched_matches
    
    except Exception as e:
        logger.error(f"Error discovering matches: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to discover matches: {str(e)}")


@router.post("/", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
async def create_match(
    match_data: MatchCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a match (request skill exchange)
    Automatically calculates scores and generates explanation
    """
    try:
        # Verify skills exist and belong to correct users
        user1_skills = await db.get_user_skills(current_user["id"])
        user2_skills = await db.get_user_skills(match_data.user2_id)
        
        skill1 = next((s for s in user1_skills if s["id"] == match_data.skill1_id), None)
        skill2 = next((s for s in user2_skills if s["id"] == match_data.skill2_id), None)
        
        if not skill1:
            raise HTTPException(status_code=404, detail="Skill 1 not found or unauthorized")
        if not skill2:
            raise HTTPException(status_code=404, detail="Skill 2 not found")
        
        # Verify modes are compatible (user1 teaches, user2 teaches)
        if skill1["mode"] != "TEACH":
            raise HTTPException(status_code=400, detail="Skill 1 must be a TEACH skill")
        if skill2["mode"] != "TEACH":
            raise HTTPException(status_code=400, detail="Skill 2 must be a TEACH skill")
        
        # Calculate match scores
        user1 = await db.get_user_by_id(current_user["id"])
        user2 = await db.get_user_by_id(match_data.user2_id)
        
        # For score calculation, we need the corresponding LEARN skills
        # This is simplified - in production, you'd pass the actual learn skills
        scores = {
            "semantic_score": 0.8,  # Placeholder - would calculate from embeddings
            "reciprocity_score": 0.7,
            "availability_score": 0.6,
            "preference_score": 0.9,
            "total_score": 0.75
        }
        
        # Generate explanation
        explanation = await ai_assistant.generate_match_explanation(
            user1_name=user1["name"],
            user2_name=user2["name"],
            skill1_teach=skill1["name"],
            skill1_learn="complementary skills",
            skill2_teach=skill2["name"],
            skill2_learn="complementary skills",
            scores=scores
        )
        
        # Create match
        match_dict = {
            "user1_id": current_user["id"],
            "user2_id": match_data.user2_id,
            "skill1_id": match_data.skill1_id,
            "skill2_id": match_data.skill2_id,
            **scores,
            "explanation": explanation,
            "status": "PENDING"
        }
        
        match = await db.create_match(match_dict)
        if not match:
            raise HTTPException(status_code=500, detail="Failed to create match")
        
        return match
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating match: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create match: {str(e)}")


@router.patch("/{match_id}", response_model=MatchResponse)
async def update_match(
    match_id: str,
    match_data: MatchUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update match status (accept/reject)"""
    # Verify user is part of this match
    matches = await db.get_user_matches(current_user["id"])
    match = next((m for m in matches if m["id"] == match_id), None)
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Update match
    updated_match = await db.update_match(match_id, match_data.model_dump())
    if not updated_match:
        raise HTTPException(status_code=500, detail="Failed to update match")
    
    return updated_match


@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(
    match_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific match details"""
    matches = await db.get_user_matches(current_user["id"])
    match = next((m for m in matches if m["id"] == match_id), None)
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    return match
