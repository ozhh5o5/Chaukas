import React, { useState, useEffect, useRef } from 'react';
import { BarChart2, Activity, Target, Zap, Shield, AlertTriangle, TrendingUp, Map, Info } from 'lucide-react';

const AREAS = [
    { area:'Rajwada', incidents:18, potholes:12, accel:24.3, risk:92, sev:'critical' },
    { area:'Palasia', incidents:15, potholes:10, accel:21.5, risk:88, sev:'critical' },
    { area:'Bhawarkuan', incidents:12, potholes:9, accel:19.8, risk:74, sev:'high' },
    { area:'Vijay Nagar', incidents:10, potholes:8, accel:18.7, risk:68, sev:'high' },
    { area:'LIG Square', incidents:8, potholes:6, accel:16.2, risk:55, sev:'medium' },
    { area:'Khajrana', incidents:6, potholes:5, accel:15.4, risk:44, sev:'medium' },
    { area:'Scheme 54', incidents:4, potholes:4, accel:14.1, risk:32, sev:'low' },
    { area:'Super Corridor', incidents:3, potholes:3, accel:12.0, risk:22, sev:'low' },
];

const HOURLY = [2,1,3,1,0,2,4,8,12,10,7,9,11,8,6,10,14,18,15,12,9,7,5,3];
const WEEKLY = [{d:'Mon',v:24},{d:'Tue',v:18},{d:'Wed',v:31},{d:'Thu',v:22},{d:'Fri',v:38},{d:'Sat',v:42},{d:'Sun',v:29}];
const TYPES  = [{t:'Pothole',v:57,c:'#f59e0b'},{t:'Accident',v:48,c:'#ef4444'},{t:'Road Block',v:22,c:'#8b5cf6'},{t:'Flood Risk',v:14,c:'#3b82f6'},{t:'Fire Hazard',v:9,c:'#f97316'}];
const PIPELINE = [
    {icon:'📡',title:'Accelerometer Capture',color:'cyan',desc:'DeviceMotionEvent at 60 Hz. Vertical spike > 14 m/s² triggers candidate.'},
    {icon:'🧠',title:'Probabilistic Scoring',color:'purple',desc:'Speed-weighted confidence. High-speed spikes penalized 40–80%.'},
    {icon:'📍',title:'Spatial Clustering',color:'yellow',desc:'DBSCAN 15 m radius. ≥3 reports = verified hotspot.'},
    {icon:'⚠️',title:'Severity Grading',color:'orange',desc:'Deep ≥28 · Medium ≥20 · Shallow ≥14 m/s².'},
    {icon:'🗺️',title:'Heatmap Fusion',color:'green',desc:'Pothole + accident layers merged on Leaflet. Refreshed every 30 s.'},
    {icon:'🤖',title:'AI Severity Engine',color:'red',desc:'Weather + hour + density → probabilistic severity per report.'},
];

const rc = s=>({critical:'#ef4444',high:'#f59e0b',medium:'#3b82f6',low:'#22c55e'}[s]||'#6b7280');
const ac = v=>v>=22?'#ef4444':v>=17?'#f59e0b':'#3b82f6';

// Animated counter hook
function useCounter(target, duration=1200) {
    const [val,setVal]=useState(0);
    useEffect(()=>{
        let start=null;
        const step=ts=>{
            if(!start)start=ts;
            const p=Math.min((ts-start)/duration,1);
            setVal(Math.floor(p*target));
            if(p<1)requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    },[target]);
    return val;
}

// Tooltip-aware SVG bar
const TooltipBar = ({x,y,w,h,fill,label,value,unit=''})=>{
    const [show,setShow]=useState(false);
    return (
        <g onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)} style={{cursor:'pointer'}}>
            <rect x={x} y={y} width={w} height={h} fill={fill} opacity={show?1:0.75} rx={3}/>
            {show&&<g>
                <rect x={x+w/2-36} y={y-32} width={72} height={22} fill="#1f2937" rx={4} stroke="#374151"/>
                <text x={x+w/2} y={y-17} fill="#fff" fontSize={10} textAnchor="middle" fontWeight="bold">{label}: {value}{unit}</text>
            </g>}
        </g>
    );
};

