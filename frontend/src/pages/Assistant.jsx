import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import RiskBadge from '../components/common/RiskBadge';
import { askAssistant } from '../services/api';

export default function Assistant() {
  const location = useLocation();
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! I\'m the VIGIL Intelligence Assistant. I can help you analyze infrastructure project risk data, compare sectors, identify trends, and answer questions about the monitored portfolio.\n\nTry asking me something like:\n• "Why is Project X high risk?"\n• "Show top 10 at-risk projects"\n• "Compare performance across sectors"', type: 'text' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { if (location.state?.initialQuery) { handleSend(location.state.initialQuery); window.history.replaceState({}, ''); } }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function handleSend(text) {
    const q = text || input;
    if (!q.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setInput('');
    setIsTyping(true);
    const response = await askAssistant(q);
    setIsTyping(false);
    setMessages((prev) => [...prev, { role: 'assistant', content: response.response, data: response }]);
  }

  const handleSubmit = (e) => { e.preventDefault(); handleSend(); };

  const suggestions = ['Why is Project X high risk?', 'Show top 10 at-risk projects', 'Compare performance across sectors', 'What changed this month?'];

  return (
    <PageContainer title="AI Assistant" subtitle="Natural language interface for infrastructure risk intelligence queries.">
      <div className="bg-white border border-gray-200 rounded-xl flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (<div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0 mt-0.5"><Bot size={16} className="text-navy-600" /></div>)}
                <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-navy-700 text-white rounded-br-sm' : 'bg-navy-50 text-navy-800 rounded-bl-sm'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.data?.factors && (<div className="mt-3 space-y-2">{msg.data.factors.map((f, i) => (<div key={i} className="bg-white rounded-lg p-2.5 border border-navy-100"><p className="text-xs font-semibold text-navy-700">{f.title}</p><p className="text-xs text-navy-600 mt-0.5">{f.detail}</p></div>))}</div>)}
                  {msg.data?.projects && (<div className="mt-3 overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-navy-200"><th className="text-left py-1.5 text-navy-600">Project</th><th className="text-left py-1.5 text-navy-600">Sector</th><th className="text-right py-1.5 text-navy-600">Risk</th></tr></thead><tbody>{msg.data.projects.map((p) => (<tr key={p.id} className="border-b border-navy-100"><td className="py-1.5 text-navy-800">{p.name}</td><td className="py-1.5 text-navy-600">{p.sector}</td><td className="py-1.5 text-right"><RiskBadge level={p.riskLevel} score={p.riskScore} size="xs" /></td></tr>))}</tbody></table></div>)}
                  {msg.data?.data && msg.data?.type === 'sectors' && (<div className="mt-3 overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-navy-200"><th className="text-left py-1.5 text-navy-600">Sector</th><th className="text-right py-1.5 text-navy-600">Projects</th><th className="text-right py-1.5 text-navy-600">Avg Risk</th></tr></thead><tbody>{msg.data.data.map((s) => (<tr key={s.sector} className="border-b border-navy-100"><td className="py-1.5 text-navy-800">{s.sector}</td><td className="py-1.5 text-right text-navy-700">{s.projects}</td><td className="py-1.5 text-right text-navy-700">{s.avgRisk}</td></tr>))}</tbody></table></div>)}
                </div>
                {msg.role === 'user' && (<div className="w-8 h-8 rounded-full bg-navy-200 flex items-center justify-center flex-shrink-0 mt-0.5"><User size={14} className="text-navy-700" /></div>)}
              </div>
            ))}
            {isTyping && (<div className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center"><Bot size={16} className="text-navy-600" /></div><div className="bg-navy-50 rounded-xl px-4 py-3 rounded-bl-sm"><div className="flex gap-1"><div className="w-2 h-2 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-2 h-2 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div></div></div>)}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">{suggestions.map((s, i) => (<button key={i} onClick={() => handleSend(s)} className="text-xs px-3 py-1.5 bg-navy-50 text-navy-600 rounded-lg hover:bg-navy-100 transition-colors border border-navy-100">{s}</button>))}</div>
            <form onSubmit={handleSubmit} className="flex gap-2"><input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question about infrastructure projects..." className="flex-1 h-10 px-4 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-200 text-navy-800" disabled={isTyping} /><button type="submit" disabled={isTyping || !input.trim()} className="h-10 px-5 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50"><Send size={14} />Send</button></form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
