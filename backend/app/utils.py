"""
Utility Functions
Calendar export, sanitization, and other helpers
"""

from icalendar import Calendar, Event
from datetime import datetime, timedelta
from typing import Dict, Any
import re
import html


def generate_ics_file(session: Dict[str, Any], match: Dict[str, Any]) -> str:
    """
    Generate ICS calendar file content for a session
    
    Args:
        session: Session dictionary with agenda, scheduled_at, duration_minutes
        match: Match dictionary with user information
    
    Returns:
        ICS file content as string
    """
    cal = Calendar()
    cal.add('prodid', '-//TradeCraft//Skill Exchange Session//EN')
    cal.add('version', '2.0')
    
    event = Event()
    
    # Event details
    user1_name = match.get('user1', {}).get('name', 'User 1')
    user2_name = match.get('user2', {}).get('name', 'User 2')
    skill1_name = match.get('skill1', {}).get('name', 'Skill 1')
    skill2_name = match.get('skill2', {}).get('name', 'Skill 2')
    
    event.add('summary', f'TradeCraft Session: {skill1_name} ↔ {skill2_name}')
    event.add('dtstart', session['scheduled_at'])
    event.add('dtend', session['scheduled_at'] + timedelta(minutes=session['duration_minutes']))
    event.add('description', f"""TradeCraft Skill Exchange Session

Participants: {user1_name} and {user2_name}

Agenda:
{session['agenda']}

Meeting Link: {session.get('meeting_link', 'TBD')}
""")
    
    event.add('location', session.get('meeting_link', 'Online'))
    event.add('status', 'CONFIRMED')
    
    cal.add_component(event)
    
    return cal.to_ical().decode('utf-8')


def sanitize_html(text: str) -> str:
    """
    Sanitize HTML to prevent XSS attacks
    
    Args:
        text: Input text that may contain HTML
    
    Returns:
        Sanitized text with HTML entities escaped
    """
    if not text:
        return ""
    
    # Escape HTML entities
    sanitized = html.escape(text)
    
    return sanitized


def sanitize_sql(text: str) -> str:
    """
    Basic SQL injection prevention (Prisma/Supabase handles this, but extra safety)
    
    Args:
        text: Input text
    
    Returns:
        Sanitized text
    """
    if not text:
        return ""
    
    # Remove common SQL injection patterns
    dangerous_patterns = [
        r"(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b|\bEXEC\b|\bUNION\b)",
        r"(--|;|\/\*|\*\/)",
        r"(\bOR\b\s+\d+\s*=\s*\d+)",
        r"(\bAND\b\s+\d+\s*=\s*\d+)"
    ]
    
    sanitized = text
    for pattern in dangerous_patterns:
        sanitized = re.sub(pattern, "", sanitized, flags=re.IGNORECASE)
    
    return sanitized.strip()


def validate_email(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email address to validate
    
    Returns:
        True if valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def truncate_text(text: str, max_length: int, suffix: str = "...") -> str:
    """
    Truncate text to maximum length
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to add if truncated
    
    Returns:
        Truncated text
    """
    if not text or len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix
