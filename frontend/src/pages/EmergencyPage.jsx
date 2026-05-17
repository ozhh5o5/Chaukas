import React from 'react';
import EmergencyContacts from '../components/EmergencyContacts';
import GoldenHourSOS from '../components/GoldenHourSOS';
import WeatherRiskBadge from '../components/WeatherRiskBadge';
import PhotoAIAnalyzer from '../components/PhotoAIAnalyzer';

const EmergencyPage = () => {
    return (
        <div className="min-h-screen pt-24 px-4 pb-12 flex flex-col items-center relative">
            <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-red-900/10 via-transparent to-black/20 z-0" />

            <div className="relative z-10 w-full max-w-5xl">
                <div className="mb-8 text-center space-y-3">
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                        Emergency<span className="text-red-600">.SOS</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-mono uppercase tracking-widest">
                        Chaukas — Road Accident Emergency Response
                    </p>
                </div>

                {/* Weather Risk Banner */}
                <div className="mb-6">
                    <WeatherRiskBadge />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Golden Hour SOS */}
                    <GoldenHourSOS />

                    {/* Photo AI Analyzer */}
                    <PhotoAIAnalyzer
                        onAnalysisComplete={(data) => console.log('AI Analysis:', data)}
                    />
                </div>

                <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-10 shadow-2xl">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-6">Emergency Contacts &amp; Services</h2>
                    <EmergencyContacts />
                </div>
            </div>
        </div>
    );
};

export default EmergencyPage;
