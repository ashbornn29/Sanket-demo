import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMonitoredProjects,
  getMonitoredProjectWarnings,
  formatPercent
} from '../services/api';
import WarningResponseModal from '../components/modals/WarningResponseModal';
import { AlertTriangle, Search, Filter } from 'lucide-react';

export default function Warnings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [warningsList, setWarningsList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [activeWarningItem, setActiveWarningItem] = useState(null);

  const loadWarnings = async () => {
    setLoading(true);
    try {
      const monRes = await getMonitoredProjects();
      const projects = monRes?.projects || [];

      const list = [];
      for (const p of projects) {
        try {
          const wRes = await getMonitoredProjectWarnings(p.project_id);
          const pWarnings = wRes?.warnings || [];
          for (const w of pWarnings) {
            list.push({
              ...w,
              project_name: p.project_name,
              current_project_status: p.current_status,
              warning_consecutive_count: p.warning_consecutive_count,
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
      setWarningsList(list);
    } catch (err) {
      console.error('Failed to load warnings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarnings();
  }, []);

  const activeCount = warningsList.filter((w) => w.status === 'ISSUED').length;
  const underRecoveryCount = warningsList.filter(
    (w) => w.status === 'RESPONSE_SUBMITTED' || w.current_project_status === 'UNDER_RECOVERY'
  ).length;
  const recoveredCount = warningsList.filter((w) => w.current_project_status === 'RECOVERED').length;
  const persistentCount = warningsList.filter(
    (w) => w.warning_consecutive_count >= 2 || w.current_project_status === 'ESCALATED'
  ).length;

  const filtered = warningsList.filter((w) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!w.project_name.toLowerCase().includes(q) && !w.project_id.toLowerCase().includes(q)) return false;
    }
    if (filterStatus === 'ACTIVE' && w.status !== 'ISSUED') return false;
    if (filterStatus === 'UNDER_RECOVERY' && w.current_project_status !== 'UNDER_RECOVERY') return false;
    if (filterStatus === 'RECOVERED' && w.current_project_status !== 'RECOVERED') return false;
    if (filterStatus === 'PERSISTENT' && w.warning_consecutive_count < 2 && w.current_project_status !== 'ESCALATED') return false;
    return true;
  });

  return (
    <div className="p-6 space-y-5 min-w-0">
      {/* Header Info */}
      <div className="p-4 bg-[#161922] border border-[#262a3a] rounded text-[12px] text-[#6b7194] flex items-center justify-between">
        <div>
          <span className="font-medium text-[#eef0f6]">Notice Trigger Rule: </span>
          Early-warning notices automatically dispatched when project risk reaches or exceeds the 50% deterioration threshold.
        </div>
      </div>

      {/* KPI stats strip */}
      <div className="bg-[#161922] border border-[#262a3a] rounded px-5 py-3.5 flex items-center justify-between text-xs divide-x divide-[#262a3a]">
        <div className="flex-1 flex items-baseline gap-2.5">
          <span className="text-[11px] text-[#6b7194] uppercase tracking-wider font-medium">Active Notices</span>
          <span className="font-mono font-bold text-amber-500 text-base">{activeCount}</span>
        </div>
        <div className="flex-1 pl-6 flex items-baseline gap-2.5">
          <span className="text-[11px] text-[#6b7194] uppercase tracking-wider font-medium">Under Recovery</span>
          <span className="font-mono font-bold text-blue-400 text-base">{underRecoveryCount}</span>
        </div>
        <div className="flex-1 pl-6 flex items-baseline gap-2.5">
          <span className="text-[11px] text-[#6b7194] uppercase tracking-wider font-medium">Recovered</span>
          <span className="font-mono font-bold text-emerald-400 text-base">{recoveredCount}</span>
        </div>
        <div className="flex-1 pl-6 flex items-baseline gap-2.5">
          <span className="text-[11px] text-[#6b7194] uppercase tracking-wider font-medium">Persistent Deterioration</span>
          <span className="font-mono font-bold text-red-500 text-base">{persistentCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161922] border border-[#262a3a] rounded p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4a5070]" size={13} />
          <input
            type="text"
            placeholder="Filter warnings by project or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded text-xs w-72 focus:outline-none focus:border-amber-600/50 placeholder:text-[#4a5070]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['ALL', 'ACTIVE', 'UNDER_RECOVERY', 'RECOVERED', 'PERSISTENT'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filterStatus === st
                  ? 'bg-amber-600/20 text-amber-400 border border-amber-600/40'
                  : 'bg-[#0f1117] text-[#6b7194] border border-[#262a3a] hover:text-[#a0a5bd] hover:bg-[#1a1d2e]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Warnings Table */}
      <div className="bg-[#161922] border border-[#262a3a] rounded overflow-x-auto min-w-0">
        <table className="w-full text-left text-[12px] border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#262a3a] text-[#6b7194] text-[11px] bg-[#12141e]">
              <th className="px-4 py-2.5 font-medium">PROJECT</th>
              <th className="px-3 py-2.5 text-right font-medium">RISK AT WARNING</th>
              <th className="px-3 py-2.5 font-medium">MONTH</th>
              <th className="px-3 py-2.5 font-medium">TRIGGER REASON</th>
              <th className="px-3 py-2.5 font-medium">CONTRACTOR STATUS</th>
              <th className="px-3 py-2.5 font-medium">RECOVERY STATE</th>
              <th className="px-3 py-2.5 text-center font-medium">CYCLES</th>
              <th className="px-4 py-2.5 text-right font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2235]">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[#4a5070]">
                  Loading warning notices...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[#4a5070]">
                  No contractor warnings matching filters.
                </td>
              </tr>
            ) : (
              filtered.map((w) => (
                <tr key={w.warning_id} className="hover:bg-[#1a1d2e] transition-colors">
                  <td className="px-4 py-2.5 max-w-[220px]">
                    <div className="font-medium text-[#eef0f6] truncate" title={w.project_name}>
                      {w.project_name}
                    </div>
                    <div className="font-mono text-[10px] text-[#6b7194] truncate">
                      {w.project_id} · <span className="text-[#4a5070]">{w.warning_id}</span>
                    </div>
                  </td>

                  <td className="px-3 py-2.5 text-right font-mono font-bold text-red-400">
                    {formatPercent(w.pred_prob, 2)}
                  </td>

                  <td className="px-3 py-2.5 font-mono text-[#a0a5bd]">
                    {w.reporting_month}
                  </td>

                  <td className="px-3 py-2.5 max-w-[260px] text-[#6b7194] truncate" title={w.trigger_reason}>
                    {w.trigger_reason}
                  </td>

                  <td className="px-3 py-2.5">
                    {w.status === 'ISSUED' ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 border border-amber-800/60 text-amber-300">
                        Response requested
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 border border-blue-800/60 text-blue-300">
                        Response submitted
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2.5 text-[11px]">
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      w.current_project_status === 'RECOVERED'
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                        : w.current_project_status === 'ESCALATED'
                        ? 'bg-red-950/50 text-red-400 border border-red-800/40'
                        : 'bg-[#1a1d2e] text-[#c8ccd8] border border-[#262a3a]'
                    }`}>
                      {w.current_project_status.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 text-center font-mono font-medium text-[#eef0f6]">
                    {w.warning_consecutive_count}
                  </td>

                  <td className="px-4 py-2.5 text-right space-x-2">
                    {w.status === 'ISSUED' && (
                      <button
                        onClick={() => {
                          setActiveWarningItem(w);
                          setShowResponseModal(true);
                        }}
                        className="text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Log Response
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/projects/${encodeURIComponent(w.project_id)}`)}
                      className="text-[11px] font-medium text-[#c8ccd8] hover:text-[#ffffff] transition-colors"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {activeWarningItem && (
        <WarningResponseModal
          isOpen={showResponseModal}
          onClose={() => {
            setShowResponseModal(false);
            setActiveWarningItem(null);
          }}
          projectId={activeWarningItem.project_id}
          warning={activeWarningItem}
          onSuccess={loadWarnings}
        />
      )}
    </div>
  );
}
