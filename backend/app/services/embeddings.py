"""
Embeddings Service
Generates vector embeddings using all-MiniLM-L6-v2 model
"""

from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import numpy as np
import logging

logger = logging.getLogger(__name__)


class EmbeddingsService:
    """Service for generating embeddings from text"""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """Initialize the embedding model"""
        try:
            self.model = SentenceTransformer(model_name)
            self.dimension = 384  # all-MiniLM-L6-v2 produces 384-dimensional embeddings
            logger.info(f"Loaded embedding model: {model_name}")
        except Exception as e:
            logger.error(f"Error loading embedding model: {e}")
            raise
    
    def canonicalize_skill(self, skill: Dict[str, Any]) -> str:
        """
        Convert skill object to canonical text representation
        
        Args:
            skill: Dictionary with keys: name, mode, level, availability
        
        Returns:
            Canonical text string for embedding generation
        
        Example:
            Input: {name: "React", mode: "TEACH", level: 5, availability: [...]}
            Output: "Teach React at advanced level (5/5); available for hands-on sessions"
        """
        name = skill.get("name", "").strip()
        mode = skill.get("mode", "TEACH").lower()
        level = skill.get("level", 3)
        
        # Map level to descriptive term
        level_map = {
            1: "beginner",
            2: "elementary",
            3: "intermediate",
            4: "advanced",
            5: "expert"
        }
        level_desc = level_map.get(level, "intermediate")
        
        # Build canonical text
        canonical = f"{mode.capitalize()} {name} at {level_desc} level ({level}/5)"
        
        # Add availability context if present
        availability = skill.get("availability", [])
        if availability and len(availability) > 0:
            canonical += "; available for practical sessions"
        
        return canonical
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector from text
        
        Args:
            text: Input text to embed
        
        Returns:
            List of floats representing the embedding vector (384 dimensions)
        """
        try:
            # Generate embedding
            embedding = self.model.encode(text, convert_to_numpy=True)
            
            # Normalize to unit length (for cosine similarity)
            embedding = embedding / np.linalg.norm(embedding)
            
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def generate_skill_embedding(self, skill: Dict[str, Any]) -> tuple[str, List[float]]:
        """
        Generate embedding for a skill object
        
        Args:
            skill: Skill dictionary
        
        Returns:
            Tuple of (canonical_text, embedding_vector)
        """
        canonical_text = self.canonicalize_skill(skill)
        embedding = self.generate_embedding(canonical_text)
        return canonical_text, embedding
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors
        
        Args:
            vec1: First vector
            vec2: Second vector
        
        Returns:
            Similarity score between 0 and 1
        """
        try:
            v1 = np.array(vec1)
            v2 = np.array(vec2)
            
            # Vectors should already be normalized, but ensure it
            v1 = v1 / np.linalg.norm(v1)
            v2 = v2 / np.linalg.norm(v2)
            
            similarity = np.dot(v1, v2)
            
            # Clamp to [0, 1] range
            return float(max(0.0, min(1.0, similarity)))
        except Exception as e:
            logger.error(f"Error calculating cosine similarity: {e}")
            return 0.0


# Global embeddings service instance
embeddings_service = EmbeddingsService()
