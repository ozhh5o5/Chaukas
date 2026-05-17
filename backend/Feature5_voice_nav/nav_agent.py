import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Robust Environment Loading
try:
    env_path = Path(__file__).resolve().parent.parent / '.env'
    load_dotenv(dotenv_path=env_path, override=True)
except Exception as e:
    print(f"Voice Agent Env Load Error: {e}")

GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")

# Note: Removed deprecated google.generativeai package
# Using enhanced fallback system instead
print("INFO: Voice navigation using rule-based processing (Gemini package deprecated)")

SYSTEM_PROMPT = """
You are a voice navigation assistant for Chaukas, a road safety command platform.

Available Routes:
- "/" - Main dashboard with map view
- "/analytics" - Analytics and statistics page
- "/emergency" - Emergency contacts and SOS page
- "/news" - News and updates page
- "/risk-assessment" - Risk assessment page
- "/escalation" - Escalation management page

Emergency Actions:
- "call_ambulance" - Call ambulance service (108)
- "call_fire" - Call fire brigade (101)
- "call_police" - Call police (100)

Navigation Commands Examples:
- "navigate to analytics" → /analytics
- "go to dashboard" → /
- "open emergency page" → /emergency
- "show me news" → /news
- "risk assessment" → /risk-assessment
- "escalation page" → /escalation

Emergency Commands Examples:
- "call ambulance" → call_ambulance
- "call an ambulance" → call_ambulance
- "fire emergency" → call_fire
- "call fire brigade" → call_fire
- "police help" → call_police
- "call police" → call_police

Always respond with JSON in this format:
{
  "intent": "navigate|emergency|error",
  "action": "navigation|emergency_call|unknown",
  "target": "/route or emergency_service",
  "confirmation_message": "What to say to user",
  "service_type": "ambulance|fire|police" (only for emergency calls)
}
"""

def enhanced_keyword_fallback(text: str):
    """
    Enhanced fallback logic with emergency call support.
    """
    text = text.lower().strip()
    
    # Emergency call patterns
    emergency_patterns = {
        'ambulance': ['ambulance', 'medical', 'hospital', 'doctor', 'injured', 'hurt', 'sick'],
        'fire': ['fire', 'burning', 'smoke', 'flame', 'fire brigade'],
        'police': ['police', 'cop', 'security', 'theft', 'crime', 'help']
    }
    
    # Check for emergency calls first
    for service, keywords in emergency_patterns.items():
        for keyword in keywords:
            if keyword in text and ('call' in text or 'emergency' in text or 'help' in text):
                return {
                    "intent": "emergency",
                    "action": "emergency_call",
                    "target": f"call_{service}",
                    "confirmation_message": f"Calling {service} emergency service immediately.",
                    "service_type": service
                }
    
    # Navigation patterns
    navigation_patterns = {
        '/analytics': ['analytics', 'stats', 'data', 'statistics', 'analysis'],
        '/emergency': ['emergency', 'sos', 'contacts', 'emergency contacts'],
        '/news': ['news', 'updates', 'information', 'reports'],
        '/risk-assessment': ['risk', 'assessment', 'evaluate', 'analyze risk'],
        '/escalation': ['escalation', 'escalate', 'management'],
        '/': ['dashboard', 'home', 'main', 'map', 'overview']
    }
    
    # Check navigation commands
    for route, keywords in navigation_patterns.items():
        for keyword in keywords:
            if keyword in text and ('navigate' in text or 'go' in text or 'open' in text or 'show' in text):
                page_name = route.replace('/', '').replace('-', ' ').title() or 'Dashboard'
                return {
                    "intent": "navigate",
                    "action": "navigation",
                    "target": route,
                    "confirmation_message": f"Opening {page_name}."
                }
    
    # Direct page mentions without explicit navigation words
    for route, keywords in navigation_patterns.items():
        for keyword in keywords:
            if keyword in text:
                page_name = route.replace('/', '').replace('-', ' ').title() or 'Dashboard'
                return {
                    "intent": "navigate",
                    "action": "navigation", 
                    "target": route,
                    "confirmation_message": f"Going to {page_name}."
                }
    
    return {
        "intent": "error",
        "action": "unknown",
        "target": None,
        "confirmation_message": "I didn't understand that command. Try saying 'navigate to analytics' or 'call ambulance'."
    }

async def process_voice_command(command_text: str):
    """
    Enhanced voice command processing with emergency call support.
    Uses rule-based processing for reliability.
    """
    if not command_text or not command_text.strip():
        return {
            "intent": "error",
            "action": "unknown", 
            "target": None,
            "confirmation_message": "No command received. Please try again."
        }
    
    # Use enhanced fallback for all processing
    result = enhanced_keyword_fallback(command_text)
    print(f"DEBUG_VOICE: Rule-based processing - '{command_text}' -> {result}")
    return result
