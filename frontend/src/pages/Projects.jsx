import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMonitoredProjects, getMonitoredProjectObservations, getProjects, formatINR, formatPercent, formatDelayMonths } from '../services/api';
import OnboardModal from '../components/modals/OnboardModal';

const SECTORS = ['ALL','Road Transport and Highways','Railways','Power','Petroleum','Urban Development','Atomic Energy','OTHER'];
const RISK_TIERS = ['ALL','NORMAL','WATCH','REVIEW','ESCALATE'];
const GOV_STATES = ['ALL','ACTIVE','WARNING_ISSUED','UNDER_RECOVERY','RECOVERED','ESCALATED'];

const riskColor = r => r >= 0.50 ? '#b91c1c' : r >= 0.45 ? '#ea580c' : r >= 0.40 ? '#d97706' : '#6b7194';

export default function Projects() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('monitored');
  const [loading, setLoading] = useState(true);
  const [showOnboard, setShowOnboard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedGov, setSelectedGov] = useState('ALL');
  const [monitoredList, setMonitoredList] = useState([]);
  const [portfolioList, setPortfolioList] = useState([]);
  const [totalPortfolio, setTotalPortfolio] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const monRes = await getMonitoredProjects();
      const rawMon = monRes?.projects || [];
      const enriched = await Promise.all(rawMon.map(async (p) => {
        try {
          const obsRes = await getMonitoredProjectObservations(p.project_id).catch(() => ({ observations: [] }));
          const obsList = obsRes?.observations || [];
          const latest = obsList.length > 0 ? obsList[obsList.length - 1] : null;
          let trajectory = 'Stable';
          if (obsList.length >= 2) {
            const prev = obsList[obsList.length - 2];
            if (latest.pred_prob > prev.pred_prob + 0.02) trajectory = '↓ Deteriorating';
            else if (latest.pred_prob < prev.pred_prob - 0.02) trajectory = '↑ Improving';
          } else if (p.current_status === 'RECOVERED') trajectory = '↑ Improving';
          else if (p.current_status === 'WARNING_ISSUED' || p.current_status === 'ESCALATED') trajectory = '↓ Deteriorating';
          return { ...p, financial_progress: latest?.financial_progress ?? null, schedule_deviation_months: latest?.schedule_deviation_months ?? null, latest_risk: latest?.pred_prob ?? null, latest_risk_tier: latest?.risk_tier ?? 'NORMAL', latest_observation: latest?.reporting_month ?? p.initial_reporting_month, trajectory };
        } catch { return { ...p, financial_progress: null, schedule_deviation_months: null, latest_risk: null, latest_risk_tier: 'NORMAL', latest_observation: p.initial_reporting_month, trajectory: 'Stable' }; }
      }));
      setMonitoredList(enriched);
      const portRes = await getProjects({ limit: 100 });
      setPortfolioList(portRes?.projects || []);
      setTotalPortfolio(portRes?.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredMon = monitoredList.filter(p => {
    if (searchTerm) { const q = searchTerm.toLowerCase(); if (!(p.project_id||'').toLowerCase().includes(q) && !(p.project_name||'').toLowerCase().includes(q)) return false; }
    if (selectedSector !== 'ALL' && p.sector !== selectedSector) return false;
    if (selectedRisk !== 'ALL' && p.latest_risk_tier !== selectedRisk) return false;
    if (selectedGov !== 'ALL') { const s = p.current_status; if (selectedGov === 'UNDER_RECOVERY' && (s === 'CONTRACTOR_RESPONDED' || s === 'UNDER_RECOVERY')) {} else if (s !== selectedGov) return false; }
    return true;
  });
  const filteredPort = portfolioList.filter(p => {
    if (searchTerm) { const q = searchTerm.toLowerCase(); if (!(p.project_id||'').toLowerCase().includes(q) && !(p.project_name||'').toLowerCase().includes(q)) return false; }
    if (selectedSector !== 'ALL' && p.sector !== selectedSector) return false;
    if (selectedRisk !== 'ALL' && p.latest_risk_tier !== selectedRisk) return false;
    return true;
  });

  const sel = 'border-b-2 border-amber-600 text-[#eef0f6] font-medium';
  const unsel = 'border-b-2 border-transparent text-[#6b7194] hover:text-[#a0a5bd]';
  const inputCls = 'px-2.5 py-1.5 bg-[#161922] border border-[#262a3a] text-[#c8ccd8] text-[11px] rounded focus:outline-none focus:border-amber-600/50';

  return (
    <div className="p-6 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div />
        <button onClick={() => setShowOnboard(true)} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-medium rounded transition-colors">
          + Onboard project
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#262a3a] mb-4 text-[12px]">
        <button onClick={() => setActiveTab('monitored')} className={`pb-2.5 ${activeTab === 'monitored' ? sel : unsel}`}>
          Active monitoring ({monitoredList.length})
        </button>
        <button onClick={() => setActiveTab('portfolio')} className={`pb-2.5 ${activeTab === 'portfolio' ? sel : unsel}`}>
          National archive ({totalPortfolio.toLocaleString()})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2.5 mb-4">
        <input type="text" placeholder="Search project ID or name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`${inputCls} w-56`} />
        <select value={selectedSector} onChange={e => setSelectedSector(e.target.value)} className={inputCls}>
          <option value="ALL">Sector: All</option>
          {SECTORS.filter(s => s !== 'ALL').map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={selectedRisk} onChange={e => setSelectedRisk(e.target.value)} className={inputCls}>
          <option value="ALL">Risk: All</option>
          {RISK_TIERS.filter(r => r !== 'ALL').map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {activeTab === 'monitored' && (
          <select value={selectedGov} onChange={e => setSelectedGov(e.target.value)} className={inputCls}>
            <option value="ALL">Governance: All</option>
            {GOV_STATES.filter(g => g !== 'ALL').map(g => <option key={g} value={g}>{g.replace(/_/g, ' ')}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#161922] border border-[#262a3a] rounded overflow-x-auto min-w-0">
        <table className="w-full text-[12px] border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#262a3a] text-[#6b7194] text-[11px]">
              <th className="text-left px-4 py-2.5 font-medium">Project</th>
              <th className="text-left px-3 py-2.5 font-medium">Sector</th>
              <th className="text-right px-3 py-2.5 font-medium">Cost</th>
              {activeTab === 'monitored' && <><th className="text-right px-3 py-2.5 font-medium">Fin. prog</th><th className="text-right px-3 py-2.5 font-medium">Delay</th></>}
              <th className="text-right px-3 py-2.5 font-medium">Risk</th>
              <th className="text-left px-3 py-2.5 font-medium">Tier</th>
              {activeTab === 'monitored' && <><th className="text-left px-3 py-2.5 font-medium">Trajectory</th><th className="text-left px-3 py-2.5 font-medium">Status</th></>}
              <th className="text-right px-3 py-2.5 font-medium">Report</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-[#4a5070]">Loading...</td></tr>
            ) : activeTab === 'monitored' ? filteredMon.map(p => (
              <tr key={p.project_id} onClick={() => navigate(`/projects/${encodeURIComponent(p.project_id)}`)} className="border-b border-[#1e2235] hover:bg-[#1c1f2e] cursor-pointer transition-colors">
                <td className="px-4 py-2.5 max-w-[220px]">
                  <div className="text-[#eef0f6] font-medium truncate">{p.project_name}</div>
                  <div className="text-[10px] text-[#4a5070] font-mono mt-0.5 truncate">{p.project_id}</div>
                </td>
                <td className="px-3 py-2.5 text-[#6b7194] truncate max-w-[120px]">{p.sector}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[#6b7194]">{formatINR(p.sanctioned_cost)}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[#6b7194]">{p.financial_progress !== null ? formatPercent(p.financial_progress) : '—'}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[#6b7194]">{p.schedule_deviation_months !== null ? formatDelayMonths(p.schedule_deviation_months) : '—'}</td>
                <td className="px-3 py-2.5 text-right font-mono font-medium" style={{ color: p.latest_risk !== null ? riskColor(p.latest_risk) : '#4a5070' }}>
                  {p.latest_risk !== null ? formatPercent(p.latest_risk) : '—'}
                </td>
                <td className="px-3 py-2.5 font-mono text-[11px] text-[#6b7194]">{p.latest_risk_tier}</td>
                <td className="px-3 py-2.5 text-[11px]" style={{ color: p.trajectory.includes('Deteriorating') ? '#ea580c' : p.trajectory.includes('Improving') ? '#9ca3af' : '#4a5070' }}>{p.trajectory}</td>
                <td className="px-3 py-2.5 text-[11px]">
                  <span className="flex items-center gap-1.5" style={{ color: p.current_status === 'ESCALATED' ? '#b91c1c' : p.current_status === 'WARNING_ISSUED' ? '#ea580c' : '#6b7194' }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.current_status === 'ESCALATED' ? 'bg-red-700' : p.current_status === 'WARNING_ISSUED' ? 'bg-orange-600' : p.current_status === 'RECOVERED' ? 'bg-gray-500' : 'bg-[#4a5070]'}`} />
                    {p.current_status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-[#4a5070]">{p.latest_observation}</td>
              </tr>
            )) : filteredPort.map(p => (
              <tr key={p.project_id} onClick={() => navigate(`/projects/${encodeURIComponent(p.project_id)}`)} className="border-b border-[#1e2235] hover:bg-[#1c1f2e] cursor-pointer transition-colors">
                <td className="px-4 py-2.5 max-w-[260px]">
                  <div className="text-[#eef0f6] font-medium truncate">{p.project_name}</div>
                  <div className="text-[10px] text-[#4a5070] font-mono mt-0.5 truncate">{p.project_id}</div>
                </td>
                <td className="px-3 py-2.5 text-[#6b7194] truncate max-w-[130px]">{p.sector}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[#6b7194]">{formatINR(p.baseline_cost)}</td>
                <td className="px-3 py-2.5 text-right font-mono font-medium" style={{ color: riskColor(p.latest_risk) }}>{formatPercent(p.latest_risk)}</td>
                <td className="px-3 py-2.5 font-mono text-[11px] text-[#6b7194]">{p.latest_risk_tier}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[#4a5070]">{p.latest_observation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <OnboardModal isOpen={showOnboard} onClose={() => setShowOnboard(false)} onSuccess={loadData} />
    </div>
  );
}
