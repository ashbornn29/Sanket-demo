import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const CustomTooltip = ({ active, payload, label }) => { if (active && payload && payload.length) return (<div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg"><p className="text-xs font-medium text-navy-800 mb-1">{label}</p>{payload.map((p, idx) => (<div key={idx} className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} /><span className="text-navy-600">{p.name}:</span><span className="font-medium text-navy-800">{p.value.toLocaleString()}</span></div>))}</div>); return null; };
export default function RiskTrend({ data }) {
  const [mode, setMode] = useState('count');
  const chartData = mode === 'percentage' ? data.map((d) => { const total = d.critical + d.high + d.moderate + d.low; return { ...d, critical: Math.round((d.critical / total) * 100), high: Math.round((d.high / total) * 100), moderate: Math.round((d.moderate / total) * 100), low: Math.round((d.low / total) * 100) }; }) : data;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-navy-800">Risk Trend (12 months)</h3>
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="text-xs bg-navy-50 border border-navy-200 rounded-md px-2 py-1 text-navy-700 focus:outline-none"><option value="count">Number of Projects</option><option value="percentage">Risk Percentage</option></select>
      </div>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} /><YAxis tick={{ fontSize: 11, fill: '#6b7280' }} /><Tooltip content={<CustomTooltip />} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} name="Critical" /><Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} dot={false} name="High" /><Line type="monotone" dataKey="moderate" stroke="#eab308" strokeWidth={2} dot={false} name="Moderate" /><Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} dot={false} name="Low" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
