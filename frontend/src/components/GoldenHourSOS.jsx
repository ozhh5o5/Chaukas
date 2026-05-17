import { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, MapPin, Phone, Heart, CheckCircle, Navigation } from 'lucide-react';

const GOLDEN_HOUR_SECONDS = 60 * 60; // 60 minutes

// Mock nearest hospital data (replace with real API in production)
const NEAREST_HOSPITALS = [
  { name: 'AIIMS Trauma Centre', distance: 3.2, eta: 8, phone: '011-26588500' },
  { name: 'Apollo Hospitals', distance: 5.1, eta: 13, phone: '1860-500-1066' },
  { name: 'Safdarjung Hospital', distance: 4.7, eta: 11, phone: '011-26165060' },
];

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const GoldenHourSOS = ({ onSafe }) => {
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(GOLDEN_HOUR_SECONDS);
  const [hospital] = useState(NEAREST_HOSPITALS[0]);
  const [isSafe, setIsSafe] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const intervalRef = useRef(null);

  const urgencyColor = secondsLeft > 2400
    ? { text: 'text-green-400', bg: 'bg-green-500', border: 'border-green-500/40' }
    : secondsLeft > 1200
    ? { text: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500/40' }
    : { text: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500/60 animate-pulse' };

  const progressPercent = ((GOLDEN_HOUR_SECONDS - secondsLeft) / GOLDEN_HOUR_SECONDS) * 100;

  const startSOS = () => {
    setIsActive(true);
    setSosTriggered(true);
    // Notify backend
    fetch('/api/emergency/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'road_accident', timestamp: new Date().toISOString() })
    }).catch(() => {});
  };

  const markSafe = () => {
    setIsSafe(true);
    setIsActive(false);
    clearInterval(intervalRef.current);
    // Notify backend
    fetch('/api/emergency/safe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: new Date().toISOString() })
    }).catch(() => {});
    if (onSafe) onSafe();
  };

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  useEffect(() => {
    if (secondsLeft === 0) {
      clearInterval(intervalRef.current);
    }
  }, [secondsLeft]);

  if (isSafe) {
    return (
      <div className="rounded-2xl border border-green-500/40 bg-green-900/20 p-6 flex flex-col items-center gap-4 text-center">
        <CheckCircle className="w-12 h-12 text-green-400" />
        <h3 className="text-xl font-bold text-white font-display">You are marked Safe</h3>
        <p className="text-green-300 text-sm font-mono">Your emergency contacts have been notified via SMS.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${urgencyColor.border} bg-black/60 backdrop-blur-md p-6 flex flex-col gap-5`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${urgencyColor.text}`} />
          <span className="text-white font-bold font-display uppercase tracking-wider">
            {isActive ? 'SOS ACTIVE — Golden Hour' : 'Emergency SOS'}
          </span>
        </div>
        {isActive && (
          <div className={`text-xs font-mono font-bold px-2 py-1 rounded ${urgencyColor.text} border ${urgencyColor.border}`}>
            LIVE
          </div>
        )}
      </div>

      {/* Timer */}
      {isActive && (
        <>
          <div className="text-center">
            <div className={`text-6xl font-mono font-bold ${urgencyColor.text} tracking-widest`}>
              {formatTime(secondsLeft)}
            </div>
            <div className="text-gray-400 text-xs font-mono mt-1 uppercase tracking-widest">Time Remaining (Golden Hour)</div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${urgencyColor.bg} transition-all duration-1000`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Nearest Hospital */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono uppercase tracking-widest">
              <Navigation className="w-3 h-3" /> Nearest Trauma Centre
            </div>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white font-bold text-sm">{hospital.name}</div>
                <div className="text-gray-400 text-xs font-mono">{hospital.distance} km away · ETA ~{hospital.eta} min</div>
              </div>
              <a
                href={`tel:${hospital.phone}`}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-lg font-bold transition-colors"
              >
                <Phone className="w-3 h-3" /> Call
              </a>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!isActive ? (
          <button
            onClick={startSOS}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-sm transition-all shadow-lg shadow-red-900/40"
          >
            <AlertTriangle className="w-5 h-5" />
            TRIGGER SOS
          </button>
        ) : (
          <button
            onClick={markSafe}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-sm transition-all shadow-lg shadow-green-900/40"
          >
            <Heart className="w-5 h-5" />
            I'M SAFE
          </button>
        )}
      </div>

      {!isActive && (
        <p className="text-center text-gray-500 text-xs font-mono">
          Triggers emergency call, notifies nearest hospital & your contacts
        </p>
      )}
    </div>
  );
};

export default GoldenHourSOS;
