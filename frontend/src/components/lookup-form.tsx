"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CloudIcon, MapPinIcon, CalendarIcon, ThermometerIcon } from "lucide-react";

interface WeatherApiResponse {
  _id: string;
  request: {
    date: string;
    location: string;
    notes?: string;
  };
  weather_data: {
    location: {
      name: string;
      country: string;
      region: string;
      localtime: string;
      timezone_id: string;
    };
    current: {
      observation_time: string;
      temperature: number;
      weather_icons: string[];
      weather_descriptions: string[];
      feelslike: number;
      humidity: number;
      wind_speed: number;
      wind_dir: string;
      // Additional fields that may not be displayed directly
      [key: string]: any;
    };
  };
}

export function LookupForm() {
  const [requestId, setRequestId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestId(e.target.value);
    if (weatherData) {
      setWeatherData(null);
    }
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId) return;

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/weather/${requestId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      } else {
        setError("Weather request not found");
      }
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudIcon className="size-5" />
          Weather Lookup
        </CardTitle>
        <CardDescription>Enter a request ID to check weather details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requestId">Request ID</Label>
            <Input
              id="requestId"
              type="text"
              placeholder="e04c1adf-2e1d-468a-9fb4-4d6e89f27543"
              value={requestId}
              onChange={handleInputChange}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            {isLoading ? "Loading..." : "Search"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-900/20 text-red-500 border border-red-500">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {weatherData && (
          <div className="mt-6 border-t pt-4 space-y-4">
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <CalendarIcon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">{weatherData.request.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <MapPinIcon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {weatherData.weather_data.location.name}, {weatherData.weather_data.location.country}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <ThermometerIcon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Temperature</p>
                <p className="text-sm text-muted-foreground">
                  {weatherData.weather_data.current.temperature}°C (feels like {weatherData.weather_data.current.feelslike}°C)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <CloudIcon className="size-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm font-medium">Condition</p>
                  <p className="text-sm text-muted-foreground">
                    {weatherData.weather_data.current.weather_descriptions[0]}
                  </p>
                </div>
                <img
                  src={weatherData.weather_data.current.weather_icons[0]}
                  alt={weatherData.weather_data.current.weather_descriptions[0]}
                  className="size-8 ml-auto"
                />
              </div>
            </div>

            {/* Dump remaining api data */}
            <div className="p-2 bg-muted/20 rounded-lg mt-4">
              <p className="text-sm font-medium mb-2">Raw API Data</p>
              <pre className="text-xs text-muted-foreground overflow-auto max-h-60">
                {JSON.stringify(weatherData.weather_data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}