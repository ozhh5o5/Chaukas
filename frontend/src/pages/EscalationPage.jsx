import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, TrendingUp, AlertCircle, Shield, Eye, Zap,
    ArrowUp, ArrowDown, Minus, Play, RotateCcw, RefreshCcw,
    Users, Truck, Phone, MapPin, Clock, Target, Satellite, BrainCircuit, ArrowLeft
} from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import { useLocation } from '../context/LocationContext';
import { useNavigate } from 'react-router-dom';

const EscalationPage = () => {
    const { location, locationError } = useLocation();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        flood_risk_percentage: 35,
        severity_level: 'Medium',
        risk_trend: 'stable'
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [availableStates, setAvailableStates] = useState(null);
    const [simulationMode, setSimulationMode] = useState(false);
    const [autoMode, setAutoMode] = useState(true);
    const [severityData, setSeverityData] = useState(null);
    const [fromSeverityEngine, setFromSeverityEngine] = useState(false);
    const [realTimeMode, setRealTimeMode] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

    const severityLevels = [
        { value: 'Low', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50', description: 'Minor incidents, routine monitoring' },
        { value: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', description: 'Moderate risk, increased attention' },
        { value: 'High', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', description: 'Critical incidents, immediate action' }
    ];

    const riskTrends = [
        { value: 'decreasing', label: 'Decreasing', icon: ArrowDown, color: 'text-green-400', description: 'Risk is reducing over time' },
        { value: 'stable', label: 'Stable', icon: Minus, color: 'text-blue-400', description: 'Risk remains constant' },
        { value: 'increasing', label: 'Increasing', icon: ArrowUp, color: 'text-red-400', description: 'Risk is escalating rapidly' }
    ];

    const stateIcons = {
        'NORMAL': {
            icon: Shield,
            color: 'text-green-400',
            bg: 'bg-green-500/20',
            border: 'border-green-500/50',
            description: 'No immediate risk detected',
            actions: ['Routine monitoring', 'Regular patrols', 'System maintenance']
        },
        'WATCH': {
            icon: Eye,
            color: 'text-blue-400',
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/50',
            description: 'Situation requires monitoring',
            actions: ['Increase surveillance', 'Alert standby teams', 'Monitor weather']
        },
        'PREPAREDNESS': {
            icon: AlertCircle,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/50',
            description: 'Prepare resources and teams',
            actions: ['Deploy resources', 'Activate response teams', 'Issue warnings']
        },
        'CRISIS': {
            icon: Zap,
            color: 'text-red-400',
            bg: 'bg-red-500/20',
            border: 'border-red-500/50',
            description: 'Active emergency response required',
            actions: ['Full deployment', 'Emergency protocols', 'Evacuation procedures']
        }
    };

    // Fetch available states on component mount
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await fetch('/api/escalation/states');
                if (response.ok) {
                    const data = await response.json();
                    setAvailableStates(data);
                }
            } catch (error) {
                console.error('Error fetching states:', error);
            }
        };
        fetchStates();
    }, []);

    // Auto-assess when location is available and auto mode is enabled
    useEffect(() => {
        // Check if we have severity data from the severity page
        const storedSeverityData = sessionStorage.getItem('currentSeverityData');
        if (storedSeverityData) {
            const severityData = JSON.parse(storedSeverityData);
            console.log('Using stored severity data:', severityData);
            
            // Automatically run escalation assessment with the stored data
            handleAutoAssessmentWithSeverityData(severityData);
            
            // Clear the stored data after use
            sessionStorage.removeItem('currentSeverityData');
        } else if (autoMode && location && location.latitude && location.longitude) {
            handleAutoAssessment();
        }
    }, [location, autoMode]);

    // Real-time updates
    useEffect(() => {
        let interval;
        if (realTimeMode && autoMode && location && location.latitude && location.longitude) {
            interval = setInterval(() => {
                handleAutoAssessment();
            }, 30000); // Update every 30 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [realTimeMode, autoMode, location]);

    const handleAutoAssessmentWithSeverityData = async (severityData) => {
        setFromSeverityEngine(true);
        setLoading(true);
        try {
            // Use the severity data directly to run escalation assessment
            const response = await fetch('/api/escalation/auto-assess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: `user_${Date.now()}`,
                    latitude: severityData.location.latitude,
                    longitude: severityData.location.longitude
                })
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data.escalation_assessment);
                setSeverityData(data.severity_data);
                setLastUpdate(new Date());
                
                // Update form data with live values
                setFormData({
                    flood_risk_percentage: Math.round(data.escalation_factors.flood_risk_percentage),
                    severity_level: data.escalation_factors.incident_severity,
                    risk_trend: data.severity_data.trend
                });
                
                // Show notification that data was automatically loaded
                console.log('✅ Escalation assessment completed with severity data from Feature 3');
            } else {
                console.error('Auto-assessment with severity data failed');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoAssessment = async () => {
        if (!location || !location.latitude || !location.longitude) {
            console.error('Location not available for auto-assessment');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/escalation/auto-assess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: `user_${Date.now()}`,
                    latitude: location.latitude,
                    longitude: location.longitude
                })
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data.escalation_assessment);
                setSeverityData(data.severity_data);
                
                // Update form data with live values
                setFormData({
                    flood_risk_percentage: Math.round(data.escalation_factors.flood_risk_percentage),
                    severity_level: data.escalation_factors.incident_severity,
                    risk_trend: data.severity_data.trend
                });
            } else {
                console.error('Auto-assessment failed');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);

        try {
            let response;
            
            if (autoMode && location && location.latitude && location.longitude) {
                // Use auto-assessment with live location data
                response = await fetch('/api/escalation/auto-assess', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: `user_${Date.now()}`,
                        latitude: location.latitude,
                        longitude: location.longitude
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setResult(data.escalation_assessment);
                    setSeverityData(data.severity_data);
                    setLastUpdate(new Date());
                }
            } else {
                // Use manual assessment
                response = await fetch('/api/escalation/manual-assess', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: `user_${Date.now()}`,
                        latitude: location?.latitude || 0,
                        longitude: location?.longitude || 0,
                        flood_risk_percentage: formData.flood_risk_percentage,
                        manual_severity_override: formData.severity_level
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setResult(data.escalation_assessment);
                    setSeverityData(null);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const runSimulation = () => {
        setSimulationMode(true);
        setAutoMode(false); // Disable auto mode during simulation
        
        const scenarios = [
            { flood_risk_percentage: 15, severity_level: 'Low', risk_trend: 'stable' },
            { flood_risk_percentage: 35, severity_level: 'Medium', risk_trend: 'increasing' },
            { flood_risk_percentage: 55, severity_level: 'High', risk_trend: 'increasing' },
            { flood_risk_percentage: 75, severity_level: 'High', risk_trend: 'stable' }
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < scenarios.length) {
                setFormData(scenarios[index]);
                handleSubmit();
                index++;
            } else {
                clearInterval(interval);
                setSimulationMode(false);
                setAutoMode(true); // Re-enable auto mode
            }
        }, 2000);
    };

    const resetForm = () => {
        setFormData({
            flood_risk_percentage: 35,
            severity_level: 'Medium',
            risk_trend: 'stable'
        });
        setResult(null);
        setSeverityData(null);
        setSimulationMode(false);
        setAutoMode(true);
        setFromSeverityEngine(false);
    };

    const getStateProgression = () => {
        const states = ['NORMAL', 'WATCH', 'PREPAREDNESS', 'CRISIS'];
        const currentIndex = result ? states.indexOf(result.current_state) : 0;

        return states.map((state, index) => ({
            state,
            active: index <= currentIndex,
            current: result && state === result.current_state
        }));
    };

    const getRecommendations = () => {
        if (!result) return [];
        
        const stateRecommendations = {
            'NORMAL': [
                'Continue routine monitoring',
                'Maintain standard readiness levels', 
                'Review emergency plans'
            ],
            'WATCH': [
                'Increase monitoring frequency',
                'Alert response teams',
                'Prepare communication channels'
            ],
            'PREPAREDNESS': [
                'Deploy monitoring equipment',
                'Activate response teams',
                'Issue public advisories'
            ],
            'CRISIS': [
                'Implement full emergency response',
                'Coordinate with all agencies',
                'Issue immediate warnings'
            ]
        };
        
        return stateRecommendations[result.current_state] || [];
    };

    return (
        <div className="min-h-screen pt-24 px-4 pb-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <button
                            onClick={() => navigate('/severity-engine')}
                            className="p-2 bg-gray-500/20 border border-gray-500/50 rounded-lg text-gray-400 hover:bg-gray-500/30 transition-all mr-4"
                            title="Back to Severity Engine"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <Activity className="w-12 h-12 text-purple-400" />
                        <h1 className="text-5xl font-black text-white uppercase tracking-tight">
                            Escalation<span className="text-purple-400">Engine</span>
                        </h1>
                    </div>
                    <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                        AI-powered escalation management system that automatically integrates with live severity data from Feature 3
                    </p>
                    
                    {/* Data Source Indicator */}
                    {fromSeverityEngine && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400"
                        >
                            <BrainCircuit className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Data automatically loaded from Severity Engine
                            </span>
                        </motion.div>
                    )}
                    
                    {/* Location Status */}
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                            location ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 
                            'bg-red-500/20 border border-red-500/50 text-red-400'
                        }`}>
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">
                                {location ? `Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 
                                 locationError ? 'Location Access Denied' : 'Getting Location...'}
                            </span>
                        </div>
                        
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                            autoMode ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' : 
                            'bg-gray-500/20 border border-gray-500/50 text-gray-400'
                        }`}>
                            <Satellite className="w-4 h-4" />
                            <span className="text-sm">
                                {autoMode ? 'Auto-Assessment Active' : 'Manual Mode'}
                            </span>
                        </div>
                        
                        {realTimeMode && autoMode && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400">
                                <RefreshCcw className="w-4 h-4 animate-spin" />
                                <span className="text-sm">
                                    Real-time Updates (30s)
                                    {lastUpdate && (
                                        <span className="ml-2 text-xs opacity-75">
                                            Last: {lastUpdate.toLocaleTimeString()}
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Control Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <SpotlightCard
                            className="p-8"
                            spotlightColor="rgba(168, 85, 247, 0.2)"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Target className="w-6 h-6 text-purple-400" />
                                    Control Panel
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAutoMode(!autoMode)}
                                        className={`p-2 rounded-lg border transition-all ${
                                            autoMode 
                                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                                                : 'bg-gray-500/20 border-gray-500/50 text-gray-400 hover:bg-gray-500/30'
                                        }`}
                                        title={autoMode ? 'Switch to Manual Mode' : 'Switch to Auto Mode'}
                                    >
                                        <Satellite className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setRealTimeMode(!realTimeMode)}
                                        disabled={!autoMode}
                                        className={`p-2 rounded-lg border transition-all ${
                                            realTimeMode && autoMode
                                                ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                                                : 'bg-gray-500/20 border-gray-500/50 text-gray-400 hover:bg-gray-500/30'
                                        } ${!autoMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        title={realTimeMode ? 'Disable Real-time Updates' : 'Enable Real-time Updates (30s)'}
                                    >
                                        <RefreshCcw className={`w-4 h-4 ${realTimeMode && autoMode ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button
                                        onClick={runSimulation}
                                        disabled={simulationMode}
                                        className="p-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-all disabled:opacity-50"
                                        title="Run Simulation"
                                    >
                                        <Play className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={resetForm}
                                        className="p-2 bg-gray-500/20 border border-gray-500/50 rounded-lg text-gray-400 hover:bg-gray-500/30 transition-all"
                                        title="Reset"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Auto Mode Info */}
                            {autoMode && (
                                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                                        <Satellite className="w-4 h-4" />
                                        <span className="font-medium">Auto-Assessment Mode</span>
                                        {realTimeMode && (
                                            <div className="flex items-center gap-1 ml-auto">
                                                <RefreshCcw className="w-3 h-3 animate-spin" />
                                                <span className="text-xs">Real-time</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-blue-300">
                                        Using live location data and Feature 3 severity intelligence for automatic escalation assessment.
                                        {realTimeMode && (
                                            <span className="block mt-1 text-green-300">
                                                🔄 Real-time updates enabled - refreshing every 30 seconds
                                            </span>
                                        )}
                                        {severityData && (
                                            <span className="block mt-1">
                                                Current severity: <strong>{severityData.risk_band}</strong> ({(severityData.continuous_risk * 100).toFixed(1)}%)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Flood Risk Percentage Slider */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        <TrendingUp className="w-4 h-4 inline mr-2" />
                                        Flood Risk Percentage: {formData.flood_risk_percentage}%
                                        {autoMode && severityData && (
                                            <span className="ml-2 text-xs text-blue-400">(Auto-calculated)</span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.flood_risk_percentage}
                                            onChange={(e) => setFormData({ ...formData, flood_risk_percentage: parseInt(e.target.value) })}
                                            disabled={autoMode}
                                            className={`w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider ${autoMode ? 'opacity-50' : ''}`}
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                                            <span>0% (Safe)</span>
                                            <span>50% (High)</span>
                                            <span>100% (Critical)</span>
                                        </div>
                                    </div>
                                    <div className={`mt-2 p-2 rounded-lg text-sm ${formData.flood_risk_percentage < 20 ? 'bg-green-500/20 text-green-400' :
                                            formData.flood_risk_percentage < 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        {formData.flood_risk_percentage < 20 ? '🟢 Low Risk Zone' :
                                            formData.flood_risk_percentage < 60 ? '🟡 Moderate Risk Zone' :
                                                '🔴 High Risk Zone'}
                                    </div>
                                </div>

                                {/* Severity Level */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        <AlertCircle className="w-4 h-4 inline mr-2" />
                                        Incident Severity Level
                                        {autoMode && severityData && (
                                            <span className="ml-2 text-xs text-blue-400">(Auto-detected)</span>
                                        )}
                                    </label>
                                    <div className="space-y-2">
                                        {severityLevels.map((level) => (
                                            <button
                                                key={level.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, severity_level: level.value })}
                                                disabled={autoMode}
                                                className={`w-full p-4 rounded-lg border text-left transition-all ${
                                                    autoMode ? 'opacity-50 cursor-not-allowed' : ''
                                                } ${formData.severity_level === level.value
                                                        ? `${level.bg} ${level.border} ${level.color}`
                                                        : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                                                    }`}
                                            >
                                                <div className="font-medium">{level.value}</div>
                                                <div className="text-xs opacity-80 mt-1">{level.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Risk Trend */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        <Activity className="w-4 h-4 inline mr-2" />
                                        Risk Trend Analysis
                                        {autoMode && severityData && (
                                            <span className="ml-2 text-xs text-blue-400">(Live trend: {severityData.trend})</span>
                                        )}
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {riskTrends.map((trend) => {
                                            const IconComponent = trend.icon;
                                            return (
                                                <button
                                                    key={trend.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, risk_trend: trend.value })}
                                                    disabled={autoMode}
                                                    className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                                                        autoMode ? 'opacity-50 cursor-not-allowed' : ''
                                                    } ${formData.risk_trend === trend.value
                                                            ? `bg-${trend.color.split('-')[1]}-500/20 border-${trend.color.split('-')[1]}-500/50 ${trend.color}`
                                                            : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                                                        }`}
                                                >
                                                    <IconComponent className="w-5 h-5" />
                                                    <div>
                                                        <div className="font-medium">{trend.label}</div>
                                                        <div className="text-xs opacity-80">{trend.description}</div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                {!simulationMode && (
                                    <button
                                        type="submit"
                                        disabled={loading || (autoMode && !location)}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                {autoMode ? 'Auto-Analyzing...' : 'Analyzing...'}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <Activity className="w-5 h-5" />
                                                {autoMode ? 'Auto-Assess Escalation' : 'Manual Assessment'}
                                            </div>
                                        )}
                                    </button>
                                )}

                                {simulationMode && (
                                    <div className="w-full bg-purple-500/20 border border-purple-500/50 text-purple-400 font-bold py-4 px-6 rounded-lg text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                                            Running Simulation...
                                        </div>
                                    </div>
                                )}
                            </form>
                        </SpotlightCard>
                    </motion.div>

                    {/* Results Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Current State Result */}
                        {result && (
                            <SpotlightCard
                                className={`p-8 border-2 ${stateIcons[result.current_state]?.border}`}
                                spotlightColor={
                                    result.current_state === 'CRISIS' ? 'rgba(239, 68, 68, 0.3)' :
                                        result.current_state === 'PREPAREDNESS' ? 'rgba(245, 158, 11, 0.3)' :
                                            result.current_state === 'WATCH' ? 'rgba(59, 130, 246, 0.3)' :
                                                'rgba(34, 197, 94, 0.3)'
                                }
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Current State</h2>
                                    <div className="flex items-center gap-3">
                                        {result.auto_generated && (
                                            <div className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                                <Satellite className="w-3 h-3" />
                                                Auto-Generated
                                            </div>
                                        )}
                                        {stateIcons[result.current_state] && (
                                            React.createElement(stateIcons[result.current_state].icon, {
                                                className: `w-10 h-10 ${stateIcons[result.current_state].color}`
                                            })
                                        )}
                                    </div>
                                </div>
                                <div className={`text-4xl font-black mb-4 ${stateIcons[result.current_state]?.color}`}>
                                    {result.current_state}
                                </div>
                                <div className="text-lg text-gray-300 mb-4">
                                    {result.reason}
                                </div>
                                
                                {/* Enhanced data display for auto-generated results */}
                                {severityData ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="bg-black/30 p-4 rounded-lg">
                                            <div className="text-gray-400 text-xs uppercase mb-1">Live Risk</div>
                                            <div className="text-2xl font-bold text-blue-400">{(severityData.continuous_risk * 100).toFixed(1)}%</div>
                                        </div>
                                        <div className="bg-black/30 p-4 rounded-lg">
                                            <div className="text-gray-400 text-xs uppercase mb-1">Risk Band</div>
                                            <div className="text-lg font-bold text-purple-400 capitalize">{severityData.risk_band}</div>
                                        </div>
                                        <div className="bg-black/30 p-4 rounded-lg">
                                            <div className="text-gray-400 text-xs uppercase mb-1">Trend</div>
                                            <div className="text-lg font-bold text-orange-400 capitalize">{severityData.trend}</div>
                                        </div>
                                        <div className="bg-black/30 p-4 rounded-lg">
                                            <div className="text-gray-400 text-xs uppercase mb-1">Confidence</div>
                                            <div className="text-2xl font-bold text-green-400">{(result.confidence * 100).toFixed(0)}%</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="bg-black/30 p-4 rounded-lg">
                                            <div className="text-gray-400 text-xs uppercase mb-1">Flood Risk</div>
                                            <div className="text-2xl font-bold text-blue-400">{result.flood_risk_percentage || formData.flood_risk_percentage}%</div>
                                        </div>
                                        <div className="bg-black/30 p-4 rounded-lg">
                                            <div className="text-gray-400 text-xs uppercase mb-1">Severity</div>
                                            <div className="text-2xl font-bold text-orange-400">{result.incident_severity || formData.severity_level}</div>
                                        </div>
                                    </div>
                                )}
                            </SpotlightCard>
                        )}

                        {/* Action Recommendations */}
                        {result && (
                            <SpotlightCard
                                className="p-8"
                                spotlightColor="rgba(34, 197, 94, 0.2)"
                            >
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-green-400" />
                                    Recommended Actions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {getRecommendations().map((action, index) => (
                                        <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                                            <div className="flex items-center gap-3 mb-2">
                                                {index === 0 && <Users className="w-5 h-5 text-blue-400" />}
                                                {index === 1 && <Truck className="w-5 h-5 text-yellow-400" />}
                                                {index === 2 && <Phone className="w-5 h-5 text-red-400" />}
                                                <span className="font-medium text-white">{action}</span>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Priority: {index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SpotlightCard>
                        )}

                        {/* System Status */}
                        <SpotlightCard
                            className="p-8"
                            spotlightColor="rgba(168, 85, 247, 0.2)"
                        >
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-400" />
                                System Status
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/50">
                                    <div className="text-2xl font-bold text-green-400">✓</div>
                                    <div className="text-sm text-green-300">Engine Active</div>
                                </div>
                                <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/50">
                                    <div className="text-2xl font-bold text-blue-400">{availableStates?.states?.length || 4}</div>
                                    <div className="text-sm text-blue-300">States Available</div>
                                </div>
                                <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-500/50">
                                    <div className="text-2xl font-bold text-purple-400">F3</div>
                                    <div className="text-sm text-purple-300">Severity Integrated</div>
                                </div>
                                <div className="bg-yellow-500/20 p-4 rounded-lg border border-yellow-500/50">
                                    <div className="text-2xl font-bold text-yellow-400">24/7</div>
                                    <div className="text-sm text-yellow-300">Monitoring</div>
                                </div>
                            </div>
                            
                            {/* Integration Status */}
                            <div className="mt-6 p-4 bg-black/30 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-300 mb-3">Feature Integration Status</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Feature 3 Severity Engine</span>
                                        <span className="text-green-400">✓ Connected</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Live Location Data</span>
                                        <span className={location ? "text-green-400" : "text-red-400"}>
                                            {location ? "✓ Active" : "✗ Unavailable"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Auto-Assessment</span>
                                        <span className={autoMode ? "text-blue-400" : "text-gray-400"}>
                                            {autoMode ? "◉ Enabled" : "○ Manual"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">ML Escalation Engine</span>
                                        <span className="text-green-400">✓ Active</span>
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* No Results State */}
                        {!result && (
                            <SpotlightCard
                                className="p-12 text-center"
                                spotlightColor="rgba(107, 114, 128, 0.2)"
                            >
                                <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400 text-lg mb-4">
                                    {autoMode ? 
                                        (location ? 'Auto-assessment ready with live location data' : 'Waiting for location access...') :
                                        'Configure parameters and run escalation assessment'
                                    }
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {autoMode ? 
                                        'The system will automatically integrate Feature 3 severity data with your current location' :
                                        'The AI engine will analyze flood risk and incident severity to determine the appropriate response level'
                                    }
                                </p>
                                
                                {autoMode && location && (
                                    <button
                                        onClick={handleAutoAssessment}
                                        disabled={loading}
                                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Analyzing...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Satellite className="w-4 h-4" />
                                                Run Auto-Assessment
                                            </div>
                                        )}
                                    </button>
                                )}
                            </SpotlightCard>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default EscalationPage;