import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  AlertTriangle,
  Coins,
  Calendar,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { getProjectDetails, getProjectReplay } from '../api';
import type { ProjectDetail, ProjectReplay, RiskTier } from '../types';

export const ProjectConsole: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [replay, setReplay] = useState<ProjectReplay | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    Promise.all([getProjectDetails(projectId), getProjectReplay(projectId)])
      .then(([details, rep]) => {
        setProject(details);
        setReplay(rep);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load project details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <div className="dot-live" style={{ width: '12px', height: '12px' }} />
        <p className="font-mono text-secondary">Reconstructing Point-in-Time Trajectory for {projectId}...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="panel" style={{ borderLeft: '4px solid var(--risk-escalate)', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <AlertTriangle color="var(--risk-escalate)" size={20} />
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Project Not Found</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {error || `Project ID '${projectId}' could not be resolved in the longitudinal database.`}
        </p>
        <Link to="/" className="btn btn-secondary" style={{ fontSize: '13px' }}>
          <ArrowLeft size={14} /> Back to Command Center
        </Link>
      </div>
    );
  }

  const getTierColor = (tier: RiskTier) => {
    switch (tier) {
      case 'ESCALATE': return 'var(--risk-escalate)';
      case 'REVIEW': return 'var(--risk-review)';
      case 'WATCH': return 'var(--risk-watch)';
      default: return 'var(--risk-normal)';
    }
  };

  const getTierBadge = (tier: RiskTier) => {
    switch (tier) {
      case 'ESCALATE': return <span className="tier-badge tier-escalate">ESCALATE</span>;
      case 'REVIEW': return <span className="tier-badge tier-review">REVIEW</span>;
      case 'WATCH': return <span className="tier-badge tier-watch">WATCH</span>;
      default: return <span className="tier-badge tier-normal">NORMAL</span>;
    }
  };

  // Trajectory timeline data for charts
  const timelineData = (replay?.timeline || []).map((rec) => ({
    month: rec.reporting_month,
    prob: rec.pred_prob !== null ? Math.round(rec.pred_prob * 1000) / 10 : null,
    c_base: rec.C_base,
    expenditure: rec.expenditure,
    fin_prog: rec.financial_progress,
    sch_dev: rec.schedule_deviation_months,
    tier: rec.risk_tier,
    alert: rec.alert,
    actual_event: rec.actual_event
  }));

  const hasScheduleData = timelineData.some((d) => d.sch_dev !== null && !isNaN(d.sch_dev));

  return (
    <div>
      {/* Back button & Breadcrumb */}
      <div style={{ marginBottom: '16px' }}>
        <Link to="/" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
          <ArrowLeft size={14} /> Back to Command Center
        </Link>
      </div>

      {/* Screen 2 Header */}
      <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="font-mono text-cyan" style={{ fontSize: '14px', fontWeight: 600 }}>
                {project.project_id}
              </span>
              <span style={{ color: 'var(--border-strong)' }}>|</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {project.sector}
              </span>
              <span style={{ color: 'var(--border-strong)' }}>|</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                State: {project.state || 'National / Multi-State'}
              </span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '850px', lineHeight: 1.3 }}>
              {project.project_name}
            </h1>
            <div style={{ display: 'flex', gap: '24px', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div>Ministry / Agency: <strong style={{ color: 'var(--text-primary)' }}>{project.ministry || 'N/A'}</strong></div>
              <div>Timeline Span: <span className="font-mono">{project.start_month}</span> to <span className="font-mono">{project.end_month}</span></div>
              <div>Observations: <span className="font-mono">{project.total_observations}</span> months</div>
            </div>
          </div>

          {/* Primary Action Button: Replay History */}
          <button
            onClick={() => navigate(`/projects/${project.project_id}/replay`)}
            className="btn btn-replay-large"
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <Play size={18} fill="#ffffff" />
            REPLAY HISTORY
          </button>
        </div>
      </div>

      {/* Hero Grid: Current Risk Panel + Why Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(400px, 2fr)', gap: '20px', marginBottom: '28px' }}>
        {/* Hero Risk Panel */}
        <div className="panel" style={{
          margin: 0,
          borderLeft: `4px solid ${getTierColor(project.current_risk_tier)}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div className="panel-title" style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Current Point-in-Time Risk
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <div style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: getTierColor(project.current_risk_tier), lineHeight: 1 }}>
                {(project.latest_prediction.pred_prob * 100).toFixed(1)}%
              </div>
              <div>
                {getTierBadge(project.current_risk_tier)}
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
              Calibrated 12-month forward probability of cost escalation &ge; 5% or schedule slippage &ge; 6 months.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            <div>
              <div className="text-muted">Current Baseline</div>
              <div className="font-mono text-primary font-semibold">₹{project.current_trajectory_metrics.C_base.toLocaleString()} Cr</div>
            </div>
            <div>
              <div className="text-muted">Cumulative Exp.</div>
              <div className="font-mono text-primary font-semibold">₹{project.current_trajectory_metrics.expenditure.toLocaleString()} Cr</div>
            </div>
            <div>
              <div className="text-muted">Financial Progress</div>
              <div className="font-mono text-primary font-semibold">{project.current_trajectory_metrics.financial_progress.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-muted">Kinematic Velocity</div>
              <div className="font-mono text-primary font-semibold">
                {project.current_trajectory_metrics.V_fin_1m !== null ? `${project.current_trajectory_metrics.V_fin_1m.toFixed(2)}%/mo` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* WHY IS VIGIL FLAGGING THIS PROJECT? */}
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title" style={{ color: 'var(--accent-cyan)' }}>
                WHY IS VIGIL FLAGGING THIS PROJECT?
              </div>
              <div className="panel-subtitle">
                Deterministic TreeSHAP feature contributions derived from point-in-time observations
              </div>
            </div>
          </div>

          <div>
            {project.top_explanations && project.top_explanations.length > 0 ? (
              project.top_explanations.slice(0, 3).map((exp, idx) => (
                <div key={idx} className="why-item">
                  <div className="why-rank">{idx + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div className="why-text">{exp.explanation}</div>
                    <div className="why-meta">
                      Feature: <code>{exp.feature}</code> | SHAP Contribution: <span style={{ color: exp.contribution > 0 ? 'var(--risk-escalate)' : 'var(--risk-normal)' }}>
                        {exp.contribution > 0 ? `+${exp.contribution}` : exp.contribution}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', padding: '16px 0', fontSize: '13px' }}>
                No active risk elevation factors flagged for this observation period.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trajectory Overview Chart */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--accent-cyan)" />
              Trajectory Risk Overview
            </div>
            <div className="panel-subtitle">
              Point-in-time calibrated risk probability across longitudinal observation history
            </div>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', background: 'var(--risk-watch)' }} /> WATCH (40%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', background: 'var(--risk-review)' }} /> REVIEW (45%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', background: 'var(--risk-escalate)' }} /> ESCALATE (50%)
            </span>
          </div>
        </div>

        <div style={{ height: '320px', width: '100%', marginTop: '12px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="%" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="custom-tooltip">
                        <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '4px' }}>Month: {label}</div>
                        <div style={{ color: '#38bdf8' }}>Risk Probability: {d.prob}%</div>
                        <div style={{ color: getTierColor(d.tier) }}>Tier: {d.tier}</div>
                        {d.actual_event && <div style={{ color: '#ef4444', fontWeight: 700, marginTop: '4px' }}>Actual Deterioration Recorded</div>}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={40} stroke="var(--risk-watch)" strokeDasharray="4 4" label={{ value: 'WATCH 40%', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={45} stroke="var(--risk-review)" strokeDasharray="4 4" label={{ value: 'REVIEW 45%', fill: '#f97316', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={50} stroke="var(--risk-escalate)" strokeDasharray="4 4" label={{ value: 'ESCALATE 50%', fill: '#ef4444', fontSize: 10, position: 'right' }} />
              <Line
                type="monotone"
                dataKey="prob"
                name="Risk Probability"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0f172a', stroke: '#38bdf8', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#38bdf8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Financial Trajectory + Schedule Trajectory */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(350px, 1fr)', gap: '20px' }}>
        {/* Financial Trajectory Chart */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coins size={16} color="var(--accent-cyan)" />
                Financial Trajectory
              </div>
              <div className="panel-subtitle">Baseline cost vs cumulative expenditure (₹ Cr)</div>
            </div>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="custom-tooltip">
                          <div style={{ color: '#f8fafc', fontWeight: 600 }}>{label}</div>
                          <div>Baseline C_base: ₹{d.c_base?.toLocaleString()} Cr</div>
                          <div style={{ color: '#3b82f6' }}>Expenditure: ₹{d.expenditure?.toLocaleString()} Cr</div>
                          {d.fin_prog && <div>Financial Progress: {d.fin_prog}%</div>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="c_base" stroke="#94a3b8" fill="#1e293b" fillOpacity={0.4} name="Baseline Cost" />
                <Area type="monotone" dataKey="expenditure" stroke="#3b82f6" fill="#1d4ed8" fillOpacity={0.3} name="Cumulative Expenditure" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Schedule Trajectory Chart */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="var(--accent-cyan)" />
                Schedule Trajectory
              </div>
              <div className="panel-subtitle">Reported schedule deviation over time (Months)</div>
            </div>
          </div>

          {hasScheduleData ? (
            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} unit="m" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="custom-tooltip">
                            <div>Month: {label}</div>
                            <div style={{ color: '#f59e0b' }}>Schedule Deviation: {d.sch_dev} months</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="sch_dev" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Schedule Deviation" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{
              height: '240px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-panel)',
              borderRadius: '4px',
              border: '1px dashed var(--border-strong)',
              color: 'var(--text-muted)',
              fontSize: '13px',
              gap: '8px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <HelpCircle size={24} color="var(--text-muted)" />
              <div>Schedule evidence unavailable for this period.</div>
              <div style={{ fontSize: '11px', maxWidth: '300px' }}>
                Ministry reports for this project did not record completion milestones or schedule deviation fields during early reporting phases.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
