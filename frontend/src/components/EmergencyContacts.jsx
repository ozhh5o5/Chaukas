import { useState } from 'react';
import { Phone, AlertCircle, ShieldAlert, Heart, Truck, Shield, MapPin, Clock, Users, Database } from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import { getTotalContactCount, NATIONAL_HELPLINES, STATE_CONTACTS } from '../data/emergencyContacts';

const EmergencyContacts = () => {
    const [loading, setLoading] = useState(null); // 'ambulance', 'fire', 'police' or null
    const [result, setResult] = useState(null); // { type: 'success'|'error', message: string }

    const triggerEmergency = async (service) => {
        setLoading(service);
        setResult(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

            const response = await fetch(`${apiUrl}/emergency/call`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ service })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to initiate emergency call');
            }

            setResult({
                type: 'success',
                message: `✅ Request Initiated: ${data.message || 'Support is on the way.'}`
            });

        } catch (error) {
            setResult({
                type: 'error',
                message: `❌ System Error: ${error.message}`
            });
        } finally {
            setLoading(null);
        }
    };

    const emergencyServices = [
        {
            service: 'ambulance',
            label: 'Medical Emergency',
            icon: Heart,
            color: 'rgba(16, 185, 129, 0.3)',
            textColor: 'text-emerald-400',
            description: 'Medical assistance & ambulance dispatch',
            number: '108'
        },
        {
            service: 'fire',
            label: 'Fire Brigade',
            icon: AlertCircle,
            color: 'rgba(251, 146, 60, 0.3)',
            textColor: 'text-orange-400',
            description: 'Fire emergency & rescue operations',
            number: '101'
        },
        {
            service: 'police',
            label: 'Police Emergency',
            icon: Shield,
            color: 'rgba(59, 130, 246, 0.3)',
            textColor: 'text-blue-400',
            description: 'Law enforcement & security',
            number: '100'
        }
    ];

    const additionalServices = [
        {
            title: 'Disaster Management',
            icon: Truck,
            color: 'rgba(168, 85, 247, 0.3)',
            textColor: 'text-purple-400',
            description: 'NDRF & disaster response coordination',
            contact: '1078'
        },
        {
            title: 'Women Helpline',
            icon: ShieldAlert,
            color: 'rgba(236, 72, 153, 0.3)',
            textColor: 'text-pink-400',
            description: '24/7 women safety & support services',
            contact: '1091'
        },
        {
            title: 'Child Helpline',
            icon: Heart,
            color: 'rgba(34, 197, 94, 0.3)',
            textColor: 'text-green-400',
            description: 'Child protection & welfare services',
            contact: '1098'
        },
        {
            title: 'Tourist Helpline',
            icon: MapPin,
            color: 'rgba(14, 165, 233, 0.3)',
            textColor: 'text-sky-400',
            description: 'Tourist assistance & information',
            contact: '1363'
        },
        {
            title: 'Senior Citizen',
            icon: Users,
            color: 'rgba(245, 158, 11, 0.3)',
            textColor: 'text-amber-400',
            description: 'Elder care & support services',
            contact: '14567'
        },
        {
            title: 'Mental Health',
            icon: Heart,
            color: 'rgba(139, 92, 246, 0.3)',
            textColor: 'text-violet-400',
            description: 'Psychological support & counseling',
            contact: '9152987821'
        }
    ];

    const EmergencyButton = ({ service, label, icon: Icon, color, textColor, description, number }) => (
        <SpotlightCard 
            className="group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
            spotlightColor={color}
            onClick={() => triggerEmergency(service)}
        >
            <div className="p-8 text-center">
                <div className={`inline-flex p-6 rounded-full bg-black/30 backdrop-blur-sm mb-6 ${loading === service ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform duration-300`}>
                    <Icon size={48} className={`${textColor} drop-shadow-lg`} />
                </div>

                <h3 className={`text-2xl font-black uppercase tracking-widest mb-2 ${textColor}`}>
                    {label}
                </h3>
                
                <p className="text-gray-300 text-sm mb-4 font-medium">
                    {description}
                </p>

                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-current/30 ${textColor} text-sm font-mono`}>
                    <Phone className="w-4 h-4" />
                    {number}
                </div>

                {loading === service ? (
                    <div className="mt-4 text-sm font-mono animate-pulse text-white">
                        CONNECTING TO DISPATCH...
                    </div>
                ) : (
                    <div className="mt-4 text-xs font-mono opacity-60 text-gray-400 uppercase">
                        TAP TO REQUEST IMMEDIATE AID
                    </div>
                )}
            </div>
        </SpotlightCard>
    );

    const ServiceCard = ({ title, icon: Icon, color, textColor, description, contact }) => (
        <SpotlightCard 
            className="group cursor-pointer transition-all duration-300 hover:scale-105"
            spotlightColor={color}
        >
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-black/30 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={24} className={`${textColor}`} />
                    </div>
                    <div className="flex-1">
                        <h4 className={`font-bold text-lg ${textColor} mb-1`}>
                            {title}
                        </h4>
                        <p className="text-gray-300 text-sm mb-3">
                            {description}
                        </p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-current/30 ${textColor} text-xs font-mono`}>
                            <Phone className="w-3 h-3" />
                            {contact}
                        </div>
                    </div>
                </div>
            </div>
        </SpotlightCard>
    );

    const [selectedState, setSelectedState] = useState('');
    const totalContacts = getTotalContactCount();
    const stateNames = Object.keys(STATE_CONTACTS).sort();
    const localContacts = selectedState ? STATE_CONTACTS[selectedState]?.contacts || [] : [];

    return (
        <div className="w-full max-w-6xl mx-auto p-4 py-8">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-3 flex items-center justify-center gap-3">
                    <ShieldAlert className="text-red-500 w-10 h-10" />
                    Emergency Response Center
                </h2>
                <p className="text-gray-400 text-lg font-medium max-w-2xl mx-auto mb-4">
                    Direct access to emergency services with real-time dispatch coordination
                </p>

                {/* Contact Count Badge */}
                <div className="inline-flex items-center gap-2 bg-cyan-900/30 border border-cyan-500/40 px-4 py-2 rounded-full mb-4">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300 font-mono text-sm font-bold">{totalContacts}+ Emergency Contacts</span>
                    <span className="text-cyan-500 font-mono text-xs">• 28 States + 8 UTs • All India Coverage</span>
                </div>

                <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-500 font-mono">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        SECURE LINE
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        24/7 MONITORED
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        GPS ENABLED
                    </div>
                </div>
            </div>

            {/* National Helpline Strip */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-8">
                <p className="text-red-400 font-mono text-xs uppercase tracking-widest mb-3 text-center">National Emergency Helplines</p>
                <div className="flex flex-wrap gap-2 justify-center">
                    {NATIONAL_HELPLINES.slice(0, 6).map((h, i) => (
                        <a key={i} href={`tel:${h.number}`}
                            className="flex items-center gap-1.5 bg-black/40 border border-white/10 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-colors group">
                            <Phone className="w-3 h-3 text-red-400 group-hover:text-red-300" />
                            <span className="text-white font-mono text-xs font-bold">{h.number}</span>
                            <span className="text-gray-500 text-[10px]">{h.name}</span>
                        </a>
                    ))}
                </div>
            </div>

            {/* State Contacts Selector */}
            <div className="bg-black/30 border border-white/10 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-bold text-sm">Local Emergency Contacts</span>
                    <span className="text-gray-500 text-xs font-mono">(Select your state)</span>
                </div>
                <select
                    value={selectedState}
                    onChange={e => setSelectedState(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-white mb-4"
                >
                    <option value="">-- Select State --</option>
                    {stateNames.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {localContacts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {localContacts.map((c, i) => (
                            <a key={i} href={`tel:${c.number}`}
                                className="flex items-center justify-between bg-black/40 border border-white/10 hover:border-cyan-500/40 px-3 py-2.5 rounded-lg transition-colors group">
                                <div>
                                    <p className="text-white text-xs font-bold group-hover:text-cyan-300 transition-colors">{c.name}</p>
                                    {c.city && <p className="text-gray-500 text-[10px] font-mono">{c.city}</p>}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Phone className="w-3 h-3 text-cyan-400" />
                                    <span className="text-cyan-400 font-mono text-xs font-bold">{c.number}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Primary Emergency Services */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {emergencyServices.map((service) => (
                    <EmergencyButton key={service.service} {...service} />
                ))}
            </div>

            {/* Additional Services */}
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                    Additional Support Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {additionalServices.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>
            </div>

            {/* Status Feedback */}
            {result && (
                <SpotlightCard 
                    className={`mt-8 ${result.type === 'success' ? 'border-green-500/50' : 'border-red-500/50'}`}
                    spotlightColor={result.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
                >
                    <div className={`p-6 text-center font-bold animate-bounce-in ${
                        result.type === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}>
                        {result.message}
                    </div>
                </SpotlightCard>
            )}
        </div>
    );
};

export default EmergencyContacts;
