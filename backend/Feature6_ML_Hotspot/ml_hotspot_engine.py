# -*- coding: utf-8 -*-
"""
Chaukas ML Hotspot Engine
AI-powered crisis hotspot detection and heatmap generation
"""

from math import radians, sin, cos, sqrt, atan2
from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
import json
from enum import Enum

class HotspotSeverity(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium" 
    HIGH = "High"
    CRITICAL = "Critical"

class HotspotZone(str, Enum):
    SAFE = "safe"        # Green
    CAUTION = "caution"  # Yellow
    WARNING = "warning"  # Orange
    DANGER = "danger"    # Red

def haversine_distance(p1: Dict[str, float], p2: Dict[str, float]) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    R = 6371  # Earth's radius in kilometers
    
    dlat = radians(p2["lat"] - p1["lat"])
    dlon = radians(p2["lng"] - p1["lng"])
    
    a = (sin(dlat/2)**2 + 
         cos(radians(p1["lat"])) * cos(radians(p2["lat"])) * sin(dlon/2)**2)
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    return R * c

def detect_hotspot(points: List[Dict[str, Any]], radius_km: float = 50) -> Dict[str, Any]:
    """
    Detects crisis hotspot regions using spatial clustering with enhanced ML logic
    
    Args:
        points: List of incident points with lat, lng, and optional severity
        radius_km: Clustering radius in kilometers
        
    Returns:
        Dict with hotspot detection results
    """
    if len(points) < 2:
        return {
            "hotspot_detected": False,
            "hotspot_strength": HotspotSeverity.LOW,
            "hotspot_radius_km": radius_km,
            "clustered_points": 0,
            "zone_classification": HotspotZone.SAFE,
            "risk_score": 0.0,
            "center_point": None
        }
    
    clustered_points = 0
    severity_weights = {"critical": 4, "high": 3, "medium": 2, "low": 1}
    total_severity_score = 0
    
    # Enhanced clustering with severity weighting
    for i in range(len(points)):
        neighbors = 0
        severity_sum = 0
        
        for j in range(len(points)):
            if i != j:
                distance = haversine_distance(points[i], points[j])
                if distance <= radius_km:
                    neighbors += 1
                    # Weight by severity if available
                    point_severity = points[j].get("severity", "medium").lower()
                    severity_sum += severity_weights.get(point_severity, 2)
        
        if neighbors >= 1:  # Lowered threshold for better detection
            clustered_points += 1
            point_severity = points[i].get("severity", "medium").lower()
            total_severity_score += severity_weights.get(point_severity, 2) * (neighbors + 1)
    
    # Calculate risk score (0-100)
    max_possible_score = len(points) * 4 * len(points)  # Max if all critical with max neighbors
    risk_score = min(100, (total_severity_score / max_possible_score) * 100) if max_possible_score > 0 else 0
    
    # Determine hotspot strength and zone
    if clustered_points >= 8 or risk_score >= 80:
        strength = HotspotSeverity.CRITICAL
        zone = HotspotZone.DANGER
    elif clustered_points >= 5 or risk_score >= 60:
        strength = HotspotSeverity.HIGH
        zone = HotspotZone.WARNING
    elif clustered_points >= 3 or risk_score >= 30:
        strength = HotspotSeverity.MEDIUM
        zone = HotspotZone.CAUTION
    else:
        strength = HotspotSeverity.LOW
        zone = HotspotZone.SAFE
    
    # Calculate center point of hotspot
    center_point = None
    if clustered_points > 0:
        avg_lat = sum(p["lat"] for p in points) / len(points)
        avg_lng = sum(p["lng"] for p in points) / len(points)
        center_point = {"lat": avg_lat, "lng": avg_lng}
    
    return {
        "hotspot_detected": strength != HotspotSeverity.LOW,
        "hotspot_strength": strength,
        "hotspot_radius_km": radius_km,
        "clustered_points": clustered_points,
        "zone_classification": zone,
        "risk_score": round(risk_score, 2),
        "center_point": center_point,
        "total_incidents": len(points),
        "analysis_timestamp": datetime.now().isoformat()
    }

def generate_heatmap_data(incidents: List[Dict[str, Any]], grid_size: float = 0.1) -> List[Dict[str, Any]]:
    """
    Generate heatmap grid data for visualization
    
    Args:
        incidents: List of incident data with lat, lng, severity
        grid_size: Grid cell size in degrees (0.1 = ~11km)
        
    Returns:
        List of grid cells with intensity and zone classification
    """
    if not incidents:
        return []
    
    # Find bounds
    lats = [inc["lat"] for inc in incidents]
    lngs = [inc["lng"] for inc in incidents]
    
    min_lat, max_lat = min(lats), max(lats)
    min_lng, max_lng = min(lngs), max(lngs)
    
    # Expand bounds slightly
    padding = grid_size
    min_lat -= padding
    max_lat += padding
    min_lng -= padding
    max_lng += padding
    
    heatmap_cells = []
    severity_weights = {"critical": 4, "high": 3, "medium": 2, "low": 1}
    
    # Generate grid
    lat = min_lat
    while lat <= max_lat:
        lng = min_lng
        while lng <= max_lng:
            cell_center = {"lat": lat + grid_size/2, "lng": lng + grid_size/2}
            
            # Calculate intensity for this cell
            intensity = 0
            incident_count = 0
            
            for incident in incidents:
                distance = haversine_distance(cell_center, incident)
                if distance <= 25:  # 25km influence radius
                    # Distance-weighted intensity
                    weight = max(0, 1 - (distance / 25))  # Linear decay
                    severity = incident.get("severity", "medium").lower()
                    severity_multiplier = severity_weights.get(severity, 2)
                    intensity += weight * severity_multiplier
                    incident_count += 1
            
            if intensity > 0:
                # Normalize intensity (0-100)
                normalized_intensity = min(100, intensity * 10)
                
                # Determine zone based on intensity
                if normalized_intensity >= 75:
                    zone = HotspotZone.DANGER
                    color = "#FF0000"  # Red
                elif normalized_intensity >= 50:
                    zone = HotspotZone.WARNING
                    color = "#FF8C00"  # Orange
                elif normalized_intensity >= 25:
                    zone = HotspotZone.CAUTION
                    color = "#FFD700"  # Yellow
                else:
                    zone = HotspotZone.SAFE
                    color = "#32CD32"  # Green
                
                heatmap_cells.append({
                    "lat": lat,
                    "lng": lng,
                    "lat_end": lat + grid_size,
                    "lng_end": lng + grid_size,
                    "center": cell_center,
                    "intensity": round(normalized_intensity, 2),
                    "zone": zone,
                    "color": color,
                    "incident_count": incident_count,
                    "grid_size": grid_size
                })
            
            lng += grid_size
        lat += grid_size
    
    return heatmap_cells

def analyze_temporal_patterns(incidents: List[Dict[str, Any]], days_back: int = 7) -> Dict[str, Any]:
    """
    Analyze temporal patterns in incident data
    
    Args:
        incidents: List of incidents with timestamp data
        days_back: Number of days to analyze
        
    Returns:
        Temporal analysis results
    """
    if not incidents:
        return {"trend": "stable", "pattern": "no_data", "forecast": "unknown"}
    
    # Filter recent incidents
    cutoff_date = datetime.now() - timedelta(days=days_back)
    recent_incidents = []
    
    for incident in incidents:
        # Try to parse timestamp
        try:
            if "created_at" in incident:
                incident_date = datetime.fromisoformat(incident["created_at"].replace('Z', '+00:00'))
                if incident_date >= cutoff_date:
                    recent_incidents.append(incident)
        except:
            # If parsing fails, include the incident
            recent_incidents.append(incident)
    
    if len(recent_incidents) < 2:
        return {"trend": "stable", "pattern": "insufficient_data", "forecast": "stable"}
    
    # Simple trend analysis
    daily_counts = {}
    for incident in recent_incidents:
        try:
            date_str = incident.get("created_at", datetime.now().isoformat())[:10]
            daily_counts[date_str] = daily_counts.get(date_str, 0) + 1
        except:
            continue
    
    if len(daily_counts) < 2:
        return {"trend": "stable", "pattern": "single_day", "forecast": "stable"}
    
    # Calculate trend
    dates = sorted(daily_counts.keys())
    counts = [daily_counts[date] for date in dates]
    
    if len(counts) >= 3:
        recent_avg = sum(counts[-3:]) / 3
        earlier_avg = sum(counts[:-3]) / max(1, len(counts) - 3) if len(counts) > 3 else counts[0]
        
        if recent_avg > earlier_avg * 1.5:
            trend = "increasing"
            forecast = "escalating"
        elif recent_avg < earlier_avg * 0.7:
            trend = "decreasing"
            forecast = "improving"
        else:
            trend = "stable"
            forecast = "stable"
    else:
        trend = "stable"
        forecast = "stable"
    
    return {
        "trend": trend,
        "pattern": "analyzed",
        "forecast": forecast,
        "daily_counts": daily_counts,
        "total_recent": len(recent_incidents),
        "analysis_period_days": days_back
    }

def get_zone_color_mapping() -> Dict[str, Dict[str, str]]:
    """
    Get color mapping for different zones
    
    Returns:
        Dictionary mapping zones to colors and descriptions
    """
    return {
        HotspotZone.SAFE: {
            "color": "#32CD32",
            "hex": "#32CD32",
            "rgb": "50, 205, 50",
            "description": "Safe Zone - Low risk area",
            "alert_level": "None"
        },
        HotspotZone.CAUTION: {
            "color": "#FFD700",
            "hex": "#FFD700", 
            "rgb": "255, 215, 0",
            "description": "Caution Zone - Moderate risk area",
            "alert_level": "Advisory"
        },
        HotspotZone.WARNING: {
            "color": "#FF8C00",
            "hex": "#FF8C00",
            "rgb": "255, 140, 0", 
            "description": "Warning Zone - High risk area",
            "alert_level": "Warning"
        },
        HotspotZone.DANGER: {
            "color": "#FF0000",
            "hex": "#FF0000",
            "rgb": "255, 0, 0",
            "description": "Danger Zone - Critical risk area", 
            "alert_level": "Emergency"
        }
    }

# Test the functions
if __name__ == "__main__":
    # Test data
    test_points = [
        {"lat": 22.7196, "lng": 75.8577, "severity": "critical"},
        {"lat": 22.7245, "lng": 75.8621, "severity": "high"},
        {"lat": 22.7310, "lng": 75.8480, "severity": "medium"},
        {"lat": 22.7150, "lng": 75.8700, "severity": "high"},
        {"lat": 22.7500, "lng": 75.9000, "severity": "low"}  # Far away point
    ]
    
    # Test hotspot detection
    result = detect_hotspot(test_points)
    print("Hotspot Detection Result:")
    print(json.dumps(result, indent=2))
    
    # Test heatmap generation
    heatmap = generate_heatmap_data(test_points, grid_size=0.05)
    print(f"\nGenerated {len(heatmap)} heatmap cells")
    
    # Test temporal analysis
    temporal = analyze_temporal_patterns(test_points)
    print("\nTemporal Analysis:")
    print(json.dumps(temporal, indent=2))