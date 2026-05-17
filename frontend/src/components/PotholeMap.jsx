import React from 'react';
import { MapContainer, TileLayer, Circle, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const PotholeMap = ({ hotspots }) => {
    // Default center to first hotspot or Mumbai
    const center = hotspots.length > 0 ? [hotspots[0].lat, hotspots[0].lng] : [22.7196, 75.8577]; // Indore

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Deep': return '#ef4444'; // Red
            case 'Medium': return '#f59e0b'; // Yellow
            case 'Shallow': return '#3b82f6'; // Blue
            default: return '#6b7280'; // Gray
        }
    };

    return (
        <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-700 shadow-2xl relative z-0">
            <MapContainer 
                center={center} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {hotspots.map((h, i) => (
                    <Circle
                        key={i}
                        center={[h.lat, h.lng]}
                        pathOptions={{ 
                            fillColor: getSeverityColor(h.severity), 
                            color: getSeverityColor(h.severity),
                            fillOpacity: 0.6,
                            weight: 2
                        }}
                        radius={25}
                    >
                        <Tooltip>
                            <div className="p-1">
                                <p className="font-bold text-gray-900">Hazard: {h.severity}</p>
                                <p className="text-xs text-gray-700">Confidence: {(h.confidence_score * 100).toFixed(0)}%</p>
                                <p className="text-xs text-gray-700">Reports: {h.report_count}</p>
                            </div>
                        </Tooltip>
                    </Circle>
                ))}
            </MapContainer>
        </div>
    );
};

export default PotholeMap;
