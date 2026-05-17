import React, { useState, useEffect } from 'react';
import HeatmapVisualization from '../components/HeatmapVisualization';
import { useAuth } from '../context/AuthContext';
import { Target, Activity, TrendingUp, AlertTriangle, Shield, Zap, Volume2, VolumeX, Play, Square, MapPin, BarChart2 } from 'lucide-react';
import { potholeService } from '../lib/potholeDetectionService';

const INDORE_CENTER = { latitude: 22.7196, longitude: 75.8577 };

const INDORE_INCIDENTS = [
    { id: 1, latitude: 22.7196, longitude: 75.8577, severity: 'critical', type: 'accident', location: 'Rajwada Chowk', created_at: new Date().toISOString() },
    { id: 2, latitude: 22.7310, longitude: 75.8720, severity: 'high',     type: 'accident', location: 'Vijay Nagar Square', created_at: new Date(Date.now()-3600000).toISOString() },
    { id: 3, latitude: 22.7245, longitude: 75.8400, severity: 'critical', type: 'accident', location: 'Palasia', created_at: new Date(Date.now()-7200000).toISOString() },
    { id: 4, latitude: 22.7050, longitude: 75.8650, severity: 'high',     type: 'accident', location: 'LIG Square', created_at: new Date(Date.now()-10800000).toISOString() },
    { id: 5, latitude: 22.7400, longitude: 75.8550, severity: 'medium',   type: 'accident', location: 'Scheme 54', created_at: new Date(Date.now()-14400000).toISOString() },
    { id: 6, latitude: 22.7155, longitude: 75.8800, severity: 'high',     type: 'accident', location: 'Bhawarkuan', created_at: new Date(Date.now()-21600000).toISOString() },
    { id: 7, latitude: 22.6960, longitude: 75.8500, severity: 'medium',   type: 'accident', location: 'Khajrana', created_at: new Date(Date.now()-28800000).toISOString() },
    { id: 8, latitude: 22.7480, longitude: 75.8900, severity: 'critical', type: 'accident', location: 'Super Corridor', created_at: new Date(Date.now()-36000000).toISOString() },
];

// EDA seed: simulated accelerometer readings per Indore area
const AREA_EDA = [
    { area: 'Rajwada',      avgAccel: 24.3, events: 12, deep: 5,  medium: 5,  shallow: 2,  lat: 22.7196, lng: 75.8577 },
    { area: 'Vijay Nagar',  avgAccel: 18.7, events: 8,  deep: 2,  medium: 4,  shallow: 2,  lat: 22.7310, lng: 75.8720 },
    { area: 'Palasia',      avgAccel: 21.5, events: 10, deep: 4,  medium: 4,  shallow: 2,  lat: 22.7245, lng: 75.8400 },
    { area: 'LIG Square',   avgAccel: 16.2, events: 6,  deep: 1,  medium: 3,  shallow: 2,  lat: 22.7050, lng: 75.8650 },
    { area: 'Scheme 54',    avgAccel: 14.1, events: 4,  deep: 0,  medium: 2,  shallow: 2,  lat: 22.7400, lng: 75.8550 },
    { area: 'Bhawarkuan',   avgAccel: 19.8, events: 9,  deep: 3,  medium: 4,  shallow: 2,  lat: 22.7155, lng: 75.8800 },
    { area: 'Khajrana',     avgAccel: 15.4, events: 5,  deep: 1,  medium: 2,  shallow: 2,  lat: 22.6960, lng: 75.8500 },
    { area: 'Super Corridor', avgAccel: 12.0, events: 3, deep: 0, medium: 1,  shallow: 2,  lat: 22.7480, lng: 75.8900 },
];

const MAX_ACCEL = 30;

const severityColor = { Deep:'#ef4444', Medium:'#f59e0b', Shallow:'#3b82f6' };

const getAccelColor = (val) => {
    if (val >= 22) return '#ef4444';
    if (val >= 17) return '#f59e0b';
    return '#3b82f6';
};

const getSeverityBadge = (sev) => {
    const map = {
        Deep:'bg-red-500/20 text-red-400', Medium:'bg-yellow-500/20 text-yellow-400',
        Shallow:'bg-blue-500/20 text-blue-400', critical:'bg-red-500/20 text-red-400',
        high:'bg-orange-500/20 text-orange-400', medium:'bg-yellow-500/20 text-yellow-400',
    };
    return (map[sev] || 'bg-gray-700 text-gray-400') + ' px-2 py-0.5 rounded-full text-[10px] font-bold';
};

