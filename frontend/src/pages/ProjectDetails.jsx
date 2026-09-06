import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import {
  getMonitoredProject,
  getMonitoredProjectStatus,
  getMonitoredProjectObservations,
  getMonitoredProjectWarnings,
  getMonitoredProjectAudit,
  getProjectDetail,
  getProjectReplay,
  formatINR,
  formatPercent,
  formatDelayMonths
} from '../services/api';
import ObservationModal from '../components/modals/ObservationModal';
import WarningResponseModal from '../components/modals/WarningResponseModal';
import { ArrowLeft, Plus, MessageSquare, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOperational, setIsOperational] = useState(false);

  // Project state
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState(null);
  const [observations, setObservations] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);

  // Modals
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);

  const fetchProjectData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Try operational monitoring
      try {
        const [projRes, statusRes, obsRes, warnRes, auditRes] = await Promise.all([
          getMonitoredProject(id),
          getMonitoredProjectStatus(id).catch(() => null),
          getMonitoredProjectObservations(id).catch(() => ({ observations: [] })),
          getMonitoredProjectWarnings(id).catch(() => ({ warnings: [] })),
          getMonitoredProjectAudit(id).catch(() => ({ audit_events: [] })),
        ]);

        setIsOperational(true);
        setProject(projRes);
        setStatus(statusRes);
        setObservations(obsRes?.observations || []);
        setWarnings(warnRes?.warnings || []);
        setAuditEvents(auditRes?.audit_events || []);
        setLoading(false);
        return;
      } catch {
        // Fall back to historical portfolio
      }

      // 2. Historical portfolio fallback
      const [histDetail, histReplay] = await Promise.all([
        getProjectDetail(id),
        getProjectReplay(id),
      ]);

      setIsOperational(false);
      setProject({
        project_id: histDetail.project_id,
        project_name: histDetail.project_name,
        sector: histDetail.sector,
        ministry: histDetail.ministry,
        state: histDetail.state,
        sanctioned_cost: histDetail.approved_cost || histDetail.current_trajectory_metrics?.C_base || 0,
        current_status: 'ACTIVE',
        initial_reporting_month: histDetail.start_month,
      });

      const timeline = histReplay?.timeline || [];
      setObservations(
        timeline.map((t) => ({
          reporting_month: t.reporting_month,
          financial_progress: t.financial_progress,
          physical_progress: null,
          cumulative_expenditure: t.expenditure,
          schedule_deviation_months: t.schedule_deviation_months,
          pred_prob: t.pred_prob,
          risk_tier: t.risk_tier,
          trajectory_status: 'SUFFICIENT_HISTORY',
          top_factors_json: JSON.stringify(t.top_explanations || []),
        }))
      );

      setAuditEvents([
        {
          event_id: 'AUDIT-HIST-01',
          event_type: 'ARCHIVE_RECORD_LOADED',
          performed_by: 'HISTORICAL_ARCHIVE',
          timestamp: histDetail.start_month,
          payload_json: JSON.stringify({ notes: 'Point-in-time timeline reconstructed from official repository' }),
        },
      ]);
    } catch (err) {
      setError(err.message || `Failed to load project '${id}'.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-[#6b7194]">
        <p className="text-xs font-mono">Loading telemetry for project: {id}...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center border border-[#262a3a] bg-[#161922] rounded mt-12">
        <h2 className="text-sm font-semibold text-[#eef0f6]">Project Not Found</h2>
        <p className="text-xs text-[#6b7194] mt-1.5">{error || `Project ID '${id}' not in registry.`}</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-[#0f1117] rounded transition-colors"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const latestObs = observations.length > 0 ? observations[observations.length - 1] : null;
  const currentRisk = status?.current_risk ?? latestObs?.pred_prob ?? null;
  const currentRiskTier = status?.risk_tier ?? latestObs?.risk_tier ?? 'NORMAL';
  const rawGov = status?.status ?? project?.current_status ?? 'ACTIVE';

  const hasWarning = rawGov === 'WARNING_ISSUED' || warnings.length > 0;
  const isUnderRecovery = rawGov === 'UNDER_RECOVERY' || rawGov === 'CONTRACTOR_RESPONDED';
  const isRecovered = rawGov === 'RECOVERED';
  const isEscalated = rawGov === 'ESCALATED';

  const activeWarning = warnings.find((w) => w.status === 'ISSUED') || (warnings.length > 0 ? warnings[warnings.length - 1] : null);
  const canRespondToWarning = isOperational && activeWarning && activeWarning.status === 'ISSUED';

  // Parse evidence / risk drivers (strictly deterministic TreeSHAP)
  let riskDrivers = [];
  try {
    if (latestObs?.top_factors_json) {
      riskDrivers = JSON.parse(latestObs.top_factors_json);
    } else if (status?.active_warning?.top_factors) {
      riskDrivers = status.active_warning.top_factors;
    }
  } catch {
    riskDrivers = [];
  }

  // Trajectory direction
  let trajectoryLabel = 'Stable';
  if (observations.length >= 2) {
    const prev = observations[observations.length - 2];
    if (latestObs?.pred_prob > prev.pred_prob + 0.02) {
      trajectoryLabel = '↓ Deteriorating';
    } else if (latestObs?.pred_prob < prev.pred_prob - 0.02) {
      trajectoryLabel = '↑ Improving';
    }
  } else if (isRecovered) {
    trajectoryLabel = '↑ Improving';
  } else if (hasWarning || isEscalated) {
    trajectoryLabel = '↓ Deteriorating';
  }

  // Build chart dataset with annotated milestones
  const chartData = observations.map((obs, idx) => {
    const riskPct = obs.pred_prob !== null && obs.pred_prob !== undefined
      ? parseFloat((obs.pred_prob * 100).toFixed(2))
      : null;

    let milestoneLabel = null;
    if (warnings.some((w) => w.reporting_month === obs.reporting_month)) {
      milestoneLabel = 'Warning Issued';
    } else if (isRecovered && idx === observations.length - 1) {
      milestoneLabel = 'Recovered';
    } else if (isEscalated && idx === observations.length - 1) {
      milestoneLabel = 'Escalated';
    } else if (obs.schedule_deviation_months && obs.schedule_deviation_months >= 36 && idx === 2) {
      milestoneLabel = 'Deterioration';
    }

    return {
      month: obs.reporting_month,
      risk: riskPct,
      fin_progress: obs.financial_progress ?? null,
      delay_months: obs.schedule_deviation_months ?? null,
      milestoneLabel,
    };
  });

  return (
    <div className="p-6 space-y-5 min-w-0">
      {/* Top back navigation */}
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1 text-xs text-[#6b7194] hover:text-[#eef0f6] transition-colors"
        >
          <ArrowLeft size={13} /> Back to Projects
        </button>
      </div>

      {/* Project Identity & Health Strip */}
      <div className="bg-[#161922] border border-[#262a3a] rounded p-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          {/* Left: Info */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h2 className="text-base font-semibold text-[#eef0f6] tracking-tight">{project.project_name}</h2>
              <span className="font-mono text-xs text-amber-500">{project.project_id}</span>
            </div>
            <p className="text-xs text-[#6b7194] leading-relaxed">
              {project.sector || 'Sector unspecified'} · Sanctioned Baseline: <strong className="font-mono text-[#eef0f6]">{formatINR(project.sanctioned_cost)}</strong>
              {project.ministry && ` · Ministry: ${project.ministry}`}
              {project.contractor && ` · Contractor: ${project.contractor}`}
            </p>
          </div>

          {/* Right: Model & Governance status */}
          <div className="flex flex-wrap items-center gap-6 border-t lg:border-t-0 lg:border-l border-[#262a3a] pt-4 lg:pt-0 lg:pl-6 text-xs flex-shrink-0">
            {/* Model Risk Card */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6b7194]">
                Model Calibrated Risk
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-lg font-bold text-[#eef0f6]">
                  {formatPercent(currentRisk, 2)}
                </span>
                <span className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                  currentRisk >= 0.50
                    ? 'text-red-400 bg-red-950/50 border border-red-800/40'
                    : currentRisk >= 0.40
                    ? 'text-amber-400 bg-amber-950/50 border border-amber-800/40'
                    : 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/40'
                }`}>
                  {currentRiskTier}
                </span>
              </div>
              <p className="text-[10px] text-[#6b7194] font-mono">Trajectory: {trajectoryLabel}</p>
            </div>

            <div className="h-9 w-px bg-[#262a3a] hidden sm:block" />

            {/* Governance Card */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6b7194]">
                Governance State
              </span>
              <div>
                {isEscalated ? (
                  <span className="font-mono text-xs font-semibold text-red-400 bg-red-950/50 px-2 py-0.5 rounded border border-red-800/40">
                    AUTHORITY ESCALATION
                  </span>
                ) : isRecovered ? (
                  <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                    RECOVERED
                  </span>
                ) : isUnderRecovery ? (
                  <span className="font-mono text-xs font-semibold text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded border border-blue-800/40">
                    UNDER RECOVERY
                  </span>
                ) : hasWarning ? (
                  <span className="font-mono text-xs font-semibold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                    CONTRACTOR WARNING
                  </span>
                ) : (
                  <span className="font-mono text-xs font-medium text-[#c8ccd8] bg-[#1a1d2e] px-2 py-0.5 rounded border border-[#262a3a]">
                    Active Surveillance
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#6b7194]">
                {isEscalated
                  ? 'Authority dossier issued'
                  : hasWarning
                  ? 'Contractor corrective-action window'
                  : isRecovered
                  ? 'Metrics verified below threshold'
                  : 'Standard monthly reporting'}
              </p>
            </div>

            {/* Actions */}
            {isOperational && (
              <div className="flex items-center gap-2">
                {canRespondToWarning && (
                  <button
                    onClick={() => {
                      setSelectedWarning(activeWarning);
                      setShowResponseModal(true);
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-[#0f1117] rounded transition-colors"
                  >
                    Log Response
                  </button>
                )}
                <button
                  onClick={() => setShowObservationModal(true)}
                  className="px-3 py-1.5 text-xs font-medium bg-[#1a1d2e] hover:bg-[#252a42] border border-[#262a3a] text-[#eef0f6] rounded transition-colors flex items-center gap-1"
                >
                  <Plus size={12} /> Observation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trajectory Time-Series Chart */}
      <div className="bg-[#161922] border border-[#262a3a] rounded p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262a3a] pb-3">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#eef0f6]">
              Project Trajectory Over Time
            </h3>
            <p className="text-[11px] text-[#6b7194] mt-0.5">
              Calibrated deterioration probability and reporting milestones across monthly observation cycles
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-[#eef0f6]">
              <span className="w-2.5 h-0.5 bg-amber-500 inline-block" /> Risk %
            </span>
            <span className="text-amber-500">-- WATCH (40%)</span>
            <span className="text-orange-500">-- REVIEW (45%)</span>
            <span className="text-red-500">-- ESCALATE (50%)</span>
          </div>
        </div>

        {/* Large Chart */}
        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2235" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#6b7194' }}
                  axisLine={{ stroke: '#262a3a' }}
                />
                <YAxis
                  domain={[30, 75]}
                  tick={{ fontSize: 11, fill: '#6b7194' }}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={{ stroke: '#262a3a' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#0b0d14] border border-[#262a3a] text-[#c8ccd8] p-3 rounded text-xs font-mono space-y-1.5 shadow-xl">
                        <p className="font-bold text-[#eef0f6] border-b border-[#1e2235] pb-1">{label}</p>
                        <p>Calibrated Risk: <strong className="text-amber-400">{d.risk}%</strong></p>
                        {d.fin_progress !== null && <p>Financial Progress: {d.fin_progress}%</p>}
                        {d.delay_months !== null && <p>Schedule Delay: {formatDelayMonths(d.delay_months)}</p>}
                        {d.milestoneLabel && (
                          <p className="text-red-400 font-bold border-t border-[#1e2235] pt-1 mt-1">
                            {d.milestoneLabel}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />

                <ReferenceLine y={40} stroke="#d97706" strokeDasharray="3 3" />
                <ReferenceLine y={45} stroke="#ea580c" strokeDasharray="3 3" />
                <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" />

                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const isEsc = payload.milestoneLabel === 'Escalated' || (payload.risk && payload.risk >= 60);
                    const isWarn = payload.milestoneLabel === 'Warning Issued';
                    const fill = isEsc ? '#ef4444' : isWarn ? '#f59e0b' : '#d97706';
                    return (
                      <circle
                        key={props.key}
                        cx={cx}
                        cy={cy}
                        r={payload.milestoneLabel ? 6 : 3.5}
                        fill={fill}
                        stroke="#0f1117"
                        strokeWidth={2}
                      />
                    );
                  }}
                />

                {chartData.map((pt) => {
                  if (!pt.milestoneLabel) return null;
                  return (
                    <ReferenceDot
                      key={pt.month}
                      x={pt.month}
                      y={pt.risk}
                      r={0}
                      label={{
                        value: pt.milestoneLabel,
                        position: 'top',
                        fill: pt.milestoneLabel === 'Escalated' ? '#ef4444' : '#c8ccd8',
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    />
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#4a5070]">
              No longitudinal observations recorded.
            </div>
          )}
        </div>

        {/* Chart KPI Footer */}
        <div className="pt-3 border-t border-[#262a3a] flex flex-wrap items-center gap-x-8 gap-y-1.5 text-xs text-[#6b7194] font-mono">
          <span>Obs Count: <strong className="text-[#eef0f6]">{observations.length}</strong></span>
          <span>Latest Month: <strong className="text-[#eef0f6]">{latestObs?.reporting_month || '—'}</strong></span>
          <span>Sanction Delay: <strong className="text-[#eef0f6]">{formatDelayMonths(latestObs?.schedule_deviation_months)}</strong></span>
          <span>Financial Spend: <strong className="text-[#eef0f6]">{formatINR(latestObs?.cumulative_expenditure)}</strong></span>
        </div>
      </div>

      {/* Two Columns: Risk Drivers (TreeSHAP) & Governance Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: TreeSHAP */}
        <div className="lg:col-span-6 bg-[#161922] border border-[#262a3a] rounded p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#262a3a] pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#eef0f6]">
              Evidence Contributing to Risk
            </h3>
            <span className="text-[10px] font-mono text-[#6b7194]">LightGBM TreeSHAP</span>
          </div>

          <div className="space-y-2 text-xs border-b border-[#262a3a] pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[#6b7194]">Schedule deviation</span>
              <span className="font-mono font-bold text-[#eef0f6]">
                {formatDelayMonths(latestObs?.schedule_deviation_months)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6b7194]">Financial velocity</span>
              <span className={`font-mono font-bold ${trajectoryLabel.includes('Deteriorating') ? 'text-red-400' : 'text-[#eef0f6]'}`}>
                {trajectoryLabel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6b7194]">Trajectory risk tier</span>
              <span className={`font-mono font-bold ${currentRiskTier === 'ESCALATE' ? 'text-red-400' : 'text-[#eef0f6]'}`}>
                {currentRiskTier} ({formatPercent(currentRisk)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6b7194]">Baseline capital scale</span>
              <span className="font-mono font-bold text-[#eef0f6]">
                {formatINR(project.sanctioned_cost)}
              </span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase text-[#6b7194] tracking-wider mb-2">
              Primary Risk Attributions:
            </p>
            {riskDrivers.length > 0 ? (
              <div className="space-y-2">
                {riskDrivers.map((driver, idx) => (
                  <div key={idx} className="p-2.5 border border-[#1e2235] bg-[#0f1117] rounded text-xs flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[#eef0f6]">
                        {driver.explanation || driver.feature}
                      </div>
                      <div className="font-mono text-[10px] text-[#6b7194] mt-0.5">
                        Feature: {driver.feature} · Observed: {String(driver.value)}
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-400 ml-3 whitespace-nowrap">
                      {driver.contribution !== undefined ? `${driver.contribution >= 0 ? '+' : ''}${driver.contribution.toFixed(3)}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#4a5070]">No anomalous risk drivers flagged for this observation.</p>
            )}
          </div>
        </div>

        {/* Right: Governance Timeline */}
        <div className="lg:col-span-6 bg-[#161922] border border-[#262a3a] rounded p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#262a3a] pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#eef0f6]">
              Governance Audit Ledger
            </h3>
            <span className="text-[10px] font-mono text-[#6b7194]">Audited Events</span>
          </div>

          <div className="divide-y divide-[#1e2235] text-xs font-mono max-h-72 overflow-y-auto">
            {auditEvents.length > 0 ? (
              auditEvents.map((evt, idx) => {
                let parsed = {};
                try {
                  parsed = typeof evt.payload_json === 'string' ? JSON.parse(evt.payload_json) : evt.payload_json;
                } catch {
                  parsed = {};
                }

                const isEsc = evt.event_type.includes('ESCALAT');
                const isWarn = evt.event_type.includes('WARNING');
                const isRec = evt.event_type.includes('RECOVERY');
                const isResp = evt.event_type.includes('RESPONSE');

                return (
                  <div key={evt.event_id || idx} className="py-2.5 flex items-start gap-3">
                    <span className="text-[#6b7194] text-[11px] whitespace-nowrap w-20 flex-shrink-0">
                      {evt.timestamp}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isEsc ? 'bg-red-500' : isWarn ? 'bg-amber-500' : isRec ? 'bg-emerald-500' : isResp ? 'bg-blue-500' : 'bg-[#6b7194]'
                          }`}
                        />
                        <span className={`font-semibold text-xs ${isEsc ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-[#eef0f6]'}`}>
                          {evt.event_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {parsed && (
                        <p className="text-[11px] text-[#8e94ad] mt-1 font-sans line-clamp-2">
                          {parsed.trigger_reason || parsed.reason || parsed.response_text || parsed.notes || JSON.stringify(parsed)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-[#4a5070] py-6 text-center">No governance events recorded.</div>
            )}
          </div>
        </div>
      </div>

      {/* Observations Log Table */}
      <div className="bg-[#161922] border border-[#262a3a] rounded overflow-hidden">
        <div className="px-5 py-3 border-b border-[#262a3a] bg-[#12141e] flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#eef0f6]">
            Longitudinal Observations Log
          </h3>
          <span className="text-[10px] font-mono text-[#6b7194]">{observations.length} Cycles</span>
        </div>

        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left text-[12px] border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#262a3a] text-[#6b7194] text-[11px] bg-[#12141e]">
                <th className="px-4 py-2.5 font-medium">MONTH</th>
                <th className="px-3 py-2.5 text-right font-medium">FIN. PROGRESS</th>
                <th className="px-3 py-2.5 text-right font-medium">EXPENDITURE</th>
                <th className="px-3 py-2.5 text-right font-medium">SCHEDULE DELAY</th>
                <th className="px-3 py-2.5 text-right font-medium">RISK PROBABILITY</th>
                <th className="px-4 py-2.5 font-medium">RISK TIER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2235] font-mono text-[11px]">
              {observations.map((obs, idx) => (
                <tr key={idx} className="hover:bg-[#1a1d2e] transition-colors">
                  <td className="px-4 py-2.5 font-bold text-[#eef0f6]">
                    {obs.reporting_month}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[#c8ccd8]">
                    {obs.financial_progress !== null ? formatPercent(obs.financial_progress) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[#c8ccd8]">
                    {obs.cumulative_expenditure !== null ? formatINR(obs.cumulative_expenditure) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[#c8ccd8]">
                    {obs.schedule_deviation_months !== null ? formatDelayMonths(obs.schedule_deviation_months) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-amber-400">
                    {formatPercent(obs.pred_prob, 2)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      obs.risk_tier === 'ESCALATE'
                        ? 'text-red-400 bg-red-950/50 border border-red-800/40 font-bold'
                        : obs.risk_tier === 'WATCH'
                        ? 'text-amber-400 bg-amber-950/50 border border-amber-800/40 font-medium'
                        : 'text-[#8e94ad] bg-[#0f1117] border border-[#262a3a]'
                    }`}>
                      {obs.risk_tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Observation Modal */}
      <ObservationModal
        isOpen={showObservationModal}
        onClose={() => setShowObservationModal(false)}
        projectId={project.project_id}
        projectName={project.project_name}
        latestMonth={latestObs?.reporting_month || project.initial_reporting_month}
        onSuccess={fetchProjectData}
      />

      {/* Contractor Response Modal */}
      <WarningResponseModal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        projectId={project.project_id}
        warning={selectedWarning}
        onSuccess={fetchProjectData}
      />
    </div>
  );
}
