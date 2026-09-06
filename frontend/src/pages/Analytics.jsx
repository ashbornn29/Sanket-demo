import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PageContainer from '../components/layout/PageContainer';
import Loading from '../components/common/Loading';
import { getAnalytics } from '../services/api';
import { getRiskColor, getRiskLevel } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }) => { if (active && payload && payload.length) return (<div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg"><p className="text-xs font-medium text-navy-800 mb-1">{label}</p>{payload.map((p, i) => (<p key={i} className="text-xs text-navy-600">{p.name}: <span className="font-medium">{p.value.toLocaleString()}</span></p>))}</div>); return null; };

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('sector');

  useEffect(() => { loadAnalytics(); }, []);
  async function loadAnalytics() { setLoading(true); const d = await getAnalytics(); setData(d); setLoading(false); }

  if (loading) return <Loading />;
  const tabs = [{ id: 'sector', label: 'Sector Analysis' }, { id: 'ministry', label: 'Ministry Comparison' }, { id: 'overruns', label: 'Overrun Distribution' }, { id: 'geography', label: 'Geographic Analysis' }];

  return (
    <PageContainer title="Analytics & Benchmarks" subtitle="Cross-sectional analysis of infrastructure project performance metrics.">
      <div className="flex border-b border-gray-200 mb-5">{tabs.map((t) => (<button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'text-navy-800 border-navy-700' : 'text-navy-500 border-transparent hover:text-navy-700'}`}>{t.label}</button>))}</div>

      {tab === 'sector' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5"><h3 className="text-sm font-semibold text-navy-800 mb-4">Projects by Sector</h3><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.sectorData} layout="vertical" margin={{ left: 0, right: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="sector" type="category" width={150} tick={{ fontSize: 11 }} /><Tooltip content={<CustomTooltip />} /><Bar dataKey="projects" fill="#3a5380" radius={[0, 4, 4, 0]} barSize={18} name="Projects" /></BarChart></ResponsiveContainer></div></div>
          <div className="bg-white border border-gray-200 rounded-xl p-5"><h3 className="text-sm font-semibold text-navy-800 mb-4">Average Risk by Sector</h3><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.sectorData} layout="vertical" margin={{ left: 0, right: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} /><XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} /><YAxis dataKey="sector" type="category" width={150} tick={{ fontSize: 11 }} /><Tooltip content={<CustomTooltip />} /><Bar dataKey="avgRisk" radius={[0, 4, 4, 0]} barSize={18} name="Avg Risk">{data.sectorData.map((s, i) => <Cell key={i} fill={getRiskColor(getRiskLevel(s.avgRisk))} />)}</Bar></BarChart></ResponsiveContainer></div></div>
        </div>
      )}

      {tab === 'ministry' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-navy-50 border-b border-gray-200"><th className="text-left py-3 px-4 text-xs font-medium text-navy-600">Ministry</th><th className="text-right py-3 px-4 text-xs font-medium text-navy-600">Projects</th><th className="text-right py-3 px-4 text-xs font-medium text-navy-600">Avg Risk</th><th className="text-right py-3 px-4 text-xs font-medium text-navy-600">Exposure (₹ Cr)</th><th className="text-left py-3 px-4 text-xs font-medium text-navy-600">Risk Level</th></tr></thead>
            <tbody>{data.ministryAnalytics.map((m) => (<tr key={m.ministry} className="border-b border-gray-50 hover:bg-navy-50/50"><td className="py-3 px-4 text-sm text-navy-800 font-medium">{m.ministry}</td><td className="py-3 px-4 text-right font-data text-sm text-navy-700">{m.projects.toLocaleString()}</td><td className="py-3 px-4 text-right font-data text-sm text-navy-700">{m.avgRisk}</td><td className="py-3 px-4 text-right font-data text-sm text-navy-700">₹{m.exposure.toLocaleString()}</td><td className="py-3 px-4"><div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden max-w-[120px]"><div className="h-full rounded-full" style={{ width: `${m.avgRisk}%`, backgroundColor: getRiskColor(getRiskLevel(m.avgRisk)) }} /></div></td></tr>))}</tbody></table></div>
        </div>
      )}

      {tab === 'overruns' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5"><h3 className="text-sm font-semibold text-navy-800 mb-4">Cost Overrun Distribution</h3><div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.costOverrunDistribution} margin={{ left: -10, right: 10 }}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="range" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip content={<CustomTooltip />} /><Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} barSize={32} name="Projects" /></BarChart></ResponsiveContainer></div></div>
          <div className="bg-white border border-gray-200 rounded-xl p-5"><h3 className="text-sm font-semibold text-navy-800 mb-4">Time Overrun Distribution</h3><div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.timeOverrunDistribution} margin={{ left: -10, right: 10 }}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="range" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip content={<CustomTooltip />} /><Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} name="Projects" /></BarChart></ResponsiveContainer></div></div>
        </div>
      )}

      {tab === 'geography' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-navy-50 border-b border-gray-200"><th className="text-left py-3 px-4 text-xs font-medium text-navy-600">State</th><th className="text-right py-3 px-4 text-xs font-medium text-navy-600">Projects</th><th className="text-right py-3 px-4 text-xs font-medium text-navy-600">Critical</th><th className="text-right py-3 px-4 text-xs font-medium text-navy-600">Avg Risk</th><th className="text-right py-3 px-4 text-xs font-medium text-navy-600">Exposure (₹ Cr)</th></tr></thead>
            <tbody>{data.stateData.sort((a, b) => b.projects - a.projects).map((s) => (<tr key={s.state} className="border-b border-gray-50 hover:bg-navy-50/50"><td className="py-3 px-4 text-sm text-navy-800 font-medium">{s.state}</td><td className="py-3 px-4 text-right font-data text-sm text-navy-700">{s.projects}</td><td className="py-3 px-4 text-right font-data text-sm text-red-600">{s.critical}</td><td className="py-3 px-4 text-right font-data text-sm text-navy-700">{s.avgRisk}</td><td className="py-3 px-4 text-right font-data text-sm text-navy-700">₹{s.exposure.toLocaleString()}</td></tr>))}</tbody></table></div>
        </div>
      )}
    </PageContainer>
  );
}
