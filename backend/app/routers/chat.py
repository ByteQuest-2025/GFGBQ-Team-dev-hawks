from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import google.generativeai as genai
import os
from dotenv import load_dotenv
from .. import database, auth, models

load_dotenv()

router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

# Configure Gemini API
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY", "")
if GOOGLE_AI_API_KEY:
    genai.configure(api_key=GOOGLE_AI_API_KEY)

class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

@router.post("/", response_model=ChatResponse)
async def chat(
    chat_message: ChatMessage,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Chat endpoint for citizen portal chatbot using Gemini AI.
    Provides assistance with grievance submission, tracking, and general queries.
    """
    if not GOOGLE_AI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please contact administrator."
        )
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        # System context for the chatbot
        system_prompt = """You are a helpful assistant for a civic grievance redressal system called CivicPulse. 
Your role is to help citizens:
1. Understand how to submit grievances
2. Check the status of their grievances
3. Get information about the system
4. Answer general questions about civic services

Be friendly, concise, and helpful. If asked about specific grievances, guide them to check their dashboard.
Keep responses under 200 words. If you don't know something, admit it and suggest contacting support."""
        
        user_message = chat_message.message
        
        # Create conversation context
        full_prompt = f"{system_prompt}\n\nUser: {user_message}\nAssistant:"
        
        response = model.generate_content(full_prompt)
        
        return ChatResponse(
            response=response.text.strip(),
            conversation_id=chat_message.conversation_id or "default"
        )
        
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response: {str(e)}"
        )

