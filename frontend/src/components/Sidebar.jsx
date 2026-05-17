import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Shield, LayoutDashboard, Activity, BarChart2, TrendingUp,
    Target, AlertTriangle, Users, Newspaper, FileText,
    Zap, Moon, Car, Wrench, ChevronRight, LogOut, User,
    MapPin, ChevronDown
} from 'lucide-react';

const NAV = [
    {
        section: 'Intelligence',
        items: [
            { path: '/landing',      icon: LayoutDashboard, label: 'Overview' },
            { path: '/intelligence', icon: Activity,        label: 'Incidents' },
            { path: '/analytics',    icon: BarChart2,       label: 'Analytics & EDA' },
            { path: '/severity',     icon: TrendingUp,      label: 'Severity AI' },
        ]
    },
    {
        section: 'Safety & Features',
        items: [
            { path: '/hotspot',          icon: Target,        label: 'Hotspots' },
            { path: '/crash-sos',        icon: Car,           label: 'Crash SOS',         badge: 'NEW' },
            { path: '/night-watch',      icon: Moon,          label: 'Night Watch',        badge: 'NEW' },
            { path: '/medical-card',     icon: Shield,        label: 'Medical Card',       badge: 'NEW' },
            { path: '/repair-estimator', icon: Wrench,        label: 'Repair Estimator',   badge: 'NEW' },
            { path: '/escalation',       icon: AlertTriangle, label: 'Escalation' },
        ]
    },
    {
        section: 'Community',
        items: [
            { path: '/community',    icon: Users,     label: 'Community' },
            { path: '/coordination', icon: Newspaper, label: 'News' },
            { path: '/docs',         icon: FileText,  label: 'Documentation' },
        ]
    }
];

const Sidebar = () => {
    const location = useLocation();
    const { user, signOut } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (path) => location.pathname === path;

    return (
        <div className={`fixed left-0 top-0 h-screen bg-[#0a0f1e] border-r border-white/[0.06] flex flex-col transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-60'}`}>

            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
                    <Shield size={16} className="text-white" />
                </div>
                {!collapsed && (
                    <div>
                        <span className="text-sm font-bold text-white tracking-wide">CHAUKAS</span>
                        <p className="text-[9px] text-gray-500 leading-none mt-0.5">Road Safety Command</p>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="ml-auto text-gray-600 hover:text-gray-400 transition-colors shrink-0"
                >
                    <ChevronRight size={14} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
                </button>
            </div>

            {/* Location badge */}
            {!collapsed && (
                <div className="px-4 py-2.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                        <MapPin size={10} className="text-cyan-500" />
                        <span>Indore, Madhya Pradesh</span>
                        <span className="ml-auto flex items-center gap-1 text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            LIVE
                        </span>
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
                {NAV.map(({ section, items }) => (
                    <div key={section}>
                        {!collapsed && (
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-1.5">{section}</p>
                        )}
                        <div className="space-y-0.5">
                            {items.map(({ path, icon: Icon, label, badge }) => {
                                const active = isActive(path);
                                return (
                                    <Link key={path} to={path}
                                        className={`flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all group relative ${
                                            active
                                                ? 'bg-red-500/10 text-red-400 border-l-2 border-red-500 pl-[9px]'
                                                : 'text-gray-500 hover:text-gray-200 hover:bg-white/5 border-l-2 border-transparent'
                                        }`}
                                    >
                                        <Icon size={15} className={active ? 'text-red-400' : 'text-gray-600 group-hover:text-gray-300'} />
                                        {!collapsed && (
                                            <>
                                                <span className="text-xs font-medium">{label}</span>
                                                {badge && (
                                                    <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-cyan-500/15 text-cyan-400 rounded font-bold">{badge}</span>
                                                )}
                                            </>
                                        )}
                                        {collapsed && badge && (
                                            <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Profile */}
            <div className="border-t border-white/[0.06] p-3">
                <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0 ring-1 ring-white/10">
                        <User size={13} className="text-gray-300" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-300 truncate">{user?.email?.split('@')[0] || 'Officer'}</p>
                            <p className="text-[9px] text-gray-600 truncate">Chaukas Unit · Indore</p>
                        </div>
                    )}
                    {!collapsed && (
                        <button onClick={signOut} className="text-gray-600 hover:text-red-400 transition-colors" title="Sign out">
                            <LogOut size={13} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
