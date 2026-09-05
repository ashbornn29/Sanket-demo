import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Info, Activity } from 'lucide-react';
import { checkHealth } from '../api';

interface HeaderProps {
  onOpenAbout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAbout }) => {
  const location = useLocation();
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    checkHealth()
      .then((res) => {
        if (mounted) {
          setIsHealthy(res.status === 'healthy');
          setProjectCount(res.total_projects_indexed);
        }
      })
      .catch(() => {
        if (mounted) setIsHealthy(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="header-bar">
      <div className="header-brand">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-badge">VIGIL</div>
          <div className="header-title-group">
            <h1>
              <span>Infrastructure Early Warning System</span>
            </h1>
            <p>From monitoring project status to predicting project trajectory.</p>
          </div>
        </Link>
      </div>

      <div className="header-actions">
        <div className="status-indicator">
          {isHealthy === true ? (
            <>
              <div className="dot-live" title="API connected" />
              <span className="font-mono text-xs">
                SYSTEM ACTIVE ({projectCount ? projectCount.toLocaleString() : '115,693'} ASSETS)
              </span>
            </>
          ) : isHealthy === false ? (
            <>
              <div className="dot-error" title="API disconnected" />
              <span className="font-mono text-xs" style={{ color: 'var(--risk-escalate)' }}>
                BACKEND DISCONNECTED
              </span>
            </>
          ) : (
            <span className="font-mono text-xs text-muted">CONNECTING...</span>
          )}
        </div>

        <Link
          to="/"
          className={`btn ${location.pathname === '/' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          <Activity size={14} />
          Command Center
        </Link>

        <button
          onClick={onOpenAbout}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12px' }}
          title="Methodology and audit provenance"
        >
          <Info size={14} />
          About VIGIL
        </button>
      </div>
    </header>
  );
};
