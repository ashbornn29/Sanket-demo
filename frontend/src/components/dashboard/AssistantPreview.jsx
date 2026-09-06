import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send } from 'lucide-react';
const suggestedQuestions = ['Why is Project X high risk?', 'Show top 10 at-risk projects', 'Compare performance across sectors', 'What changed this month?'];
export default function AssistantPreview() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); navigate('/assistant', { state: { initialQuery: query } }); };
  const handleSuggestion = (q) => navigate('/assistant', { state: { initialQuery: q } });
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-md bg-navy-100 flex items-center justify-center"><Bot size={14} className="text-navy-600" /></div><div><h3 className="text-sm font-semibold text-navy-800">Project Intelligence Assistant</h3><p className="text-[10px] text-navy-500">Ask questions about projects, risk, and trends</p></div></div>
      <div className="flex flex-wrap gap-2 mb-3">{suggestedQuestions.map((q, idx) => (<button key={idx} onClick={() => handleSuggestion(q)} className="text-xs px-3 py-1.5 bg-navy-50 text-navy-600 rounded-lg hover:bg-navy-100 transition-colors border border-navy-100">{q}</button>))}</div>
      <form onSubmit={handleSubmit} className="flex gap-2"><input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type your question here..." className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-200 focus:border-navy-400 text-navy-800 placeholder:text-navy-400" /><button type="submit" className="h-9 px-4 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors flex items-center gap-1.5 text-sm"><Send size={13} />Ask</button></form>
    </div>
  );
}
