import matplotlib
matplotlib.use('Agg')

import os
import sys
import time
from pathlib import Path
from typing import Optional, Tuple

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import requests

D = Path(__file__).resolve().parent


def _save(fig, name: str, dpi: int = 180) -> None:
    fig.savefig(str(D / name), dpi=dpi)
    plt.close(fig)


def _world_bank_latest(country: str, indicator: str, timeout_s: int = 20) -> Tuple[Optional[float], Optional[int]]:
    """Return (value, year) for the latest non-null datapoint."""
    url = f"https://api.worldbank.org/v2/country/{country}/indicator/{indicator}?format=json"
    try:
        r = requests.get(url, timeout=timeout_s)
        r.raise_for_status()
        payload = r.json()
        if not isinstance(payload, list) or len(payload) < 2 or not payload[1]:
            return None, None
        for row in payload[1]:
            v = row.get("value")
            if v is not None:
                y = row.get("date")
                return float(v), int(y) if y is not None else None
    except Exception:
        return None, None
    return None, None

# 1. Fatalities Trend (MoRTH) — from local CSV for reproducibility
fatalities_csv = D / "data" / "morth_fatalities_2018_2023.csv"
df_f = pd.read_csv(fatalities_csv)
yrs = df_f["year"].astype(int).tolist()
deaths = df_f["deaths"].astype(int).tolist()

fig, ax = plt.subplots(figsize=(6.5, 3.2))
ax.plot(yrs, [d / 1000 for d in deaths], "o-", color="#dc2626", linewidth=2.5, markersize=8)
for y, d in zip(yrs, deaths):
    ax.annotate(
        f"{d//1000}K",
        (y, d / 1000),
        textcoords="offset points",
        xytext=(0, 10),
        ha="center",
        fontsize=8,
        fontweight="bold",
    )
ax.fill_between(yrs, [d / 1000 for d in deaths], alpha=0.15, color="#dc2626")
ax.set_title("Road Accident Fatalities in India (2018–2023)", fontsize=11, fontweight="bold")
ax.set_ylabel("Deaths (Thousands)")
ax.set_xlabel(
    "Year\nSource: MoRTH — Road Accidents in India (Annual publication)",
    fontsize=7,
)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.set_ylim(100, 200)
plt.tight_layout()
_save(fig, "c1_fatalities.png")

# 2. Effort vs Impact Matrix
fig, ax = plt.subplots(figsize=(5.5, 4.5))
items = [
    (0.3, 0.85, 'Edge-AI\nPothole Detection', '#10b981', 14),
    (0.25, 0.7, 'GPS Hotspot\nMapping', '#3b82f6', 13),
    (0.4, 0.6, 'Real-time\nSeverity Alerts', '#8b5cf6', 12),
    (0.7, 0.9, 'Autonomous\nVehicle Integration', '#6b7280', 10),
    (0.8, 0.5, 'Full Highway\nSensor Network', '#6b7280', 10),
    (0.35, 0.45, 'Community\nReporting App', '#f59e0b', 11),
    (0.2, 0.55, 'Offline-First\nPWA Platform', '#10b981', 13),
]
for x,y,label,c,s in items:
    ax.scatter(x, y, s=200, c=c, zorder=5, edgecolors='white', linewidth=1.5)
    ax.annotate(label, (x,y), textcoords="offset points", xytext=(12,5), fontsize=s-5, ha='left')
ax.axhline(0.5, color='gray', ls='--', alpha=0.4); ax.axvline(0.5, color='gray', ls='--', alpha=0.4)
ax.text(0.25, 0.95, 'HIGH IMPACT\nLOW EFFORT', ha='center', fontsize=9, fontweight='bold', color='#10b981', alpha=0.7)
ax.text(0.75, 0.95, 'HIGH IMPACT\nHIGH EFFORT', ha='center', fontsize=9, fontweight='bold', color='#f59e0b', alpha=0.7)
ax.text(0.25, 0.05, 'LOW IMPACT\nLOW EFFORT', ha='center', fontsize=9, color='#6b7280', alpha=0.7)
ax.text(0.75, 0.05, 'LOW IMPACT\nHIGH EFFORT', ha='center', fontsize=9, color='#dc2626', alpha=0.7)
ax.set_xlabel('Implementation Effort -->'); ax.set_ylabel('Safety Impact -->')
ax.set_title('Effort vs. Impact Analysis Matrix', fontsize=11, fontweight='bold')
ax.set_xlim(0,1); ax.set_ylim(0,1); ax.spines['top'].set_visible(False); ax.spines['right'].set_visible(False)
plt.tight_layout(); plt.savefig(os.path.join(D,'c2_effort_impact.png'),dpi=180); plt.close()

