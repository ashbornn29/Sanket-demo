import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { getRiskColor, getRiskLevel } from '../../data/mockData';
export default function IndiaRiskMap({ data }) {
  const center = [22.5, 80.0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-navy-800 mb-4">Project Risk Map — India</h3>
      <div className="h-[400px] rounded-lg overflow-hidden border border-gray-100">
        <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} zoomControl={true}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {data.map((state) => { const level = getRiskLevel(state.avgRisk); const color = getRiskColor(level); const radius = Math.max(8, Math.min(22, state.projects / 10)); return (
            <CircleMarker key={state.state} center={[state.lat, state.lng]} radius={radius} fillColor={color} fillOpacity={0.6} color={color} weight={2} opacity={0.8}>
              <Popup><div className="font-sans text-navy-800 min-w-[180px]"><h4 className="font-bold text-sm mb-2">{state.state}</h4><div className="space-y-1 text-xs"><div className="flex justify-between"><span className="text-navy-500">Total Projects</span><span className="font-semibold">{state.projects}</span></div><div className="flex justify-between"><span className="text-navy-500">Critical</span><span className="font-semibold text-red-600">{state.critical}</span></div><div className="flex justify-between"><span className="text-navy-500">Avg Risk Score</span><span className="font-semibold">{state.avgRisk}</span></div><div className="flex justify-between"><span className="text-navy-500">Exposure</span><span className="font-semibold">₹{(state.exposure / 100).toFixed(0)} Cr</span></div></div></div></Popup>
            </CircleMarker>); })}
        </MapContainer>
      </div>
      <p className="text-[10px] text-navy-400 mt-2">Circle size proportional to project count. Color indicates average risk level. Click markers for details.</p>
    </div>
  );
}
