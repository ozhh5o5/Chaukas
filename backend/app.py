from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# --- PATH CONFIGURATION ---
# Vercel and some local setups might run from root or backend/
# We ensure the 'backend' directory is in sys.path so 'Feature1' and 'Feature2_news' can be found.
current_file_path = Path(__file__).resolve()
backend_dir = current_file_path.parent
root_dir = backend_dir.parent

# Load environment variables from backend/.env early so all routers
# (including ones that don't call load_dotenv themselves) can read them.
load_dotenv(dotenv_path=backend_dir / '.env', override=True)

# Add backend_dir to sys.path if not present
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Also add root_dir just in case imports reference 'backend.FeatureX'
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

# --- IMPORTS ---
try:
    # Try importing as top-level modules (standard local python backend/app.py run)
    from Feature1.crisis_dispatch import router as crisis_router
    print("SUCCESS: Crisis Router imported successfully")
except ImportError as e:
    print(f"Warning: Direct import of Feature1 failed: {e}. Trying absolute...")
    try:
        # Try absolute import (useful if running from root like 'python -m backend.app')
        from backend.Feature1.crisis_dispatch import router as crisis_router
        print("SUCCESS: Crisis Router imported successfully (absolute)")
    except ImportError as e2:
        print(f"CRITICAL: Could not import Crisis Router. {e2}")
        crisis_router = None

try:
    from Feature2_news.news_router import router as news_router
    print("SUCCESS: News Router imported successfully")
except ImportError as e:
    print(f"Warning: Direct import of Feature2_news failed: {e}. Trying absolute...")
    try:
        from backend.Feature2_news.news_router import router as news_router
        print("SUCCESS: News Router imported successfully (absolute)")
    except ImportError as e2:
        print(f"CRITICAL: Could not import News Router. {e2}")
        news_router = None


# --- APP SETUP ---
app = FastAPI(
    title="Chaukas API",
    version="2.0.0",
    description="Backend for Chaukas: India's Intelligent Road Safety Command System"
)

from fastapi.staticfiles import StaticFiles

# CORS middleware
# Allow broad access for hackathon development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory for media
uploads_path = backend_dir / "uploads"
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# --- ROUTING ---
# Mount routers if they were successfully imported

if crisis_router:
    # Standard API prefix
    app.include_router(crisis_router, prefix="/api") 
    # Fallback for some frontend calls that might miss /api prefix or Vercel rewrites
    app.include_router(crisis_router) 
else:
    print("ERROR: Crisis Router NOT mounted.")

if news_router:
    app.include_router(news_router, prefix="/api")
    app.include_router(news_router) # Fallback
else:
    print("ERROR: News Router NOT mounted.")

# Feature 3: Emergency Broadcast
try:
    from Feature3_emergency.emergency_router import router as emergency_router
    app.include_router(emergency_router, prefix="/api")
    app.include_router(emergency_router) # Fallback
    print("SUCCESS: Emergency Router mounted")
except ImportError as e:
    print(f"FAILED to mount Emergency Router: {e}")
    try:
        from backend.Feature3_emergency.emergency_router import router as emergency_router
        app.include_router(emergency_router, prefix="/api") 
        print("SUCCESS: Emergency Router mounted (absolute)")
    except Exception as e2:
        print(f"CRITICAL: Emergency Router completely failed: {e2}")

# Feature 3: Risk Scoring
try:
    from Feature3.scoring_router import router as scoring_router
    app.include_router(scoring_router, prefix="/api")
    print("SUCCESS: Scoring Router mounted")
except ImportError as e:
    print(f"FAILED to mount Scoring Router: {e}")
    try:
        from backend.Feature3.scoring_router import router as scoring_router
        app.include_router(scoring_router, prefix="/api")
        print("SUCCESS: Scoring Router mounted (absolute)")
    except Exception as e2:
        print(f"CRITICAL: Scoring Router completely failed: {e2}")

# Feature 3: Live Severity Intelligence
try:
    from Feature3.live_severity_router import router as live_severity_router
    app.include_router(live_severity_router, prefix="/api")
    print("SUCCESS: Live Severity Router mounted")
except ImportError as e:
    print(f"FAILED to mount Live Severity Router: {e}")
    try:
        from backend.Feature3.live_severity_router import router as live_severity_router
        app.include_router(live_severity_router, prefix="/api")
        print("SUCCESS: Live Severity Router mounted (absolute)")
    except Exception as e2:
        print(f"CRITICAL: Live Severity Router completely failed: {e2}")

# Feature 4: Escalation Management
try:
    from Feature4.enhanced_escalation_router import router as escalation_router
    app.include_router(escalation_router, prefix="/api")
    print("SUCCESS: Enhanced Escalation Router mounted")
