import React, { useState } from 'react';
import { Wrench, MapPin, BarChart2, ChevronDown } from 'lucide-react';

const AREAS = [
    { area:'Rajwada',       potholes:12, deep:5, medium:5, shallow:2, road:'ABD Road' },
    { area:'Palasia',       potholes:10, deep:4, medium:4, shallow:2, road:'MR-10' },
    { area:'Bhawarkuan',    potholes:9,  deep:3, medium:4, shallow:2, road:'Bypass Road' },
    { area:'Vijay Nagar',   potholes:8,  deep:2, medium:4, shallow:2, road:'Scheme-54 Link' },
    { area:'LIG Square',    potholes:6,  deep:1, medium:3, shallow:2, road:'LIG Main Rd' },
    { area:'Khajrana',      potholes:5,  deep:1, medium:2, shallow:2, road:'Khajrana Rd' },
    { area:'Scheme 54',     potholes:4,  deep:0, medium:2, shallow:2, road:'Sukhliya Rd' },
    { area:'Super Corridor',potholes:3,  deep:0, medium:1, shallow:2, road:'Super Corridor' },
];

const DIMS = { deep:{l:50,w:40,d:12}, medium:{l:40,w:35,d:6}, shallow:{l:30,w:25,d:3} };
const HMA_DENSITY = 2.4;
const COST_PER_KG = 8;
const LABOUR = 150;

const calcArea = (a) => {
    const vol = (cnt, t) => cnt * (DIMS[t].l * DIMS[t].w * DIMS[t].d) / 1000;
    const totalVol = vol(a.deep,'deep') + vol(a.medium,'medium') + vol(a.shallow,'shallow');
    const kg = totalVol * HMA_DENSITY;
    const matCost = kg * COST_PER_KG;
    const labourCost = a.potholes * LABOUR;
    return { totalVol: totalVol.toFixed(1), kg: kg.toFixed(1), matCost: Math.round(matCost), labourCost, total: Math.round(matCost + labourCost) };
};

const fmt = (n) => n.toLocaleString('en-IN');

