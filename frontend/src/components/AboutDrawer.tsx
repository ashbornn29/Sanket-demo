import { X, ShieldCheck, Database, Layers, Clock, Cpu, AlertTriangle } from 'lucide-react';

interface AboutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDrawer: React.FC<AboutDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-badge">VIGIL</div>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Methodology & Architecture</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '6px', border: 'none', background: 'transparent' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} color="var(--accent-cyan)" />
              Longitudinal Dataset Provenance
            </h3>
            <p style={{ marginBottom: '6px' }}>
              VIGIL monitors the complete longitudinal history of India's Central Sector infrastructure projects:
            </p>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><strong className="text-primary font-mono">115,693</strong> tracked infrastructure projects</li>
              <li><strong className="text-primary font-mono">443,195</strong> canonical project-month observations</li>
              <li><strong className="text-primary font-mono">336</strong> MoSPI Flash & Monthly Summary Reports audited</li>
            </ul>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--accent-cyan)" />
              Trajectory & Predictive Engines
            </h3>
            <p>
              Rather than inspecting static delays, VIGIL calculates longitudinal kinematics:
              1-month and 3-month expenditure velocity (V<sub>exp</sub>), expenditure acceleration (A<sub>exp</sub>),
              sector peer normalized progress (Z<sub>peer</sub>), and exponential moving averages (EWMA).
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--accent-cyan)" />
              Prediction Horizon & Operating Modes
            </h3>
            <p style={{ marginBottom: '8px' }}>
              Models are trained to predict 12-month forward composite deterioration (cost escalation &ge; 5% or schedule jump &ge; 6 months):
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              <div style={{ padding: '6px 8px', background: 'var(--bg-panel)', borderRadius: '4px', borderLeft: '3px solid var(--risk-watch)' }}>
                WATCH &ge; 40.0%
              </div>
              <div style={{ padding: '6px 8px', background: 'var(--bg-panel)', borderRadius: '4px', borderLeft: '3px solid var(--risk-review)' }}>
                REVIEW &ge; 45.0%
              </div>
              <div style={{ padding: '6px 8px', background: 'var(--bg-panel)', borderRadius: '4px', borderLeft: '3px solid var(--risk-escalate)' }}>
                ESCALATE &ge; 50.0%
              </div>
              <div style={{ padding: '6px 8px', background: 'var(--bg-panel)', borderRadius: '4px', borderLeft: '3px solid var(--risk-normal)' }}>
                NORMAL &lt; 40.0%
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={16} color="var(--accent-cyan)" />
              Deterministic TreeSHAP Explanations
            </h3>
            <p>
              Zero generative LLMs are used in reasoning. Top contributing factors are calculated using LightGBM’s native
              TreeSHAP algorithm (`pred_contrib=True`), guaranteeing legally auditable, fact-grounded explanations.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--accent-cyan)" />
              Leakage-Safe Point-in-Time Replay
            </h3>
            <p>
              Replay engines enforce strict point-in-time boundaries: row $t$ never accesses information, revisions,
              or expenditures from rows &gt; $t$.
            </p>
          </div>

          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            padding: '12px 14px',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}>
              <AlertTriangle size={14} />
              Formal Governance Notice
            </div>
            <p style={{ fontSize: '12px', color: '#fca5a5', lineHeight: 1.4 }}>
              "Scenario outputs are sensitivity estimates, not causal forecasts.
              Intervention rankings represent prioritization guides for oversight allocation."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
