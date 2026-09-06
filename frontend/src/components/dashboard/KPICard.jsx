import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'navy', onClick }) {
  const colorClasses = { navy: 'bg-navy-50 text-navy-600', red: 'bg-red-50 text-red-600', orange: 'bg-orange-50 text-orange-600', green: 'bg-green-50 text-green-600', blue: 'bg-blue-50 text-blue-600', amber: 'bg-amber-50 text-amber-600' };
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}><Icon size={20} /></div>
        {trend && (<div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${trend === 'up' ? 'text-red-600 bg-red-50' : trend === 'down' ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-50'}`}>{trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}{trendValue}</div>)}
      </div>
      <div className="text-2xl font-bold text-navy-900 mb-1">{value}</div>
      <p className="text-xs text-navy-500">{subtitle}</p>
    </div>
  );
}
