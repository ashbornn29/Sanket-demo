import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Briefcase,
  ArrowRight,
  ShieldAlert,
  RefreshCw,
  Info
} from 'lucide-react';
import { getDashboardSummary, getInterventions } from '../api';
import type { DashboardSummary, InterventionItem, RiskTier } from '../types';

export const CommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [interventions, setInterventions] = useState<InterventionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [sectorFilter, setSectorFilter] = useState<string>('');
  const [minTierFilter, setMinTierFilter] = useState<string>('WATCH');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, intData] = await Promise.all([
        getDashboardSummary(),
        getInterventions(30, sectorFilter || undefined, minTierFilter || undefined)
      ]);
      setSummary(sumData);
      setInterventions(intData.projects);
    } catch (err: any) {
      setError(err.message || 'Failed to load command center data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sectorFilter, minTierFilter]);

  const filteredInterventions = interventions.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.project_id.toLowerCase().includes(term) ||
      item.project_name.toLowerCase().includes(term) ||
      item.sector.toLowerCase().includes(term) ||
      (item.state && item.state.toLowerCase().includes(term))
    );
  });

  const getTierBadge = (tier: RiskTier) => {
    switch (tier) {
      case 'ESCALATE':
        return <span className="tier-badge tier-escalate">ESCALATE</span>;
      case 'REVIEW':
        return <span className="tier-badge tier-review">REVIEW</span>;
      case 'WATCH':
        return <span className="tier-badge tier-watch">WATCH</span>;
      default:
        return <span className="tier-badge tier-normal">NORMAL</span>;
    }
  };

  // Indian currency formatting guideline:
  // < ₹1,000 Cr: ₹X.X Cr
  // ₹1,000–₹99,999 Cr: ₹X,XXX Cr
  // >= ₹1,00,000 Cr: ₹X.XX Lakh Cr
  const formatExposure = (val: number | undefined | null): string => {
    if (val === undefined || val === null || isNaN(val)) return '₹0.0 Cr';
    const absVal = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (absVal < 1000.0) {
      return `${sign}₹${absVal.toFixed(1)} Cr`;
    } else if (absVal < 100000.0) {
      return `${sign}₹${Math.round(absVal).toLocaleString()} Cr`;
    } else {
      const lakhCr = absVal / 100000.0;
      return `${sign}₹${lakhCr.toFixed(2)} Lakh Cr`;
    }
  };

  if (loading && !summary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <RefreshCw className="animate-spin" size={32} color="var(--accent-cyan)" />
        <p className="font-mono text-secondary">Loading Sanitized Portfolio Telemetry...</p>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="panel" style={{ borderLeft: '4px solid var(--risk-escalate)', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <AlertTriangle color="var(--risk-escalate)" size={20} />
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Backend Connection Error</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
        <button onClick={loadData} className="btn btn-primary" style={{ fontSize: '13px' }}>
          <RefreshCw size={14} /> Retry Connection
        </button>
      </div>
    );
  }

  const activeProjectTotal = summary?.active_project_count || summary?.total_projects || 2319;
  const normalCount = activeProjectTotal -
    ((summary?.watch_count || 0) + (summary?.review_count || 0) + (summary?.escalate_count || 0));

  return (
    <div>
      {/* Top Header Banner */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                className="font-mono text-xs"
                style={{
                  background: 'rgba(0, 229, 255, 0.1)',
                  color: 'var(--accent-cyan)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}
              >
                DATA THROUGH MAR 2025
              </span>
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                MoSPI Central Sector Telemetry
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              National Infrastructure Command Center
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
              Presentation-safe longitudinal early-warning risk monitoring across Indian Central Sector capital assets.
            </p>
          </div>
          <button onClick={loadData} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="kpi-grid">
        {/* KPI 1: Active Projects */}
        <div className="kpi-card">
          <div className="kpi-label">
            ACTIVE PROJECTS
            <Briefcase size={14} color="var(--text-muted)" />
          </div>
          <div className="kpi-value">
            {activeProjectTotal.toLocaleString()}
          </div>
          <div className="kpi-subtext" style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>
            Latest observation: 2024–2025
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: '4px' }}>
            Longitudinal archive: 2003–2025 ({summary?.archive_entity_count?.toLocaleString() || '115,693'} extracted identities)
          </div>
        </div>

        {/* KPI 2: Watch */}
        <div className="kpi-card watch-border">
          <div className="kpi-label">
            Watch
            <span className="font-mono text-xs" style={{ color: 'var(--risk-watch)' }}>&ge; 40%</span>
          </div>
          <div className="kpi-value" style={{ color: 'var(--risk-watch)' }}>
            {summary?.watch_count.toLocaleString() || '0'}
          </div>
          <div className="kpi-subtext">
            {summary ? ((summary.watch_count / activeProjectTotal) * 100).toFixed(1) : '0'}% of active portfolio
          </div>
        </div>

        {/* KPI 3: Review */}
        <div className="kpi-card review-border">
          <div className="kpi-label">
            Review
            <span className="font-mono text-xs" style={{ color: 'var(--risk-review)' }}>&ge; 45%</span>
          </div>
          <div className="kpi-value" style={{ color: 'var(--risk-review)' }}>
            {summary?.review_count.toLocaleString() || '0'}
          </div>
          <div className="kpi-subtext">
            {summary ? ((summary.review_count / activeProjectTotal) * 100).toFixed(1) : '0'}% of active portfolio
          </div>
        </div>

        {/* KPI 4: Escalate */}
        <div className="kpi-card escalate-border">
          <div className="kpi-label">
            Escalate
            <span className="font-mono text-xs" style={{ color: 'var(--risk-escalate)' }}>&ge; 50%</span>
          </div>
          <div className="kpi-value" style={{ color: 'var(--risk-escalate)' }}>
            {summary?.escalate_count.toLocaleString() || '0'}
          </div>
          <div className="kpi-subtext">
            {summary ? ((summary.escalate_count / activeProjectTotal) * 100).toFixed(1) : '0'}% of active portfolio
          </div>
        </div>

        {/* KPI 5: Active Capital Exposure */}
        <div className="kpi-card">
          <div className="kpi-label">
            ACTIVE CAPITAL EXPOSURE
            <TrendingUp size={14} color="var(--text-muted)" />
          </div>
          <div className="kpi-value">
            {formatExposure(summary?.active_baseline_exposure ?? summary?.total_baseline_exposure)}
          </div>
          <div className="kpi-subtext">
            {formatExposure(summary?.exposure_in_escalate)} in ESCALATE
          </div>
        </div>

        {/* KPI 6: Median Warning Lead */}
        <div className="kpi-card">
          <div className="kpi-label">
            Median Warning Lead
            <Clock size={14} color="var(--accent-cyan)" />
          </div>
          <div className="kpi-value text-cyan">
            {summary?.historical_median_warning_lead || summary?.median_warning_lead_time || 3.0} Mo
          </div>
          <div className="kpi-subtext">Validated historical benchmark</div>
        </div>
      </div>

      {/* Grid: Section A (Risk Distribution) + Section B (Sector Risk) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 1.6fr)', gap: '20px', marginBottom: '28px' }}>
        {/* Section A: Risk Distribution */}
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">Active Risk Distribution</div>
              <div className="panel-subtitle">Validated operational risk tiers for active projects (2024–2025)</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* ESCALATE */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                <span style={{ color: 'var(--risk-escalate)', fontWeight: 600 }}>ESCALATE (&ge; 50%)</span>
                <span className="font-mono text-primary">
                  {summary?.escalate_count.toLocaleString()} ({summary ? ((summary.escalate_count / activeProjectTotal) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${summary ? Math.min(100, (summary.escalate_count / activeProjectTotal) * 100) : 0}%`,
                    height: '100%',
                    background: 'var(--risk-escalate)'
                  }}
                />
              </div>
            </div>

            {/* REVIEW */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                <span style={{ color: 'var(--risk-review)', fontWeight: 600 }}>REVIEW (45% - 50%)</span>
                <span className="font-mono text-primary">
                  {summary?.review_count.toLocaleString()} ({summary ? ((summary.review_count / activeProjectTotal) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${summary ? Math.min(100, (summary.review_count / activeProjectTotal) * 100) : 0}%`,
                    height: '100%',
                    background: 'var(--risk-review)'
                  }}
                />
              </div>
            </div>

            {/* WATCH */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                <span style={{ color: 'var(--risk-watch)', fontWeight: 600 }}>WATCH (40% - 45%)</span>
                <span className="font-mono text-primary">
                  {summary?.watch_count.toLocaleString()} ({summary ? ((summary.watch_count / activeProjectTotal) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${summary ? Math.min(100, (summary.watch_count / activeProjectTotal) * 100) : 0}%`,
                    height: '100%',
                    background: 'var(--risk-watch)'
                  }}
                />
              </div>
            </div>

            {/* NORMAL */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                <span style={{ color: 'var(--risk-normal)', fontWeight: 600 }}>NORMAL (&lt; 40%)</span>
                <span className="font-mono text-primary">
                  {normalCount.toLocaleString()} ({summary ? ((normalCount / activeProjectTotal) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${summary ? Math.min(100, (normalCount / activeProjectTotal) * 100) : 0}%`,
                    height: '100%',
                    background: 'var(--risk-normal)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Sector Risk Breakdown */}
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">Sector Exposure & Alerts</div>
              <div className="panel-subtitle">Active central sector capital allocation (sanitized genuine portfolio)</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="command-table">
              <thead>
                <tr>
                  <th>Sector</th>
                  <th style={{ textAlign: 'right' }}>Active Assets</th>
                  <th style={{ textAlign: 'right' }}>Escalate</th>
                  <th style={{ textAlign: 'right' }}>Watch / Review</th>
                  <th style={{ textAlign: 'right' }}>Active Exposure</th>
                </tr>
              </thead>
              <tbody>
                {summary?.sector_breakdown.slice(0, 6).map((s) => (
                  <tr key={s.sector}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.sector}</td>
                    <td className="font-mono" style={{ textAlign: 'right' }}>{s.total_projects.toLocaleString()}</td>
                    <td className="font-mono" style={{ textAlign: 'right', color: s.escalate_count > 0 ? 'var(--risk-escalate)' : 'inherit' }}>
                      {s.escalate_count.toLocaleString()}
                    </td>
                    <td className="font-mono" style={{ textAlign: 'right', color: 'var(--risk-watch)' }}>
                      {(s.watch_count + s.review_count).toLocaleString()}
                    </td>
                    <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatExposure(s.total_exposure)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section C: Intervention Queue */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="var(--risk-escalate)" />
              Intervention Priority Queue
            </div>
            <div className="panel-subtitle">
              Prioritized by <strong style={{ color: 'var(--text-primary)' }}>RISK-WEIGHTED EXPOSURE</strong> (<code className="font-mono">Priority Score = Calibrated Risk &times; Baseline Exposure</code>).
              Restricted to active genuine projects.
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="filter-bar">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by ID, project name, sector, state..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={minTierFilter}
            onChange={(e) => setMinTierFilter(e.target.value)}
          >
            <option value="">All Tiers</option>
            <option value="ESCALATE">ESCALATE Only (&ge; 50%)</option>
            <option value="REVIEW">REVIEW and above (&ge; 45%)</option>
            <option value="WATCH">WATCH and above (&ge; 40%)</option>
          </select>

          <select
            className="filter-select"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
          >
            <option value="">All Sectors</option>
            {summary?.sector_breakdown.map((sec) => (
              <option key={sec.sector} value={sec.sector}>{sec.sector}</option>
            ))}
          </select>
        </div>

        {/* Intervention Queue Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="command-table">
            <thead>
              <tr>
                <th>PROJECT</th>
                <th>SECTOR</th>
                <th>STATE</th>
                <th>REPORTING MONTH</th>
                <th style={{ textAlign: 'center' }}>RISK TIER</th>
                <th style={{ textAlign: 'right' }}>CALIBRATED RISK</th>
                <th style={{ textAlign: 'right' }}>BASELINE EXPOSURE</th>
                <th style={{ textAlign: 'right' }}>
                  <span
                    title="Transparent prioritization metric weighting capital exposure by 12-month deterioration probability for oversight resource allocation."
                    style={{ borderBottom: '1px dotted var(--accent-cyan)', cursor: 'help', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    RISK-WEIGHTED EXPOSURE
                    <Info size={12} color="var(--accent-cyan)" />
                  </span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredInterventions.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No active genuine projects matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInterventions.map((p) => {
                  const baselineVal = p.baseline_exposure ?? p.baseline_cost;
                  const rweVal = p.risk_weighted_exposure ?? p.priority_score;
                  return (
                    <tr
                      key={p.project_id}
                      className="clickable"
                      onClick={() => navigate(`/projects/${p.project_id}`)}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="font-mono text-cyan" style={{ fontSize: '12px' }}>{p.project_id}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.project_name}
                        </div>
                      </td>
                      <td style={{ fontSize: '12px' }}>{p.sector}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.state || '—'}</td>
                      <td className="font-mono text-xs">{p.reporting_month || p.latest_observation}</td>
                      <td style={{ textAlign: 'center' }}>{getTierBadge(p.risk_tier || p.latest_risk_tier)}</td>
                      <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>
                        {(p.latest_risk * 100).toFixed(1)}%
                      </td>
                      <td className="font-mono" style={{ textAlign: 'right' }}>
                        {formatExposure(baselineVal)}
                      </td>
                      <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {formatExposure(rweVal)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <ArrowRight size={16} color="var(--text-muted)" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
