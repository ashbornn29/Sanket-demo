import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import RiskBadge from '../common/RiskBadge';
export default function PriorityProjects({ projects }) {
  const navigate = useNavigate();
  const topProjects = projects.sort((a, b) => b.riskScore - a.riskScore).slice(0, 8);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-navy-800">High Priority Projects</h3><button onClick={() => navigate('/projects')} className="text-xs text-navy-600 hover:text-navy-800 font-medium">View All →</button></div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100"><th className="text-left py-2 text-xs font-medium text-navy-500 w-8">#</th><th className="text-left py-2 text-xs font-medium text-navy-500">Project</th><th className="text-left py-2 text-xs font-medium text-navy-500">Sector</th><th className="text-left py-2 text-xs font-medium text-navy-500">State</th><th className="text-left py-2 text-xs font-medium text-navy-500">Risk</th><th className="text-left py-2 text-xs font-medium text-navy-500">Exposure</th><th className="text-left py-2 text-xs font-medium text-navy-500">Trend</th><th className="text-right py-2 text-xs font-medium text-navy-500">Action</th></tr></thead>
        <tbody>{topProjects.map((project, idx) => (
          <tr key={project.id} className="border-b border-gray-50 hover:bg-navy-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
            <td className="py-3 text-xs text-navy-400 font-medium">{idx + 1}</td><td className="py-3"><span className="text-sm font-medium text-navy-800">{project.name}</span></td><td className="py-3 text-xs text-navy-600">{project.sector}</td><td className="py-3 text-xs text-navy-600">{project.state}</td><td className="py-3"><RiskBadge level={project.riskLevel} score={project.riskScore} size="xs" /></td><td className="py-3 text-xs font-medium text-navy-700">₹{project.costExposure.toLocaleString()} Cr</td>
            <td className="py-3">{project.trend === 'increasing' ? <TrendingUp size={14} className="text-red-500" /> : project.trend === 'decreasing' ? <TrendingDown size={14} className="text-green-500" /> : <Minus size={14} className="text-gray-400" />}</td>
            <td className="py-3 text-right"><button className="text-xs text-navy-600 hover:text-navy-800 font-medium flex items-center gap-1 ml-auto"><Eye size={12} />View</button></td>
          </tr>))}</tbody></table></div>
    </div>
  );
}
