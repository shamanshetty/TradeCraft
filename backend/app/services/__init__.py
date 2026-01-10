# Backend Services __init__.py
from app.services.embeddings import embeddings_service
from app.services.matching import matching_service
from app.services.ai_assistant import ai_assistant

__all__ = ['embeddings_service', 'matching_service', 'ai_assistant']
