import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
export default function RecentAlerts({ alerts }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-navy-800 mb-4">Recent Alerts</h3>
      <div className="space-y-0">
        {alerts.slice(0, 5).map((alert) => (
          <button key={alert.id} onClick={() => navigate(`/projects/${alert.projectId}`)} className="w-full text-left py-3 border-b border-gray-50 last:border-0 hover:bg-navy-50/50 transition-colors px-2 rounded">
            <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-1.5 text-xs text-navy-400"><Clock size={11} /><span>{alert.time}</span></div><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${alert.level === 'CRITICAL' ? 'bg-red-100 text-red-700' : alert.level === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>{alert.level}</span></div>
            <p className="text-sm font-medium text-navy-800">{alert.project}</p><p className="text-xs text-navy-500 mt-0.5">{alert.message}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
