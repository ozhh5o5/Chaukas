import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# Chart 1: India Road Accident Fatalities (MoRTH data)
years = [2018, 2019, 2020, 2021, 2022, 2023]
deaths = [151417, 151113, 131714, 153972, 168491, 178126]
fig, ax = plt.subplots(figsize=(6, 3.5))
bars = ax.bar(years, [d/1000 for d in deaths], color=['#3b82f6','#3b82f6','#22c55e','#f59e0b','#ef4444','#dc2626'], width=0.6, edgecolor='white')
for b, d in zip(bars, deaths):
    ax.text(b.get_x()+b.get_width()/2, b.get_height()+1, f'{d//1000}K', ha='center', va='bottom', fontsize=9, fontweight='bold')
ax.set_xlabel('Year', fontsize=10)
ax.set_ylabel('Deaths (Thousands)', fontsize=10)
ax.set_title('Road Accident Fatalities in India (MoRTH)', fontsize=12, fontweight='bold')
ax.set_ylim(0, 200)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
plt.tight_layout()
plt.savefig(os.path.join(OUT, 'chart_fatalities.png'), dpi=150)
plt.close()

# Chart 2: Cause of Death Distribution
labels = ['Over-speeding', 'Drunk Driving', 'Wrong Side', 'Lane Violation', 'Distracted', 'Other']
sizes = [62, 8, 7, 6, 5, 12]
colors = ['#ef4444','#f59e0b','#8b5cf6','#3b82f6','#10b981','#6b7280']
fig, ax = plt.subplots(figsize=(5, 3.5))
wedges, texts, autotexts = ax.pie(sizes, labels=labels, autopct='%1.0f%%', colors=colors, startangle=140, textprops={'fontsize':8})
for t in autotexts:
    t.set_fontsize(8)
    t.set_fontweight('bold')
ax.set_title('Primary Causes of Road Accidents (NCRB 2023)', fontsize=11, fontweight='bold')
plt.tight_layout()
plt.savefig(os.path.join(OUT, 'chart_causes.png'), dpi=150)
plt.close()

# Chart 3: System Architecture Module Map
fig, ax = plt.subplots(figsize=(7, 3.5))
modules = ['Crisis\nDispatch', 'Severity\nAI', 'Escalation\nEngine', 'ML\nHotspot', 'News\nIntel', 'Photo\nAI', 'Voice\nNav', 'Weather\nRisk', 'Admin\nDash']
vals = [95, 92, 90, 88, 85, 87, 82, 89, 93]
colors2 = ['#ef4444','#8b5cf6','#f59e0b','#10b981','#3b82f6','#ec4899','#6366f1','#14b8a6','#f97316']
bars = ax.barh(modules, vals, color=colors2, height=0.6, edgecolor='white')
for b, v in zip(bars, vals):
    ax.text(v+0.5, b.get_y()+b.get_height()/2, f'{v}%', va='center', fontsize=8, fontweight='bold')
ax.set_xlim(0, 105)
ax.set_xlabel('Module Readiness (%)', fontsize=10)
ax.set_title('Chaukas Platform - Module Readiness', fontsize=12, fontweight='bold')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
plt.tight_layout()
plt.savefig(os.path.join(OUT, 'chart_modules.png'), dpi=150)
plt.close()

print("Charts generated successfully.")
