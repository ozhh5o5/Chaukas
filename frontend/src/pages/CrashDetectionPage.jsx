import React, { useState, useEffect, useRef } from 'react';
import { Car, AlertTriangle, Activity, CheckCircle, Phone, Users, Radio, Wifi, WifiOff, Camera, FileText, Shield, MapPin, Clock } from 'lucide-react';

const INDORE = { lat: 22.7196, lng: 75.8577 };
const CRASH_THRESHOLD = 50;
const SOS_COUNTDOWN = 10;

// Simulated nearby community members
const NEARBY = [
    { name: 'Rahul S.', dist: '0.4 km', status: 'notified' },
    { name: 'Priya M.', dist: '0.8 km', status: 'notified' },
    { name: 'Amit K.', dist: '1.2 km', status: 'notified' },
];

const DISPATCH_LAYERS = [
    { label: 'Indore CATS Ambulance', number: '108', icon: '🚑', color: 'red', delay: 500 },
    { label: 'Indore Police Control', number: '100', icon: '🚔', color: 'blue', delay: 1200 },
    { label: 'Fire Brigade', number: '101', icon: '🚒', color: 'orange', delay: 1800 },
    { label: 'Community (3 nearby)', number: 'Mesh', icon: '👥', color: 'cyan', delay: 400 },
    { label: 'Emergency Contacts', number: '2 contacts', icon: '📱', color: 'green', delay: 300 },
];

