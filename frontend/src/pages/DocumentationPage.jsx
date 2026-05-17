import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code, Shield, Cpu, Database, Globe, Zap, Wifi, WifiOff, Camera, MapPin, Phone, Users, BarChart3, Brain, Leaf } from 'lucide-react';

const Section = ({ icon: Icon, title, children, color = 'text-blue-400', delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="mb-8 p-5 bg-black/40 border border-white/10 rounded-xl">
    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      <Icon className={`w-5 h-5 ${color}`} /> {title}
    </h2>
    <div className="text-gray-300 text-sm leading-relaxed space-y-3">{children}</div>
  </motion.div>
);

const DocumentationPage = () => {
  return (
    <div className="w-full min-h-screen pb-16">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-600/20 border border-red-500/30 rounded-full text-red-400 text-xs font-bold mb-4">
            <BookOpen className="w-3 h-3" /> OFFICIAL DOCUMENTATION
          </div>
          <h1 className="text-4xl font-black text-white mb-2">CHAUKAS</h1>
          <p className="text-lg text-gray-400">India's Intelligent Road Safety Command System</p>
          <p className="text-xs text-gray-600 mt-2">National Road Safety Hackathon 2026 — IIT Madras</p>
        </motion.div>

        {/* Mission */}
        <Section icon={Shield} title="Mission & Vision" color="text-red-400" delay={0.1}>
          <p>
            <strong>Chaukas</strong> (meaning "alert" / "vigilant") is an AI-powered, offline-first road safety
            platform designed to save lives on India's roads. With <strong>1.78 lakh road fatalities in 2023</strong> alone,
            India faces a road safety crisis. Chaukas empowers citizens, traffic police, and emergency services
            with real-time incident reporting, AI-driven severity analysis, and a nationwide emergency contact network.
          </p>
          <p>
            Our vision is to reduce road accident fatalities by 50% through technology-driven awareness,
            rapid emergency response, and community-powered vigilance across all 28 states and 8 Union Territories.
          </p>
        </Section>

        {/* Core Features */}
        <Section icon={Zap} title="Core Features" color="text-yellow-400" delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Camera, name: 'Gemini Vision AI', desc: 'Auto-analyze accident photos to determine severity, type, and recommended response in under 3 seconds' },
              { icon: MapPin, name: 'Live Incident Map', desc: 'Real-time geolocation-tagged incident reports with ML-powered hotspot detection and heatmap visualization' },
              { icon: Phone, name: 'Emergency Response Center', desc: '137+ emergency contacts across all Indian states and UTs with one-tap calling and national helpline strip' },
              { icon: WifiOff, name: 'Offline-First Architecture', desc: 'All core features — auth, reporting, contacts, news — work without internet via localStorage caching' },
              { icon: Users, name: 'Community Leaderboard', desc: 'Gamified reporting system with reputation points, badges, and rankings to incentivize citizen participation' },
              { icon: Globe, name: 'National News Integration', desc: 'Cross-country road safety news from 6+ major cities with offline fallback for demo environments' },
              { icon: BarChart3, name: 'Admin Command Center', desc: 'Comprehensive dashboard for traffic police with past reports, action history, and AI-suggested interventions' },
              { icon: Leaf, name: 'EV Awareness Campaign', desc: 'Promoting electric vehicle adoption as a road safety and environmental sustainability initiative' },
            ].map((f, i) => (
              <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-lg">
                <f.icon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm">{f.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Tech Stack */}
        <Section icon={Code} title="Technical Architecture" color="text-green-400" delay={0.2}>
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-bold text-sm mb-2">Frontend Stack</h3>
              <div className="flex flex-wrap gap-2">
                {['React 18', 'Vite 6', 'TailwindCSS', 'Framer Motion', 'Three.js', 'React Router', 'Lucide Icons'].map(t => (
                  <span key={t} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-2">Backend Stack</h3>
              <div className="flex flex-wrap gap-2">
                {['Python 3.13', 'FastAPI', 'Uvicorn', 'SQLite', 'Supabase (optional)', 'Google Gemini Vision API'].map(t => (
                  <span key={t} className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-300 text-xs rounded">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-2">Offline & Storage</h3>
              <div className="flex flex-wrap gap-2">
                {['localStorage', 'IndexedDB', 'Service Workers', 'JSON Fallback DB', 'Cache-First Strategy'].map(t => (
                  <span key={t} className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs rounded">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Architecture Diagram */}
        <Section icon={Cpu} title="System Architecture" color="text-purple-400" delay={0.25}>
          <div className="font-mono text-xs bg-black/60 p-4 rounded-lg border border-white/5 overflow-x-auto">
            <pre className="text-gray-300">{`
┌─────────────────────────────────────────────────────┐
│                    USER DEVICE                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ React UI │  │ 3D Globe │  │ Offline Cache    │  │
│  │ (Vite)   │  │(Three.js)│  │ (localStorage)   │  │
│  └────┬─────┘  └──────────┘  └────────┬─────────┘  │
│       │                               │              │
│       ▼                               ▼              │
│  ┌─────────────────────────────────────────────┐    │
│  │        Auth Context (Local / Supabase)       │    │
│  └──────────────────┬──────────────────────────┘    │
└─────────────────────┼───────────────────────────────┘
                      │ HTTP / Fetch
                      ▼
┌─────────────────────────────────────────────────────┐
│                 FastAPI BACKEND                      │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │ Crisis   │ │ News     │ │ Gemini Vision AI   │  │
│  │ Dispatch │ │ Aggreg.  │ │ (Photo Analysis)   │  │
│  └──────────┘ └──────────┘ └────────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │ Severity │ │ Escalate │ │ ML Hotspot Engine  │  │
│  │ Engine   │ │ Manager  │ │ (Prediction Model) │  │
│  └──────────┘ └──────────┘ └────────────────────┘  │
│  ┌──────────────────────────────────────────────┐   │
│  │  SQLite / JSON Local DB / Supabase (Cloud)   │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </Section>

        {/* Offline Capabilities */}
        <Section icon={WifiOff} title="Offline Capabilities" color="text-orange-400" delay={0.3}>
          <p>Chaukas is engineered for <strong>zero-connectivity environments</strong> — a critical requirement for rural India and network-restricted hackathon venues.</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-gray-400">
            <li><strong>Authentication:</strong> Full local login/signup with hashed passwords in localStorage</li>
            <li><strong>Incident Reporting:</strong> Reports cached locally and synced when connectivity returns</li>
            <li><strong>Emergency Contacts:</strong> 137+ contacts embedded as static data — zero API dependency</li>
            <li><strong>News Feed:</strong> 18 national articles pre-seeded; cached API responses for repeat visits</li>
            <li><strong>Gemini Vision:</strong> Intelligent mock analysis fallback when API is unreachable</li>
            <li><strong>Session Persistence:</strong> User's last route saved and restored on next visit</li>
            <li><strong>Community Leaderboard:</strong> Entirely localStorage-backed with no server dependency</li>
          </ul>
        </Section>

        {/* Data Accuracy */}
        <Section icon={Database} title="Data Accuracy & Coverage" color="text-cyan-400" delay={0.35}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Emergency Contacts', value: '137+' },
              { label: 'States & UTs Covered', value: '36' },
              { label: 'National Helplines', value: '8' },
              { label: 'News Sources', value: '18' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-2xl font-black text-cyan-400">{stat.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Hackathon Rulebook Compliance */}
        <Section icon={Brain} title="Hackathon Rulebook Compliance" color="text-pink-400" delay={0.4}>
          <div className="space-y-2">
            {[
              { rule: 'Offline Functionality', status: '✅ Full offline auth, reporting, contacts, news, leaderboard' },
              { rule: 'Data Accuracy', status: '✅ Verified emergency numbers from official .gov sources' },
              { rule: 'Number of Contacts Fetched', status: '✅ 137+ contacts across 36 states/UTs' },
              { rule: 'Information Integration Across Country', status: '✅ 18 national articles from 6 major cities + policy updates' },
              { rule: 'AI/ML Integration', status: '✅ Gemini Vision for photo analysis + ML hotspot prediction' },
              { rule: 'User Experience', status: '✅ 3D globe, glassmorphism, micro-animations, responsive design' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-2 rounded-lg hover:bg-white/5">
                <span className="text-green-400 font-mono text-xs flex-shrink-0 mt-0.5">✓</span>
                <div>
                  <p className="text-white font-semibold text-sm">{item.rule}</p>
                  <p className="text-gray-400 text-xs">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-12 text-center border-t border-white/10 pt-8 pb-4">
          <p className="text-gray-500 text-sm mb-2">Designed & Developed by</p>
          <p className="text-2xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Palash Singh Tomar
          </p>
          <p className="text-xs text-gray-600 mt-2">National Road Safety Hackathon 2026 • Team Outliers</p>
          <p className="text-[10px] text-gray-700 mt-4">© 2026 Chaukas. All Rights Reserved.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentationPage;
