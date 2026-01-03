import os
import json
import re
from typing import Dict, Any, Tuple
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY", "")
if GOOGLE_AI_API_KEY:
    genai.configure(api_key=GOOGLE_AI_API_KEY)

class AIService:
    @staticmethod
    def classify_grievance(title: str, description: str) -> Dict[str, Any]:
        """
        Use Gemini AI to classify grievance, detect spam, and calculate severity.
        """
        if not GOOGLE_AI_API_KEY:
            # Fallback to mock logic if API key not configured
            return AIService._mock_classify(title, description)
        
        try:
            model = genai.GenerativeModel('gemini-pro')
            
            prompt = f"""Analyze the following grievance report and provide a JSON response with:
1. category: One of ["Sanitation", "Roads", "Water Supply", "Electricity", "Law & Order", "Other"]
2. severity_score: A float between 0.0 and 1.0 (0.9+ for critical/urgent, 0.6-0.8 for high priority, 0.3-0.5 for medium, below 0.3 for low)
3. is_spam: boolean indicating if this is spam or a test
4. summary: A brief 100-character summary

Title: {title}
Description: {description}

Return only valid JSON in this format:
{{"category": "...", "severity_score": 0.0-1.0, "is_spam": true/false, "summary": "..."}}"""
            
            response = model.generate_content(prompt)
            
            # Parse JSON response
            # Extract JSON from response
            text = response.text.strip()
            json_match = re.search(r'\{[^}]*\}', text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                # Fallback if JSON parsing fails
                return AIService._mock_classify(title, description)
            
            # Validate and return
            return {
                "category": result.get("category", "Other"),
                "severity_score": float(result.get("severity_score", 0.3)),
                "is_spam": bool(result.get("is_spam", False)),
                "summary": result.get("summary", description[:100] + "..." if len(description) > 100 else description)
            }
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            # Fallback to mock logic on error
            return AIService._mock_classify(title, description)
    
    @staticmethod
    def _mock_classify(title: str, description: str) -> Dict[str, Any]:
        """Fallback mock classification logic"""
        text = (title + " " + description).lower()
        
        categories = ["Sanitation", "Roads", "Water Supply", "Electricity", "Law & Order", "Other"]
        category = "Other"
        for cat in categories:
            if cat.lower() in text:
                category = cat
                break
        
        severity_score = 0.3
        if "urgent" in text or "danger" in text or "accident" in text:
            severity_score = 0.9
        elif "broken" in text or "leak" in text:
            severity_score = 0.6
            
        is_spam = False
        if "test" in text or len(text) < 5:
            is_spam = True
            
        return {
            "category": category,
            "severity_score": severity_score,
            "is_spam": is_spam,
            "summary": description[:100] + "..." if len(description) > 100 else description
        }

    @staticmethod
    def suggest_department(category: str) -> str:
        """
        Maps category to department code.
        """
        mapping = {
            "Sanitation": "DEPT-SAN",
            "Roads": "DEPT-PWD",
            "Water Supply": "DEPT-WAT",
            "Electricity": "DEPT-PWR",
            "Law & Order": "DEPT-POL"
        }
        return mapping.get(category, "DEPT-GEN")
