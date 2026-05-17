# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from .pothole_engine import PotholeEngine, get_smart_route_penalty

router = APIRouter(prefix="/api/potholes", tags=["Pothole Intelligence"])
engine = PotholeEngine()

# In-memory store for demo (should be SQLite/LocalDB in production)
sensor_events = []
verified_potholes = [
    {"lat": 22.7196, "lng": 75.8577, "report_count": 7, "confidence_score": 0.95, "severity": "Deep", "is_verified": True},
    {"lat": 22.7245, "lng": 75.8621, "report_count": 4, "confidence_score": 0.70, "severity": "Medium", "is_verified": True},
    {"lat": 22.7310, "lng": 75.8480, "report_count": 2, "confidence_score": 0.45, "severity": "Shallow", "is_verified": False},
    {"lat": 22.7150, "lng": 75.8700, "report_count": 5, "confidence_score": 0.85, "severity": "Deep", "is_verified": True},
]

class SensorData(BaseModel):
    lat: float
    lng: float
    accel_z: float
    speed: float
    timestamp: Optional[str] = None

class RouteRequest(BaseModel):
    points: List[dict]

@router.post("/report")
async def report_pothole_event(data: SensorData):
    """
    Receives accelerometer data from the mobile client.
    """
    analysis = engine.process_sensor_event(data.dict())
    
    if analysis["is_potential_pothole"]:
        event = data.dict()
        event.update(analysis)
        sensor_events.append(event)
        
        # Trigger re-clustering logic (simplified for demo)
        global verified_potholes
        verified_potholes = engine.cluster_potholes(sensor_events)
        
        return {"status": "success", "message": "Pothole hazard logged", "analysis": analysis}
    
    return {"status": "ignored", "reason": "Low probability spike"}

@router.get("/hotspots")
async def get_pothole_hotspots():
    """
    Returns all detected and verified pothole hotspots for map display.
    """
    return verified_potholes

@router.post("/smart-route-check")
async def check_route_roughness(request: RouteRequest):
    """
    Calculates the 'Roughness Score' for a proposed route.
    Helpful for the 'Smooth Route' suggestor.
    """
    penalty = get_smart_route_penalty(request.points, verified_potholes)
    
    # Suggestion logic
    status = "Smooth"
    if penalty > 100: status = "Rough"
    if penalty > 500: status = "Hazardous"
    
    return {
        "roughness_score": penalty,
        "status": status,
        "recommendation": "Try an alternative route" if status != "Smooth" else "Route is clear"
    }

@router.get("/stats")
async def get_pothole_stats():
    return {
        "total_sensor_events": len(sensor_events),
        "active_hotspots": len(verified_potholes),
        "verified_hazards": len([p for p in verified_potholes if p['is_verified']]),
        "system_status": "Monitoring Active"
    }
