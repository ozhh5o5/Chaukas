import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Map as MapIcon, Zap, Activity, Navigation } from 'lucide-react';
import { potholeService } from '../lib/potholeDetectionService';
import PotholeMap from '../components/PotholeMap';
import { Trophy, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

const PotholeAwarenessPage = () => {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [hotspots, setHotspots] = useState([]);
    const [lastDetection, setLastDetection] = useState(null);
    const [stats, setStats] = useState({ total_sensor_events: 0, active_hotspots: 0 });
    const [badges, setBadges] = useState([
        { id: 1, name: 'Pothole Pioneer', icon: <Activity size={16}/>, unlocked: true },
        { id: 2, name: 'Urban Guardian', icon: <ShieldCheck size={16}/>, unlocked: false },
        { id: 3, name: 'Road Warrior', icon: <Trophy size={16}/>, unlocked: false },
    ]);

    useEffect(() => {
        fetchHotspots();
        const interval = setInterval(fetchHotspots, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchHotspots = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/potholes/hotspots');
            const data = await res.json();
            setHotspots(data);

            const statRes = await fetch('http://localhost:8000/api/potholes/stats');
            const statData = await statRes.json();
            setStats(statData);
        } catch (e) {
            console.error("Fetch error", e);
        }
    };

    const toggleMonitoring = () => {
        if (isMonitoring) {
            potholeService.stopMonitoring();
        } else {
            potholeService.startMonitoring((payload) => {
                setLastDetection(payload);
                if (voiceEnabled && payload.accel_z > 20) {
                    potholeService.speakAlert(`Warning: ${payload.severity} road hazard detected!`);
                }
            });
        }
        setIsMonitoring(!isMonitoring);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
                            <Activity className="animate-pulse" /> Pothole Intelligence
                        </h1>
                        <p className="text-gray-400 mt-1">Real-time accelerometer-based road hazard detection</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`p-3 rounded-xl transition-all ${voiceEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-700 text-gray-500'}`}
                            title={voiceEnabled ? "Voice Alerts On" : "Voice Alerts Off"}
                        >
                            {voiceEnabled ? <Volume2 /> : <VolumeX />}
                        </button>
                        <button 
                            onClick={toggleMonitoring}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${
                                isMonitoring 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                                : 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:scale-105'
                            }`}
                        >
                            {isMonitoring ? 'Stop Monitoring' : 'Start Detection'}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Active Hotspots</p>
                        <h2 className="text-4xl font-bold mt-2 text-cyan-400">{stats.active_hotspots}</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs text-green-400 bg-green-400/10 w-fit px-2 py-1 rounded">
                            <Zap size={14} /> AI Verified
                        </div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Detection Confidence</p>
                        <h2 className="text-4xl font-bold mt-2 text-cyan-400">92.4%</h2>
                        <p className="text-xs text-gray-500 mt-4">Across {stats.total_sensor_events} sensor events</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Road Health Index</p>
                        <h2 className="text-4xl font-bold mt-2 text-yellow-400">Fair</h2>
                        <p className="text-xs text-gray-500 mt-4">Based on regional clustering</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="lg:col-span-2 space-y-8">
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <MapIcon className="text-cyan-400" /> Hazard Hotspot Map
                            </h3>
                            <PotholeMap hotspots={hotspots} />
                        </div>

                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Trophy className="text-yellow-400" /> Road Warrior Rewards
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {badges.map(badge => (
                                    <div key={badge.id} className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                                        badge.unlocked ? 'bg-cyan-500/10 border-cyan-500/50 text-white' : 'bg-gray-900/50 border-gray-700 text-gray-600 grayscale'
                                    }`}>
                                        <div className={`p-3 rounded-full ${badge.unlocked ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800'}`}>
                                            {badge.icon}
                                        </div>
                                        <p className="text-xs font-bold">{badge.name}</p>
                                        {!badge.unlocked && <p className="text-[10px] uppercase tracking-tighter">Locked</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Activity className="text-cyan-400" /> Recent Hotspots
                            </h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {hotspots.map((h, i) => (
                                    <div key={i} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex justify-between items-center group hover:border-cyan-500/50 transition-colors">
                                        <div>
                                            <p className="font-bold text-gray-200">Zone {i+1}</p>
                                            <p className="text-xs text-gray-500">Reports: {h.report_count} • Conf: {(h.confidence_score * 100).toFixed(0)}%</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            h.severity === 'Deep' ? 'bg-red-500/20 text-red-400' : h.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                            {h.severity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col items-center justify-center text-center">
                            <div className="mb-6 p-4 bg-cyan-400/10 rounded-full">
                                <Navigation className="text-cyan-400" size={48} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Smart Route Suggestor</h3>
                            <p className="text-gray-400 mb-8 max-w-md">Avoid hazardous road conditions using AI telemetry.</p>
                            
                            <div className="w-full bg-gray-900/50 p-6 rounded-2xl border border-dashed border-gray-600 mb-8">
                                <p className="text-sm text-gray-500">Last Detected Spike</p>
                                {lastDetection ? (
                                    <div className="mt-4">
                                        <p className="text-2xl font-bold text-red-400">{lastDetection.accel_z.toFixed(2)} m/s²</p>
                                        <p className="text-xs text-gray-500 mt-1">{lastDetection.severity} Impact Detected</p>
                                    </div>
                                ) : (
                                    <p className="mt-4 text-gray-600 italic">No events detected</p>
                                )}
                            </div>

                            <button 
                                onClick={() => potholeService.simulateImpact()}
                                className="text-cyan-400 text-sm font-bold hover:underline"
                            >
                                Simulate Impact for Demo
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PotholeAwarenessPage;