const CrashDetectionPage = () => {
    const [monitoring, setMonitoring] = useState(false);
    const [crashDetected, setCrashDetected] = useState(false);
    const [countdown, setCountdown] = useState(SOS_COUNTDOWN);
    const [sosSent, setSosSent] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [lastAccel, setLastAccel] = useState({ x: 0, y: 0, z: 0 });
    const [accelHistory, setAccelHistory] = useState(Array(30).fill(0));
    const [location, setLocation] = useState(INDORE);
    const [dispatched, setDispatched] = useState([]);
    const [isOffline, setIsOffline] = useState(false);
    const [sceneCapture, setSceneCapture] = useState(null);
    const [reportReady, setReportReady] = useState(false);
    const [medCard, setMedCard] = useState(null);
    const timerRef = useRef(null);
    const dispatchTimer = useRef(null);
    const synthRef = useRef(null);
    const crashRef = useRef(false);

    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            p => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => setLocation(INDORE)
        );
        const saved = localStorage.getItem('chaukas_medical_card');
        if (saved) setMedCard(JSON.parse(saved));
        setIsOffline(!navigator.onLine);
        window.addEventListener('online',  () => setIsOffline(false));
        window.addEventListener('offline', () => setIsOffline(true));

        // ── Synthetic accelerometer simulation ─────────────────────────────
        // Generates realistic road vibration noise + random pothole spikes
        let spikeCountdown = Math.floor(Math.random() * 80) + 40; // ~4–8s at 60ms tick
        synthRef.current = setInterval(() => {
            if (crashRef.current) return; // pause during real crash countdown
            spikeCountdown -= 1;
            let mag, x, y, z;
            if (spikeCountdown <= 0) {
                // Pothole spike: 14–30 m/s²
                mag = 14 + Math.random() * 16;
                x   = +(( Math.random() - 0.5) * 8).toFixed(1);
                y   = +(( Math.random() - 0.5) * 4).toFixed(1);
                z   = +(mag * (0.8 + Math.random() * 0.4)).toFixed(1);
                spikeCountdown = Math.floor(Math.random() * 80) + 40;
            } else {
                // Normal road noise: 2–8 m/s²
                mag = 2 + Math.random() * 6;
                x   = +(( Math.random() - 0.5) * 4).toFixed(1);
                y   = +(( Math.random() - 0.5) * 3).toFixed(1);
                z   = +(mag * (0.6 + Math.random() * 0.6)).toFixed(1);
            }
            setLastAccel({ x, y, z });
            setAccelHistory(prev => [...prev.slice(1), Math.min(mag, 60)]);
        }, 60);
        return () => { clearInterval(synthRef.current); };
    }, []);

    const runDispatch = () => {
        DISPATCH_LAYERS.forEach(d => {
            setTimeout(() => setDispatched(prev => [...prev, d.label]), d.delay);
        });
    };

    const runSceneCapture = () => {
        setSceneCapture('capturing');
        setTimeout(() => { setSceneCapture('uploading'); }, 1500);
        setTimeout(() => { setSceneCapture('done'); setReportReady(true); }, 3500);
    };

    const startCrash = () => {
        crashRef.current = true;
        setCrashDetected(true); setCancelled(false); setSosSent(false);
        setDispatched([]); setSceneCapture(null); setReportReady(false);
        // Inject big spike into history
        setAccelHistory(prev => [...prev.slice(1), 58]);
        setLastAccel({ x: '32.4', y: '-18.6', z: '54.2' });
        setCountdown(SOS_COUNTDOWN);
        let c = SOS_COUNTDOWN;
        timerRef.current = setInterval(() => {
            c -= 1; setCountdown(c);
            if (c <= 0) {
                clearInterval(timerRef.current);
                crashRef.current = false;
                setSosSent(true); setCrashDetected(false);
                runDispatch(); runSceneCapture();
                if (isOffline) triggerSMSFallback();
            }
        }, 1000);
    };

    const cancelSOS = () => {
        clearInterval(timerRef.current);
        crashRef.current = false;
        setCrashDetected(false); setCancelled(true);
        setTimeout(() => setCancelled(false), 3000);
    };

    const triggerSMSFallback = () => {
        const msg = encodeURIComponent(
            `🚨 ACCIDENT SOS from Chaukas\nLocation: ${location.lat.toFixed(4)},${location.lng.toFixed(4)}\nMap: https://maps.google.com?q=${location.lat},${location.lng}\nTime: ${new Date().toLocaleTimeString()}`
        );
        window.open(`sms:100?body=${msg}`, '_blank');
    };

    const handleMotion = (e) => {
        const { x, y, z } = e.acceleration || {};
        if (!x && !y && !z) return;
        setLastAccel({ x: (x||0).toFixed(1), y: (y||0).toFixed(1), z: (z||0).toFixed(1) });
        const mag = Math.sqrt((x||0)**2 + (y||0)**2 + (z||0)**2);
        setAccelHistory(prev => [...prev.slice(1), Math.min(mag, 60)]);
        if (mag > CRASH_THRESHOLD && !crashDetected) startCrash();
    };

    const toggleMonitoring = () => {
        if (monitoring) { window.removeEventListener('devicemotion', handleMotion); setMonitoring(false); }
        else { window.addEventListener('devicemotion', handleMotion); setMonitoring(true); }
    };

    const maxH = Math.max(...accelHistory, 10);

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-16">
            {/* Header */}
            <div className="bg-gray-900/95 border-b border-white/5 px-6 py-4 flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-xl"><Car className="text-red-400" size={20}/></div>
                <div>
                    <h1 className="text-xl font-bold text-white">Crash SOS — Multi-Layer Emergency Dispatch</h1>
                    <p className="text-[11px] text-gray-500">Silent broadcast · Scene documentation · Offline SMS fallback</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isOffline ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>
                        {isOffline ? <WifiOff size={11}/> : <Wifi size={11}/>}
                        {isOffline ? 'OFFLINE — SMS MODE' : 'ONLINE'}
                    </span>
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-bold ${monitoring ? 'bg-red-500/10 text-red-400' : 'bg-gray-700 text-gray-500'}`}>
                        <Activity size={11}/> {monitoring ? 'MONITORING' : 'STANDBY'}
                    </span>
                </div>
            </div>

            <div className="px-6 py-6 max-w-6xl mx-auto space-y-5">

                {/* CRASH COUNTDOWN */}
                {crashDetected && (
                    <div className="bg-red-500/10 border-2 border-red-500 rounded-2xl p-6 text-center">
                        <AlertTriangle className="text-red-400 mx-auto mb-2 animate-bounce" size={44}/>
                        <h2 className="text-2xl font-bold text-red-400 mb-1">💥 CRASH DETECTED</h2>
                        <p className="text-gray-400 mb-3">Dispatching to ALL emergency services in</p>
                        <div className="text-7xl font-black font-mono text-red-400 mb-4">{countdown}</div>
                        <p className="text-xs text-gray-500 mb-5">📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)} · Indore, MP{medCard ? ` · 🩸 ${medCard.blood}` : ''}</p>
                        <button onClick={cancelSOS} className="px-10 py-3 bg-white text-red-600 font-black rounded-xl text-lg hover:bg-gray-100 transition-all shadow-xl">
                            ✋ I'M OKAY — CANCEL SOS
                        </button>
                    </div>
                )}

                {/* SOS SENT STATE */}
                {sosSent && (
                    <div className="space-y-4">
                        {/* Broadcast layers */}
                        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Radio size={14} className="text-red-400"/> Silent SOS Broadcast — 3-Layer Dispatch
                            </h3>
                            <div className="space-y-3">
                                {DISPATCH_LAYERS.map(d => (
                                    <div key={d.label} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${dispatched.includes(d.label) ? `bg-${d.color}-500/10 border border-${d.color}-500/30` : 'bg-gray-900/40 border border-gray-700/40 opacity-40'}`}>
                                        <span className="text-xl">{d.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-white">{d.label}</p>
                                            <p className="text-[10px] text-gray-500">{d.number}</p>
                                        </div>
                                        {dispatched.includes(d.label)
                                            ? <span className="text-[10px] font-bold text-green-400 flex items-center gap-1"><CheckCircle size={11}/>NOTIFIED</span>
                                            : <span className="text-[10px] text-gray-600">Pending...</span>
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Nearby community */}
                        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-5">
                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Users size={13} className="text-cyan-400"/>Good Samaritan Network — Nearby Responders</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {NEARBY.map(n => (
                                    <div key={n.name} className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3 text-center">
                                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-1">
                                            <Users size={14} className="text-cyan-400"/>
                                        </div>
                                        <p className="text-xs font-bold text-white">{n.name}</p>
                                        <p className="text-[10px] text-gray-500">{n.dist} away</p>
                                        <span className="text-[9px] font-bold text-green-400">✓ Alerted</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Scene capture */}
                        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-5">
                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Camera size={13} className="text-purple-400"/>Auto Scene Documentation</h3>
                            <div className="flex items-center gap-4">
                                <div className={`flex-1 h-2 rounded-full overflow-hidden bg-gray-700`}>
                                    <div className="h-2 bg-purple-500 rounded-full transition-all duration-1000"
                                        style={{width: sceneCapture==='done'?'100%':sceneCapture==='uploading'?'70%':sceneCapture==='capturing'?'35%':'0%'}}/>
                                </div>
                                <span className="text-xs text-gray-400 w-32 text-right">
                                    {sceneCapture==='done'?'✅ Report ready':sceneCapture==='uploading'?'☁ Uploading...':sceneCapture==='capturing'?'📸 Capturing...':'Waiting...'}
                                </span>
                            </div>
                            {reportReady && (
                                <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-purple-400 flex items-center gap-2"><FileText size={12}/>Crash Report Generated</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)} · {new Date().toLocaleString()} · 3 photos + video</p>
                                    </div>
                                    <button className="text-xs px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all font-bold">
                                        📄 Download PDF
                                    </button>
                                </div>
                            )}
                            {medCard && (
                                <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3">
                                    <Shield size={16} className="text-red-400 shrink-0"/>
                                    <div>
                                        <p className="text-[10px] font-bold text-red-400">Medical Card Attached to Report</p>
                                        <p className="text-[10px] text-gray-500">Blood: {medCard.blood} · Allergies: {medCard.allergies||'None'} · {medCard.conditions||'No conditions'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Offline SMS */}
                        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-5">
                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><WifiOff size={13} className="text-orange-400"/>Offline SMS Fallback</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400">If internet fails, SOS auto-sends via SMS with GPS coordinates</p>
                                    <p className="text-[10px] text-gray-600 mt-1">sms:100 · sms:108 · Emergency contacts</p>
                                </div>
                                <button onClick={triggerSMSFallback} className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-bold hover:bg-orange-500/30 transition-all">
                                    📲 Send SMS Now
                                </button>
                            </div>
                        </div>

                        <button onClick={()=>{setSosSent(false);setDispatched([]);}} className="w-full text-xs text-gray-500 hover:text-gray-300 underline py-2">
                            ← Reset Demo
                        </button>
                    </div>
                )}

                {cancelled && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                        <CheckCircle className="text-green-400 mx-auto mb-1" size={24}/>
                        <p className="text-green-400 font-bold">SOS Cancelled — Stay Safe!</p>
                    </div>
                )}

                {/* Controls */}
                {!sosSent && !crashDetected && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Shield size={13} className="text-red-400"/>Sensor Control</h3>
                            <button onClick={toggleMonitoring} className={`w-full py-3 rounded-xl font-bold text-sm mb-3 transition-all ${monitoring ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'}`}>
                                {monitoring ? '⏹ Stop Monitoring' : '▶ Start Crash Monitor'}
                            </button>
                            <button onClick={startCrash} className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-400 border border-gray-700 hover:border-red-500/40 hover:text-red-400 transition-all">
                                💥 Simulate Crash (Full Demo)
                            </button>
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                {[['X', lastAccel.x, 'text-cyan-400'],['Y', lastAccel.y, 'text-yellow-400'],['Z', lastAccel.z, 'text-red-400']].map(([ax,v,c])=>(
                                    <div key={ax} className="bg-gray-900/60 rounded-lg p-2">
                                        <p className={`text-lg font-mono font-bold ${c}`}>{v}</p>
                                        <p className="text-[9px] text-gray-600">Accel {ax}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Activity size={13} className="text-red-400"/>Live Acceleration</h3>
                            <div className="flex items-end gap-0.5 h-28">
                                {accelHistory.map((v,i) => (
                                    <div key={i} className="flex-1 rounded-t transition-all duration-100"
                                        style={{ height:`${(v/maxH)*100}%`, backgroundColor: v>50?'#ef4444':v>25?'#f59e0b':'#22d3ee', opacity: 0.5+(i/accelHistory.length)*0.5 }}/>
                                ))}
                            </div>
                            <div className="flex justify-between text-[9px] text-gray-600 mt-1">
                                <span>30 samples</span>
                                <span className="text-red-400">Threshold: 50 m/s²</span>
                                <span>now</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* How it works */}
                {!sosSent && !crashDetected && (
                    <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                        <h3 className="text-sm font-bold text-white mb-4">Dispatch Architecture</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                {icon:'📡', t:'Accelerometer', d:'60 Hz XYZ monitoring. Crash spike >50 m/s² triggers pipeline.', c:'red'},
                                {icon:'📻', t:'Silent Broadcast', d:'5 simultaneous channels: Police, Ambulance, Fire, Community mesh, Personal contacts.', c:'cyan'},
                                {icon:'📸', t:'Scene Capture', d:'3 auto-photos + 5s video. GPS-tagged. PDF crash report for FIR & insurance.', c:'purple'},
                                {icon:'📵', t:'Offline Fallback', d:'No internet? SMS via sms: protocol + BLE mesh relay to nearby Chaukas users.', c:'orange'},
                            ].map(s=>(
                                <div key={s.t} className={`bg-gray-900/60 rounded-xl p-4 border border-${s.c}-500/10 hover:border-${s.c}-500/30 transition-all`}>
                                    <div className="text-2xl mb-2">{s.icon}</div>
                                    <p className={`text-xs font-bold text-${s.c}-400 mb-1`}>{s.t}</p>
                                    <p className="text-[10px] text-gray-500 leading-relaxed">{s.d}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CrashDetectionPage;
