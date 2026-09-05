import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Clock,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { getProjectReplay } from '../api';
import type { ProjectReplay, ReplayRecord, RiskTier } from '../types';

export const HistoricalReplay: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [replay, setReplay] = useState<ProjectReplay | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Playback state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1); // 1x, 2x, 4x
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    getProjectReplay(projectId)
      .then((data) => {
        setReplay(data);
        setCurrentIndex(0);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load historical replay.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId]);

  // Handle playback interval
  useEffect(() => {
    if (isPlaying && replay && replay.timeline.length > 0) {
      const intervalMs = Math.max(250, 900 / playSpeed);
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < replay.timeline.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, replay, playSpeed]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <div className="dot-live" style={{ width: '12px', height: '12px' }} />
        <p className="font-mono text-secondary">Loading Full Point-in-Time Historical Replay for {projectId}...</p>
      </div>
    );
  }

  if (error || !replay) {
    return (
      <div className="panel" style={{ borderLeft: '4px solid var(--risk-escalate)', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <AlertTriangle color="var(--risk-escalate)" size={20} />
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Replay Unavailable</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
        <Link to={`/projects/${projectId}`} className="btn btn-secondary" style={{ fontSize: '13px' }}>
          <ArrowLeft size={14} /> Back to Project Console
        </Link>
      </div>
    );
  }

  const timeline = replay.timeline;
  const currentRecord: ReplayRecord | undefined = timeline[currentIndex];

  // Full timeline chart data with point-in-time progression
  const chartData = timeline.map((rec, idx) => ({
    month: rec.reporting_month,
    // Active line shows data strictly up to currentIndex (point-in-time perspective)
    activeProb: idx <= currentIndex && rec.pred_prob !== null ? Math.round(rec.pred_prob * 1000) / 10 : null,
    // Full background ghost curve for reference
    ghostProb: rec.pred_prob !== null ? Math.round(rec.pred_prob * 1000) / 10 : null,
    c_base: rec.C_base,
    expenditure: rec.expenditure,
    tier: rec.risk_tier,
    alert: rec.alert,
    actual_event: rec.actual_event
  }));

  const firstAlert = replay.first_alert;
  const actualEvent = replay.actual_deterioration_event;

  const hasFirstAlertPassed = firstAlert && currentRecord && currentRecord.reporting_month >= firstAlert.alert_month;
  const hasEventPassed = actualEvent && currentRecord && currentRecord.reporting_month >= actualEvent.event_month;

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

  return (
    <div>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Link to={`/projects/${projectId}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
          <ArrowLeft size={14} /> Back to Project Console
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-mono text-xs text-muted">POINT-IN-TIME REPLAY ENGINE</span>
        </div>
      </div>

      {/* Replay Header */}
      <div className="panel" style={{ padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="brand-badge" style={{ fontSize: '11px', padding: '2px 8px' }}>HISTORICAL REPLAY</span>
              <span className="font-mono text-cyan" style={{ fontSize: '13px' }}>{replay.project_id}</span>
              <span style={{ color: 'var(--border-strong)' }}>|</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{replay.sector}</span>
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {replay.project_name}
            </h1>
          </div>

          {/* Warning Lead Time Banner */}
          {replay.lead_time !== null && (
            <div style={{
              background: '#0d1d33',
              border: '1px solid #1e40af',
              borderRadius: '6px',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Validated Warning Lead Time
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', lineHeight: 1.1 }}>
                  {replay.lead_time} MONTHS
                </div>
              </div>
              <Clock size={28} color="var(--accent-cyan)" />
            </div>
          )}
        </div>
      </div>

      {/* Main Playback HUD: Current Step Telemetry */}
      {currentRecord && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {/* Month & Playback Step */}
          <div className="kpi-card" style={{ padding: '12px 16px' }}>
            <div className="kpi-label">Observation Month</div>
            <div className="kpi-value" style={{ fontSize: '20px' }}>{currentRecord.reporting_month}</div>
            <div className="kpi-subtext">Step {currentIndex + 1} of {timeline.length}</div>
          </div>

          {/* Calibrated Risk */}
          <div className="kpi-card" style={{ padding: '12px 16px', borderLeft: `3px solid ${getTierColor(currentRecord.risk_tier)}` }}>
            <div className="kpi-label">Risk Probability</div>
            <div className="kpi-value" style={{ fontSize: '20px', color: getTierColor(currentRecord.risk_tier) }}>
              {(currentRecord.pred_prob * 100).toFixed(1)}%
            </div>
            <div className="kpi-subtext">{getTierBadge(currentRecord.risk_tier)}</div>
          </div>

          {/* Milestone Status */}
          <div className="kpi-card" style={{ padding: '12px 16px' }}>
            <div className="kpi-label">Milestone State</div>
            {hasEventPassed ? (
              <div>
                <span className="tier-badge tier-escalate" style={{ fontSize: '11px' }}>ACTUAL DETERIORATION</span>
                <div className="text-xs text-muted" style={{ marginTop: '4px' }}>Recorded at {actualEvent?.event_month}</div>
              </div>
            ) : hasFirstAlertPassed ? (
              <div>
                <span className="tier-badge tier-watch" style={{ fontSize: '11px' }}>VIGIL ALERT ACTIVE</span>
                <div className="text-xs text-muted" style={{ marginTop: '4px' }}>Triggered at {firstAlert?.alert_month}</div>
              </div>
            ) : (
              <div>
                <span className="tier-badge tier-normal" style={{ fontSize: '11px' }}>PRE-ALERT BASELINE</span>
                <div className="text-xs text-muted" style={{ marginTop: '4px' }}>Normal trajectory</div>
              </div>
            )}
          </div>

          {/* Baseline Cost */}
          <div className="kpi-card" style={{ padding: '12px 16px' }}>
            <div className="kpi-label">Baseline C_base</div>
            <div className="kpi-value" style={{ fontSize: '18px' }}>₹{currentRecord.C_base.toLocaleString()} Cr</div>
            <div className="kpi-subtext">Cumulative: ₹{currentRecord.expenditure.toLocaleString()} Cr</div>
          </div>
        </div>
      )}

      {/* Main Interactive Replay Chart */}
      <div className="panel" style={{ padding: '20px 24px', marginBottom: '20px' }}>
        <div className="panel-header">
          <div>
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--accent-cyan)" />
              Replay Trajectory Timeline (Point-in-Time)
            </div>
            <div className="panel-subtitle">
              Animate longitudinal progression month-by-month without future leakage
            </div>
          </div>

          {/* Status Badges on Chart */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {hasFirstAlertPassed && (
              <span className="tier-badge tier-watch" style={{ animation: 'pulse 2s infinite' }}>
                ALERT: {firstAlert?.alert_month} ({firstAlert?.risk_tier})
              </span>
            )}
            {hasEventPassed && (
              <span className="tier-badge tier-escalate">
                DETERIORATION: {actualEvent?.event_month}
              </span>
            )}
          </div>
        </div>

        {/* Large Chart Canvas */}
        <div style={{ height: '360px', width: '100%', marginTop: '12px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="%" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="custom-tooltip">
                        <div style={{ color: '#f8fafc', fontWeight: 600 }}>Month: {label}</div>
                        <div style={{ color: '#38bdf8' }}>Point-in-Time Risk: {d.ghostProb}%</div>
                        <div style={{ color: getTierColor(d.tier) }}>Tier: {d.tier}</div>
                        {d.actual_event && <div style={{ color: '#ef4444', fontWeight: 700 }}>Formal Deterioration Point</div>}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={40} stroke="var(--risk-watch)" strokeDasharray="4 4" label={{ value: 'WATCH 40%', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={45} stroke="var(--risk-review)" strokeDasharray="4 4" label={{ value: 'REVIEW 45%', fill: '#f97316', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={50} stroke="var(--risk-escalate)" strokeDasharray="4 4" label={{ value: 'ESCALATE 50%', fill: '#ef4444', fontSize: 10, position: 'right' }} />

              {/* Ghost curve (complete timeline) */}
              <Line
                type="monotone"
                dataKey="ghostProb"
                stroke="#334155"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
                name="Complete Trajectory"
              />

              {/* Active Point-in-Time Curve (advances with playback) */}
              <Line
                type="monotone"
                dataKey="activeProb"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 3, fill: '#0f172a', stroke: '#38bdf8', strokeWidth: 2 }}
                name="Replayed Trajectory"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Playback Controls & Slider */}
        <div style={{
          background: 'var(--bg-panel)',
          borderRadius: '6px',
          padding: '16px 20px',
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="font-mono text-xs text-muted" style={{ minWidth: '60px' }}>
              {timeline[0]?.reporting_month}
            </span>
            <input
              type="range"
              min={0}
              max={timeline.length - 1}
              value={currentIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentIndex(Number(e.target.value));
              }}
              style={{ flex: 1, accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <span className="font-mono text-xs text-muted" style={{ minWidth: '60px', textAlign: 'right' }}>
              {timeline[timeline.length - 1]?.reporting_month}
            </span>
          </div>

          {/* Control Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isPlaying ? (
                <button
                  onClick={() => setIsPlaying(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  <Pause size={16} /> Pause
                </button>
              ) : (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  <Play size={16} fill="#ffffff" /> Play
                </button>
              )}

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentIndex(0);
                }}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '13px' }}
                title="Restart replay from beginning"
              >
                <RotateCcw size={15} /> Restart
              </button>
            </div>

            {/* Speed Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="text-xs text-muted font-mono">SPEED:</span>
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaySpeed(spd)}
                  className={`btn ${playSpeed === spd ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Current Month TreeSHAP Explanation Card */}
      {currentRecord && (
        <div className="panel" style={{ marginBottom: '20px' }}>
          <div className="panel-header">
            <div>
              <div className="panel-title" style={{ color: 'var(--accent-cyan)' }}>
                Point-in-Time Explanation at {currentRecord.reporting_month}
              </div>
              <div className="panel-subtitle">
                Deterministic TreeSHAP factor contributions informing this specific monthly risk score
              </div>
            </div>
          </div>

          <div>
            {currentRecord.top_explanations && currentRecord.top_explanations.length > 0 ? (
              currentRecord.top_explanations.map((exp, idx) => (
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
              <div style={{ color: 'var(--text-muted)', padding: '12px 0', fontSize: '13px' }}>
                All kinematic features within baseline tolerances at this observation month.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Replay Narrative Box: WHAT HAPPENED? */}
      <div className="narrative-box">
        <div className="narrative-title">
          <Info size={16} />
          WHAT HAPPENED? — REPLAY AUDIT NARRATIVE
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          {firstAlert ? (
            <div className="narrative-step">
              <span className="dot-live" style={{ background: 'var(--risk-watch)', boxShadow: 'none' }} />
              <span>
                VIGIL first raised an early-warning alert in{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{firstAlert.alert_month}</strong>{' '}
                at <strong style={{ color: getTierColor(firstAlert.risk_tier) }}>{firstAlert.risk_tier}</strong>{' '}
                tier (calibrated probability: <span className="font-mono">{(firstAlert.pred_prob * 100).toFixed(1)}%</span>).
              </span>
            </div>
          ) : (
            <div className="narrative-step">
              <span className="dot-live" style={{ background: 'var(--risk-normal)', boxShadow: 'none' }} />
              <span>No early warning alert threshold was crossed during this project's observed history.</span>
            </div>
          )}

          {actualEvent ? (
            <div className="narrative-step">
              <span className="dot-live" style={{ background: 'var(--risk-escalate)', boxShadow: 'none' }} />
              <span>
                Formal deterioration was recorded in{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{actualEvent.event_month}</strong>:{' '}
                {actualEvent.reasons.join('; ')}.
              </span>
            </div>
          ) : (
            <div className="narrative-step">
              <span className="dot-live" style={{ background: 'var(--text-muted)', boxShadow: 'none' }} />
              <span>No qualifying deterioration event (&ge; 5% cost escalation or &ge; 6 months delay jump) was recorded.</span>
            </div>
          )}

          {replay.lead_time !== null && (
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '6px',
              padding: '12px 16px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Actionable Early-Warning Lead Time:
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px' }}>
                  VIGIL alerted <strong style={{ color: 'var(--accent-cyan)' }}>{replay.lead_time} months</strong> before the formal deterioration event was officially registered in Ministry reports.
                </div>
              </div>
              <div className="lead-time-highlight">
                {replay.lead_time} Mo
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