const RepairEstimatorPage = () => {
    const [selected, setSelected] = useState(AREAS[0]);
    const [showAll, setShowAll]   = useState(false);

    const est = calcArea(selected);
    const allEsts = AREAS.map(a => ({ ...a, ...calcArea(a) }));
    const cityTotal = allEsts.reduce((s,a) => ({
        total: s.total + a.total,
        kg: s.kg + parseFloat(a.kg),
        potholes: s.potholes + a.potholes
    }), { total:0, kg:0, potholes:0 });

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-16">
            <div className="bg-gray-900/95 border-b border-white/5 px-6 py-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-xl"><Wrench className="text-yellow-400" size={20}/></div>
                <div>
                    <h1 className="text-xl font-bold text-white">Pothole Repair Cost Estimator</h1>
                    <p className="text-[11px] text-gray-500">Area-wise HMA material and labour cost · Municipal Corporation Indore</p>
                </div>
            </div>

            <div className="px-6 py-6 max-w-5xl mx-auto space-y-6">
                {/* City totals */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { l:'Total Potholes',  v: String(cityTotal.potholes),           c:'yellow' },
                        { l:'HMA Required',    v: cityTotal.kg.toFixed(0) + ' kg',      c:'orange' },
                        { l:'Material Cost',   v: '₹' + fmt(Math.round(cityTotal.total*0.68)), c:'cyan' },
                        { l:'Total Estimate',  v: '₹' + fmt(cityTotal.total),           c:'red' },
                    ].map(k=>(
                        <div key={k.l} className={`bg-gray-800/60 backdrop-blur rounded-2xl border border-${k.c}-500/20 p-5`}>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{k.l}</p>
                            <p className={`text-2xl font-bold text-${k.c}-400 mt-1`}>{k.v}</p>
                            <p className="text-[9px] text-gray-600 mt-0.5">All Indore areas combined</p>
                        </div>
                    ))}
                </div>

                {/* Selector + Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <MapPin size={13} className="text-yellow-400"/>Select Area
                        </h3>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {AREAS.map(a => (
                                <button key={a.area} onClick={()=>setSelected(a)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${selected.area===a.area ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400' : 'text-gray-400 border border-transparent hover:bg-white/5 hover:text-white'}`}>
                                    <div>
                                        <p className="text-sm font-bold">{a.area}</p>
                                        <p className="text-[10px] text-gray-600">{a.road}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-mono">{a.potholes} potholes</p>
                                        <p className="text-[10px] text-gray-600">₹{fmt(calcArea(a).total)}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                        <h3 className="text-sm font-bold text-white mb-1">{selected.area} — Repair Report</h3>
                        <p className="text-[10px] text-gray-500 mb-5">{selected.road} · {selected.potholes} potholes detected</p>

                        <div className="grid grid-cols-3 gap-3 mb-5">
                            {[['Deep',selected.deep,'#ef4444'],['Medium',selected.medium,'#f59e0b'],['Shallow',selected.shallow,'#3b82f6']].map(([t,v,c])=>(
                                <div key={t} className="rounded-xl p-3 text-center" style={{backgroundColor:c+'15',border:`1px solid ${c}30`}}>
                                    <p className="text-xl font-bold" style={{color:c}}>{v}</p>
                                    <p className="text-[9px] text-gray-500">{t}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-900/60 rounded-xl p-4 mb-4">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Bill of Materials</p>
                            <div className="space-y-2">
                                {[
                                    ['Hot Mix Asphalt (HMA)', est.kg + ' kg', '₹' + fmt(est.matCost)],
                                    ['Labour (per pothole)',  selected.potholes + ' x ₹150', '₹' + fmt(est.labourCost)],
                                    ['Traffic Management',   'Flat rate', '₹1,200'],
                                ].map(([item,qty,cost])=>(
                                    <div key={item} className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">{item}</span>
                                        <span className="text-gray-600 mx-2">{qty}</span>
                                        <span className="font-mono text-white">{cost}</span>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-xs font-bold text-white">Total Estimate</span>
                                    <span className="text-lg font-bold text-yellow-400 font-mono">₹{fmt(est.total + 1200)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {[
                                [est.totalVol + ' L', 'Volume', 'text-cyan-400'],
                                [est.kg + ' kg',     'HMA',    'text-orange-400'],
                                ['2-3 days',          'Repair', 'text-green-400'],
                            ].map(([v,l,c])=>(
                                <div key={l} className="flex-1 bg-gray-900/60 rounded-lg p-3 text-center">
                                    <p className={`text-sm font-mono font-bold ${c}`}>{v}</p>
                                    <p className="text-[9px] text-gray-600">{l}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <BarChart2 size={13} className="text-yellow-400"/>All Areas Cost Summary
                        </h3>
                        <button onClick={()=>setShowAll(!showAll)} className="text-[10px] text-gray-500 hover:text-gray-300 flex items-center gap-1">
                            {showAll?'Show less':'Show all'} <ChevronDown size={12} className={showAll?'rotate-180 transition-transform':'transition-transform'}/>
                        </button>
                    </div>
                    <table className="w-full text-xs" style={{tableLayout:'fixed',minWidth:640}}>
                        <colgroup>
                            <col style={{width:'22%'}}/><col style={{width:'12%'}}/><col style={{width:'10%'}}/>
                            <col style={{width:'10%'}}/><col style={{width:'10%'}}/><col style={{width:'14%'}}/>
                            <col style={{width:'14%'}}/><col style={{width:'8%'}}/>
                        </colgroup>
                        <thead>
                            <tr className="text-[10px] text-gray-500 uppercase bg-black/20 border-b border-white/5">
                                <th className="px-4 py-2.5 text-left">Area</th>
                                <th className="px-3 py-2.5 text-right">Potholes</th>
                                <th className="px-3 py-2.5 text-right text-red-400">Deep</th>
                                <th className="px-3 py-2.5 text-right text-yellow-400">Med</th>
                                <th className="px-3 py-2.5 text-right text-blue-400">Shallow</th>
                                <th className="px-3 py-2.5 text-right">HMA (kg)</th>
                                <th className="px-3 py-2.5 text-right">Est. Cost</th>
                                <th className="px-3 py-2.5 text-center">Priority</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allEsts.slice(0, showAll ? undefined : 4).sort((a,b)=>b.total-a.total).map((row,i)=>(
                                <tr key={row.area} className={`border-t border-white/5 hover:bg-white/5 transition-colors ${i===0?'bg-red-500/5':''}`}>
                                    <td className="px-4 py-3 font-medium text-gray-200">{row.area}</td>
                                    <td className="px-3 py-3 text-right font-mono text-gray-300">{row.potholes}</td>
                                    <td className="px-3 py-3 text-right text-red-400 font-mono">{row.deep}</td>
                                    <td className="px-3 py-3 text-right text-yellow-400 font-mono">{row.medium}</td>
                                    <td className="px-3 py-3 text-right text-blue-400 font-mono">{row.shallow}</td>
                                    <td className="px-3 py-3 text-right font-mono text-gray-300">{row.kg}</td>
                                    <td className="px-3 py-3 text-right font-mono font-bold text-yellow-400">₹{fmt(row.total+1200)}</td>
                                    <td className="px-3 py-3 text-center">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${row.deep>2?'bg-red-500/15 text-red-400':row.medium>2?'bg-yellow-500/15 text-yellow-400':'bg-green-500/15 text-green-400'}`}>
                                            {row.deep>2?'URGENT':row.medium>2?'HIGH':'NORMAL'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RepairEstimatorPage;