// ── Bar Chart — Avg Acceleration by Area ─────────────────────────────────
const BarChart = ({ data }) => {
    const W = 620, H = 200;
    const pad = { l: 48, r: 20, t: 20, b: 56 };
    const innerW = W - pad.l - pad.r;
    const innerH = H - pad.t - pad.b;
    const gap  = innerW / data.length;
    const barW = gap * 0.55;
    const yTicks = [0, 7.5, 15, 22.5, 30];

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* Y axis ticks + grid */}
            {yTicks.map(v => {
                const y = pad.t + innerH * (1 - v / MAX_ACCEL);
                return (
                    <g key={v}>
                        <line x1={pad.l} x2={W - pad.r} y1={y} y2={y}
                              stroke="#374151" strokeWidth={0.6} strokeDasharray="4 3" />
                        <text x={pad.l - 6} y={y + 4} fill="#6b7280" fontSize={9}
                              textAnchor="end">{v}</text>
                    </g>
                );
            })}
            {/* Threshold */}
            {(() => { const ty = pad.t + innerH * (1 - 15 / MAX_ACCEL); return (
                <>
                    <line x1={pad.l} x2={W - pad.r} y1={ty} y2={ty}
                          stroke="#f59e0b" strokeWidth={1.2} strokeDasharray="6 3" />
                    <text x={pad.l + 6} y={ty - 5} fill="#f59e0b" fontSize={9}
                          fontWeight="bold">Threshold 15 m/s²</text>
                </>
            ); })()}
            {/* Y-axis label */}
            <text x={12} y={pad.t + innerH / 2} fill="#9ca3af" fontSize={10}
                  textAnchor="middle"
                  transform={`rotate(-90, 12, ${pad.t + innerH / 2})`}>m/s²</text>
            {/* Bars */}
            {data.map((d, i) => {
                const x   = pad.l + i * gap + (gap - barW) / 2;
                const bh  = (d.avgAccel / MAX_ACCEL) * innerH;
                const y   = pad.t + innerH - bh;
                const col = getAccelColor(d.avgAccel);
                const lx  = x + barW / 2;
                const ly  = pad.t + innerH + 10;
                return (
                    <g key={d.area}>
                        <rect x={x} y={y} width={barW} height={bh} fill={col} opacity={0.85} rx={3} />
                        <text x={lx} y={y - 5} fill={col} fontSize={9} textAnchor="middle"
                              fontWeight="bold">{d.avgAccel}</text>
                        <text x={0} y={0} fill="#9ca3af" fontSize={9} textAnchor="end"
                              transform={`translate(${lx}, ${ly}) rotate(-38)`}>{d.area}</text>
                    </g>
                );
            })}
            {/* Axes */}
            <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} stroke="#4b5563" strokeWidth={1} />
            <line x1={pad.l} y1={pad.t + innerH} x2={W - pad.r} y2={pad.t + innerH} stroke="#4b5563" strokeWidth={1} />
        </svg>
    );
};

// ── Stacked Severity Bar Chart ───────────────────────────────────────────────
const StackedBar = ({ data }) => {
    const W = 620, H = 200;
    const pad = { l: 48, r: 20, t: 32, b: 56 };
    const innerW = W - pad.l - pad.r;
    const innerH = H - pad.t - pad.b;
    const gap  = innerW / data.length;
    const barW = gap * 0.55;
    const maxEvents = Math.max(...data.map(d => d.events));
    const yTicks = [0, 3, 6, 9, 12];

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {/* Legend */}
            {[['Deep','#ef4444'],['Medium','#f59e0b'],['Shallow','#3b82f6']].map(([l, c], i) => (
                <g key={l} transform={`translate(${pad.l + i * 90}, 8)`}>
                    <rect width={10} height={10} fill={c} rx={2} />
                    <text x={14} y={9} fill="#d1d5db" fontSize={9}>{l}</text>
                </g>
            ))}
            {/* Y ticks + grid */}
            {yTicks.map(v => {
                const y = pad.t + innerH * (1 - v / maxEvents);
                return (
                    <g key={v}>
                        <line x1={pad.l} x2={W - pad.r} y1={y} y2={y}
                              stroke="#374151" strokeWidth={0.6} strokeDasharray="4 3" />
                        <text x={pad.l - 6} y={y + 4} fill="#6b7280" fontSize={9}
                              textAnchor="end">{v}</text>
                    </g>
                );
            })}
            {/* Y-axis label */}
            <text x={12} y={pad.t + innerH / 2} fill="#9ca3af" fontSize={10}
                  textAnchor="middle"
                  transform={`rotate(-90, 12, ${pad.t + innerH / 2})`}>Events</text>
            {/* Bars */}
            {data.map((d, i) => {
                const x    = pad.l + i * gap + (gap - barW) / 2;
                const base = pad.t + innerH;
                const scale = innerH / maxEvents;
                const dh = d.deep   * scale;
                const mh = d.medium * scale;
                const sh = d.shallow * scale;
                const lx = x + barW / 2;
                const ly = pad.t + innerH + 10;
                return (
                    <g key={d.area}>
                        <rect x={x} y={base - dh}         width={barW} height={dh} fill="#ef4444" rx={2} />
                        <rect x={x} y={base - dh - mh}    width={barW} height={mh} fill="#f59e0b" rx={2} />
                        <rect x={x} y={base - dh - mh - sh} width={barW} height={sh} fill="#3b82f6" rx={2} />
                        <text x={0} y={0} fill="#9ca3af" fontSize={9} textAnchor="end"
                              transform={`translate(${lx}, ${ly}) rotate(-38)`}>{d.area}</text>
                    </g>
                );
            })}
            {/* Axes */}
            <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} stroke="#4b5563" strokeWidth={1} />
            <line x1={pad.l} y1={pad.t + innerH} x2={W - pad.r} y2={pad.t + innerH} stroke="#4b5563" strokeWidth={1} />
        </svg>
    );
};

