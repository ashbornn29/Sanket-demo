import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  seedDemoScenarios,
  getMonitoredProjectStatus,
  getMonitoredProjectObservations,
  formatPercent,
  formatINR,
  formatDelayMonths
} from '../services/api';
import { PlayCircle, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export default function DemoMode() {
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(null);
  const [scenario1, setScenario1] = useState(null);
  const [scenario2, setScenario2] = useState(null);

  const fetchLiveStates = async () => {
    try {
      const [s1Status, s1Obs, s2Status, s2Obs] = await Promise.all([
        getMonitoredProjectStatus('PRJ-DEMO-RECOVERY-01').catch(() => null),
        getMonitoredProjectObservations('PRJ-DEMO-RECOVERY-01').catch(() => ({ observations: [] })),
        getMonitoredProjectStatus('PRJ-DEMO-ESCALATE-02').catch(() => null),
        getMonitoredProjectObservations('PRJ-DEMO-ESCALATE-02').catch(() => ({ observations: [] })),
      ]);

      setScenario1({ status: s1Status, observations: s1Obs?.observations || [] });
      setScenario2({ status: s2Status, observations: s2Obs?.observations || [] });
    } catch (err) {
      console.error('Failed to load demo states:', err);
    }
  };

  useEffect(() => {
    fetchLiveStates();
  }, []);

  const handleRun = async (sc) => {
    setSeeding(sc);
    try {
      await seedDemoScenarios(sc);
      await fetchLiveStates();
    } catch (err) {
      alert(`Execution error: ${err.message}`);
    } finally {
      setSeeding(null);
    }
  };

  return (
    <div className="p-6 space-y-5 min-w-0">
      {/* Header */}
      <div className="p-4 bg-[#161922] border border-[#262a3a] rounded flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold text-[#eef0f6]">Deterministic Evaluation Scenarios</h2>
          <p className="text-[11px] text-[#6b7194] mt-0.5">
            Test and validate the end-to-end early warning and escalation state machine with synthetic benchmarks.
          </p>
        </div>

        <button
          onClick={() => handleRun('all')}
          disabled={seeding !== null}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-[#0f1117] text-xs font-semibold rounded transition-colors disabled:opacity-50"
        >
          {seeding === 'all' ? 'Seeding all...' : 'Seed All Scenarios'}
        </button>
      </div>

      {/* Two Canonical Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* =============================================================== */}
        {/* CASE 1: CONTRACTOR RECOVERY */}
        {/* =============================================================== */}
        <div className="bg-[#161922] border border-[#262a3a] rounded p-5 space-y-4">
          <div className="flex items-start justify-between border-b border-[#262a3a] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#eef0f6]">Scenario 1: Contractor Recovery</h3>
              </div>
              <p className="font-mono text-[11px] text-amber-500 mt-0.5">PRJ-DEMO-RECOVERY-01</p>
              <p className="text-[11px] text-[#6b7194] mt-1">Power · Transmission Grid Substation (₹50 Cr)</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 rounded">
                {scenario1?.status?.status || 'RECOVERED'}
              </span>
              <button
                onClick={() => handleRun('1')}
                disabled={seeding !== null}
                className="px-2.5 py-1 bg-[#1a1d2e] hover:bg-[#252a42] border border-[#262a3a] text-[#eef0f6] text-xs font-medium rounded transition-colors disabled:opacity-50"
              >
                {seeding === '1' ? 'Running...' : 'Run Case 1'}
              </button>
            </div>
          </div>

          {/* Chronological Sequence */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6b7194]">
              Trajectory Progression
            </span>
            <div className="p-3 bg-[#0f1117] border border-[#1e2235] rounded font-mono text-[11px] flex flex-wrap items-center gap-2 text-[#8e94ad]">
              <span className="text-amber-400">Jan (Watch)</span>
              <span>→</span>
              <span className="text-amber-400">Feb (Watch)</span>
              <span>→</span>
              <span className="text-red-400 font-medium">Mar (Warning)</span>
              <span>→</span>
              <span className="text-blue-400 font-medium">Apr (Corrective action window)</span>
              <span>→</span>
              <span className="text-emerald-400 font-semibold">May (Recovered)</span>
            </div>
          </div>

          {/* Actual Backend Observations */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6b7194]">
              Observation Timeline
            </span>
            <div className="border border-[#262a3a] rounded overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead className="bg-[#12141e] text-[#6b7194] text-[10px] border-b border-[#262a3a]">
                  <tr>
                    <th className="px-2.5 py-1.5 font-medium">MONTH</th>
                    <th className="px-2 py-1.5 text-right font-medium">FIN. PROG</th>
                    <th className="px-2 py-1.5 text-right font-medium">DELAY</th>
                    <th className="px-2 py-1.5 text-right font-medium">RISK</th>
                    <th className="px-2.5 py-1.5 font-medium">TIER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2235]">
                  {scenario1?.observations.length > 0 ? (
                    scenario1.observations.map((o) => (
                      <tr key={o.reporting_month} className="hover:bg-[#1a1d2e] transition-colors">
                        <td className="px-2.5 py-1.5 font-bold text-[#eef0f6]">{o.reporting_month}</td>
                        <td className="px-2 py-1.5 text-right text-[#c8ccd8]">{formatPercent(o.financial_progress)}</td>
                        <td className="px-2 py-1.5 text-right text-[#c8ccd8]">{o.schedule_deviation_months}m</td>
                        <td className="px-2 py-1.5 text-right font-bold text-amber-400">{formatPercent(o.pred_prob, 2)}</td>
                        <td className="px-2.5 py-1.5 text-[#8e94ad]">{o.risk_tier}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-2 py-4 text-center text-[#4a5070]">
                        Click 'Run Case 1' to generate live data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Narrative Evidence */}
          <div className="space-y-2 border-t border-[#262a3a] pt-3 text-[11px]">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#6b7194] block mb-1">
                Contractor Corrective Action
              </span>
              <p className="text-[#c8ccd8] bg-[#0f1117] p-2.5 border border-[#1e2235] rounded font-mono text-[10px]">
                Corrective action logged: automated tensioning units deployed, double-shift site assembly mobilized.
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#6b7194] block mb-1">
                Recovery Evidence
              </span>
              <ul className="list-disc pl-4 text-[#8e94ad] space-y-0.5 text-[11px]">
                <li>Financial progress velocity accelerated to +11.5%/month</li>
                <li>Schedule deviation cleared from 36.0m to 0.0m upon re-baseline</li>
                <li>Calibrated risk reduced below threshold to 40.05% (WATCH)</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => navigate('/projects/PRJ-DEMO-RECOVERY-01')}
              className="text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              Open Project Details <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* =============================================================== */}
        {/* CASE 2: AUTHORITY ESCALATION */}
        {/* =============================================================== */}
        <div className="bg-[#161922] border border-[#262a3a] rounded p-5 space-y-4">
          <div className="flex items-start justify-between border-b border-[#262a3a] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#eef0f6]">Scenario 2: Authority Escalation</h3>
              </div>
              <p className="font-mono text-[11px] text-red-400 mt-0.5">PRJ-DEMO-ESCALATE-02</p>
              <p className="text-[11px] text-[#6b7194] mt-1">Railways · Freight Rail Feeder Link (₹50 Cr)</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium text-red-400 bg-red-950/50 border border-red-800/40 rounded">
                {scenario2?.status?.status || 'ESCALATED'}
              </span>
              <button
                onClick={() => handleRun('2')}
                disabled={seeding !== null}
                className="px-2.5 py-1 bg-[#1a1d2e] hover:bg-[#252a42] border border-[#262a3a] text-[#eef0f6] text-xs font-medium rounded transition-colors disabled:opacity-50"
              >
                {seeding === '2' ? 'Running...' : 'Run Case 2'}
              </button>
            </div>
          </div>

          {/* Chronological Sequence */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6b7194]">
              Escalation Milestones
            </span>
            <div className="p-3 bg-[#0f1117] border border-[#1e2235] rounded text-[11px] space-y-1.5 text-[#8e94ad]">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[#4a5070]">1.</span>
                <span>Deterioration detected (Jan 2025 · 61.97% ESCALATE)</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-amber-400">
                <span className="text-[#4a5070]">2.</span>
                <span>Contractor warning issued (Response requested)</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[#4a5070]">3.</span>
                <span>Response received (partner dispute cited; zero mobilization)</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-red-400">
                <span className="text-[#4a5070]">4.</span>
                <span>No measurable recovery (Feb 2025 · 67.73% · Cycle 2)</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-red-400 font-semibold">
                <span className="text-[#4a5070]">5.</span>
                <span>Authority escalation dispatched to Ministry</span>
              </div>
            </div>
          </div>

          {/* Actual Backend Observations */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6b7194]">
              Observation Timeline
            </span>
            <div className="border border-[#262a3a] rounded overflow-x-auto max-h-44 overflow-y-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead className="bg-[#12141e] text-[#6b7194] text-[10px] border-b border-[#262a3a] sticky top-0">
                  <tr>
                    <th className="px-2.5 py-1.5 font-medium">MONTH</th>
                    <th className="px-2 py-1.5 text-right font-medium">FIN. PROG</th>
                    <th className="px-2 py-1.5 text-right font-medium">DELAY</th>
                    <th className="px-2 py-1.5 text-right font-medium">RISK</th>
                    <th className="px-2.5 py-1.5 font-medium">TIER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2235]">
                  {scenario2?.observations.length > 0 ? (
                    scenario2.observations.map((o) => (
                      <tr key={o.reporting_month} className="hover:bg-[#1a1d2e] transition-colors">
                        <td className="px-2.5 py-1.5 font-bold text-[#eef0f6]">{o.reporting_month}</td>
                        <td className="px-2 py-1.5 text-right text-[#c8ccd8]">{formatPercent(o.financial_progress)}</td>
                        <td className="px-2 py-1.5 text-right text-[#c8ccd8]">{o.schedule_deviation_months}m</td>
                        <td className="px-2 py-1.5 text-right font-bold text-red-400">{formatPercent(o.pred_prob, 2)}</td>
                        <td className="px-2.5 py-1.5 text-[#8e94ad]">{o.risk_tier}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-2 py-4 text-center text-[#4a5070]">
                        Click 'Run Case 2' to generate live data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => navigate('/projects/PRJ-DEMO-ESCALATE-02')}
              className="text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              Open Project Details <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
