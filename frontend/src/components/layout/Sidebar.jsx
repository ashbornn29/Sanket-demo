import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, AlertTriangle, ShieldAlert, FileClock, PlayCircle } from 'lucide-react';
import { getHealth } from '../../services/api';

const nav = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/warnings', label: 'Warnings', icon: AlertTriangle },
  { path: '/escalations', label: 'Escalations', icon: ShieldAlert },
  { path: '/audit', label: 'Audit trail', icon: FileClock },
  { path: '/demo', label: 'Demo mode', icon: PlayCircle },
];

export default function Sidebar() {
  const loc = useLocation();
  const [health, setHealth] = useState(null);
  useEffect(() => { getHealth().then(d => setHealth({ ok: true, d })).catch(() => setHealth({ ok: false })); }, []);

  return (
    <aside className="h-full w-full bg-[#0b0d14] flex flex-col border-r border-[#1e2235]">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-2 h-5 bg-amber-600 rounded-sm" />
          <span className="text-[15px] font-semibold text-[#eef0f6] tracking-tight">VIGIL</span>
        </div>
        <p className="text-[10px] text-[#6b7194] pl-[18px] leading-tight">Infrastructure Early-Warning</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {nav.map(item => {
          const Icon = item.icon;
          const active = item.path === '/'
            ? ['/', '/dashboard', '/overview'].includes(loc.pathname)
            : loc.pathname.startsWith(item.path);
          return (
            <NavLink key={item.path} to={item.path}
              className={`flex items-center gap-2.5 px-3 py-[7px] text-[12px] rounded transition-all ${
                active
                  ? 'bg-[#1a1d2e] text-[#eef0f6] font-medium shadow-[inset_2px_0_0_#d97706]'
                  : 'text-[#6b7194] hover:text-[#a0a5bd] hover:bg-[#12141e]'
              }`}>
              <Icon size={15} strokeWidth={active ? 2 : 1.5} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Engine status */}
      <div className="px-5 py-4 border-t border-[#1e2235]">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${health?.ok ? 'bg-amber-500' : 'bg-red-500'}`} />
          <span className="text-[11px] text-[#6b7194]">{health?.ok ? 'Engine online' : 'Connecting...'}</span>
        </div>
      </div>
    </aside>
  );
}
