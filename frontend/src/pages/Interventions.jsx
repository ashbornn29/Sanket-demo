import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Eye, TrendingUp, TrendingDown, Minus, Filter } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Loading from '../components/common/Loading';
import RiskBadge from '../components/common/RiskBadge';
import { getInterventions } from '../services/api';

export default function Interventions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interventions, setInterventions] = useState([]);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [highExposure, setHighExposure] = useState(false);
  const [increasingRisk, setIncreasingRisk] = useState(false);

  useEffect(() => { loadInterventions(); }, [criticalOnly, highExposure, increasingRisk]);
  async function loadInterventions() { setLoading(true); const data = await getInterventions({ criticalOnly, highExposure, increasingRisk }); setInterventions(data); setLoading(false); }

  return (
    <PageContainer title="Intervention Priority Queue" subtitle="Projects ranked by risk-weighted exposure for prioritized review and action.">
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-navy-700"><Filter size={15} /><span>Quick Filters</span></div>
        <div className="flex flex-wrap gap-3">
          {[{ label: 'Critical Only', active: criticalOnly, toggle: () => setCriticalOnly(!criticalOnly) }, { label: 'High Exposure (>₹5,000 Cr)', active: highExposure, toggle: () => setHighExposure(!highExposure) }, { label: 'Increasing Risk Only', active: increasingRisk, toggle: () => setIncreasingRisk(!increasingRisk) }].map((f) => (
            <button key={f.label} onClick={f.toggle} className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${f.active ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-navy-600 border-gray-200 hover:bg-navy-50'}`}>{f.label}</button>
          ))}
        </div>
      </div>
      {loading ? <Loading /> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-navy-50 border-b border-gray-200"><th className="text-left py-3 px-4 text-xs font-medium text-navy-600">#</th><th className="text-left py-3 px-4 text-xs font-medium text-navy-600">Project</th><th className="text-left py-3 px-4 text-xs font-medium text-navy-600">Sector</th><th className="text-left py-3 px-4 text-xs font-medium text-navy-600">Risk</th><th className="text-left py-3 px-4 text-xs font-medium text-navy-600">Primary Concern</th><th className="text-left py-3 px-4 text-xs font-medium text-navy-600">Review</th><th className="text-right py-3 px-4 text-xs font-medium text-navy-600">Exposure</th><th className="text-center py-3 px-4 text-xs font-medium text-navy-600">Trend</th><th className="text-right py-3 px-4 text-xs font-medium text-navy-600"></th></tr></thead>
            <tbody>{interventions.map((p, idx) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-navy-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                <td className="py-3.5 px-4 text-xs text-navy-400 font-data">{idx + 1}</td><td className="py-3.5 px-4"><div className="text-sm font-medium text-navy-800">{p.name}</div><div className="text-[11px] text-navy-400 font-data">{p.id} · {p.state}</div></td><td className="py-3.5 px-4 text-xs text-navy-600">{p.sector}</td><td className="py-3.5 px-4"><RiskBadge level={p.riskLevel} score={p.riskScore} size="xs" /></td><td className="py-3.5 px-4 text-xs text-navy-600">{p.primaryConcern}</td>
                <td className="py-3.5 px-4"><span className={`text-[10px] font-medium px-2 py-1 rounded ${p.recommendedReview === 'Immediate Review' ? 'bg-red-50 text-red-700' : p.recommendedReview === 'Priority Review' ? 'bg-orange-50 text-orange-700' : 'bg-navy-50 text-navy-600'}`}>{p.recommendedReview}</span></td>
                <td className="py-3.5 px-4 text-right font-data text-xs text-navy-700">₹{p.costExposure.toLocaleString()} Cr</td>
                <td className="py-3.5 px-4 text-center">{p.trend === 'increasing' ? <TrendingUp size={14} className="text-red-500 mx-auto" /> : p.trend === 'decreasing' ? <TrendingDown size={14} className="text-green-500 mx-auto" /> : <Minus size={14} className="text-gray-400 mx-auto" />}</td>
                <td className="py-3.5 px-4 text-right"><Eye size={14} className="text-navy-400" /></td>
              </tr>))}</tbody></table></div>
          <div className="px-4 py-3 border-t border-gray-100"><span className="text-xs text-navy-500">{interventions.length} projects in queue</span></div>
        </div>
      )}
    </PageContainer>
  );
}
