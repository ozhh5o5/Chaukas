import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Shield, Award, TrendingUp, Users, AlertTriangle, CheckCircle, Medal, Flame, Target, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BADGES = [
  { name: 'Road Guardian', icon: Shield, minPts: 0, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' },
  { name: 'Safety Hero', icon: Award, minPts: 100, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50' },
  { name: 'Community Champion', icon: Trophy, minPts: 300, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' },
  { name: 'Legend', icon: Flame, minPts: 500, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' },
];

const getBadge = (pts) => {
  for (let i = BADGES.length - 1; i >= 0; i--) {
    if (pts >= BADGES[i].minPts) return BADGES[i];
  }
  return BADGES[0];
};

const SEED_LEADERBOARD = [
  { id: 'u1', name: 'Aarav Sharma', reports: 42, verified: 38, reputation: 520, city: 'Delhi' },
  { id: 'u2', name: 'Priya Patel', reports: 35, verified: 33, reputation: 440, city: 'Mumbai' },
  { id: 'u3', name: 'Rohit Verma', reports: 28, verified: 25, reputation: 335, city: 'Bengaluru' },
  { id: 'u4', name: 'Sneha Reddy', reports: 22, verified: 20, reputation: 260, city: 'Hyderabad' },
  { id: 'u5', name: 'Vikram Singh', reports: 18, verified: 15, reputation: 190, city: 'Jaipur' },
  { id: 'u6', name: 'Ananya Iyer', reports: 15, verified: 14, reputation: 170, city: 'Chennai' },
  { id: 'u7', name: 'Karan Gupta', reports: 12, verified: 10, reputation: 130, city: 'Kolkata' },
  { id: 'u8', name: 'Meera Joshi', reports: 9, verified: 8, reputation: 95, city: 'Pune' },
];

const CommunityPage = () => {
  const { user, profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myStats, setMyStats] = useState({ reports: 0, verified: 0, reputation: 0 });
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    // Load or seed leaderboard
    let stored = null;
    try {
      stored = JSON.parse(localStorage.getItem('chaukas_community_scores'));
    } catch (e) {}

    if (stored && stored.length > 0) {
      setLeaderboard(stored);
    } else {
      // Seed with demo data + current user
      const currentUserEntry = {
        id: user?.id || 'current',
        name: profile?.full_name || user?.user_metadata?.full_name || 'You',
        reports: 5,
        verified: 4,
        reputation: 55,
        city: 'Your City'
      };
      const seeded = [...SEED_LEADERBOARD, currentUserEntry].sort((a, b) => b.reputation - a.reputation);
      localStorage.setItem('chaukas_community_scores', JSON.stringify(seeded));
      setLeaderboard(seeded);
    }
  }, [user, profile]);

  useEffect(() => {
    if (leaderboard.length > 0 && user) {
      const me = leaderboard.find(u => u.id === user.id || u.id === 'current');
      if (me) setMyStats(me);
    }
  }, [leaderboard, user]);

  const handleSimulateReport = () => {
    setLeaderboard(prev => {
      const updated = prev.map(u => {
        if (u.id === user?.id || u.id === 'current') {
          return {
            ...u,
            reports: u.reports + 1,
            verified: u.verified + (Math.random() > 0.2 ? 1 : 0),
            reputation: u.reputation + 10 + Math.floor(Math.random() * 15),
          };
        }
        return u;
      }).sort((a, b) => b.reputation - a.reputation);
      localStorage.setItem('chaukas_community_scores', JSON.stringify(updated));
      return updated;
    });
  };

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="w-full min-h-screen pb-16">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">COMMUNITY LEADERBOARD</h1>
              <p className="text-gray-400 text-sm">Report incidents, earn reputation, become a Road Safety Champion</p>
            </div>
          </div>
        </motion.div>

        {/* My Stats Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-8 p-5 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30 border border-white/10 rounded-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-black">
                {(profile?.full_name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white font-bold text-lg">{profile?.full_name || 'You'}</p>
                <div className="flex items-center gap-2 mt-1">
                  {(() => { const b = getBadge(myStats.reputation); return (
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${b.bg} ${b.border} ${b.color}`}>
                      <b.icon className="w-3 h-3" /> {b.name}
                    </span>
                  ); })()}
                  <span className="text-xs text-gray-500">Rank #{leaderboard.findIndex(u => u.id === user?.id || u.id === 'current') + 1} of {leaderboard.length}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{myStats.reputation}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Reputation</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{myStats.reports}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Reports</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{myStats.verified}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Verified</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: AlertTriangle, title: 'Report Incident', desc: '+10 pts per report submitted', color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { icon: CheckCircle, title: 'Get Verified', desc: '+15 bonus pts when verified by admin', color: 'text-green-400', bg: 'bg-green-500/10' },
            { icon: Medal, title: 'Earn Badges', desc: 'Unlock badges at 100, 300, 500 pts', color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              className={`p-4 rounded-xl border border-white/10 ${item.bg}`}>
              <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
              <p className="text-white font-bold text-sm">{item.title}</p>
              <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Podium — Top 3 */}
        {topThree.length >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mb-8 flex items-end justify-center gap-4">
            {[topThree[1], topThree[0], topThree[2]].map((entry, i) => {
              const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
              const heights = ['h-28', 'h-36', 'h-24'];
              const colors = ['from-gray-400 to-gray-600', 'from-yellow-400 to-yellow-600', 'from-amber-700 to-amber-900'];
              const badge = getBadge(entry.reputation);
              return (
                <div key={entry.id} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/20 flex items-center justify-center text-white font-bold mb-2">
                    {entry.name[0]}
                  </div>
                  <p className="text-white text-xs font-bold truncate max-w-[90px]">{entry.name}</p>
                  <p className="text-yellow-400 text-xs font-mono">{entry.reputation} pts</p>
                  <div className={`${heights[i]} w-24 bg-gradient-to-t ${colors[i]} rounded-t-lg mt-2 flex items-center justify-center`}>
                    <span className="text-white text-2xl font-black">#{rank}</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Full Leaderboard Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-white font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Full Rankings</h2>
            <button onClick={handleSimulateReport}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
              <Zap className="w-3 h-3" /> Simulate Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="text-left p-3 w-12">#</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3 hidden sm:table-cell">City</th>
                  <th className="text-center p-3">Reports</th>
                  <th className="text-center p-3">Verified</th>
                  <th className="text-center p-3">Reputation</th>
                  <th className="text-center p-3 hidden sm:table-cell">Badge</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => {
                  const badge = getBadge(entry.reputation);
                  const isMe = entry.id === user?.id || entry.id === 'current';
                  return (
                    <tr key={entry.id} className={`border-b border-white/5 transition-colors ${isMe ? 'bg-blue-900/20' : 'hover:bg-white/5'}`}>
                      <td className="p-3 font-mono font-bold text-gray-400">
                        {i < 3 ? <span className={i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-amber-600'}>{i + 1}</span> : i + 1}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${isMe ? 'bg-blue-600' : 'bg-white/10'}`}>
                            {entry.name[0]}
                          </div>
                          <span className={`font-medium ${isMe ? 'text-blue-300' : 'text-white'}`}>{entry.name} {isMe && <span className="text-[10px] text-blue-400">(YOU)</span>}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-400 hidden sm:table-cell">{entry.city}</td>
                      <td className="p-3 text-center text-white font-mono">{entry.reports}</td>
                      <td className="p-3 text-center text-green-400 font-mono">{entry.verified}</td>
                      <td className="p-3 text-center">
                        <span className="text-yellow-400 font-bold font-mono">{entry.reputation}</span>
                      </td>
                      <td className="p-3 text-center hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${badge.bg} ${badge.border} ${badge.color}`}>
                          <badge.icon className="w-3 h-3" /> {badge.name}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityPage;
