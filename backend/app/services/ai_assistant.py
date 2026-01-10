"""
AI Assistant Service
Provides GPT-4 powered assistance with moderation and safety
"""

from openai import OpenAI
from app.config import settings
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class AIAssistantService:
    """Service for AI-powered assistance and explanations"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.max_code_lines = settings.max_code_lines
        self.max_explanation_length = settings.max_explanation_length
    
    async def moderate_content(self, text: str) -> Dict[str, Any]:
        """
        Moderate content using OpenAI moderation API
        
        Args:
            text: Content to moderate
        
        Returns:
            Moderation result with flagged status
        """
        try:
            response = self.client.moderations.create(input=text)
            result = response.results[0]
            
            return {
                "flagged": result.flagged,
                "categories": result.categories.model_dump() if result.flagged else {}
            }
        except Exception as e:
            logger.error(f"Error moderating content: {e}")
            # Fail safe: flag as potentially unsafe
            return {"flagged": True, "categories": {"error": True}}
    
    async def generate_match_explanation(
        self,
        user1_name: str,
        user2_name: str,
        skill1_teach: str,
        skill1_learn: str,
        skill2_teach: str,
        skill2_learn: str,
        scores: Dict[str, float]
    ) -> str:
        """
        Generate human-readable explanation for why a match works
        
        Args:
            user1_name: First user's name
            user2_name: Second user's name
            skill1_teach: What user1 teaches
            skill1_learn: What user1 wants to learn
            skill2_teach: What user2 teaches
            skill2_learn: What user2 wants to learn
            scores: Match score breakdown
        
        Returns:
            Natural language explanation (2-3 sentences)
        """
        try:
            prompt = f"""Generate a concise, friendly explanation (2-3 sentences) for why these two users are a good match for skill exchange:

User 1 ({user1_name}):
- Teaches: {skill1_teach}
- Wants to learn: {skill1_learn}

User 2 ({user2_name}):
- Teaches: {skill2_teach}
- Wants to learn: {skill2_learn}

Match Scores:
- Semantic similarity: {scores.get('semantic_score', 0):.2f}
- Reciprocity: {scores.get('reciprocity_score', 0):.2f}
- Availability overlap: {scores.get('availability_score', 0):.2f}

Focus on:
1. How their skills complement each other
2. Why the skill levels are compatible
3. Any schedule alignment

Keep it under {self.max_explanation_length} characters. Be specific and encouraging."""

            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that explains skill matches clearly and concisely."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )
            
            explanation = response.choices[0].message.content.strip()
            
            # Truncate if too long
            if len(explanation) > self.max_explanation_length:
                explanation = explanation[:self.max_explanation_length - 3] + "..."
            
            return explanation
        
        except Exception as e:
            logger.error(f"Error generating match explanation: {e}")
            # Fallback explanation
            return f"{user2_name} teaches {skill2_teach} which matches what you want to learn. You teach {skill1_teach} which they want to learn. This creates a balanced skill exchange."
    
    async def generate_session_agenda(
        self,
        teacher_name: str,
        learner_name: str,
        skill_name: str,
        skill_level: int,
        duration_minutes: int
    ) -> str:
        """
        Generate structured session agenda
        
        Args:
            teacher_name: Name of teacher
            learner_name: Name of learner
            skill_name: Skill being taught
            skill_level: Learner's current level (1-5)
            duration_minutes: Session duration (30, 45, or 60)
        
        Returns:
            Structured agenda as markdown
        """
        try:
            level_desc = ["beginner", "elementary", "intermediate", "advanced", "expert"][skill_level - 1]
            
            prompt = f"""Create a structured learning session agenda for:

Teacher: {teacher_name}
Learner: {learner_name}
Skill: {skill_name}
Learner's Level: {level_desc} ({skill_level}/5)
Duration: {duration_minutes} minutes

Format the agenda as a numbered list with time allocations. Include:
1. Introduction & setup
2. Core teaching segments (hands-on if applicable)
3. Q&A
4. Next steps

Make it practical and actionable. Total time must equal {duration_minutes} minutes."""

            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert at designing effective learning sessions."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.7
            )
            
            agenda = response.choices[0].message.content.strip()
            return agenda
        
        except Exception as e:
            logger.error(f"Error generating session agenda: {e}")
            # Fallback agenda
            return f"""Session: {teacher_name} teaches {skill_name} to {learner_name} ({duration_minutes} min)

1. Introduction & Setup (5 min)
2. Core Concepts ({duration_minutes - 15} min)
3. Hands-on Practice ({duration_minutes // 3} min)
4. Q&A & Next Steps (5 min)"""
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate AI assistant response
        
        Args:
            messages: Conversation history
            context: Optional context (user info, current match, etc.)
        
        Returns:
            Assistant response with safety disclaimers
        """
        try:
            # Moderate user input
            last_message = messages[-1]["content"]
            moderation = await self.moderate_content(last_message)
            
            if moderation["flagged"]:
                return "I'm sorry, but I can't respond to that request. Please ask about technical topics, learning strategies, or session planning."
            
            # Build system prompt
            system_prompt = """You are a helpful technical assistant for TradeCraft, a skill exchange platform.

Your role:
- Answer concise technical questions
- Explain concepts clearly
- Provide code snippets (max 20 lines)
- Help with debugging hints
- Suggest learning strategies
- Assist with session planning

Constraints:
- Keep responses under 300 words
- For code: max 20 lines, always include disclaimer
- No medical, legal, or financial advice
- No sensitive or harmful content
- Focus on technical skills and learning

Code disclaimer template:
"⚠️ Example only — test in your environment before use."
"""
            
            # Add context if available
            if context:
                system_prompt += f"\n\nContext: {context}"
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    *messages
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            assistant_response = response.choices[0].message.content.strip()
            
            # Add disclaimer if code is present
            if "```" in assistant_response or "def " in assistant_response or "function " in assistant_response:
                if "⚠️" not in assistant_response:
                    assistant_response += "\n\n⚠️ Example only — test in your environment before use."
            
            return assistant_response
        
        except Exception as e:
            logger.error(f"Error in chat completion: {e}")
            return "I'm having trouble processing your request right now. Please try again or rephrase your question."


# Global AI assistant service instance
ai_assistant = AIAssistantService()
