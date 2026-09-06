import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';

const titles = {
  '/': ['Overview', 'Portfolio trajectory intelligence'],
  '/dashboard': ['Overview', 'Portfolio trajectory intelligence'],
  '/projects': ['Project registry', 'Longitudinal surveillance roster'],
  '/warnings': ['Contractor warnings', 'Active early-warning notices'],
  '/escalations': ['Authority escalations', 'Intervention referrals'],
  '/audit': ['Audit trail', 'Immutable governance log'],
  '/demo': ['Demo scenarios', 'Deterministic validation runs'],
};

export default function Topbar() {
  const loc = useLocation();
  const [title, sub] = titles[loc.pathname] || (
    loc.pathname.startsWith('/projects/') ? ['Project detail', 'Trajectory & governance state'] : ['VIGIL', '']
  );

  return (
    <header className="bg-[#0f1117] border-b border-[#262a3a] px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 min-w-0">
      <div className="min-w-0 flex-1 mr-4">
        <h1 className="text-[15px] font-semibold text-[#eef0f6] truncate">{title}</h1>
        <p className="text-[11px] text-[#6b7194] truncate mt-0.5">{sub}</p>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="relative hidden lg:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4a5070]" size={13} />
          <input type="text" placeholder="Search projects..."
            className="pl-8 pr-3 py-1.5 bg-[#161922] border border-[#262a3a] text-[#c8ccd8] text-[11px] w-52 rounded focus:outline-none focus:border-amber-600/50 placeholder:text-[#4a5070]" />
        </div>
        <div className="w-7 h-7 bg-[#1c1f2e] border border-[#262a3a] rounded flex items-center justify-center text-[11px] font-medium text-[#6b7194]">
          V
        </div>
      </div>
    </header>
  );
}
