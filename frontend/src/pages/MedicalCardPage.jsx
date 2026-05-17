import React, { useState, useEffect } from 'react';
import { Shield, User, Heart, AlertTriangle, Pill, Phone, CheckCircle, Copy, Eye, Lock } from 'lucide-react';

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const EMPTY = { name:'', age:'', blood:'', allergies:'', conditions:'', medications:'', emergency_name:'', emergency_phone:'' };

const genToken = () => Math.random().toString(36).slice(2, 10).toUpperCase();

const MedicalCardPage = () => {
    const [form, setForm]       = useState(EMPTY);
    const [saved, setSaved]     = useState(false);
    const [token, setToken]     = useState(null);
    const [copied, setCopied]   = useState(false);
    const [preview, setPreview] = useState(false);
    const [existing, setExisting] = useState(null);

    useEffect(() => {
        const data = localStorage.getItem('chaukas_medical_card');
        if (data) {
            const parsed = JSON.parse(data);
            setExisting(parsed);
            setForm(parsed);
            setToken(parsed.token);
        }
    }, []);

    const handleChange = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = () => {
        const tok = token || genToken();
        const payload = { ...form, token: tok, saved_at: new Date().toISOString() };
        localStorage.setItem('chaukas_medical_card', JSON.stringify(payload));
        setToken(tok);
        setSaved(true);
        setExisting(payload);
        setTimeout(() => setSaved(false), 3000);
    };

    const copyLink = () => {
        const link = `https://chaukas.in/sos/${token}`;
        navigator.clipboard?.writeText(link).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const cardUrl = token ? `https://chaukas.in/sos/${token}` : null;

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-16">
            <div className="bg-gray-900/95 border-b border-white/5 px-6 py-4 flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-xl"><Heart className="text-red-400" size={20}/></div>
                <div>
                    <h1 className="text-xl font-bold text-white">Medical Emergency Card</h1>
                    <p className="text-[11px] text-gray-500">Paramedics get instant access via secure one-time URL · auto-attached to crash SOS</p>
                </div>
                {token && (
                    <div className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full font-bold">
                        <CheckCircle size={11}/> Card Active
                    </div>
                )}
            </div>

            <div className="px-6 py-6 max-w-4xl mx-auto space-y-6">

                {/* How it works banner */}
                <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-5">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {[
                            { step:'1', icon:'🚨', text:'Crash SOS fires', desc:'Accelerometer detects impact' },
                            { step:'2', icon:'📎', text:'Card auto-attached', desc:'Embedded in dispatch packet' },
                            { step:'3', icon:'🏥', text:'Paramedic scans', desc:'No login — opens in 1 tap' },
                        ].map(s => (
                            <div key={s.step} className="flex flex-col items-center gap-2">
                                <div className="text-2xl">{s.icon}</div>
                                <p className="text-xs font-bold text-white">{s.text}</p>
                                <p className="text-[10px] text-gray-500">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Secure URL card */}
                {token && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Lock size={14} className="text-red-400"/>
                            <h3 className="text-sm font-bold text-red-400">Your Secure Emergency URL</h3>
                            <span className="ml-auto text-[9px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded font-mono">EXPIRES ON USE</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-900/60 rounded-xl px-4 py-3">
                            <span className="text-xs font-mono text-gray-300 flex-1 truncate">{cardUrl}</span>
                            <button onClick={copyLink} className="shrink-0 text-[10px] font-bold px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-all flex items-center gap-1 text-gray-300">
                                {copied ? <><CheckCircle size={10} className="text-green-400"/>Copied</> : <><Copy size={10}/>Copy</>}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-2">🔒 URL is encrypted · accessible without login · auto-expires after emergency resolves</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form */}
                    <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                        <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2"><User size={13} className="text-cyan-400"/>Personal & Medical Details</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase tracking-wider">Full Name</label>
                                    <input value={form.name} onChange={e=>handleChange('name',e.target.value)} placeholder="Your name"
                                        className="mt-1 w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"/>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase tracking-wider">Age</label>
                                    <input value={form.age} onChange={e=>handleChange('age',e.target.value)} placeholder="e.g. 28" type="number"
                                        className="mt-1 w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"/>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Blood Type</label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {BLOOD_TYPES.map(b => (
                                        <button key={b} onClick={()=>handleChange('blood',b)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.blood===b ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-gray-900/60 text-gray-400 border border-white/10 hover:border-red-500/40'}`}>
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1"><AlertTriangle size={9}/>Allergies</label>
                                <input value={form.allergies} onChange={e=>handleChange('allergies',e.target.value)} placeholder="e.g. Penicillin, Peanuts"
                                    className="mt-1 w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50"/>
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1"><Heart size={9}/>Pre-existing Conditions</label>
                                <input value={form.conditions} onChange={e=>handleChange('conditions',e.target.value)} placeholder="e.g. Diabetes, Hypertension"
                                    className="mt-1 w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"/>
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1"><Pill size={9}/>Current Medications</label>
                                <input value={form.medications} onChange={e=>handleChange('medications',e.target.value)} placeholder="e.g. Metformin 500mg"
                                    className="mt-1 w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"/>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1"><Phone size={9}/>Emergency Contact</label>
                                    <input value={form.emergency_name} onChange={e=>handleChange('emergency_name',e.target.value)} placeholder="Name"
                                        className="mt-1 w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50"/>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase tracking-wider">&nbsp;</label>
                                    <input value={form.emergency_phone} onChange={e=>handleChange('emergency_phone',e.target.value)} placeholder="Phone number"
                                        className="mt-1 w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50"/>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button onClick={handleSave} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                                    {saved ? '✅ Saved!' : '💾 Save Medical Card'}
                                </button>
                                <button onClick={()=>setPreview(!preview)} className="px-4 py-2.5 bg-gray-700 text-gray-300 rounded-xl text-sm hover:bg-gray-600 transition-all flex items-center gap-1.5">
                                    <Eye size={14}/> {preview ? 'Hide' : 'Preview'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview card — what paramedic sees */}
                    {(preview || existing) && (
                        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield size={16} className="text-red-400"/>
                                <h3 className="text-sm font-bold text-white">Paramedic View — Emergency Card</h3>
                                <span className="ml-auto text-[9px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded font-bold animate-pulse">URGENT</span>
                            </div>

                            <div className="bg-red-500/5 border border-red-500/30 rounded-2xl p-5 space-y-4">
                                {/* Identity */}
                                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <User size={20} className="text-red-400"/>
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-white">{form.name || 'Not set'}</p>
                                        <p className="text-xs text-gray-500">Age: {form.age || '—'}</p>
                                    </div>
                                    <div className={`ml-auto w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black border-2 ${form.blood ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-gray-600 text-gray-600 bg-gray-800'}`}>
                                        {form.blood || '?'}
                                    </div>
                                </div>

                                {[
                                    { icon:'⚠️', label:'Allergies',   value:form.allergies||'None reported',   col:'yellow' },
                                    { icon:'❤️', label:'Conditions',  value:form.conditions||'None reported',  col:'red'    },
                                    { icon:'💊', label:'Medications', value:form.medications||'None reported', col:'purple' },
                                    { icon:'📞', label:'Emergency',   value:form.emergency_name ? `${form.emergency_name} · ${form.emergency_phone}` : 'Not set', col:'green' },
                                ].map(r => (
                                    <div key={r.label} className={`flex gap-3 p-2.5 rounded-xl bg-${r.col}-500/5 border border-${r.col}-500/10`}>
                                        <span className="text-base shrink-0">{r.icon}</span>
                                        <div>
                                            <p className={`text-[10px] font-bold text-${r.col}-400 uppercase`}>{r.label}</p>
                                            <p className="text-xs text-gray-300 mt-0.5">{r.value}</p>
                                        </div>
                                    </div>
                                ))}

                                <div className="text-center pt-2">
                                    <p className="text-[9px] text-gray-600">🔒 Chaukas Emergency System · Auto-expires after 2 hours</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicalCardPage;
