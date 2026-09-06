import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
const CustomTooltip = ({ active, payload }) => { if (active && payload && payload.length) return (<div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg"><p className="text-sm font-medium text-navy-800">{payload[0].name}</p><p className="text-sm text-navy-600">{payload[0].value.toLocaleString()} projects</p></div>); return null; };
export default function RiskDistribution({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-navy-800 mb-4">Risk Distribution</h3>
      <div className="flex items-center gap-6">
        <div className="w-[180px] h-[180px] relative">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value" strokeWidth={0}>{data.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart></ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-bold text-navy-900">{total.toLocaleString()}</span><span className="text-[10px] text-navy-500">Projects</span></div>
        </div>
        <div className="flex-1 space-y-3">
          {data.map((item) => (<div key={item.name} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-sm text-navy-700">{item.name}</span></div><div className="text-right"><span className="text-sm font-semibold text-navy-800">{item.value.toLocaleString()}</span><span className="text-xs text-navy-400 ml-1.5">({Math.round((item.value / total) * 100)}%)</span></div></div>))}
        </div>
      </div>
    </div>
  );
}
