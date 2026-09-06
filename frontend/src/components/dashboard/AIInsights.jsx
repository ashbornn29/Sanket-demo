import React from 'react';
import { Sparkles } from 'lucide-react';
export default function AIInsights({ insights }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4"><div className="w-7 h-7 rounded-md bg-navy-100 flex items-center justify-center"><Sparkles size={14} className="text-navy-600" /></div><h3 className="text-sm font-semibold text-navy-800">AI Insights</h3></div>
      <div className="space-y-3">{insights.slice(0, 3).map((insight, idx) => (<div key={idx} className="pl-3 border-l-2 border-navy-200 text-sm text-navy-600 leading-relaxed">{insight}</div>))}</div>
    </div>
  );
}