# 3. Target Audience Breakdown (MVP prioritization weights — internal)
fig, ax = plt.subplots(figsize=(5.5, 3.5))
cats = ['Daily\nCommuters', 'Traffic\nPolice', 'Municipal\nCorps', 'Highway\nAuthority', 'Emergency\nServices', 'Insurance\nFirms']
users = [65, 15, 8, 5, 5, 2]
colors = ['#3b82f6','#ef4444','#f59e0b','#8b5cf6','#10b981','#6b7280']
bars = ax.bar(cats, users, color=colors, width=0.55, edgecolor='white')
for b,v in zip(bars,users): ax.text(b.get_x()+b.get_width()/2, b.get_height()+1, f'{v}%', ha='center', fontsize=9, fontweight='bold')
ax.set_ylabel('MVP Priority Weight (%)'); ax.set_title('Target Audience Prioritization (MVP)', fontsize=11, fontweight='bold')
ax.set_xlabel('Source: Team Outliers (hackathon MVP prioritization weights)', fontsize=7)
ax.spines['top'].set_visible(False); ax.spines['right'].set_visible(False)
plt.tight_layout(); _save(fig,'c3_audience.png')

# 4. Tech Stack Radar (engineering rubric — internal)
fig, ax = plt.subplots(figsize=(5, 4.5), subplot_kw=dict(polar=True))
categories = ['Frontend\n(React)', 'Backend\n(FastAPI)', 'AI/ML\nEngine', 'Mapping\n(Leaflet)', 'Offline\nCapability', 'Security']
values = [92, 90, 88, 95, 98, 85]
N = len(categories)
angles = [n/float(N)*2*np.pi for n in range(N)]
values += values[:1]; angles += angles[:1]
ax.plot(angles, values, 'o-', linewidth=2, color='#3b82f6')
ax.fill(angles, values, alpha=0.2, color='#3b82f6')
ax.set_xticks(angles[:-1]); ax.set_xticklabels(categories, fontsize=8)
ax.set_ylim(0,100); ax.set_title('Technology Capability Radar (Engineering Rubric)', fontsize=11, fontweight='bold', pad=20)
plt.tight_layout(); _save(fig,'c4_techradar.png')

# 5. International comparison (World Bank) — Road traffic death rate
# NOTE: We keep the output filename `c5_causes.png` so the document generator doesn't need renaming.
indicator = "SH.STA.TRAF.P5"  # Road traffic death rate (per 100,000 population)
countries = [
    ("IND", "India"),
    ("CHN", "China"),
    ("BRA", "Brazil"),
    ("ZAF", "South Africa"),
    ("USA", "United States"),
    ("DEU", "Germany"),
]
rows = []
year_note = None
for code, label in countries:
    v, y = _world_bank_latest(code, indicator)
    rows.append((label, v, y))
    if y is not None:
        year_note = max(year_note or y, y)

labels = [r[0] for r in rows]
values = [r[1] for r in rows]
years = [r[2] for r in rows]

fig, ax = plt.subplots(figsize=(6.2, 3.4))
bar_vals = [v if v is not None else 0 for v in values]
bars = ax.bar(labels, bar_vals, color="#3b82f6", edgecolor="white", width=0.6)
for b, v, y in zip(bars, values, years):
    if v is None:
        ax.text(b.get_x() + b.get_width() / 2, 0.5, "N/A", ha="center", va="bottom", fontsize=8, fontweight="bold")
    else:
        ax.text(
            b.get_x() + b.get_width() / 2,
            b.get_height() + 0.4,
            f"{v:.1f}",
            ha="center",
            va="bottom",
            fontsize=8,
            fontweight="bold",
        )

ax.set_ylabel("Deaths per 100,000 population")
ax.set_title("Road Traffic Death Rate — Selected Countries", fontsize=11, fontweight="bold")
ax.set_xlabel(
    "Source: World Bank API (indicator SH.STA.TRAF.P5), latest available year per country",
    fontsize=7,
)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.tick_params(axis="x", labelrotation=20)
plt.tight_layout()
_save(fig, "c5_causes.png")

# 6. Module Implementation Completeness (repo-derived)
expected_files = {
    "Crisis Dispatch": ["backend/Feature1/crisis_dispatch.py", "backend/Feature1/push_service.py"],
    "Severity AI": ["backend/Feature3/severity_engine.py", "backend/Feature3/live_severity_router.py"],
    "Escalation Engine": ["backend/Feature4/escalation_router.py", "backend/Feature4/enhanced_escalation_router.py"],
    "ML Hotspot": ["backend/Feature6_ML_Hotspot/hotspot_router.py", "backend/Feature6_ML_Hotspot/ml_hotspot_engine.py"],
    "News Intel": ["backend/Feature2_news/news_router.py", "backend/Feature2_news/schema.sql"],
    "Photo AI": ["backend/Feature_PhotoAI/router.py", "backend/Feature_PhotoAI/__init__.py"],
    "Voice Nav": ["backend/Feature5_voice_nav/voice_router.py"],
    "Weather Risk": ["backend/Feature_Weather/router.py", "backend/Feature_Weather/__init__.py"],
    "Admin Dashboard": ["backend/admin_router.py", "backend/Feature_Admin/admin_router.py"],
}

