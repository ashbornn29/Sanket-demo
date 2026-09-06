import React, { useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { sectors, ministries, states, riskLevels } from '../../data/mockData';

export default function FilterBar({ filters, onFilterChange, showYear = true }) {
  const [isOpen, setIsOpen] = useState(true);
  const handleChange = (key, value) => onFilterChange({ ...filters, [key]: value });
  const handleReset = () => onFilterChange({});
  const selectClass = 'h-9 px-3 pr-8 text-sm bg-white border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-200 focus:border-navy-400 cursor-pointer';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-navy-700"><Filter size={15} /><span>Filters</span></div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-xs text-navy-500 hover:text-navy-700">{isOpen ? 'Collapse' : 'Expand'}</button>
      </div>
      {isOpen && (
        <div className="flex flex-wrap items-center gap-3">
          <select value={filters.ministry || ''} onChange={(e) => handleChange('ministry', e.target.value)} className={selectClass}><option value="">All Ministries</option>{ministries.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          <select value={filters.sector || ''} onChange={(e) => handleChange('sector', e.target.value)} className={selectClass}><option value="">All Sectors</option>{sectors.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <select value={filters.state || ''} onChange={(e) => handleChange('state', e.target.value)} className={selectClass}><option value="">All States</option>{states.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <select value={filters.riskLevel || ''} onChange={(e) => handleChange('riskLevel', e.target.value)} className={selectClass}><option value="">All Risk Levels</option>{riskLevels.map((r) => <option key={r} value={r}>{r}</option>)}</select>
          {showYear && (<select value={filters.year || ''} onChange={(e) => handleChange('year', e.target.value)} className={selectClass}><option value="">All Years</option><option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option></select>)}
          <button onClick={handleReset} className="h-9 px-3 flex items-center gap-1.5 text-sm text-navy-600 bg-navy-50 hover:bg-navy-100 border border-navy-200 rounded-lg transition-colors"><RotateCcw size={13} />Reset</button>
        </div>
      )}
    </div>
  );
}
