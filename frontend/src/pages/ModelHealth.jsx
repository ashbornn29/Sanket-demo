import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Circle, Database, Brain, BarChart3 } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Loading from '../components/common/Loading';
import { getHealthData } from '../services/api';

export default function ModelHealth() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);

  useEffect(() => { loadHealth(); }, []);
  async function loadHealth() { setLoading(true); const data = await getHealthData(); setHealth(data); setLoading(false); }
  if (loading) return <Loading />;

  const statusIcon = (status) => { if (status === 'healthy') return <CheckCircle size={16} className="text-green-500" />; if (status === 'planned') return <Circle size={16} className="text-gray-400" />; return <AlertCircle size={16} className="text-amber-500" />; };
  const statusLabel = (status) => { if (status === 'healthy') return <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs font-medium">✓ Healthy</span>; if (status === 'planned') return <span className="text-gray-500 bg-gray-50 px-2 py-0.5 rounded text-xs font-medium">○ Future Integration</span>; return <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium">⚠ Degraded</span>; };

  return (
    <PageContainer title="Data & Model Health" subtitle="Technical monitoring of data pipelines, data quality, and ML model performance.">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-700"><strong>Prototype</strong> — All values shown are for demonstration purposes only.</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Database size={16} className="text-navy-600" /><h3 className="text-sm font-semibold text-navy-800">Data Pipeline Status</h3></div>
          <div className="space-y-3">{health.pipeline.map((item) => (<div key={item.source} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"><div className="flex items-center gap-3">{statusIcon(item.status)}<div><span className="text-sm font-medium text-navy-800">{item.source}</span><span className="block text-[10px] text-navy-400">Last sync: {item.lastSync} • Records: {item.records}</span></div></div>{statusLabel(item.status)}</div>))}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-navy-600" /><h3 className="text-sm font-semibold text-navy-800">Data Quality</h3></div>
          <div className="space-y-4">
            {[{ label: 'Completeness', value: health.quality.completeness, color: 'bg-green-500' }, { label: 'Validity', value: health.quality.validity, color: 'bg-blue-500' }].map((metric) => (<div key={metric.label}><div className="flex items-center justify-between mb-1.5"><span className="text-sm text-navy-700">{metric.label}</span><span className="text-sm font-semibold text-navy-800">{metric.value}%</span></div><div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${metric.color}`} style={{ width: `${metric.value}%` }} /></div></div>))}
            <div className="flex items-center justify-between py-2"><span className="text-sm text-navy-700">Duplicate Rate</span><span className="text-sm font-semibold text-navy-800">{health.quality.duplicateRate}%</span></div>
            <p className="text-[10px] text-navy-400">Last checked: {health.quality.lastChecked}</p>
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4"><Brain size={16} className="text-navy-600" /><h3 className="text-sm font-semibold text-navy-800">ML Model Performance</h3></div>
        <div className="flex flex-wrap items-center gap-4 mb-5 text-xs text-navy-500"><span>Model: <strong className="text-navy-800">{health.model.modelType}</strong></span><span>Last Trained: <strong className="text-navy-800">{health.model.lastTrained}</strong></span><span>Training Data: <strong className="text-navy-800">{health.model.trainingData}</strong></span></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{ name: 'Delay Prediction Model', metrics: health.model.delay }, { name: 'Cost Overrun Model', metrics: health.model.cost }, { name: 'Implementation Risk Model', metrics: health.model.implementation }].map((model) => (
            <div key={model.name} className="bg-navy-50 rounded-xl p-4"><h4 className="text-xs font-semibold text-navy-700 mb-3">{model.name}</h4><div className="space-y-2">{Object.entries(model.metrics).map(([key, value]) => (<div key={key} className="flex items-center justify-between"><span className="text-xs text-navy-500 uppercase">{key === 'rocAuc' ? 'ROC-AUC' : key}</span><span className="text-sm font-semibold text-navy-800">{value}</span></div>))}</div></div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