modules = []
vals = []
for module, paths in expected_files.items():
    total = len(paths)
    present = sum(1 for p in paths if (D / p).exists())
    modules.append(module)
    vals.append(round((present / total) * 100))

fig, ax = plt.subplots(figsize=(6.6, 3.6))
bars = ax.barh(modules, vals, color="#10b981", height=0.6, edgecolor="white")
for b, v in zip(bars, vals):
    ax.text(v + 1, b.get_y() + b.get_height() / 2, f"{v}%", va="center", fontsize=8, fontweight="bold")
ax.set_xlim(0, 110)
ax.set_xlabel("Completeness (file checklist)")
ax.set_title("Chaukas — Module Implementation Completeness", fontsize=11, fontweight="bold")
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.invert_yaxis()
plt.tight_layout()
_save(fig, "c6_modules.png")

# 7. Real-time performance benchmark (repo-derived, measured on this machine)
# NOTE: Output filename stays `c7_response.png` to keep the doc generator stable.
sys.path.insert(0, str(D))
sys.path.insert(0, str(D / "backend"))

try:
    from backend.Feature3.severity_engine import severity_engine
    from backend.Feature6_ML_Hotspot.ml_hotspot_engine import detect_hotspot, generate_heatmap_data

    incident = {
        "incident_type": "fire",
        "description": "smoke near highway; visibility low",
        "location_zone": "urban",
        "time_of_day": "evening",
        "rainfall_level": "medium",
        "zone_history": "medium_risk",
    }
    points = [
        {"lat": 19.0 + (i % 10) * 0.02, "lng": 72.8 + (i // 10) * 0.02, "severity": "medium"}
        for i in range(60)
    ]

    def bench_ms(fn, args=(), repeats=50) -> float:
        start = time.perf_counter()
        for _ in range(repeats):
            fn(*args)
        return ((time.perf_counter() - start) / repeats) * 1000

    ms_sev = bench_ms(severity_engine, (incident,), repeats=2000)
    ms_hotspot = bench_ms(detect_hotspot, (points, 20), repeats=30)
    ms_heat = bench_ms(generate_heatmap_data, (points, 0.2), repeats=5)

    bench_labels = ["Severity engine\n(per incident)", "Hotspot detection\n(60 points)", "Heatmap grid\n(60 points)"]
    bench_vals = [ms_sev, ms_hotspot, ms_heat]
    source_note = "Source: Benchmarked from this repo (Feature3 + Feature6_ML_Hotspot)"
except Exception:
    bench_labels = ["Severity engine", "Hotspot detection", "Heatmap grid"]
    bench_vals = [0, 0, 0]
    source_note = "Source: Benchmark failed (missing deps/import error)"

fig, ax = plt.subplots(figsize=(6.2, 3.2))
bars = ax.bar(bench_labels, bench_vals, color=["#3b82f6", "#8b5cf6", "#10b981"], width=0.55, edgecolor="white")
for b, v in zip(bars, bench_vals):
    ax.text(b.get_x() + b.get_width() / 2, b.get_height() + (max(bench_vals) * 0.05 + 0.2), f"{v:.1f} ms", ha="center", fontsize=9, fontweight="bold")
ax.set_ylabel("Average compute time (ms)")
ax.set_title("Chaukas ML Pipeline — Performance Benchmark", fontsize=11, fontweight="bold")
ax.set_xlabel(source_note, fontsize=7)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
plt.tight_layout()
_save(fig, "c7_response.png")

# 8. Scalability Projection
fig, ax = plt.subplots(figsize=(6, 3.2))
years2 = ['Y1\n(Pilot)','Y2\n(State)','Y3\n(National)','Y4\n(Infra)','Y5\n(Full)']
users2 = [5000, 50000, 500000, 2000000, 10000000]
ax.plot(range(5), [u/1000 for u in users2], 'o-', color='#8b5cf6', linewidth=2.5, markersize=8)
for i,(y,u) in enumerate(zip(years2,users2)):
    label = f'{u//1000}K' if u<1000000 else f'{u//1000000}M'
    ax.annotate(label, (i, u/1000), textcoords="offset points", xytext=(0,12), ha='center', fontsize=9, fontweight='bold')
ax.fill_between(range(5), [u/1000 for u in users2], alpha=0.15, color='#8b5cf6')
ax.set_xticks(range(5)); ax.set_xticklabels(years2)
ax.set_ylabel('Users (Thousands)'); ax.set_title('Projected User Growth (5-Year Roadmap)', fontsize=11, fontweight='bold')
ax.set_xlabel('Source: Team Outliers (roadmap targets; not observed user data)', fontsize=7)
ax.set_yscale('log'); ax.spines['top'].set_visible(False); ax.spines['right'].set_visible(False)
plt.tight_layout(); _save(fig,'c8_scalability.png')

print("All 8 charts generated.")
