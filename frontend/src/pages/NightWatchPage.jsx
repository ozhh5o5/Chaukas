import React, { useState, useEffect, useRef } from 'react';
import { Moon, Shield, Phone, AlertTriangle, CheckCircle, MapPin, Bell, User, Plus, Trash2 } from 'lucide-react';

const DANGER_ZONES = [
    { area:'Rajwada Chowk', lat:22.7196, lng:75.8577, risk:'critical' },
    { area:'Palasia', lat:22.7245, lng:75.8400, risk:'critical' },
    { area:'LIG Square', lat:22.7050, lng:75.8650, risk:'high' },
    { area:'Bhawarkuan', lat:22.7155, lng:75.8800, risk:'high' },
];

const STOP_THRESHOLD = 120; // 2 minutes in seconds
const riskColor = r => ({ critical:'#ef4444', high:'f59e0b' }[r]||'#6b7280');

const NightWatchPage = () => {
    const [active, setActive]               = useState(false);
    const [contacts, setContacts]           = useState([{ name:'Emergency Contact', phone:'9876543210' }]);
    const [newName, setNewName]             = useState('');
    const [newPhone, setNewPhone]           = useState('');
    const [inDanger, setInDanger]           = useState(false);
    const [dangerZone, setDangerZone]       = useState(null);
    const [stopTimer, setStopTimer]         = useState(0);
    const [alertSent, setAlertSent]         = useState(false);
    const [alertCancelled, setAlertCancelled] = useState(false);
    const [currentZone, setCurrentZone]     = useState(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!active) { clearInterval(intervalRef.current); setStopTimer(0); setInDanger(false); return; }
        // Simulate stopping in a danger zone after 4s for demo
        const demoTimer = setTimeout(() => {
            setInDanger(true);
            setDangerZone(DANGER_ZONES[0]);
            setCurrentZone(DANGER_ZONES[0]);
            let t = 0;
            intervalRef.current = setInterval(() => {
                t++;
                setStopTimer(t);
                if (t >= STOP_THRESHOLD) {
                    clearInterval(intervalRef.current);
                    setAlertSent(true);
                    setInDanger(false);
                }
            }, 1000);
        }, 4000);
        return () => { clearTimeout(demoTimer); clearInterval(intervalRef.current); };
    }, [active]);

    const cancelAlert = () => {
        clearInterval(intervalRef.current);
        setInDanger(false);
        setStopTimer(0);
        setAlertCancelled(true);
        setTimeout(() => setAlertCancelled(false), 3000);
    };

    const addContact = () => {
        if (newName && newPhone) {
            setContacts(prev => [...prev, { name: newName, phone: newPhone }]);
            setNewName(''); setNewPhone('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-16">
            <div className="bg-gray-900/95 border-b border-white/5 px-6 py-4 flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-xl"><Moon className="text-purple-400" size={20}/></div>
                <div>
                    <h1 className="text-xl font-bold text-white">Night Watch — Convoy Safety</h1>
                    <p className="text-[11px] text-gray-500">Monitors if you stop in a danger zone · Auto-alerts emergency contacts</p>
                </div>
                <div className={`ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold ${active ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-700 text-gray-500'}`}>
                    <Moon size={11}/> {active ? 'NIGHT WATCH ON' : 'INACTIVE'}
                </div>
            </div>

            <div className="px-6 py-6 max-w-5xl mx-auto space-y-6">

                {/* Alert overlay */}
                {inDanger && (
                    <div className="bg-orange-500/10 border-2 border-orange-500 rounded-2xl p-6 text-center">
                        <AlertTriangle className="text-orange-400 mx-auto mb-2" size={36}/>
                        <h2 className="text-2xl font-bold text-orange-400">Stopped in Danger Zone</h2>
                        <p className="text-gray-400 mt-1">{dangerZone?.area} — {STOP_THRESHOLD - stopTimer}s until auto-alert</p>
                        <div className="w-full bg-gray-700 rounded-full h-3 mt-4 mb-4">
                            <div className="h-3 rounded-full bg-orange-500 transition-all" style={{width:`${(stopTimer/STOP_THRESHOLD)*100}%`}}/>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Alert will be sent to {contacts.length} contact(s)</p>
                        <button onClick={cancelAlert} className="px-6 py-2.5 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100">
                            ✋ I'm Safe — Cancel Alert
                        </button>
                    </div>
                )}

                {alertSent && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-5 text-center">
                        <Bell className="text-red-400 mx-auto mb-2" size={32}/>
                        <h2 className="text-xl font-bold text-red-400">Alert Sent!</h2>
                        <p className="text-gray-400 text-sm mt-1">Your location shared with {contacts.length} emergency contact(s)</p>
                        <p className="text-xs text-gray-600 mt-2">📍 {dangerZone?.area} · {dangerZone?.lat?.toFixed(4)}, {dangerZone?.lng?.toFixed(4)}</p>
                        <button onClick={()=>{setAlertSent(false);setActive(false);}} className="mt-3 text-xs text-gray-500 underline hover:text-gray-300">Dismiss</button>
                    </div>
                )}

                {alertCancelled && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                        <CheckCircle className="text-green-400 mx-auto mb-1" size={24}/>
                        <p className="text-green-400 font-bold">Safe check-in confirmed. Alert cancelled.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Toggle */}
                    <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Shield size={13} className="text-purple-400"/>Night Watch Control</h3>
                        <button onClick={()=>{ if(active){ setActive(false); setInDanger(false); setStopTimer(0); clearInterval(intervalRef.current); } else setActive(true); }}
                            className={`w-full py-4 rounded-xl font-bold text-base transition-all mb-4 ${active ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20'}`}>
                            {active ? '⏹ Deactivate Night Watch' : '🌙 Activate Night Watch'}
                        </button>
                        {active && (
                            <p className="text-xs text-gray-500 text-center">Demo: will trigger alert after 4s to simulate entering danger zone</p>
                        )}

                        {/* Status */}
                        <div className="mt-4 space-y-2">
                            {[['GPS Tracking','Active','green'],['Danger Zone Monitor','Active','green'],['Auto-Alert System','Armed','purple'],['Emergency Contacts',`${contacts.length} registered`,'yellow']].map(([l,v,c])=>(
                                <div key={l} className="flex justify-between items-center py-1.5">
                                    <span className="text-xs text-gray-500">{l}</span>
                                    <span className={`text-xs font-bold text-${c}-400`}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zones */}
                    <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><MapPin size={13} className="text-red-400"/>Monitored Danger Zones</h3>
                        <div className="space-y-2">
                            {DANGER_ZONES.map(z=>(
                                <div key={z.area} className={`flex items-center gap-3 p-3 rounded-xl border ${z.risk==='critical'?'border-red-500/20 bg-red-500/5':'border-yellow-500/20 bg-yellow-500/5'}`}>
                                    <div className={`w-2 h-2 rounded-full ${z.risk==='critical'?'bg-red-500':'bg-yellow-500'}`}/>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-white">{z.area}</p>
                                        <p className="text-[9px] text-gray-600">{z.lat.toFixed(4)}, {z.lng.toFixed(4)}</p>
                                    </div>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${z.risk==='critical'?'bg-red-500/15 text-red-400':'bg-yellow-500/15 text-yellow-400'}`}>{z.risk.toUpperCase()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Emergency contacts */}
                <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Phone size={13} className="text-cyan-400"/>Emergency Contacts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {contacts.map((c,i)=>(
                            <div key={i} className="flex items-center gap-3 bg-gray-900/60 rounded-xl p-3 border border-white/5">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                                    <User size={14} className="text-cyan-400"/>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white">{c.name}</p>
                                    <p className="text-[10px] text-gray-500">{c.phone}</p>
                                </div>
                                <button onClick={()=>setContacts(prev=>prev.filter((_,j)=>j!==i))} className="text-gray-600 hover:text-red-400 transition-colors">
                                    <Trash2 size={13}/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Contact name"
                            className="flex-1 bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"/>
                        <input value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="Phone number"
                            className="flex-1 bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"/>
                        <button onClick={addContact} className="px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all">
                            <Plus size={14}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NightWatchPage;
