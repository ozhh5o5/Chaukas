import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Zap, Lock, Globe, Activity, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const { signIn, signUp } = useAuth();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                if (!fullName.trim()) {
                    throw new Error("Full Name is required for registration.");
                }
                await signUp(email, password, fullName);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#050510] text-white relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,20,40,1)_0%,#000000_100%)] z-0"></div>
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 z-0 pointer-events-none"></div>

            {/* LEFT PANEL: Platform Info (What is this PS about?) */}
            <div className="hidden lg:flex w-3/5 relative z-10 flex-col justify-center px-20 border-r border-white/5 bg-black/20 backdrop-blur-sm">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-4 mb-12 animate-fade-in-up">
                        <img src="/logo.jpg" alt="Chaukas Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(255,59,48,0.3)]" />
                        <h1 className="text-3xl font-display font-bold tracking-wider">CHAU<span className="text-crisis-red">KAS</span></h1>
                    </div>

                    <h2 className="text-5xl font-display font-bold leading-tight mb-8 animate-fade-in-up delay-100">
                        Next-Gen Global <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-crisis-cyan to-blue-500">Crisis Response Grid</span>
                    </h2>

                    <p className="text-xl text-gray-400 leading-relaxed mb-12 animate-fade-in-up delay-200">
                        Chaukas is a centralized command platform designed to unify road safety management, resource allocation, and real-time threat intelligence.
                        We bridge the gap between ground units and strategic command using AI-driven analytics and satellite telemetry.
                    </p>

                    <div className="grid grid-cols-2 gap-8 animate-fade-in-up delay-300">
                        <div className="flex gap-4">
                            <Activity className="w-6 h-6 text-crisis-red mt-1" />
                            <div>
                                <h3 className="font-bold text-lg mb-1">Real-Time Intel</h3>
                                <p className="text-sm text-gray-500">Live incident tracking with sub-second latency.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Globe className="w-6 h-6 text-crisis-cyan mt-1" />
                            <div>
                                <h3 className="font-bold text-lg mb-1">Global Coverage</h3>
                                <p className="text-sm text-gray-500">Unified map view spanning 190+ territories.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Zap className="w-6 h-6 text-yellow-500 mt-1" />
                            <div>
                                <h3 className="font-bold text-lg mb-1">AI Logistics</h3>
                                <p className="text-sm text-gray-500">Automated resource routing and supply chain optimization.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Lock className="w-6 h-6 text-green-500 mt-1" />
                            <div>
                                <h3 className="font-bold text-lg mb-1">Secure Comms</h3>
                                <p className="text-sm text-gray-500">Encrypted channels for agency interoperability.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Login Form */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-8 relative z-20">
                <div className="w-full max-w-md p-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative">

                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-crisis-red/50 to-transparent"></div>

                    <div className="mb-8 text-center">
                        <h3 className="text-2xl font-bold mb-2 text-white">System Access</h3>
                        <div className="flex justify-center items-center gap-2">
                            <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                            <p className="text-[10px] font-mono tracking-widest uppercase text-green-500">
                                Local Auth: ACTIVE
                            </p>
                        </div>
                    </div>

                    {/* Quick Demo Login for Judges */}
                    {isLogin && (
                        <div className="mb-4 p-3 rounded-lg bg-cyan-900/20 border border-cyan-500/20">
                            <p className="text-[10px] font-mono text-cyan-400 mb-2">DEMO CREDENTIALS</p>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => { setEmail('admin@demo.com'); setPassword('demo@123'); }}
                                    className="flex-1 text-xs bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 text-cyan-300 py-2 px-3 rounded transition-colors font-mono">
                                    Admin Login
                                </button>
                                <button type="button" onClick={() => { setEmail('user@demo.com'); setPassword('demo'); setFullName('Demo User'); }}
                                    className="flex-1 text-xs bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-green-300 py-2 px-3 rounded transition-colors font-mono">
                                    User Login
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 rounded bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="space-y-2 animate-fade-in">
                                <label className="text-xs font-mono uppercase text-gray-500 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-crisis-red/50 transition-colors font-mono"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-xs font-mono uppercase text-gray-500 ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-crisis-red/50 transition-colors font-mono"
                                placeholder="name@email.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono uppercase text-gray-500 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-crisis-red/50 transition-colors font-mono"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-crisis-red hover:bg-red-600 text-white font-bold py-4 rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="animate-pulse">Authenticating...</span>
                            ) : (
                                <>
                                    {isLogin ? 'INITIALIZE SESSION' : 'REGISTER OPERATIVE'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-gray-400 pb-0.5"
                        >
                            {isLogin ? "Register New Account" : "Already have an account? Login"}
                        </button>
                        <p className="text-[9px] text-gray-600 font-mono">Any valid email + password to register. Stored locally.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;