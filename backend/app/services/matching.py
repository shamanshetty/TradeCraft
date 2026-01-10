"""
Matching Service
Implements hybrid matching algorithm with semantic similarity, reciprocity, and availability
"""

from typing import List, Dict, Any, Optional
from app.services.embeddings import embeddings_service
from app.database import db
from app.config import settings
import logging
import json

logger = logging.getLogger(__name__)


class MatchingService:
    """Service for finding and scoring skill matches"""
    
    def __init__(self):
        self.weights = {
            "semantic": settings.weight_semantic,
            "reciprocity": settings.weight_reciprocity,
            "availability": settings.weight_availability,
            "preference": settings.weight_preference
        }
    
    async def find_matches(
        self, 
        user_id: str, 
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Find top matches for a user
        
        Args:
            user_id: User ID to find matches for
            limit: Maximum number of matches to return
        
        Returns:
            List of match dictionaries with scores and explanations
        """
        try:
            # Get user's teach and learn skills
            teach_skills = await db.get_user_skills(user_id, mode="TEACH")
            learn_skills = await db.get_user_skills(user_id, mode="LEARN")
            
            if not teach_skills or not learn_skills:
                logger.info(f"User {user_id} has no skills to match")
                return []
            
            # Get user profile for preference matching
            user = await db.get_user_by_id(user_id)
            if not user:
                return []
            
            matches = []
            
            # For each skill the user wants to learn
            for learn_skill in learn_skills:
                if not learn_skill.get("embedding"):
                    continue
                
                # Find users who teach similar skills
                similar_teach_skills = await db.find_similar_skills(
                    embedding=learn_skill["embedding"],
                    mode="TEACH",
                    limit=20,
                    exclude_user_id=user_id
                )
                
                # For each potential teacher
                for teach_skill in similar_teach_skills:
                    teacher_id = teach_skill["user_id"]
                    
                    # Get what the teacher wants to learn
                    teacher_learn_skills = await db.get_user_skills(teacher_id, mode="LEARN")
                    
                    # Check if we can teach what they want to learn
                    for teacher_learn in teacher_learn_skills:
                        if not teacher_learn.get("embedding"):
                            continue
                        
                        # Find our teach skills that match what they want
                        for our_teach in teach_skills:
                            if not our_teach.get("embedding"):
                                continue
                            
                            # Calculate match score
                            match_score = await self.calculate_match_score(
                                user1=user,
                                user2_id=teacher_id,
                                skill1_teach=our_teach,
                                skill1_learn=learn_skill,
                                skill2_teach=teach_skill,
                                skill2_learn=teacher_learn
                            )
                            
                            if match_score["total_score"] > 0.3:  # Minimum threshold
                                matches.append({
                                    "user1_id": user_id,
                                    "user2_id": teacher_id,
                                    "skill1_id": our_teach["id"],
                                    "skill2_id": teach_skill["id"],
                                    "learn_skill_id": learn_skill["id"],
                                    "teacher_learn_skill_id": teacher_learn["id"],
                                    **match_score
                                })
            
            # Sort by total score and remove duplicates
            matches.sort(key=lambda x: x["total_score"], reverse=True)
            
            # Remove duplicate user pairs
            seen_users = set()
            unique_matches = []
            for match in matches:
                user_pair = tuple(sorted([match["user1_id"], match["user2_id"]]))
                if user_pair not in seen_users:
                    seen_users.add(user_pair)
                    unique_matches.append(match)
            
            return unique_matches[:limit]
        
        except Exception as e:
            logger.error(f"Error finding matches for user {user_id}: {e}")
            return []
    
    async def calculate_match_score(
        self,
        user1: Dict[str, Any],
        user2_id: str,
        skill1_teach: Dict[str, Any],
        skill1_learn: Dict[str, Any],
        skill2_teach: Dict[str, Any],
        skill2_learn: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive match score
        
        Returns:
            Dictionary with component scores and total score
        """
        # 1. Semantic Similarity Score
        # User1 learns from User2's teach skill
        semantic_score_1 = embeddings_service.cosine_similarity(
            skill1_learn["embedding"],
            skill2_teach["embedding"]
        )
        
        # User2 learns from User1's teach skill
        semantic_score_2 = embeddings_service.cosine_similarity(
            skill2_learn["embedding"],
            skill1_teach["embedding"]
        )
        
        # Average semantic similarity
        semantic_score = (semantic_score_1 + semantic_score_2) / 2
        
        # 2. Reciprocity Score (level compatibility)
        reciprocity_score = self.calculate_reciprocity_score(
            skill1_teach["level"],
            skill1_learn["level"],
            skill2_teach["level"],
            skill2_learn["level"]
        )
        
        # 3. Availability Score
        availability_score = self.calculate_availability_score(
            skill1_teach.get("availability", []),
            skill2_teach.get("availability", [])
        )
        
        # 4. Preference Score
        user2 = await db.get_user_by_id(user2_id)
        preference_score = self.calculate_preference_score(user1, user2)
        
        # 5. Total weighted score
        total_score = (
            self.weights["semantic"] * semantic_score +
            self.weights["reciprocity"] * reciprocity_score +
            self.weights["availability"] * availability_score +
            self.weights["preference"] * preference_score
        )
        
        return {
            "semantic_score": round(semantic_score, 4),
            "reciprocity_score": round(reciprocity_score, 4),
            "availability_score": round(availability_score, 4),
            "preference_score": round(preference_score, 4),
            "total_score": round(total_score, 4)
        }
    
    def calculate_reciprocity_score(
        self,
        teach_level_1: int,
        learn_level_1: int,
        teach_level_2: int,
        learn_level_2: int
    ) -> float:
        """
        Calculate reciprocity score based on skill level compatibility
        
        Penalizes large skill gaps (e.g., expert teaching beginner with no reciprocity)
        """
        # Check if teacher's level is appropriate for learner
        gap_1 = teach_level_2 - learn_level_1  # User2 teaches User1
        gap_2 = teach_level_1 - learn_level_2  # User1 teaches User2
        
        # Ideal gap is 1-2 levels (teacher slightly ahead)
        score_1 = 1.0 if 1 <= gap_1 <= 2 else max(0, 1 - abs(gap_1 - 1.5) / 3)
        score_2 = 1.0 if 1 <= gap_2 <= 2 else max(0, 1 - abs(gap_2 - 1.5) / 3)
        
        return (score_1 + score_2) / 2
    
    def calculate_availability_score(
        self,
        availability_1: List[Dict[str, Any]],
        availability_2: List[Dict[str, Any]]
    ) -> float:
        """
        Calculate availability overlap score
        
        Expects availability as list of time slots:
        [{"day": "Monday", "time": "evening"}, ...]
        """
        if not availability_1 or not availability_2:
            return 0.5  # Neutral score if availability not specified
        
        # Convert to sets of (day, time) tuples
        slots_1 = {(slot.get("day"), slot.get("time")) for slot in availability_1}
        slots_2 = {(slot.get("day"), slot.get("time")) for slot in availability_2}
        
        # Calculate overlap
        overlap = len(slots_1 & slots_2)
        total = len(slots_1 | slots_2)
        
        if total == 0:
            return 0.5
        
        return overlap / total
    
    def calculate_preference_score(
        self,
        user1: Optional[Dict[str, Any]],
        user2: Optional[Dict[str, Any]]
    ) -> float:
        """
        Calculate preference compatibility score
        
        Currently checks language preference
        Can be extended with learning style, timezone, etc.
        """
        if not user1 or not user2:
            return 0.5
        
        score = 0.0
        
        # Language match
        if user1.get("preferred_language") == user2.get("preferred_language"):
            score += 1.0
        else:
            score += 0.3  # Partial credit for different languages
        
        return score


# Global matching service instance
matching_service = MatchingService()
