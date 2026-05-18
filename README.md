# 🛡️ CHAUKAS — India's Intelligent Road Safety Command System

> **Road Safety Hackathon 2026 | IIT Madras**
> *AI-Powered Accident Detection, Real-Time Blackspot Mapping, and Emergency Dispatch*

---

## 📌 Problem Statement

India witnesses over **1.5 lakh road accident fatalities annually** — one death every 3.5 minutes. The primary causes include delayed emergency response, lack of real-time accident data, absence of severity assessment at the reporting stage, and poor coordination between traffic authorities and emergency responders. The critical "**Golden Hour**" — the first 60 minutes after an accident — is lost due to fragmented systems.

**Chaukas** solves this by providing a **unified, AI-driven command interface** that detects accidents, assesses severity in real-time using Gemini AI, and dispatches emergency resources within seconds — all from a single platform.

---

## 🎯 What is Chaukas?

**Chaukas** (Hindi: चौकस — meaning "Alert" / "Vigilant") is an end-to-end **Intelligent Road Safety Command System** built for India's highways and urban roads. It combines:

- 🤖 **AI-Powered Severity Analysis** — Gemini Vision AI analyzes accident photos to classify severity and recommend resources
- 📍 **Real-Time Incident Mapping** — Interactive 3D globe and Leaflet maps for live incident tracking
- 🚨 **Golden Hour SOS** — One-tap emergency dispatch with nearest hospital routing
- 📊 **ML Hotspot Engine** — Identifies accident blackspots using spatial clustering and temporal analysis
- 🔄 **Escalation State Machine** — Automated incident lifecycle management from detection to resolution
- 🌦️ **Weather Risk Integration** — Real-time weather-correlated risk scoring
- 🗣️ **Multilingual Voice Navigation** — Voice-guided emergency instructions in 10+ Indian languages
- 📰 **Live News Intelligence** — AI-filtered road safety news aggregation
- 🏥 **AI Resource Recommendation** — Smart allocation of ambulances, fire brigades, and police units

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CHAUKAS PLATFORM                         │
├─────────────────────────┬───────────────────────────────────────┤
│      FRONTEND (React)   │          BACKEND (FastAPI)            │
│                         │                                       │
│  • 3D Globe (Three.js)  │  Feature 1: Crisis Dispatch           │
│  • Leaflet Heatmaps     │  Feature 2: News Aggregation          │
│  • SOS Dashboard        │  Feature 3: Severity AI Engine        │
│  • Admin Control Room   │  Feature 4: Escalation Management     │
│  • Photo AI Analyzer    │  Feature 5: Incident CRUD + Voice Nav │
│  • Voice Navigator      │  Feature 6: ML Hotspot Engine         │
│  • Weather Risk Badge   │  Feature 7: AI Recommendation + Seismic│
│  • Multilingual Support │  Feature 8: AI Intelligence           │
│                         │  Feature 9: Resource Management       │
│  Port: 5173 (Vite)      │  Photo AI: Gemini Vision Analyzer     │
│                         │  Weather: Risk Engine                 │
│                         │                                       │
│                         │  Port: 8000 (Uvicorn)                 │
├─────────────────────────┴───────────────────────────────────────┤
│                    LOCAL JSON DATABASE                           │
│              (backend/local_db.json + uploads/)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (For Judges)

### Prerequisites
- **Node.js** ≥ 18.x
- **Python**: recommended **3.11 or 3.12** (works best on Windows)
- **pip** (Python package manager)

> Note: On Windows, using very new Python versions (e.g. 3.14) may force some packages (like `pydantic-core`) to compile from source, which requires Visual Studio C++ Build Tools. If you hit install errors, switch to Python 3.11/3.12.

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies (using venv)
python -m venv .venv

# Windows
.venv\Scripts\activate
pip install -r backend/requirements.txt

# macOS/Linux
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### Step 2: Start the Application

