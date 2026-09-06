import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthorityEscalations, formatPercent } from '../services/api';

export default function Escalations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [escalations, setEscalations] = useState([]);

  useEffect(() => {
    getAuthorityEscalations()
      .then(res => setEscalations(res?.escalations || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 min-w-0">
      {/* Policy */}
      <div className="p-4 bg-[#161922] border border-[#262a3a] rounded text-[12px] text-[#6b7194] mb-5">
        <span className="font-medium text-[#eef0f6]">Governance policy: </span>
        Persistent deterioration across consecutive cycles triggers formal referral to the supervisory ministry.
      </div>

      {/* Table */}
      <div className="bg-[#161922] border border-[#262a3a] rounded overflow-x-auto min-w-0">
        <table className="w-full text-[12px] border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#262a3a] text-[#6b7194] text-[11px]">
              <th className="text-left px-4 py-2.5 font-medium">ID</th>
              <th className="text-left px-3 py-2.5 font-medium">Project</th>
              <th className="text-left px-3 py-2.5 font-medium">Sector</th>
              <th className="text-right px-3 py-2.5 font-medium">Risk</th>
              <th className="text-center px-3 py-2.5 font-medium">Cycles</th>
              <th className="text-left px-3 py-2.5 font-medium">Determination</th>
              <th className="text-left px-3 py-2.5 font-medium">Escalated to</th>
              <th className="text-right px-3 py-2.5 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-[#4a5070]">Loading...</td></tr>
            ) : escalations.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-[#4a5070]">No authority escalations issued</td></tr>
            ) : escalations.map(e => (
              <tr key={e.escalation_id} onClick={() => navigate(`/projects/${encodeURIComponent(e.project_id)}`)} className="border-b border-[#1e2235] hover:bg-[#1c1f2e] cursor-pointer transition-colors">
                <td className="px-4 py-2.5 font-mono text-[11px] text-red-700 font-medium">{e.escalation_id}</td>
                <td className="px-3 py-2.5 max-w-[200px]">
                  <div className="text-[#eef0f6] font-medium truncate">{e.project_name}</div>
                  <div className="text-[10px] text-[#4a5070] font-mono mt-0.5 truncate">{e.project_id}</div>
                </td>
                <td className="px-3 py-2.5 text-[#6b7194] truncate max-w-[120px]">{e.sector || '—'}</td>
                <td className="px-3 py-2.5 text-right font-mono font-medium text-red-700">{formatPercent(e.pred_prob, 2)}</td>
                <td className="px-3 py-2.5 text-center font-mono text-[#c8ccd8]">{e.persistence_cycles}</td>
                <td className="px-3 py-2.5 text-[#6b7194] max-w-[240px] truncate">{e.reason || 'Persistent deterioration'}</td>
                <td className="px-3 py-2.5 text-[#6b7194] truncate max-w-[140px]">{e.escalated_to}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[#4a5070]">{e.reporting_month}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
