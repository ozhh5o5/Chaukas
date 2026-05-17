# -*- coding: utf-8 -*-
"""
Chaukas Pothole Intelligence Engine
Detects and clusters potholes using accelerometer telemetry and probabilistic analysis.
"""

from typing import List, Dict, Any
from datetime import datetime
import math

class PotholeEngine:
    def __init__(self, cluster_radius_m: float = 15.0, min_reports: int = 3):
        self.cluster_radius_m = cluster_radius_m
        self.min_reports = min_reports
        self.earth_radius_km = 6371.0

    def calculate_distance(self, p1: Dict[str, float], p2: Dict[str, float]) -> float:
        """Haversine distance in meters."""
        lat1, lon1 = math.radians(p1['lat']), math.radians(p1['lng'])
        lat2, lon2 = math.radians(p2['lat']), math.radians(p2['lng'])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return self.earth_radius_km * c * 1000

    def process_sensor_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes raw accelerometer data to determine if it's a likely pothole.
        """
        accel_z = event.get('accel_z', 0)
        speed = event.get('speed', 0) # speed in km/h if available, else 0
        
        # Ignore stationary noise
        if speed < 3 and accel_z < 20:
            return {"is_potential_pothole": False, "confidence": 0, "timestamp": datetime.now().isoformat()}

        # Probabilistic weight based on impact magnitude
        # 9.8 is standard gravity. A pothole usually causes a sharp spike.
        probability = 0.0
        if accel_z > 14.0:
            probability = min(1.0, (accel_z - 9.8) / 15.0)
            
        # Penalize probability if speed is very high (might be a expansion joint on a bridge)
        if speed > 60:
            probability *= 0.4
        elif speed > 40:
            probability *= 0.8
            
        # Severity Grading
        severity = "Low"
        if accel_z > 28:
            severity = "Deep"
        elif accel_z > 20:
            severity = "Medium"
        elif accel_z > 14:
            severity = "Shallow"

        return {
            "is_potential_pothole": probability > 0.35,
            "confidence": round(probability, 2),
            "severity": severity,
            "accel_z": round(accel_z, 2),
            "timestamp": datetime.now().isoformat()
        }

    def cluster_potholes(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups individual sensor events into verified pothole hotspots.
        """
        if not events:
            return []

        clusters = []
        visited = set()

        for i, event in enumerate(events):
            if i in visited:
                continue
                
            current_cluster = [event]
            visited.add(i)
            
            for j, other in enumerate(events):
                if i != j and j not in visited:
                    dist = self.calculate_distance(event, other)
                    if dist <= self.cluster_radius_m:
                        current_cluster.append(other)
                        visited.add(j)
            
            if len(current_cluster) >= 1:
                avg_lat = sum(e['lat'] for e in current_cluster) / len(current_cluster)
                avg_lng = sum(e['lng'] for e in current_cluster) / len(current_cluster)
                max_severity = max(e.get('severity', 'Low') for e in current_cluster)
                
                # Confidence grows with number of unique vehicle reports
                confidence = min(1.0, (len(current_cluster) / self.min_reports))
                
                clusters.append({
                    "lat": avg_lat,
                    "lng": avg_lng,
                    "report_count": len(current_cluster),
                    "confidence_score": round(confidence, 2),
                    "severity": max_severity,
                    "is_verified": len(current_cluster) >= self.min_reports,
                    "last_detected": datetime.now().isoformat()
                })
                
        return clusters

def get_smart_route_penalty(route_points: List[Dict[str, float]], potholes: List[Dict[str, Any]]) -> float:
    """
    Calculates a 'Roughness Penalty' for a given route based on pothole proximity.
    """
    total_penalty = 0
    engine = PotholeEngine()
    
    for point in route_points:
        for pothole in potholes:
            dist = engine.calculate_distance(point, pothole)
            if dist < 50: # Within 50 meters of a pothole
                # Exponential penalty as we get closer to a verified pothole
                total_penalty += (pothole['confidence_score'] * 100) / max(1, dist/10)
                
    return round(total_penalty, 2)