```bash
# Terminal 1 (frontend)
cd frontend
npm run dev

# Terminal 2 (backend) — from project root
# (use your venv python, e.g. .venv\Scripts\python.exe on Windows)
python -m uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

This starts both:
- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:8000

### Step 3: Login

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin@demo.com    | demo@123   |

> **Note:** The admin login works offline with no external database required. All data is stored locally in `backend/local_db.json`.

---

## 🧩 Feature Breakdown

### Feature 1: Crisis Dispatch & SOS (`/report`, `/emergency`)
- **Report accidents** with title, description, type, location, and optional image upload
- **Golden Hour Timer** — real-time countdown showing time remaining for optimal emergency response
- **Nearest hospital routing** with one-tap call functionality
- Image uploads are stored locally in `backend/uploads/`

### Feature 2: Live News Intelligence (`/coordination`, `/news`)
- AI-filtered road safety news from multiple Indian sources
- Real-time aggregation of highway incidents, policy updates, and weather warnings

### Feature 3: Severity AI Engine (`/severity`)
- **Live Severity Indicator** with real-time AI classification
- **Risk Scoring Router** — calculates composite risk scores based on incident parameters
- Multi-factor severity assessment: location, time, weather, vehicle type, casualties

### Feature 4: Escalation Management (`/escalation`)
- **State Machine Architecture** — incidents transition through: `Reported → Acknowledged → Dispatched → In-Progress → Resolved`
- **ML-powered transition engine** with automated escalation rules
- Visual timeline of incident lifecycle

### Feature 5: Incident Management & Voice Navigation
- Full CRUD for incident records
- **Voice Navigator** — hands-free emergency instructions in 10+ Indian languages
- **Multilingual Support** — Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia

### Feature 6: ML Hotspot Engine (`/hotspot`)
- **Spatial clustering** to identify accident blackspots
- **Interactive heatmap** visualization on Leaflet maps
- **Temporal pattern analysis** — peak hours, seasonal trends
- Zone classification: Safe → Caution → Warning → Danger

### Feature 7: AI Resource Recommendation
- **Smart resource allocation** using incident severity and proximity
- Recommends ambulances, fire brigades, and tow trucks based on AI analysis
- **Seismic Monitor** — earthquake/natural disaster integration

### Feature 8: AI Disaster Intelligence
- Comprehensive AI-powered disaster analysis
- Predictive modeling for road infrastructure risk

### Feature 9: Resource Management (`/resources`)
- Track emergency vehicle fleet status
- Manage resource availability and deployment history

### Photo AI Analyzer (`/report` — image upload)
- **Gemini Vision AI** analyzes uploaded accident photos
- Returns: severity classification, vehicle count, road condition, recommended resources
- Works with images, providing instant AI triage

### Weather Risk Engine
- Real-time weather data integration
- Risk badges showing weather-correlated accident probability
- Fog, rain, and ice warnings for highways

### Admin Dashboard (`/admin`)
- **System-wide statistics** — total users, active incidents, critical alerts
- **Real-time incident management** — acknowledge, update status, dispatch resources
- **User management** — view all users, suspend/activate accounts
- **Analytics dashboard** — incident trends, response times, resolution rates
- **Emergency broadcast** — send alerts to all platform users
- **System health monitoring** — feature status, API response times, database connectivity

---

## 🛠️ Tech Stack

| Layer       | Technology                                                  |
|-------------|-------------------------------------------------------------|
| Frontend    | React 19, Vite 7, Three.js, React Three Fiber, Leaflet     |
| Styling     | TailwindCSS 3.4, Framer Motion                             |
| Backend     | Python FastAPI, Uvicorn                                     |
| AI/ML       | Google Gemini AI (Vision + Text), Custom ML Engines         |
| Database    | Local JSON (offline-first, no cloud dependency)             |
| Media       | Local file storage (`backend/uploads/`)                     |
| Maps        | Leaflet, React-Leaflet, Google Maps API                     |
| 3D          | Three.js, React Three Fiber, Drei                           |
| Voice       | Web Speech API, Multilingual TTS                            |
| Notifications | Web Push API, Service Workers                             |

---

## 📂 Project Structure

```
Chaukas/
├── frontend/                   # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # 35 React components
│   │   │   ├── LandingPage.jsx        # Main landing with 3D globe
│   │   │   ├── CrisisDashboard.jsx    # Real-time incident dashboard
│   │   │   ├── IncidentReport.jsx     # Accident reporting form
│   │   │   ├── GoldenHourSOS.jsx      # Emergency SOS with timer
│   │   │   ├── HeatmapVisualization.jsx # Leaflet heatmap
│   │   │   ├── PhotoAIAnalyzer.jsx    # Gemini Vision integration
│   │   │   ├── VoiceNavigator.jsx     # Multilingual voice guidance
│   │   │   ├── WeatherRiskBadge.jsx   # Weather risk indicator
│   │   │   └── ...
│   │   ├── pages/              # 9 page components
│   │   │   ├── AdminDashboard.jsx     # Admin control room
│   │   │   ├── SeverityEnginePage.jsx # AI severity analysis
│   │   │   ├── EscalationPage.jsx     # Incident escalation
│   │   │   ├── HotspotPage.jsx        # ML hotspot engine
│   │   │   └── ...
│   │   ├── context/            # React Context providers
│   │   │   ├── AuthContext.jsx        # Authentication
│   │   │   ├── LocationContext.jsx    # GPS tracking
│   │   │   └── LanguageContext.jsx    # Multilingual
│   │   └── lib/
│   │       └── supabaseClient.js      # Local API client (mock)
│   └── index.html
│
├── backend/                    # Python FastAPI Backend
│   ├── app.py                  # Main FastAPI application
│   ├── supabase_client.py      # Local JSON database engine
│   ├── admin_router.py         # Admin dashboard endpoints
│   ├── local_db.json           # Persistent local database
│   ├── uploads/                # Media file storage
│   ├── Feature1/               # Crisis dispatch + push notifications
│   ├── Feature2_news/          # News aggregation
│   ├── Feature3/               # Severity & risk scoring engine
│   ├── Feature3_emergency/     # Emergency broadcast
│   ├── Feature4/               # Escalation state machine
│   ├── Feature4_multilingual/  # Language support
│   ├── Feature5_incidents/     # Incident CRUD
│   ├── Feature5_voice_nav/     # Voice navigation
│   ├── Feature6_ML_Hotspot/    # ML hotspot detection
│   ├── Feature7_AI_Recommendation/ # AI resource recommendation
│   ├── Feature7_Seismic/       # Seismic monitoring
│   ├── Feature8_AI_Intelligence/ # AI disaster intelligence
│   ├── Feature9_Resources/     # Resource management
│   ├── Feature_PhotoAI/        # Gemini Vision analyzer
│   ├── Feature_Weather/        # Weather risk engine
│   └── Feature_Admin/          # Admin utilities
│
└── package.json                # Root project config
```

---

## 🔐 Offline-First Design

Chaukas is designed to work **completely offline** — no cloud database, no external API keys required for core functionality:

- **Database**: All data is stored in `backend/local_db.json` using a custom MockSupabase engine
- **Media Storage**: Images, videos, and audio are saved to `backend/uploads/` and served via FastAPI static files
- **Authentication**: Demo admin login works locally via localStorage
- **Frontend ↔ Backend**: The frontend communicates with the local backend at `localhost:8000` for all CRUD operations

This ensures **judges can run the full application** by simply:
1. Installing dependencies (`npm install` + `pip install`)
2. Running `npm run dev`

---

## 📊 Key Innovations

1. **Three-Stage AI Pipeline**: Detect → Analyze → Respond in under 60 seconds
2. **Gemini Vision Triage**: Upload an accident photo and receive instant severity classification with resource recommendations
3. **Golden Hour Optimization**: Real-time countdown timer with nearest trauma centre routing
4. **ML Blackspot Detection**: Spatial clustering identifies dangerous road segments before accidents happen
5. **Escalation State Machine**: Automated incident lifecycle ensures no incident is missed or forgotten
6. **Multilingual Emergency Response**: Voice-guided instructions in 10+ Indian languages break language barriers during emergencies
7. **Weather-Correlated Risk**: Real-time weather data enhances accident probability scoring
8. **3D Command Interface**: Immersive Three.js globe with real-time crisis markers provides situational awareness

---

## 🌐 API Endpoints Summary

| Endpoint                        | Method | Description                              |
|---------------------------------|--------|------------------------------------------|
| `/api/crisis/alert`             | POST   | Report a new accident                    |
| `/api/crisis/active`            | GET    | Get all active incidents                 |
| `/api/crisis/status`            | GET    | System status                            |
| `/api/severity/analyze`         | POST   | AI severity analysis                     |
| `/api/escalation/states`        | GET    | Get escalation states                    |
| `/api/hotspot/analyze`          | POST   | ML hotspot analysis                      |
| `/api/hotspot/live-analysis`    | GET    | Live incident hotspot analysis           |
| `/api/hotspot/heatmap`          | POST   | Generate heatmap data                    |
| `/api/incidents/`               | GET    | List all incidents                       |
| `/api/incidents/`               | POST   | Create incident                          |
| `/api/admin/stats`              | GET    | Admin dashboard statistics               |
| `/api/admin/users`              | GET    | All registered users                     |
| `/api/admin/incidents`          | GET    | All incidents with details               |
| `/api/admin/analytics`          | GET    | Comprehensive analytics                  |
| `/api/photo-ai/analyze`         | POST   | Gemini Vision photo analysis             |
| `/api/weather/risk`             | GET    | Weather risk assessment                  |
| `/api/health`                   | GET    | Health check                             |

---

## 👥 Team

| Name       | Role                       |
|------------|----------------------------|
| Palash     | Full-Stack Developer & Lead |

---

## 📜 License

This project was built for the **Road Safety Hackathon 2026** organized by **IIT Madras**.

© 2026 CHAUKAS. All Rights Reserved.