except ImportError as e:
    print(f"FAILED to mount Enhanced Escalation Router: {e}")
    try:
        from backend.Feature4.enhanced_escalation_router import router as escalation_router
        app.include_router(escalation_router, prefix="/api")
        print("SUCCESS: Enhanced Escalation Router mounted (absolute)")
    except Exception as e2:
        print(f"CRITICAL: Enhanced Escalation Router completely failed: {e2}")
        # Fallback to basic escalation router
        try:
            from Feature4.escalation_router import router as basic_escalation_router
            app.include_router(basic_escalation_router, prefix="/api")
            print("SUCCESS: Basic Escalation Router mounted as fallback")
        except Exception as e3:
            print(f"CRITICAL: All Escalation Routers failed: {e3}")

# Feature 7: Automated Seismic Monitor
try:
    from Feature7_Seismic.seismic_router import router as seismic_router
    app.include_router(seismic_router, prefix="/api")
    print("SUCCESS: Seismic Monitor Router mounted")
except ImportError as e:
    print(f"FAILED to mount Seismic Router: {e}")
    try:
        from backend.Feature7_Seismic.seismic_router import router as seismic_router
        app.include_router(seismic_router, prefix="/api")
        print("SUCCESS: Seismic Monitor Router mounted (absolute)")
    except Exception as e2:
        print(f"CRITICAL: Seismic Router completely failed: {e2}")

# Feature 8: AI Disaster Intelligence
try:
    from Feature8_AI_Intelligence.intelligence_router import router as intelligence_router
    app.include_router(intelligence_router, prefix="/api")
    print("SUCCESS: AI Intelligence Router mounted")
except ImportError as e:
    print(f"FAILED to mount Intelligence Router: {e}")
    try:
        from backend.Feature8_AI_Intelligence.intelligence_router import router as intelligence_router
        app.include_router(intelligence_router, prefix="/api")
        print("SUCCESS: AI Intelligence Router mounted (absolute)")
    except Exception as e2:
         print(f"CRITICAL: Intelligence Router completely failed: {e2}")

# Feature 9: Resource Management & Allocation
try:
    from Feature9_Resources.resource_router import router as resource_router
    app.include_router(resource_router, prefix="/api")
    print("SUCCESS: Resource Management Router mounted")
except ImportError as e:
    print(f"FAILED to mount Resource Router: {e}")
    try:
        from backend.Feature9_Resources.resource_router import router as resource_router
        app.include_router(resource_router, prefix="/api")
        print("SUCCESS: Resource Management Router mounted (absolute)")
    except Exception as e2:
         print(f"CRITICAL: Resource Router completely failed: {e2}")

# Feature 5: Incidents (Admin)
try:
    from Feature5_incidents.router import router as incidents_router
    app.include_router(incidents_router, prefix="/api")
    print("SUCCESS: Incidents Router mounted")
except ImportError as e:
    print(f"FAILED to mount Incidents Router: {e}")
    try:
        from backend.Feature5_incidents.router import router as incidents_router
        app.include_router(incidents_router, prefix="/api")
        print("SUCCESS: Incidents Router mounted (absolute)")
    except Exception as e2:
        print(f"CRITICAL: Incidents Router completely failed: {e2}")

# Feature 5: Voice Navigation
try:
    from Feature5_voice_nav.voice_router import router as voice_router
    app.include_router(voice_router, prefix="/api")
    print("SUCCESS: Voice Router mounted")
except ImportError as e:
    print(f"FAILED to mount Voice Router: {e}")
    try:
        from backend.Feature5_voice_nav.voice_router import router as voice_router
        app.include_router(voice_router, prefix="/api")
        print("SUCCESS: Voice Router mounted (absolute)")
    except Exception as e2:
        print(f"CRITICAL: Voice Router completely failed: {e2}")

# Feature 4: Multilingual Support
try:
    from Feature4_multilingual.language_router import router as language_router
    app.include_router(language_router, prefix="/api")
    print("SUCCESS: Multilingual Router mounted")
except ImportError as e:
    print(f"FAILED to mount Multilingual Router: {e}")
    try:
        from backend.Feature4_multilingual.language_router import router as language_router
        app.include_router(language_router, prefix="/api")
        print("SUCCESS: Multilingual Router mounted (absolute)")
    except Exception as e2:
        print(f"CRITICAL: Multilingual Router completely failed: {e2}")

# Feature 6: ML Hotspot Engine
try:
    from Feature6_ML_Hotspot.hotspot_router import router as hotspot_router
    app.include_router(hotspot_router, prefix="/api")
    app.include_router(hotspot_router) # Fallback
    print("SUCCESS: ML Hotspot Router mounted")
except ImportError as e:
    print(f"FAILED to mount ML Hotspot Router: {e}")
    try:
        from backend.Feature6_ML_Hotspot.hotspot_router import router as hotspot_router
        app.include_router(hotspot_router, prefix="/api")
        print("SUCCESS: ML Hotspot Router mounted (absolute)")
    except Exception as e2:
        print(f"CRITICAL: ML Hotspot Router completely failed: {e2}")

# Feature 7: AI-Assisted Resource Recommendation
try:
    from Feature7_AI_Recommendation.api.recommend import router as recommendation_router
    app.include_router(recommendation_router, prefix="/api")
    print("SUCCESS: AI Resource Recommendation Router mounted")
