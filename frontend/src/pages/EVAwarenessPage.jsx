import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Zap, Battery, TrendingUp, Heart, Shield, Car, Fuel, Wind, Sun, Globe, ThumbsUp, Users, IndianRupee, CheckCircle } from 'lucide-react';

const EVAwarenessPage = () => {
  const [pledgeCount, setPledgeCount] = useState(0);
  const [hasPledged, setHasPledged] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('chaukas_ev_pledges');
    const myPledge = localStorage.getItem('chaukas_ev_my_pledge');
    setPledgeCount(stored ? parseInt(stored) : 2847);
    setHasPledged(myPledge === 'true');
  }, []);

  const handlePledge = () => {
    if (!hasPledged) {
      const newCount = pledgeCount + 1;
      setPledgeCount(newCount);
      setHasPledged(true);
      localStorage.setItem('chaukas_ev_pledges', newCount.toString());
      localStorage.setItem('chaukas_ev_my_pledge', 'true');
    }
  };

  const stats = [
    { icon: Car, value: '34.4L+', label: 'EVs Registered in India (2024)', color: 'text-green-400' },
    { icon: TrendingUp, value: '49%', label: 'Year-on-Year Growth', color: 'text-blue-400' },
    { icon: Fuel, value: '₹1.1/km', label: 'EV Running Cost vs ₹5.5/km Petrol', color: 'text-yellow-400' },
    { icon: Wind, value: '0g', label: 'Tailpipe CO₂ Emissions', color: 'text-cyan-400' },
  ];

  const benefits = [
    {
      icon: Shield, title: 'Safer Roads',
      desc: 'EVs have a lower center of gravity, reducing rollover risk by 50%. Regenerative braking improves stopping distance. Fewer mechanical failures mean fewer road breakdowns.',
      color: 'from-blue-600/20 to-blue-900/20', border: 'border-blue-500/30'
    },
    {
      icon: Heart, title: 'Cleaner Air, Healthier Lives',
      desc: 'India loses 1.67 million lives annually to air pollution. Each EV removes 2.1 tonnes of CO₂/year. Switching 30% of vehicles to EVs would reduce urban PM2.5 by 18%.',
      color: 'from-red-600/20 to-red-900/20', border: 'border-red-500/30'
    },
    {
      icon: IndianRupee, title: '80% Lower Running Cost',
      desc: 'Electric vehicles cost just ₹1.1/km compared to ₹5.5/km for petrol cars. Annual savings of ₹50,000–₹80,000 on fuel alone. Lower maintenance costs with no oil changes or transmission repairs.',
      color: 'from-yellow-600/20 to-yellow-900/20', border: 'border-yellow-500/30'
    },
    {
      icon: Sun, title: 'Sustainable Future',
      desc: 'India targets 30% EV penetration by 2030 under the National Electric Mobility Mission. FAME-II subsidy of up to ₹1.5 lakh on electric two-wheelers and ₹3 lakh on e-cars.',
      color: 'from-green-600/20 to-green-900/20', border: 'border-green-500/30'
    },
  ];

  const evSafetyTips = [
    'Always use BIS-certified chargers to prevent battery fires',
    'Check tyre pressure monthly — EVs are heavier and need proper inflation',
    'Be extra cautious at intersections — EVs are near-silent at low speeds',
    'Use the regenerative braking system to maintain better speed control on hills',
    'Never charge during lightning storms or in waterlogged areas',
    'Plan highway routes with charging station stops every 150–200 km',
    'Keep a portable fire extinguisher rated for lithium-ion battery fires',
    'Report potholes via Chaukas — bad roads damage EV batteries faster than ICE vehicles',
  ];

  return (
    <div className="w-full min-h-screen pb-16">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center p-8 bg-gradient-to-br from-green-900/30 via-emerald-900/20 to-teal-900/30 border border-green-500/20 rounded-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 rounded-full text-green-400 text-xs font-bold mb-4">
            <Leaf className="w-3 h-3" /> AWARENESS CAMPAIGN
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            GO <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">ELECTRIC</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Every road made safer starts with a cleaner vehicle. Chaukas promotes EV adoption as a key pillar
            of India's road safety and environmental sustainability goals.
          </p>
        </motion.div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="text-center p-4 bg-black/40 border border-white/10 rounded-xl">
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" /> Why Switch to EVs?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {benefits.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              className={`p-5 bg-gradient-to-br ${b.color} border ${b.border} rounded-xl`}>
              <b.icon className="w-8 h-8 text-white/80 mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">{b.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* EV Safety Tips */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mb-8 p-5 bg-black/40 border border-white/10 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" /> EV Road Safety Tips for India
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {evSafetyTips.map((tip, i) => (
              <div key={i} className="flex gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Government Initiatives */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="mb-8 p-5 bg-gradient-to-r from-orange-900/20 via-white/5 to-green-900/20 border border-white/10 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-orange-400" /> Government EV Initiatives
          </h2>
          <div className="space-y-3">
            {[
              { name: 'FAME-II Scheme', desc: 'Subsidies up to ₹1.5L on 2-wheelers and ₹3L on 4-wheelers for EV buyers' },
              { name: 'State EV Policies', desc: '22 states have dedicated EV policies — Delhi, Maharashtra, and Karnataka lead with road tax exemptions' },
              { name: 'National Charging Infra', desc: 'MoP targets 46,397 public charging stations by 2030 across National Highways' },
              { name: 'PLI Scheme for Battery', desc: '₹18,100 crore Production Linked Incentive for advanced chemistry cell manufacturing' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="text-white font-semibold text-sm">{item.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pledge Section */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="text-center p-8 bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/20 rounded-2xl">
          <Leaf className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Take the Green Pledge</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Join thousands of Indians committing to switch to electric vehicles for safer, cleaner roads.
          </p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-3xl font-black text-green-400">{pledgeCount.toLocaleString()}</span>
            <span className="text-gray-400 text-sm">pledges so far</span>
          </div>
          <button onClick={handlePledge} disabled={hasPledged}
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
              hasPledged
                ? 'bg-green-800/50 text-green-300 cursor-default border border-green-500/30'
                : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/50 hover:shadow-green-800/70'
            }`}>
            {hasPledged ? (
              <span className="flex items-center gap-2"><ThumbsUp className="w-5 h-5" /> You've Pledged! 🎉</span>
            ) : (
              <span className="flex items-center gap-2"><Leaf className="w-5 h-5" /> I Pledge to Go Electric</span>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default EVAwarenessPage;
