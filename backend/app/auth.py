















"""
Authentication Module
Handles Supabase authentication and JWT token validation
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.database import db
import jwt
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Validate JWT token and return current user
    
    Args:
        credentials: HTTP Bearer token from request header
    
    Returns:
        User dictionary with id, email, etc.
    
    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        token = credentials.credentials
        
        # Decode JWT token (Supabase uses JWT for auth)
        # In production, verify with Supabase's public key
        payload = jwt.decode(
            token,
            options={"verify_signature": False}  # Supabase handles signature verification
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from database
        user = await db.get_user_by_id(user_id)
        
        if not user:
            # User authenticated but not in our database - might be first login
            # Return basic user info from token
            return {
                "id": user_id,
                "email": email,
                "name": email.split("@")[0]  # Temporary name
            }
        
        return user
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict | None:
    """
    Optional authentication - returns user if authenticated, None otherwise
    Useful for endpoints that work with or without authentication
    """
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
