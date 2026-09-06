import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const CustomTooltip = ({ active, payload, label }) => { if (active && payload && payload.length) return (<div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg"><p className="text-xs font-medium text-navy-800 mb-1">{label}</p><p className="text-xs text-navy-600">Projects: <span className="font-medium">{payload[0]?.value.toLocaleString()}</span></p>{payload[1] && <p className="text-xs text-navy-600">Avg Risk: <span className="font-medium">{payload[1]?.value}</span></p>}</div>); return null; };
export default function SectorChart({ data }) {
  const chartData = [...data].sort((a, b) => b.projects - a.projects);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-navy-800 mb-4">Projects by Sector</h3>
      <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} /><XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} /><YAxis dataKey="sector" type="category" width={140} tick={{ fontSize: 11, fill: '#374151' }} /><Tooltip content={<CustomTooltip />} /><Bar dataKey="projects" fill="#3a5380" radius={[0, 4, 4, 0]} barSize={20} name="Projects" /></BarChart></ResponsiveContainer></div>
    </div>
  );
}
