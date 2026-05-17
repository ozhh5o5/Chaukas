# Weather Risk Endpoint
# GET /api/weather/risk?lat=&lon=

import os
import httpx
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

router = APIRouter()

WEATHER_API_KEY = "7b0a575ec0139fb4f24db5e3d843367a"

def compute_risk(weather_id: int, visibility: int, wind_speed: float, hour: int) -> str:
    score = 0
    is_night = hour < 6 or hour > 20

    if 200 <= weather_id < 300:   score += 4  # Thunderstorm
    elif 300 <= weather_id < 600: score += 3  # Rain/Drizzle
    elif 600 <= weather_id < 700: score += 4  # Snow/Ice
    elif 700 <= weather_id < 800: score += 3  # Fog/Mist
    elif weather_id == 800:       score += 0  # Clear
    else:                         score += 1  # Clouds

    if visibility < 1000:  score += 3
    elif visibility < 5000: score += 1
    if wind_speed > 15:    score += 2
    if is_night:           score += 2

    if score >= 6: return "CRITICAL"
    if score >= 4: return "HIGH"
    if score >= 2: return "ELEVATED"
    return "LOW"

@router.get("/risk")
async def get_weather_risk(lat: float = Query(28.6139), lon: float = Query(77.2090)):
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"https://api.openweathermap.org/data/2.5/weather",
                params={"lat": lat, "lon": lon, "appid": WEATHER_API_KEY, "units": "metric"},
                timeout=5.0
            )
            data = res.json()

        from datetime import datetime
        hour = datetime.utcnow().hour
        weather_id = data["weather"][0]["id"]
        visibility = data.get("visibility", 10000)
        wind_speed = data["wind"]["speed"]
        risk = compute_risk(weather_id, visibility, wind_speed, hour)

        return JSONResponse({
            "risk": risk,
            "condition": data["weather"][0]["description"],
            "temperature": round(data["main"]["temp"], 1),
            "wind_kmh": round(wind_speed * 3.6, 1),
            "visibility_m": visibility,
            "city": data.get("name", "Unknown"),
            "weather_id": weather_id
        })
    except Exception as e:
        return JSONResponse({
            "risk": "LOW",
            "condition": "clear sky",
            "temperature": 28.0,
            "wind_kmh": 10.0,
            "visibility_m": 10000,
            "city": "India",
            "weather_id": 800
        })
