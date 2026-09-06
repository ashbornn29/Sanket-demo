import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMonitoredProjects,
  getMonitoredProjectAudit
} from '../services/api';
import { Search, ChevronDown, ChevronRight, FileCode } from 'lucide-react';

export default function AuditTrail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function loadAudit() {
      setLoading(true);
      try {
        const monRes = await getMonitoredProjects();
        const projects = monRes?.projects || [];

        let allEvents = [];
        for (const p of projects) {
          try {
            const aRes = await getMonitoredProjectAudit(p.project_id);
            const pEvents = aRes?.audit_events || [];
            pEvents.forEach((e) => {
              allEvents.push({ ...e, project_name: p.project_name });
            });
          } catch (e) {
            console.error(e);
          }
        }
        allEvents.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        setEvents(allEvents);
      } catch (err) {
        console.error('Failed to load audit log:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, []);

  const types = ['ALL', ...new Set(events.map((e) => e.event_type).filter(Boolean))];

  const filtered = events.filter((e) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!e.project_id.toLowerCase().includes(q) && !(e.project_name || '').toLowerCase().includes(q) && !e.event_type.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedType !== 'ALL' && e.event_type !== selectedType) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-5 min-w-0">
      {/* Governance banner */}
      <div className="p-4 bg-[#161922] border border-[#262a3a] rounded text-[12px] text-[#6b7194]">
        <span className="font-medium text-[#eef0f6]">Immutable Governance Ledger: </span>
        Records all observation submissions, LightGBM model inferences, warning notices, and authority escalations with cryptographic integrity.
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161922] border border-[#262a3a] rounded p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4a5070]" size={13} />
          <input
            type="text"
            placeholder="Filter audit log by project or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded text-xs w-72 focus:outline-none focus:border-amber-600/50 placeholder:text-[#4a5070]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#6b7194] text-[11px] font-medium">Event Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded text-xs focus:outline-none focus:border-amber-600/50"
          >
            {types.map((t) => (
              <option key={t} value={t} className="bg-[#161922] text-[#c8ccd8]">{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-[#161922] border border-[#262a3a] rounded overflow-x-auto min-w-0">
        <table className="w-full text-left text-[12px] border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#262a3a] text-[#6b7194] text-[11px] bg-[#12141e]">
              <th className="px-4 py-2.5 font-medium">TIMESTAMP</th>
              <th className="px-3 py-2.5 font-medium">PROJECT</th>
              <th className="px-3 py-2.5 font-medium">EVENT TYPE</th>
              <th className="px-3 py-2.5 font-medium">ACTOR</th>
              <th className="px-3 py-2.5 font-medium">PAYLOAD SUMMARY</th>
              <th className="px-4 py-2.5 text-right font-medium">RECORD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2235]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#4a5070] text-xs">
                  Loading audit ledger...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#4a5070] text-xs">
                  No audit records logged.
                </td>
              </tr>
            ) : (
              filtered.map((ev, idx) => {
                const key = ev.event_id || idx;
                const isExpanded = expandedId === key;

                let parsedJson = null;
                try {
                  parsedJson = typeof ev.payload_json === 'string' ? JSON.parse(ev.payload_json) : ev.payload_json;
                } catch {
                  parsedJson = ev.payload_json;
                }

                return (
                  <React.Fragment key={key}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : key)}
                      className="hover:bg-[#1a1d2e] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-2.5 font-mono text-[11px] text-[#8e94ad] whitespace-nowrap">
                        {ev.timestamp}
                      </td>
                      <td className="px-3 py-2.5 max-w-[200px]">
                        <div className="font-medium text-[#eef0f6] truncate" title={ev.project_name}>
                          {ev.project_name || ev.project_id}
                        </div>
                        <div className="text-[10px] text-[#4a5070] font-mono">{ev.project_id}</div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1a1d2e] text-amber-400 border border-amber-600/30 font-medium">
                          {ev.event_type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[#6b7194] font-mono text-[11px] whitespace-nowrap">
                        {ev.performed_by}
                      </td>
                      <td className="px-3 py-2.5 max-w-sm truncate text-[#6b7194] text-[11px]">
                        {typeof ev.payload_json === 'string' ? ev.payload_json : JSON.stringify(ev.payload_json)}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <span className="text-[11px] font-medium text-amber-400 hover:text-amber-300">
                          {isExpanded ? 'Hide ▲' : 'Inspect ▼'}
                        </span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-[#12141e]">
                        <td colSpan={6} className="p-4 border-y border-[#262a3a]">
                          <div className="p-3.5 bg-[#0b0d14] border border-[#1e2235] text-[#c8ccd8] text-[11px] rounded font-mono space-y-2">
                            <div className="text-[#6b7194] border-b border-[#1e2235] pb-2 flex justify-between items-center text-[10px]">
                              <span>RECORD ID: <strong className="text-[#eef0f6]">{ev.event_id}</strong></span>
                              <span>TIMESTAMP: <strong className="text-[#eef0f6]">{ev.timestamp}</strong></span>
                              <span>PERFORMED BY: <strong className="text-[#eef0f6]">{ev.performed_by}</strong></span>
                            </div>
                            <pre className="text-emerald-400 whitespace-pre-wrap overflow-x-auto pt-1 leading-relaxed text-[11px]">
                              {JSON.stringify(parsedJson, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