except ImportError as e:
    print(f"FAILED to mount AI Recommendation Router: {e}")
    try:
        from backend.Feature7_AI_Recommendation.api.recommend import router as recommendation_router
        app.include_router(recommendation_router, prefix="/api")
        print("SUCCESS: AI Resource Recommendation Router mounted (absolute)")
    except Exception as e2:
        print(f"CRITICAL: AI Recommendation Router completely failed: {e2}")

# Admin Dashboard Router
try:
    from admin_router import router as admin_router
    app.include_router(admin_router, prefix="/api")
    print("SUCCESS: Admin Router mounted")
except ImportError as e:
    print(f"FAILED to mount Admin Router: {e}")
    try:
        from backend.admin_router import router as admin_router
        app.include_router(admin_router, prefix="/api")
        print("SUCCESS: Admin Router mounted (absolute)")
    except Exception as e2:
        print(f"CRITICAL: Admin Router completely failed: {e2}")

# Feature 7: AI-Assisted Resource Recommendation
try:
    from Feature7_AI_Recommendation.api.recommend import router as ai_recommend_router
    app.include_router(ai_recommend_router, prefix="/api")
    print("SUCCESS: AI Recommendation Router mounted")
except ImportError as e:
    print(f"FAILED to mount AI Recommendation Router: {e}")
    try:
        from backend.Feature7_AI_Recommendation.api.recommend import router as ai_recommend_router
        app.include_router(ai_recommend_router, prefix="/api")
        print("SUCCESS: AI Recommendation Router mounted (absolute)")
    except Exception as e2:
        print(f"CRITICAL: AI Recommendation Router completely failed: {e2}")

# Photo AI (Gemini Vision Accident Analyzer)
try:
    from Feature_PhotoAI.router import router as photo_ai_router
    app.include_router(photo_ai_router, prefix="/api/photo-ai")
    print("SUCCESS: Photo AI Router mounted")
except Exception as e:
    print(f"FAILED to mount Photo AI Router: {e}")

# Weather Risk Engine
try:
    from Feature_Weather.router import router as weather_router
    app.include_router(weather_router, prefix="/api/weather")
    print("SUCCESS: Weather Risk Router mounted")
except Exception as e:
    print(f"FAILED to mount Weather Router: {e}")

# Feature 10: Pothole Intelligence & Smart Routing
try:
    from Feature10_PotholeIntelligence.pothole_router import router as pothole_router
    app.include_router(pothole_router, prefix="/api")
    app.include_router(pothole_router) # Fallback
    print("SUCCESS: Pothole Intelligence Router mounted")
except ImportError as e:
    print(f"FAILED to mount Pothole Router: {e}")
    try:
        from backend.Feature10_PotholeIntelligence.pothole_router import router as pothole_router
        app.include_router(pothole_router, prefix="/api")
        print("SUCCESS: Pothole Intelligence Router mounted (absolute)")
    except Exception as e2:
        print(f"CRITICAL: Pothole Router completely failed: {e2}")


@app.get("/")
@app.get("/api")
async def root(request: Request):
    return {
        "message": "🛡️ Chaukas API is Live — India's Road Safety Command System",
        "status": "operational",
        "services": {
            "crisis_dispatch": "active" if crisis_router is not None else "failed",
            "news_aggregator": "active" if news_router is not None else "failed",
            "emergency_broadcast": "active",
            "risk_scoring": "active",
            "live_severity_intelligence": "active",
            "escalation_management": "active",
            "incidents_management": "active",
            "voice_navigation": "active",
            "multilingual_support": "active",
            "ml_hotspot_engine": "active",
            "seismic_monitor": "active",
            "ai_intelligence": "active",
            "resource_management": "active",
            "ai_recommendation": "active",
            "admin_dashboard": "active",
            "pothole_intelligence": "active"
        },
        "env": "production" if os.getenv("VERCEL") else "local",
        "path": request.url.path
    }

@app.get("/api/health")
async def health():
    """Health check endpoint for Vercel"""
    return {
        "status": "healthy",
        "message": "Chaukas API is operational",
        "version": "2.0.0",
        "timestamp": "2026-04-24T00:00:00Z"
    }

# --- Mock DB Endpoints for Frontend ---
from supabase_client import load_db, save_db, UPLOADS_DIR
from fastapi import Request
import base64
import uuid

@app.get("/api/db/{table_name}")
async def db_select(table_name: str):
    db = load_db()
    return db.get(table_name, [])

@app.post("/api/db/{table_name}")
async def db_insert(table_name: str, request: Request):
    data = await request.json()
    db = load_db()
    if table_name not in db:
        db[table_name] = []
    
    if isinstance(data, list):
        db[table_name].extend(data)
    else:
        db[table_name].append(data)
    
    save_db(db)
    return data

@app.post("/api/storage/{bucket_name}/{file_name}")
async def storage_upload(bucket_name: str, file_name: str, request: Request):
    """Fallback endpoint for file uploads when using mock DB"""
    try:
        data = await request.body()
        file_path = UPLOADS_DIR / bucket_name / file_name
        os.makedirs(file_path.parent, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(data)
        return {"Key": f"{bucket_name}/{file_name}"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Use standard host/port for local dev
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)