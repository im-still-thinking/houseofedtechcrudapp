'use client';

import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
}

interface WeatherData {
  current: {
    main: {
      temp: number;
      feels_like: number;
      humidity: number;
      pressure: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
    name: string;
  };
  forecast: {
    list: Array<{
      dt: number;
      main: {
        temp: number;
        feels_like: number;
        humidity: number;
      };
      weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
      }>;
      dt_txt: string;
    }>;
  };
}

export default function WeatherWidget({ latitude, longitude }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/weather?lat=${latitude}&lon=${longitude}`);
        setWeatherData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to load weather data');
      } finally {
        setLoading(false);
      }
    };

    if (latitude && longitude) {
      fetchWeatherData();
    }
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No weather data available</p>
      </div>
    );
  }

  // Get the current weather
  const current = weatherData.current;
  const currentWeather = current.weather[0];
  
  // Get the forecast for the next few days (one entry per day)
  const forecast = weatherData.forecast.list
    .filter((item, index) => index % 8 === 0) // Get one forecast per day (every 24 hours)
    .slice(0, 3); // Limit to 3 days

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
      <div className="p-4 bg-indigo-600 text-white">
        <h3 className="text-lg font-semibold">Weather in {current.name}</h3>
      </div>
      
      {/* Current weather */}
      <div className="p-4 flex items-center">
        <Image
          src={`https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`}
          alt={currentWeather.description}
          width={64}
          height={64}
          priority
        />
        <div className="ml-4">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {Math.round(current.main.temp)}°C
          </p>
          <p className="text-gray-600 capitalize dark:text-gray-300">
            {currentWeather.description}
          </p>
        </div>
      </div>
      
      <div className="px-4 pb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Feels like</p>
          <p className="text-gray-800 dark:text-white">{Math.round(current.main.feels_like)}°C</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Humidity</p>
          <p className="text-gray-800 dark:text-white">{current.main.humidity}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Wind</p>
          <p className="text-gray-800 dark:text-white">{current.wind.speed} m/s</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pressure</p>
          <p className="text-gray-800 dark:text-white">{current.main.pressure} hPa</p>
        </div>
      </div>
      
      {/* Forecast */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <h4 className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">3-Day Forecast</h4>
        <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
          {forecast.map((day) => (
            <div key={day.dt} className="p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <Image
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                alt={day.weather[0].description}
                className="mx-auto"
                width={40}
                height={40}
              />
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {Math.round(day.main.temp)}°C
              </p>
              <p className="text-xs text-gray-500 capitalize dark:text-gray-400">
                {day.weather[0].main}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 