// Hourly chart
const HourlyChart = ()=>{
    const [mounted,setMounted]=useState(false);
    useEffect(()=>{setTimeout(()=>setMounted(true),100);},[]);
    const W=620,H=150,pl=40,pr=12,pt=20,pb=30;
    const iW=W-pl-pr,iH=H-pt-pb;
    const max=Math.max(...HOURLY);
    const bw=iW/24*0.65;
    return(
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {[0,.5,1].map(t=><line key={t} x1={pl} x2={W-pr} y1={pt+iH*(1-t)} y2={pt+iH*(1-t)} stroke="#374151" strokeWidth={.5} strokeDasharray="4 3"/>)}
            {[0,5,10,15,20].map(v=><text key={v} x={pl-4} y={pt+iH*(1-v/max)+4} fill="#6b7280" fontSize={8} textAnchor="end">{v}</text>)}
            {HOURLY.map((v,i)=>{
                const gap=iW/24,x=pl+i*gap+(gap-bw)/2;
                const fullH=(v/max)*iH,bh=mounted?fullH:0,y=pt+iH-bh;
                const col=v>=12?'#ef4444':v>=8?'#f59e0b':'#22d3ee';
                return <TooltipBar key={i} x={x} y={y} w={bw} h={bh} fill={col} label={`${i}:00`} value={v} unit=" incidents"/>;
            })}
            {[0,6,12,18,23].map(i=><text key={i} x={pl+i*(iW/24)+bw/2} y={H-4} fill="#6b7280" fontSize={8} textAnchor="middle">{i}h</text>)}
            <line x1={pl} y1={pt} x2={pl} y2={pt+iH} stroke="#4b5563"/>
            <line x1={pl} y1={pt+iH} x2={W-pr} y2={pt+iH} stroke="#4b5563"/>
        </svg>
    );
};

// Weekly chart
const WeeklyChart = ()=>{
    const [mounted,setMounted]=useState(false);
    useEffect(()=>{setTimeout(()=>setMounted(true),150);},[]);
    const W=620,H=150,pl=40,pr=12,pt=20,pb=30;
    const iW=W-pl-pr,iH=H-pt-pb;
    const max=Math.max(...WEEKLY.map(d=>d.v));
    const gap=iW/7,bw=gap*.6;
    return(
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
            {[0,.5,1].map(t=><line key={t} x1={pl} x2={W-pr} y1={pt+iH*(1-t)} y2={pt+iH*(1-t)} stroke="#374151" strokeWidth={.5} strokeDasharray="4 3"/>)}
            {WEEKLY.map((d,i)=>{
                const x=pl+i*gap+(gap-bw)/2;
                const fullH=(d.v/max)*iH,bh=mounted?fullH:0,y=pt+iH-bh;
                const col=d.v>=40?'#ef4444':d.v>=30?'#f59e0b':'#22d3ee';
                return(
                    <g key={i}>
                        <TooltipBar x={x} y={y} w={bw} h={bh} fill={col} label={d.d} value={d.v} unit=" incidents"/>
                        <text x={x+bw/2} y={H-4} fill="#6b7280" fontSize={9} textAnchor="middle">{d.d}</text>
                    </g>
                );
            })}
            <line x1={pl} y1={pt} x2={pl} y2={pt+iH} stroke="#4b5563"/>
            <line x1={pl} y1={pt+iH} x2={W-pr} y2={pt+iH} stroke="#4b5563"/>
        </svg>
    );
};

