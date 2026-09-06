import React, { useState, useEffect } from 'react';
import { FlaskConical, ArrowRight, RefreshCw } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Loading from '../components/common/Loading';
import RiskBadge from '../components/common/RiskBadge';
import { getProjects, runScenario } from '../services/api';
import { getRiskLevel } from '../data/mockData';

export default function Scenario() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [physicalProgress, setPhysicalProgress] = useState(50);
  const [expectedProgress, setExpectedProgress] = useState(65);
  const [milestoneDelays, setMilestoneDelays] = useState(2);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => { loadProjects(); }, []);
  async function loadProjects() { setLoading(true); const data = await getProjects({ sortBy: 'risk' }); setProjects(data); if (data.length) { setSelectedProject(data[0]); setPhysicalProgress(data[0].physicalProgress); setExpectedProgress(data[0].expectedProgress); setMilestoneDelays(data[0].milestonesOverdue); } setLoading(false); }

  async function handleRun() {
    if (!selectedProject) return;
    setRunning(true);
    const res = await runScenario({ currentRisk: selectedProject.riskScore, physicalProgress, expectedProgress, milestoneDelays });
    setResult(res);
    setRunning(false);
  }

  function handleProjectChange(id) { const p = projects.find((pr) => pr.id === id); if (p) { setSelectedProject(p); setPhysicalProgress(p.physicalProgress); setExpectedProgress(p.expectedProgress); setMilestoneDelays(p.milestonesOverdue); setResult(null); } }

  if (loading) return <Loading />;

  return (
    <PageContainer title="Scenario Analysis" subtitle="Simulate how parameter changes affect project risk scores.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-navy-800 mb-4">Simulation Parameters</h3>
          <div className="space-y-5">
            <div><label className="block text-xs font-medium text-navy-600 mb-1.5">Select Project</label><select value={selectedProject?.id || ''} onChange={(e) => handleProjectChange(e.target.value)} className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-200">{projects.map((p) => (<option key={p.id} value={p.id}>{p.name} ({p.riskScore})</option>))}</select></div>
            {selectedProject && (<div className="flex items-center gap-3 p-3 bg-navy-50 rounded-lg"><div className="flex-1"><p className="text-xs text-navy-500">Current Risk Score</p><p className="text-2xl font-bold text-navy-900">{selectedProject.riskScore}</p></div><RiskBadge level={selectedProject.riskLevel} score={selectedProject.riskScore} size="md" /></div>)}
            <div><label className="block text-xs font-medium text-navy-600 mb-1.5">Physical Progress: <span className="font-bold text-navy-800">{physicalProgress}%</span></label><input type="range" min="0" max="100" value={physicalProgress} onChange={(e) => setPhysicalProgress(Number(e.target.value))} /></div>
            <div><label className="block text-xs font-medium text-navy-600 mb-1.5">Expected Progress: <span className="font-bold text-navy-800">{expectedProgress}%</span></label><input type="range" min="0" max="100" value={expectedProgress} onChange={(e) => setExpectedProgress(Number(e.target.value))} /></div>
            <div><label className="block text-xs font-medium text-navy-600 mb-1.5">Milestone Delays: <span className="font-bold text-navy-800">{milestoneDelays}</span></label><input type="range" min="0" max="10" value={milestoneDelays} onChange={(e) => setMilestoneDelays(Number(e.target.value))} /></div>
            <button onClick={handleRun} disabled={running} className="w-full h-10 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50">{running ? <><RefreshCw size={14} className="animate-spin" />Running...</> : <><FlaskConical size={14} />Run Scenario</>}</button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-navy-800 mb-4">Scenario Results</h3>
          {!result ? (<div className="flex flex-col items-center justify-center py-16 text-navy-400"><FlaskConical size={36} className="mb-3" /><p className="text-sm">Adjust parameters and run a scenario to see projected risk.</p></div>) : (
            <div className="space-y-5">
              <div className="flex items-center justify-center gap-6 py-6">
                <div className="text-center"><p className="text-xs text-navy-500 mb-1">Current Risk</p><p className="text-3xl font-bold text-navy-700">{result.currentRisk}</p><RiskBadge level={getRiskLevel(result.currentRisk)} size="sm" /></div>
                <ArrowRight size={24} className="text-navy-300" />
                <div className="text-center"><p className="text-xs text-navy-500 mb-1">Scenario Risk</p><p className={`text-3xl font-bold ${result.scenarioRisk > result.currentRisk ? 'text-red-600' : result.scenarioRisk < result.currentRisk ? 'text-green-600' : 'text-navy-700'}`}>{result.scenarioRisk}</p><RiskBadge level={getRiskLevel(result.scenarioRisk)} size="sm" /></div>
              </div>
              <div className="text-center"><span className={`text-lg font-bold px-3 py-1 rounded-lg ${result.change > 0 ? 'text-red-700 bg-red-50' : result.change < 0 ? 'text-green-700 bg-green-50' : 'text-gray-700 bg-gray-50'}`}>{result.change > 0 ? '+' : ''}{result.change} points</span></div>
              <div className="space-y-3 mt-4"><h4 className="text-xs font-semibold text-navy-600 uppercase tracking-wide">Contributing Factors</h4>
                {[{ label: 'Progress Gap', value: result.breakdown.progressContribution }, { label: 'Milestone Delays', value: result.breakdown.milestoneContribution }, { label: 'Base Risk', value: result.breakdown.baseContribution }].map((f) => (<div key={f.label}><div className="flex justify-between mb-1"><span className="text-sm text-navy-600">{f.label}</span><span className="text-sm font-semibold text-navy-800">{f.value}</span></div><div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-navy-500 rounded-full" style={{ width: `${Math.min(100, f.value)}%` }} /></div></div>))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
