from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn

import httpx
import uuid
import os

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

BASE_URL = "http://api.weatherstack.com/current" # http://api.weatherstack.com/historical requires paid plan

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    You need to implement this endpoint to handle the following:
    1. Receive form data (date, location, notes)
    2. Calls WeatherStack API for the location
    3. Stores combined data with unique ID in memory
    4. Returns the ID to frontend
    """

    try:
        # 2. Call WeatherStack API for the location
        # Use non-blocking HTTP client to use FastAPI's async abilities
        async with httpx.AsyncClient(timeout=30.0) as client:
            params = {
                "access_key": os.environ.get("WEATHERSTACK_API_KEY"), # API key stored as environment variable
                "query": request.location,
                "units": "m" # Optional field, set to 'f' for imperial units, 's' for scientific units
            }
            response = await client.get(BASE_URL, params=params)
            response.raise_for_status()
            weather_data = response.json()

        # 3. Store combined data with unique ID in memory
        weather_id = str(uuid.uuid4())
        combined_data = {
            "_id": weather_id,
            "request": {
                "date": request.date,
                "location": request.location,
                "notes": request.notes
            },
            "weather_data": weather_data
        }
        weather_storage[weather_id] = combined_data
        return WeatherResponse(id = weather_id)

    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch weather data")

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)