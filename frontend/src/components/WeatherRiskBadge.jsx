import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, AlertTriangle } from 'lucide-react';

const WEATHER_API_KEY = '7b0a575ec0139fb4f24db5e3d843367a';

const getRiskLevel = (weatherId, visibility, windSpeed, hour) => {
  const isNight = hour < 6 || hour > 20;
  let risk = 'LOW';
  let score = 0;

  // Thunderstorm
  if (weatherId >= 200 && weatherId < 300) score += 4;
  // Drizzle / Rain
  else if (weatherId >= 300 && weatherId < 600) score += 3;
  // Snow / Ice
  else if (weatherId >= 600 && weatherId < 700) score += 4;
  // Fog / Mist / Haze
  else if (weatherId >= 700 && weatherId < 800) score += 3;
  // Clear
  else if (weatherId === 800) score += 0;
  // Clouds
  else score += 1;

  if (visibility < 1000) score += 3;
  else if (visibility < 5000) score += 1;
  if (windSpeed > 15) score += 2;
  if (isNight) score += 2;

  if (score >= 6) risk = 'CRITICAL';
  else if (score >= 4) risk = 'HIGH';
  else if (score >= 2) risk = 'ELEVATED';
  return { risk, score };
};

const riskColors = {
  LOW: { bg: 'bg-green-900/40', border: 'border-green-500/40', text: 'text-green-400', dot: 'bg-green-400' },
  ELEVATED: { bg: 'bg-yellow-900/40', border: 'border-yellow-500/40', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  HIGH: { bg: 'bg-orange-900/40', border: 'border-orange-500/40', text: 'text-orange-400', dot: 'bg-orange-400' },
  CRITICAL: { bg: 'bg-red-900/40', border: 'border-red-500/40', text: 'text-red-400', dot: 'bg-red-500 animate-pulse' },
};

const weatherIcons = {
  clear: <Sun className="w-5 h-5 text-yellow-400" />,
  clouds: <Cloud className="w-5 h-5 text-gray-400" />,
  rain: <CloudRain className="w-5 h-5 text-blue-400" />,
  snow: <CloudSnow className="w-5 h-5 text-blue-200" />,
  wind: <Wind className="w-5 h-5 text-gray-300" />,
  fog: <Cloud className="w-5 h-5 text-gray-500" />,
};

const getWeatherIcon = (id) => {
  if (id >= 200 && id < 300) return weatherIcons.rain;
  if (id >= 300 && id < 600) return weatherIcons.rain;
  if (id >= 600 && id < 700) return weatherIcons.snow;
  if (id >= 700 && id < 800) return weatherIcons.fog;
  if (id === 800) return weatherIcons.clear;
  return weatherIcons.clouds;
};

const WeatherRiskBadge = ({ compact = false }) => {
  const [weather, setWeather] = useState(null);
  const [riskInfo, setRiskInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
        );
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();
        const hour = new Date().getHours();
        const risk = getRiskLevel(data.weather[0].id, data.visibility, data.wind.speed, hour);
        setWeather(data);
        setRiskInfo(risk);
      } catch (e) {
        setError('Weather unavailable');
        // Fallback mock data for demo
        setWeather({ weather: [{ id: 800, description: 'clear sky' }], main: { temp: 28 }, wind: { speed: 5 }, visibility: 10000, name: 'Your Location' });
        setRiskInfo({ risk: 'LOW', score: 0 });
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => {
          // Default to Delhi if no GPS
          fetchWeather(28.6139, 77.2090);
        }
      );
    } else {
      fetchWeather(28.6139, 77.2090);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 animate-pulse">
        <div className="w-4 h-4 bg-gray-600 rounded-full" />
        <span className="text-xs text-gray-500 font-mono">Checking weather...</span>
      </div>
    );
  }

  if (!weather || !riskInfo) return null;

  const colors = riskColors[riskInfo.risk];
  const icon = getWeatherIcon(weather.weather[0].id);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colors.bg} ${colors.border}`}>
        {icon}
        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        <span className={`text-xs font-bold font-mono ${colors.text}`}>{riskInfo.risk} RISK</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 ${colors.bg} ${colors.border} w-full`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${colors.text}`} />
          <span className={`text-xs font-bold font-mono uppercase tracking-widest ${colors.text}`}>
            Road Risk: {riskInfo.risk}
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
      </div>

      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-white text-sm font-semibold capitalize">
            {weather.weather[0].description}
          </div>
          <div className="text-gray-400 text-xs font-mono">
            {Math.round(weather.main.temp)}°C · Wind {Math.round(weather.wind.speed * 3.6)} km/h · {weather.name}
          </div>
        </div>
      </div>

      {riskInfo.risk !== 'LOW' && (
        <div className={`mt-3 text-xs font-mono ${colors.text} border-t border-white/5 pt-3`}>
          ⚠️ {riskInfo.risk === 'CRITICAL' ? 'Extreme weather — avoid highway travel if possible.' :
              riskInfo.risk === 'HIGH' ? 'Hazardous conditions — reduce speed, increase following distance.' :
              'Moderate risk — drive carefully, watch for reduced visibility.'}
        </div>
      )}
    </div>
  );
};

export default WeatherRiskBadge;
