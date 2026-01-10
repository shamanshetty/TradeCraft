"""
TradeCraft Backend Configuration
Loads environment variables and provides application settings
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: str
    
    # OpenRouter (for embeddings)
    openrouter_api_key: str
    
    # OpenAI (for GPT-4)
    openai_api_key: str
    
    # Application
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    cors_origins: str = "http://localhost:3000"
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60
    
    # Matching Algorithm Weights
    weight_semantic: float = 0.50
    weight_reciprocity: float = 0.25
    weight_availability: float = 0.15
    weight_preference: float = 0.10
    
    # AI Configuration
    max_code_lines: int = 20
    max_explanation_length: int = 1000
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dimension: int = 384
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
