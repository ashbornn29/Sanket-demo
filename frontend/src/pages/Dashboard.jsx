import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  getDashboardSummary,
  getMonitoredProjects,
  getMonitoredProjectObservations,
  getMonitoredProjectWarnings,
  getAuthorityEscalations,
  formatINR,
  formatPercent
} from '../services/api';

// ── Color system: single amber-red hue ramp ──
const C = {
  base: '#0f1117', surface: '#161922', surfaceAlt: '#1c1f2e',
  border: '#262a3a', borderLight: '#2f3447',
  text: '#c8ccd8', dim: '#6b7194', bright: '#eef0f6',
  amber: '#d97706', orange: '#ea580c', red: '#b91c1c',
  muted: '#4b5563',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sumData, monData, escData] = await Promise.all([
          getDashboardSummary().catch(() => null),
          getMonitoredProjects().catch(() => ({ projects: [] })),
          getAuthorityEscalations().catch(() => ({ escalations: [] })),
        ]);
        setSummary(sumData);
        setEscalations(escData?.escalations || []);
        const rawProjects = monData?.projects || [];
        const allWarnings = [];
        const enriched = await Promise.all(
          rawProjects.map(async (p) => {
            try {
              const [obsRes, warnRes] = await Promise.all([
                getMonitoredProjectObservations(p.project_id).catch(() => ({ observations: [] })),
                getMonitoredProjectWarnings(p.project_id).catch(() => ({ warnings: [] })),
              ]);
              const obsList = obsRes?.observations || [];
              const latestObs = obsList.length > 0 ? obsList[obsList.length - 1] : null;
              if (warnRes?.warnings) {
                warnRes.warnings.forEach((w) => { allWarnings.push({ ...w, project_name: p.project_name }); });
              }
              let trajectory = 'Stable';
              if (obsList.length >= 2) {
                const prev = obsList[obsList.length - 2];
                if (latestObs.pred_prob > prev.pred_prob + 0.02) trajectory = '↓ Deteriorating';
                else if (latestObs.pred_prob < prev.pred_prob - 0.02) trajectory = '↑ Improving';
              } else if (p.current_status === 'RECOVERED') {
                trajectory = '↑ Improving';
              } else if (p.current_status === 'WARNING_ISSUED' || p.current_status === 'ESCALATED') {
                trajectory = '↓ Deteriorating';
              }
              return {
                project_id: p.project_id, project_name: p.project_name, sector: p.sector,
                latest_report: latestObs?.reporting_month || p.initial_reporting_month,
                risk: latestObs?.pred_prob ?? null, risk_tier: latestObs?.risk_tier ?? 'NORMAL',
                trajectory,
                governance: p.current_status === 'WARNING_ISSUED' ? 'Contractor Warning'
                  : p.current_status === 'UNDER_RECOVERY' || p.current_status === 'CONTRACTOR_RESPONDED' ? 'Under Recovery'
                  : p.current_status === 'RECOVERED' ? 'Recovered'
                  : p.current_status === 'ESCALATED' ? 'Authority Escalated'
                  : 'Active Monitoring',
                last_action: latestObs?.reporting_month || p.initial_reporting_month,
              };
            } catch {
              return {
                project_id: p.project_id, project_name: p.project_name, sector: p.sector,
                latest_report: p.initial_reporting_month, risk: null, risk_tier: 'NORMAL',
                trajectory: 'Stable', governance: 'Active Monitoring', last_action: p.initial_reporting_month,
              };
            }
          })
        );
        setProjectsList(enriched);
        setWarnings(allWarnings);
      } catch (err) { console.error('Failed to load overview:', err); }
      finally { setLoading(false); }
    }
    loadData();
  }, []);

  const total = summary?.active_project_count || summary?.total_projects || projectsList.length;
  // Non-normal projects (Watch + Review + High Risk): 435 + 175 + 1407 = 2017
  const atRisk = summary?.watch_count != null
    ? ((summary.watch_count || 0) + (summary.review_count || 0) + (summary.escalate_count || 0))
    : projectsList.filter(p => p.risk !== null && p.risk >= 0.40).length;
  const highRisk = summary?.escalate_count != null
    ? summary.escalate_count
    : projectsList.filter(p => p.risk !== null && p.risk >= 0.50).length;
  const warnCount = warnings.filter(w => w.status === 'ISSUED').length;
  const escCount = escalations.length;

  // ── Chart data: Model Risk Tiers ──
  const trajData = summary?.watch_count != null ? [
    { name: 'Normal (<40%)', count: summary.normal_count || 0 },
    { name: 'Watch (40-45%)', count: summary.watch_count || 0 },
    { name: 'Review (45-50%)', count: summary.review_count || 0 },
    { name: 'High Risk (≥50%)', count: summary.escalate_count || 0 },
  ] : [
    { name: 'Normal', count: projectsList.filter(p => p.risk !== null && p.risk < 0.40).length || 0 },
    { name: 'Watch', count: projectsList.filter(p => p.risk !== null && p.risk >= 0.40 && p.risk < 0.45).length || 0 },
    { name: 'Review', count: projectsList.filter(p => p.risk !== null && p.risk >= 0.45 && p.risk < 0.50).length || 0 },
    { name: 'High Risk', count: projectsList.filter(p => p.risk !== null && p.risk >= 0.50).length || 0 },
  ];
  const trajColors = summary?.watch_count != null
    ? [C.muted, C.amber, C.orange, C.red]
    : [C.muted, '#555e72', C.orange, '#2a2e3e'];

  const riskDist = summary?.watch_count != null ? [
    { name: 'Normal (<40%)', value: summary.normal_count || 0, color: C.muted },
    { name: 'Watch (40-45%)', value: summary.watch_count || 0, color: C.amber },
    { name: 'Review (45-50%)', value: summary.review_count || 0, color: C.orange },
    { name: 'High Risk (≥50%)', value: summary.escalate_count || 0, color: C.red },
  ] : [
    { name: 'Normal', value: projectsList.filter(p => p.risk !== null && p.risk < 0.40).length, color: C.muted },
    { name: 'Watch', value: projectsList.filter(p => p.risk !== null && p.risk >= 0.40 && p.risk < 0.45).length, color: C.amber },
    { name: 'Review', value: projectsList.filter(p => p.risk !== null && p.risk >= 0.45 && p.risk < 0.50).length, color: C.orange },
    { name: 'High Risk', value: projectsList.filter(p => p.risk !== null && p.risk >= 0.50).length, color: C.red },
  ];

  // ── Helpers ──
  const Kpi = ({ label, value, accent, sub }) => (
    <div className="min-w-0">
      <div className="text-[11px] text-[#6b7194] mb-1">{label}</div>
      <div className={`text-2xl font-mono font-semibold tracking-tight ${accent || 'text-[#eef0f6]'}`}>{value}</div>
      {sub && <div className="text-[10px] text-[#4a5070] mt-1 font-mono">{sub}</div>}
    </div>
  );

  const riskColor = (r) => r >= 0.50 ? C.red : r >= 0.45 ? C.orange : r >= 0.40 ? C.amber : C.dim;
  const govColor = (g) => g.includes('Escalat') ? C.red : g.includes('Warning') ? C.orange : g.includes('Recovery') ? C.amber : C.dim;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-[#6b7194] text-sm">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          Synchronizing with engine...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-12 min-w-0 overflow-x-hidden">

      {/* ── KPI Strip ── */}
      <div className="flex items-start gap-8 mb-8 flex-wrap">
        <Kpi label="Active projects" value={total.toLocaleString()} sub={`${summary?.archive_entity_count?.toLocaleString() || '—'} archived`} />
        <div className="w-px h-10 bg-[#262a3a] self-center" />
        <Kpi label="Projects at risk" value={atRisk.toLocaleString()} accent="text-amber-500" sub={total > 0 ? `${((atRisk/total)*100).toFixed(1)}% of portfolio` : ''} />
        <div className="w-px h-10 bg-[#262a3a] self-center" />
        <Kpi label="High risk" value={highRisk.toLocaleString()} accent="text-red-500" sub="Model risk ≥ 50%" />
        <div className="w-px h-10 bg-[#262a3a] self-center" />
        <Kpi label="Open warnings" value={warnCount} accent={warnCount > 0 ? 'text-orange-500' : ''} sub="Contractor notices" />
        <div className="w-px h-10 bg-[#262a3a] self-center" />
        <Kpi label="Authority escalations" value={escCount} accent={escCount > 0 ? 'text-red-400' : ''} sub="Governance actions" />
        {summary?.active_baseline_exposure && (
          <>
            <div className="w-px h-10 bg-[#262a3a] self-center" />
            <Kpi label="Capital exposure" value={formatINR(summary.active_baseline_exposure)} sub="Baseline outlay" />
          </>
        )}
      </div>

      {/* ── Hero: Trajectory Momentum ── */}
      <div className="bg-[#161922] border border-[#262a3a] rounded p-6 mb-6">
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 className="text-[15px] font-semibold text-[#eef0f6]">Portfolio model risk distribution</h2>
            <p className="text-[11px] text-[#6b7194] mt-1">Calibrated project deterioration probabilities across active infrastructure</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#6b7194]">High risk rate (≥50%)</span>
            <div className="text-lg font-mono text-red-400 mt-0.5">
              {total > 0 ? ((highRisk / total) * 100).toFixed(1) : '0.0'}%
            </div>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trajData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barSize={52}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262a3a" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7194' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4a5070' }} />
              <Tooltip cursor={{ fill: '#1c1f2e' }} wrapperStyle={{ zIndex: 50 }} position={{ y: -40 }} />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {trajData.map((_, i) => <Cell key={i} fill={trajColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Risk Distribution (Sourced exclusively from verified backend summary) ── */}
      <div className="bg-[#161922] border border-[#262a3a] rounded p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-[14px] font-semibold text-[#eef0f6]">Calibrated risk breakdown</h3>
          <p className="text-[11px] text-[#6b7194] mt-0.5">Distribution across validated probability operating thresholds</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-8 min-w-0">
          <div className="w-40 h-40 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDist} cx="50%" cy="50%" outerRadius={70} innerRadius={35} dataKey="value" stroke={C.surface} strokeWidth={2}>
                  {riskDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 flex-1 min-w-0 w-full">
            {riskDist.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#0f1117] border border-[#1e2235] rounded text-[12px]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-[#c8ccd8] truncate">{d.name}</span>
                </div>
                <div className="font-mono font-medium ml-3 text-right">
                  <span className="text-[#eef0f6]">{d.value.toLocaleString()}</span>
                  <span className="text-[10px] text-[#6b7194] ml-1.5">({total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom: Table + Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Project table */}
        <div className="xl:col-span-2 bg-[#161922] border border-[#262a3a] rounded min-w-0 flex flex-col">
          <div className="px-5 py-3.5 border-b border-[#262a3a] flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-[#eef0f6]">Monitored surveillance roster</h3>
            <button onClick={() => navigate('/projects')} className="text-[11px] text-[#6b7194] hover:text-amber-500 transition-colors">
              View all →
            </button>
          </div>
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="border-b border-[#262a3a] text-[#6b7194] text-[11px]">
                  <th className="text-left px-5 py-2.5 font-medium">Project</th>
                  <th className="text-left px-3 py-2.5 font-medium">Sector</th>
                  <th className="text-right px-3 py-2.5 font-medium">Model Risk</th>
                  <th className="text-left px-3 py-2.5 font-medium">Trajectory</th>
                  <th className="text-left px-3 py-2.5 font-medium">Governance Action</th>
                </tr>
              </thead>
              <tbody>
                {projectsList.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-[#4a5070]">{loading ? 'Loading...' : 'No projects found'}</td></tr>
                ) : projectsList.slice(0, 8).map(p => (
                  <tr key={p.project_id} onClick={() => navigate(`/projects/${encodeURIComponent(p.project_id)}`)}
                    className="border-b border-[#1e2235] hover:bg-[#1c1f2e] cursor-pointer transition-colors">
                    <td className="px-5 py-2.5 max-w-[200px]">
                      <div className="text-[#eef0f6] font-medium truncate">{p.project_name}</div>
                      <div className="text-[10px] text-[#4a5070] font-mono mt-0.5 truncate">{p.project_id}</div>
                    </td>
                    <td className="px-3 py-2.5 text-[#6b7194] truncate max-w-[100px]">{p.sector}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-medium" style={{ color: p.risk !== null ? riskColor(p.risk) : '#4a5070' }}>
                      {p.risk !== null ? formatPercent(p.risk) : '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <span style={{ color: p.trajectory.includes('Deteriorating') ? C.orange : p.trajectory.includes('Improving') ? '#9ca3af' : '#4a5070' }}>
                        {p.trajectory}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[11px] font-medium" style={{ color: govColor(p.governance) }}>
                        {p.governance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity feeds */}
        <div className="xl:col-span-1 space-y-5 min-w-0">
          {/* Warnings */}
          <div className="bg-[#161922] border border-[#262a3a] rounded">
            <div className="px-4 py-3 border-b border-[#262a3a] flex justify-between items-center">
              <h3 className="text-[12px] font-semibold text-[#eef0f6]">Active warnings</h3>
              <span className="text-[10px] text-[#4a5070] font-mono">{warnCount}</span>
            </div>
            <div className="p-4 space-y-3">
              {warnings.slice(0, 3).map((w, i) => (
                <div key={i} className="flex gap-2.5 min-w-0">
                  <div className="w-1 h-1 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] text-[#eef0f6] font-medium truncate">{w.project_name}</p>
                    <p className="text-[11px] text-[#6b7194] truncate mt-0.5">{w.trigger_reason}</p>
                    <span className="text-[10px] text-[#4a5070] font-mono">{w.reporting_month}</span>
                  </div>
                </div>
              ))}
              {warnings.length === 0 && <p className="text-[11px] text-[#4a5070]">No active warnings</p>}
            </div>
          </div>

          {/* Escalations */}
          <div className="bg-[#161922] border border-[#262a3a] rounded">
            <div className="px-4 py-3 border-b border-[#262a3a] flex justify-between items-center">
              <h3 className="text-[12px] font-semibold text-[#eef0f6]">Authority escalations</h3>
              <span className="text-[10px] text-[#4a5070] font-mono">{escCount}</span>
            </div>
            <div className="p-4 space-y-3">
              {escalations.slice(0, 3).map((e, i) => (
                <div key={i} className="flex gap-2.5 min-w-0">
                  <div className="w-1 h-1 rounded-full bg-red-700 mt-2 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] text-[#eef0f6] font-medium truncate">{e.project_name}</p>
                    <p className="text-[11px] text-[#6b7194] truncate mt-0.5">{e.reason || 'Persistent deterioration across cycles'}</p>
                    <span className="text-[10px] text-[#4a5070] font-mono">{e.reporting_month}</span>
                  </div>
                </div>
              ))}
              {escalations.length === 0 && <p className="text-[11px] text-[#4a5070]">No authority escalations</p>}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