// KPI card with animated counter
const KpiCard = ({label,target,sub,icon,col,suffix=''})=>{
    const val=useCounter(typeof target==='number'?target:0);
    return(
        <div className={`bg-gray-800/80 backdrop-blur rounded-2xl border border-${col}-500/20 p-5 hover:border-${col}-500/50 transition-all hover:shadow-lg hover:shadow-${col}-500/10 group`}>
            <div className={`text-${col}-400 mb-3 group-hover:scale-110 transition-transform inline-block`}>{icon}</div>
            <p className={`text-4xl font-bold text-${col}-400`}>{typeof target==='number'?val:target}{suffix}</p>
            <p className="text-sm font-bold text-gray-300 mt-1">{label}</p>
            <p className="text-[11px] text-gray-600 mt-0.5">{sub}</p>
        </div>
    );
};

// Animated horizontal bar
const AnimBar = ({pct,color,delay=0})=>{
    const [w,setW]=useState(0);
    useEffect(()=>{const t=setTimeout(()=>setW(pct),delay+100);return()=>clearTimeout(t);},[pct,delay]);
    return(
        <div className="flex-1 bg-gray-700/60 rounded-full h-2.5 overflow-hidden">
            <div className="h-2.5 rounded-full transition-all duration-700 ease-out" style={{width:`${w}%`,backgroundColor:color}}/>
        </div>
    );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const TABS=[{id:'overview',label:'Overview'},{id:'hotspot',label:'Hotspot Detection'},{id:'pothole',label:'Pothole Pipeline'},{id:'temporal',label:'Temporal Trends'}];

const AnalyticsPage = () => {
    const [tab,setTab]=useState('overview');
    const [selRow,setSelRow]=useState(null);

    return(
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white pb-16">
            {/* Header */}
            <div className="bg-gray-900/95 backdrop-blur border-b border-white/5 px-6 py-4 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-xl"><BarChart2 className="text-cyan-400" size={20}/></div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Analytics & EDA</h1>
                        <p className="text-[11px] text-gray-500">Platform-wide exploratory data analysis · Indore, MP</p>
                    </div>
                </div>
                {/* Tabs */}
                <div className="flex gap-1 mt-4">
                    {TABS.map(t=>(
                        <button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${tab===t.id?'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30':'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>{t.label}</button>
                    ))}
                </div>
            </div>

            <div className="px-6 py-6 max-w-7xl mx-auto">

                {/* OVERVIEW */}
                {tab==='overview'&&(
                    <div className="space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <KpiCard label="Total Incidents" target={150} sub="All types · Indore" icon={<AlertTriangle size={20}/>} col="red"/>
                            <KpiCard label="Pothole Hotspots" target={57} sub="Accelerometer verified" icon={<Zap size={20}/>} col="yellow"/>
                            <KpiCard label="ML Clusters" target={12} sub="DBSCAN accident zones" icon={<Target size={20}/>} col="cyan"/>
                            <KpiCard label="Avg Risk Score" target={61} sub="Weighted across areas" icon={<Shield size={20}/>} col="orange" suffix="%"/>
                        </div>

                        {/* Type distribution */}
                        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2"><Activity size={14} className="text-cyan-400"/>Incident Type Distribution</h3>
                            <div className="space-y-4">
                                {TYPES.map((d,i)=>(
                                    <div key={d.t} className="flex items-center gap-4 group">
                                        <span className="text-xs text-gray-400 w-24 shrink-0">{d.t}</span>
                                        <AnimBar pct={(d.v/57)*100} color={d.c} delay={i*80}/>
                                        <span className="text-xs font-mono font-bold w-8 text-right" style={{color:d.c}}>{d.v}</span>
                                        <span className="text-[10px] text-gray-600 w-12 text-right">{Math.round(d.v/150*100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Area table */}
                        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                                <Map size={14} className="text-cyan-400"/>
                                <h3 className="text-sm font-bold text-white">Area Risk Summary · Click a row for details</h3>
                            </div>
                            <table className="w-full text-sm" style={{tableLayout:'fixed',minWidth:680}}>
                                <colgroup><col style={{width:'20%'}}/><col style={{width:'13%'}}/><col style={{width:'13%'}}/><col style={{width:'14%'}}/><col style={{width:'12%'}}/><col style={{width:'28%'}}/></colgroup>
                                <thead><tr className="text-[10px] text-gray-500 uppercase bg-black/20 border-b border-white/5">
                                    <th className="px-4 py-3 text-left">Area</th>
                                    <th className="px-4 py-3 text-right">Accidents</th>
                                    <th className="px-4 py-3 text-right">Potholes</th>
                                    <th className="px-4 py-3 text-right">Accel m/s²</th>
                                    <th className="px-4 py-3 text-center">Severity</th>
                                    <th className="px-4 py-3 text-left">Risk Score</th>
                                </tr></thead>
                                <tbody>
                                    {[...AREAS].sort((a,b)=>b.risk-a.risk).map((row,i)=>(
                                        <tr key={row.area} onClick={()=>setSelRow(selRow===i?null:i)}
                                            className={`border-t border-white/5 cursor-pointer transition-all ${selRow===i?'bg-cyan-500/10 border-l-2 border-cyan-500':'hover:bg-white/5'}`}>
                                            <td className="px-4 py-3 font-medium text-gray-200">{row.area}</td>
                                            <td className="px-4 py-3 text-right font-mono text-gray-300">{row.incidents}</td>
                                            <td className="px-4 py-3 text-right font-mono text-yellow-400">{row.potholes}</td>
                                            <td className="px-4 py-3 text-right font-mono font-bold" style={{color:ac(row.accel)}}>{row.accel}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{backgroundColor:rc(row.sev)+'22',color:rc(row.sev)}}>{row.sev}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <AnimBar pct={row.risk} color={rc(row.sev)} delay={i*60}/>
                                                    <span className="text-[10px] text-gray-500 w-10 text-right font-mono">{row.risk}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* HOTSPOT DETECTION */}
                {tab==='hotspot'&&(
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                                <h3 className="text-sm font-bold text-cyan-400 mb-5 flex items-center gap-2"><Target size={14}/>Accident Hotspot Detection Pipeline</h3>
                                {[['Incident Report','User submits GPS + photo + type.','Input','cyan'],
                                  ['AI Severity Scoring','Gemini Vision + weather API scores severity.','AI','purple'],
                                  ['DBSCAN Clustering','Groups incidents within 50 km radius.','ML','yellow'],
                                  ['Risk Grid','0.05° grid cells scored by density.','Analysis','orange'],
                                  ['Heatmap Render','Color-coded Leaflet map, 30 s refresh.','Viz','green'],
                                ].map(([s,d,b,c],i)=>(
                                    <div key={i} className={`flex gap-3 mb-4 p-3 rounded-xl border border-${c}-500/10 hover:border-${c}-500/30 hover:bg-${c}-500/5 transition-all cursor-default`}>
                                        <div className={`w-7 h-7 rounded-full bg-${c}-500/20 text-${c}-400 flex items-center justify-center text-xs font-bold shrink-0`}>{i+1}</div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-xs font-bold text-white">{s}</span>
                                                <span className={`text-[9px] px-1.5 py-0.5 bg-${c}-500/10 text-${c}-400 rounded font-mono`}>{b}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500">{d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                                    <h3 className="text-sm font-bold text-white mb-4">Cluster Risk by Area</h3>
                                    {[...AREAS].sort((a,b)=>b.risk-a.risk).map((d,i)=>(
                                        <div key={d.area} className="flex items-center gap-3 mb-2.5 group">
                                            <span className="text-xs text-gray-400 w-28 shrink-0 group-hover:text-white transition-colors">{d.area}</span>
                                            <AnimBar pct={d.risk} color={rc(d.sev)} delay={i*50}/>
                                            <span className="text-xs font-mono w-10 text-right" style={{color:rc(d.sev)}}>{d.risk}%</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                                    <h3 className="text-sm font-bold text-white mb-3">Zone Thresholds</h3>
                                    {[['🟥 Danger','≥75%','#ef4444'],['🟧 Warning','≥50%','#f97316'],['🟨 Caution','≥25%','#f59e0b'],['🟩 Safe','<25%','#22c55e']].map(([z,r,c])=>(
                                        <div key={z} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                                            <span className="text-sm">{z}</span>
                                            <span className="text-xs font-mono font-bold" style={{color:c}}>{r}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* POTHOLE PIPELINE */}
                {tab==='pothole'&&(
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {PIPELINE.map((s,i)=>(
                                <div key={i} className={`bg-gray-800/60 backdrop-blur rounded-2xl border border-${s.color}-500/15 p-5 hover:border-${s.color}-500/40 hover:bg-${s.color}-500/5 hover:-translate-y-1 transition-all cursor-default`}>
                                    <div className="text-3xl mb-3">{s.icon}</div>
                                    <p className={`text-xs font-bold text-${s.color}-400 mb-2`}>{s.title}</p>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                            <h3 className="text-sm font-bold text-white mb-5">Acceleration Intensity by Area</h3>
                            <div className="space-y-4">
                                {[...AREAS].sort((a,b)=>b.accel-a.accel).map((d,i)=>(
                                    <div key={d.area} className="flex items-center gap-4 group">
                                        <span className="text-xs text-gray-400 w-28 shrink-0 group-hover:text-white transition-colors">{d.area}</span>
                                        <AnimBar pct={(d.accel/30)*100} color={ac(d.accel)} delay={i*60}/>
                                        <span className="text-xs font-mono font-bold w-16 text-right" style={{color:ac(d.accel)}}>{d.accel} m/s²</span>
                                        <span className="text-[9px] px-2 py-0.5 rounded font-bold w-16 text-center" style={{backgroundColor:ac(d.accel)+'22',color:ac(d.accel)}}>
                                            {d.accel>=22?'Deep':d.accel>=17?'Medium':'Shallow'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-4 text-[10px] text-gray-500">
                                <span><span className="text-red-400">■</span> Deep ≥22 m/s²</span>
                                <span><span className="text-yellow-400">■</span> Medium ≥17 m/s²</span>
                                <span><span className="text-blue-400">■</span> Shallow &lt;17 m/s²</span>
                                <span className="ml-auto">Detection threshold: 14 m/s² · Avg confidence: 92.4%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* TEMPORAL */}
                {tab==='temporal'&&(
                    <div className="space-y-6">
                        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                            <h3 className="text-sm font-bold text-white mb-1">Hourly Incident Distribution</h3>
                            <p className="text-[11px] text-gray-500 mb-4">Hover bars for details · Peak: 17–20h evening rush</p>
                            <HourlyChart/>
                        </div>
                        <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-white/5 p-6">
                            <h3 className="text-sm font-bold text-white mb-1">Weekly Incident Trend</h3>
                            <p className="text-[11px] text-gray-500 mb-4">Weekend spike on Sat/Sun · AB Road & MR-10 traffic</p>
                            <WeeklyChart/>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[{l:'Peak Hour',v:'6–7 PM',s:'18 incidents/hr',c:'red'},{l:'Quietest',v:'4 AM',s:'0 incidents',c:'green'},{l:'Worst Day',v:'Saturday',s:'42 incidents',c:'orange'},{l:'Weekly Trend',v:'+12%',s:'Escalating forecast',c:'yellow'}].map(c=>(
                                <div key={c.l} className={`bg-gray-800/60 backdrop-blur rounded-2xl border border-${c.c}-500/20 p-4 hover:border-${c.c}-500/40 transition-all`}>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{c.l}</p>
                                    <p className={`text-xl font-bold text-${c.c}-400 mt-1`}>{c.v}</p>
                                    <p className="text-[10px] text-gray-600 mt-0.5">{c.s}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;