// ── Main Page ───────────────────────────────────────────────────────────────
const HotspotPage = () => {
    const { user } = useAuth();
    const [userLocation, setUserLocation] = useState(INDORE_CENTER);
    const [potholes, setPotholes]         = useState([]);
    const [potholeStats, setPotholeStats] = useState({ total_sensor_events: 0, active_hotspots: 0 });
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [lastDetection, setLastDetection] = useState(null);
    const [detectionLog, setDetectionLog]   = useState([]);   // last 8 events for timeline

    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            p => setUserLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
            () => setUserLocation(INDORE_CENTER)
        );
    }, []);

    const fetchPotholes = async () => {
        try {
            const [hr, sr] = await Promise.all([
                fetch('http://localhost:8000/api/potholes/hotspots'),
                fetch('http://localhost:8000/api/potholes/stats'),
            ]);
            if (hr.ok) setPotholes(await hr.json());
            if (sr.ok) setPotholeStats(await sr.json());
        } catch { /* offline – seed data shows */ }
    };

    useEffect(() => { fetchPotholes(); const i = setInterval(fetchPotholes, 5000); return () => clearInterval(i); }, []);

    const toggleMonitoring = () => {
        if (isMonitoring) { potholeService.stopMonitoring(); setIsMonitoring(false); return; }
        potholeService.startMonitoring((payload) => {
            setLastDetection(payload);
            setDetectionLog(prev => [payload, ...prev].slice(0, 8));
            if (voiceEnabled && payload.accel_z > 20)
                potholeService.speakAlert(`Warning! ${payload.severity} pothole detected!`);
            setTimeout(fetchPotholes, 1500);
        });
        setIsMonitoring(true);
    };

    const handleSimulate = () => { potholeService.simulateImpact(); setTimeout(fetchPotholes, 1500); };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">

            {/* ── Header ── */}
            <div className="bg-gray-800/90 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Target className="text-cyan-400" size={26} />
                    <div>
                        <h1 className="text-xl font-bold text-cyan-400">ML Hotspot + Pothole Intelligence · Indore</h1>
                        <p className="text-gray-400 text-xs">Accident heatmap + accelerometer-detected pothole overlay</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-600/80 rounded-full font-bold"><Activity size={11} /> LIVE</span>
                    <span className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded-full text-gray-300"><MapPin size={11} className="text-cyan-400" /> Indore, MP</span>
                </div>
            </div>

            {/* ── Legend ── */}
            <div className="bg-gray-800/50 border-b border-gray-700/50 px-6 py-2 flex flex-wrap gap-5 text-xs">
                <span className="text-gray-500 font-bold uppercase tracking-wider">Accident Zones:</span>
                {[['green-400','Safe'],['yellow-400','Caution'],['orange-400','Warning'],['red-400','Danger']].map(([c,l])=>(
                    <span key={l} className={`flex items-center gap-1 text-${c}`}><span className={`w-2.5 h-2.5 rounded-sm bg-${c} inline-block`}/>{l}</span>
                ))}
                <span className="text-gray-600">|</span>
                <span className="text-gray-500 font-bold uppercase tracking-wider">Potholes:</span>
                {[['red-500','Deep'],['yellow-500','Medium'],['blue-500','Shallow']].map(([c,l])=>(
                    <span key={l} className={`flex items-center gap-1 text-${c}`}><span className={`w-2.5 h-2.5 rounded-full bg-${c} inline-block`}/>{l}</span>
                ))}
            </div>

            {/* ── Map + Sensor Sidebar ── */}
            <div className="flex" style={{ height: '55vh' }}>
                <div className="flex-1 overflow-hidden">
                    <HeatmapVisualization incidents={INDORE_INCIDENTS} userLocation={userLocation} potholes={potholes} />
                </div>

                {/* Sensor Panel */}
                <div className="w-72 bg-gray-800 border-l border-gray-700 flex flex-col overflow-y-auto">
                    <div className="p-4 border-b border-gray-700">
                        <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Zap size={13}/>Accelerometer Sensor</p>
                        <div className="flex gap-2 mb-2">
                            <button onClick={toggleMonitoring} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-sm transition-all ${isMonitoring ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-cyan-500 text-white hover:bg-cyan-400'}`}>
                                {isMonitoring ? <><Square size={13}/>Stop</> : <><Play size={13}/>Start Sensor</>}
                            </button>
                            <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`p-2 rounded-lg border transition-all ${voiceEnabled ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' : 'bg-gray-700 border-gray-600 text-gray-500'}`}>
                                {voiceEnabled ? <Volume2 size={15}/> : <VolumeX size={15}/>}
                            </button>
                        </div>
                        <button onClick={handleSimulate} className="w-full text-xs text-cyan-400 hover:underline">▶ Simulate Impact (Demo)</button>
                    </div>

                    {/* Stats */}
                    <div className="p-3 border-b border-gray-700 grid grid-cols-2 gap-2">
                        {[['Hotspots', potholeStats.active_hotspots,'cyan'],['Events', potholeStats.total_sensor_events,'purple']].map(([l,v,c])=>(
                            <div key={l} className="bg-gray-900/60 rounded-lg p-3 text-center">
                                <p className={`text-2xl font-bold text-${c}-400`}>{v}</p>
                                <p className="text-[10px] text-gray-500 uppercase mt-0.5">{l}</p>
                            </div>
                        ))}
                    </div>

                    {/* Last spike */}
                    {lastDetection && (
                        <div className="p-3 border-b border-gray-700">
                            <p className="text-[10px] text-gray-500 uppercase mb-1">Last Spike</p>
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                                <p className="text-xl font-bold text-red-400">{lastDetection.accel_z?.toFixed(2)} m/s²</p>
                                <p className="text-[10px] text-gray-400">{lastDetection.severity} · {new Date(lastDetection.timestamp).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    )}

                    {/* Pothole list */}
                    <div className="p-3 flex-1 overflow-y-auto">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Active Pothole Zones</p>
                        {potholes.length === 0
                            ? <p className="text-[10px] text-gray-600 italic text-center py-4">Click "Simulate Impact" to add pothole data to the map.</p>
                            : potholes.map((h,i) => (
                                <div key={i} className="mb-2 bg-gray-900/60 rounded-lg p-2.5 border border-gray-700">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-xs font-bold text-gray-200">Zone {i+1}</span>
                                        <span className={getSeverityBadge(h.severity)}>{h.severity}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500">{h.lat?.toFixed(4)}, {h.lng?.toFixed(4)}</p>
                                    <p className="text-[10px] text-gray-600">{h.report_count} reports · {Math.round(h.confidence_score*100)}% conf.</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* ══ EDA SECTION ══════════════════════════════════════════════════════ */}
            <div className="bg-gray-900 border-t-2 border-cyan-500/20 px-6 py-6">
                <div className="flex items-center gap-3 mb-6">
                    <BarChart2 className="text-cyan-400" size={22}/>
                    <div>
                        <h2 className="text-lg font-bold text-white">Accelerometer EDA — Indore Road Analysis</h2>
                        <p className="text-xs text-gray-500">Exploratory analysis of sensor-detected pothole events across Indore neighbourhoods</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                    {/* Chart 1: Avg Accel by Area */}
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
                        <h3 className="text-sm font-bold text-cyan-400 mb-1">Avg. Vertical Acceleration by Area</h3>
                        <p className="text-xs text-gray-500 mb-3">Higher values = more severe road jolts. Orange line = detection threshold (15 m/s²).</p>
                        <BarChart data={AREA_EDA} />
                    </div>

                    {/* Chart 2: Stacked severity distribution */}
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
                        <h3 className="text-sm font-bold text-cyan-400 mb-1">Pothole Severity Breakdown by Area</h3>
                        <p className="text-xs text-gray-500 mb-3">Stacked by depth — Deep (red) / Medium (yellow) / Shallow (blue).</p>
                        <StackedBar data={AREA_EDA} />
                    </div>
                </div>

                {/* Area Table */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-700 flex items-center gap-2">
                        <Target size={15} className="text-cyan-400"/>
                        <h3 className="text-sm font-bold text-white">Area-wise Accelerometer Summary</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: 720 }}>
                            <colgroup>
                                <col style={{ width: '18%' }} />  {/* Area */}
                                <col style={{ width: '14%' }} />  {/* Avg Accel */}
                                <col style={{ width: '12%' }} />  {/* Events */}
                                <col style={{ width: '9%' }}  />  {/* Deep */}
                                <col style={{ width: '9%' }}  />  {/* Medium */}
                                <col style={{ width: '9%' }}  />  {/* Shallow */}
                                <col style={{ width: '10%' }} />  {/* Risk */}
                                <col style={{ width: '19%' }} />  {/* Bar */}
                            </colgroup>
                            <thead>
                                <tr className="text-[10px] text-gray-500 uppercase tracking-wider bg-gray-900/50 border-b border-gray-700">
                                    <th className="px-4 py-2.5 text-left">Area</th>
                                    <th className="px-4 py-2.5 text-right">Avg Accel m/s²</th>
                                    <th className="px-4 py-2.5 text-right">Events</th>
                                    <th className="px-4 py-2.5 text-right text-red-400">Deep</th>
                                    <th className="px-4 py-2.5 text-right text-yellow-400">Med.</th>
                                    <th className="px-4 py-2.5 text-right text-blue-400">Shallow</th>
                                    <th className="px-4 py-2.5 text-center">Risk</th>
                                    <th className="px-4 py-2.5 text-left">Accel Intensity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...AREA_EDA].sort((a, b) => b.avgAccel - a.avgAccel).map((row, i) => {
                                    const risk = row.avgAccel >= 22 ? ['High', 'text-red-400'] : row.avgAccel >= 17 ? ['Medium', 'text-yellow-400'] : ['Low', 'text-green-400'];
                                    const pct  = (row.avgAccel / MAX_ACCEL) * 100;
                                    const col  = getAccelColor(row.avgAccel);
                                    return (
                                        <tr key={row.area} className={`border-t border-gray-700/40 hover:bg-gray-700/25 transition-colors ${i === 0 ? 'bg-red-500/5' : ''}`}>
                                            <td className="px-4 py-3 font-medium text-gray-200 truncate">{row.area}</td>
                                            <td className="px-4 py-3 text-right font-mono font-bold" style={{ color: col }}>{row.avgAccel}</td>
                                            <td className="px-4 py-3 text-right text-gray-300">{row.events}</td>
                                            <td className="px-4 py-3 text-right text-red-400 font-mono">{row.deep}</td>
                                            <td className="px-4 py-3 text-right text-yellow-400 font-mono">{row.medium}</td>
                                            <td className="px-4 py-3 text-right text-blue-400 font-mono">{row.shallow}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    row.avgAccel >= 22 ? 'bg-red-500/15 text-red-400' :
                                                    row.avgAccel >= 17 ? 'bg-yellow-500/15 text-yellow-400' :
                                                    'bg-green-500/15 text-green-400'
                                                }`}>{risk[0]}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                                                        <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: col }} />
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 w-8 text-right">{Math.round(pct)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Insight Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[
                        { label: 'Worst Area', value: 'Rajwada', sub: '24.3 m/s² avg', col: 'red' },
                        { label: 'Total Sensor Events', value: AREA_EDA.reduce((s,d)=>s+d.events,0), sub: 'Across all areas', col: 'cyan' },
                        { label: 'Deep Potholes', value: AREA_EDA.reduce((s,d)=>s+d.deep,0), sub: 'Require urgent repair', col: 'orange' },
                        { label: 'Detection Rate', value: '92.4%', sub: 'Avg confidence score', col: 'green' },
                    ].map(c => (
                        <div key={c.label} className={`bg-gray-800 rounded-xl border border-${c.col}-500/20 p-4`}>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{c.label}</p>
                            <p className={`text-2xl font-bold text-${c.col}-400 mt-1`}>{c.value}</p>
                            <p className="text-[10px] text-gray-600 mt-0.5">{c.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HotspotPage;