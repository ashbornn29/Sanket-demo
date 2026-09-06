import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardProject } from '../../services/api';
import { X } from 'lucide-react';

const SECTOR_OPTIONS = [
  'Road Transport and Highways',
  'Railways',
  'Power',
  'Petroleum',
  'Urban Development',
  'Atomic Energy',
  'Telecommunications',
  'OTHER',
];

export default function OnboardModal({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    project_id: '',
    project_name: '',
    sector: 'Road Transport and Highways',
    ministry: '',
    state: '',
    approved_cost: '',
    revised_cost: '',
    initial_reporting_month: new Date().toISOString().slice(0, 7),
    planned_start_date: '',
    planned_completion_date: '',
    contractor: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.project_id.trim() || !formData.project_name.trim()) {
      setError('Project ID and Project Name are required.');
      return;
    }
    const approvedCost = parseFloat(formData.approved_cost);
    if (isNaN(approvedCost) || approvedCost <= 0) {
      setError('Baseline cost must be a positive number in ₹ Cr.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        project_id: formData.project_id.trim(),
        project_name: formData.project_name.trim(),
        sector: formData.sector,
        approved_cost: approvedCost,
        initial_reporting_month: formData.initial_reporting_month.trim(),
        ministry: formData.ministry.trim() || null,
        state: formData.state.trim() || null,
        revised_cost: formData.revised_cost ? parseFloat(formData.revised_cost) : null,
        planned_start_date: formData.planned_start_date.trim() || null,
        planned_completion_date: formData.planned_completion_date.trim() || null,
        contractor: formData.contractor.trim() || null,
      };

      const result = await onboardProject(payload);
      if (onSuccess) onSuccess(result);
      onClose();
      navigate(`/projects/${encodeURIComponent(payload.project_id)}`);
    } catch (err) {
      setError(err.message || 'Failed to register project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-[#161922] border border-[#262a3a] rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#12141e] border-b border-[#262a3a]">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#eef0f6] font-semibold">
              Register Infrastructure Project
            </h3>
            <p className="text-[11px] text-[#6b7194] mt-0.5">Initiate longitudinal trajectory tracking & early warning</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b7194] hover:text-[#eef0f6] transition-colors p-1"
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono rounded">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
                Project ID *
              </label>
              <input
                type="text"
                name="project_id"
                required
                placeholder="e.g. PRJ-NHAI-2025-001"
                value={formData.project_id}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded font-mono text-xs focus:outline-none focus:border-amber-600/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
                Sector *
              </label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded text-xs focus:outline-none focus:border-amber-600/50"
              >
                {SECTOR_OPTIONS.map((sec) => (
                  <option key={sec} value={sec} className="bg-[#161922] text-[#c8ccd8]">{sec}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
              Project Name *
            </label>
            <input
              type="text"
              name="project_name"
              required
              placeholder="e.g. 4-Laning NH-58 Express Highway Section"
              value={formData.project_name}
              onChange={handleChange}
              className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded text-xs focus:outline-none focus:border-amber-600/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
                Line Ministry
              </label>
              <input
                type="text"
                name="ministry"
                placeholder="e.g. Ministry of Road Transport and Highways"
                value={formData.ministry}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded text-xs focus:outline-none focus:border-amber-600/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
                State / Jurisdiction
              </label>
              <input
                type="text"
                name="state"
                placeholder="e.g. Uttar Pradesh"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded text-xs focus:outline-none focus:border-amber-600/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
                Approved Baseline Cost (₹ Cr) *
              </label>
              <input
                type="number"
                step="0.01"
                name="approved_cost"
                required
                placeholder="1250.0"
                value={formData.approved_cost}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded font-mono text-xs focus:outline-none focus:border-amber-600/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
                Initial Observation Month (YYYY-MM) *
              </label>
              <input
                type="text"
                name="initial_reporting_month"
                required
                placeholder="2025-01"
                value={formData.initial_reporting_month}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded font-mono text-xs focus:outline-none focus:border-amber-600/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
              Executing Contractor / EPC
            </label>
            <input
              type="text"
              name="contractor"
              placeholder="e.g. National Infrastructure Executing Agency"
              value={formData.contractor}
              onChange={handleChange}
              className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded text-xs focus:outline-none focus:border-amber-600/50"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-[#12141e] border-t border-[#262a3a]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3.5 py-1.5 border border-[#262a3a] text-[#8e94ad] hover:text-[#eef0f6] text-xs rounded hover:bg-[#1a1d2e] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-[#0f1117] text-xs font-semibold rounded disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Register Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
