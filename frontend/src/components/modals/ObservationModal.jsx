import React, { useState } from 'react';
import { submitObservation, formatPercent } from '../../services/api';
import { X, CheckCircle } from 'lucide-react';

export default function ObservationModal({ isOpen, onClose, projectId, projectName, latestMonth, onSuccess }) {
  const getNextMonth = (m) => {
    if (!m || !m.includes('-')) return new Date().toISOString().slice(0, 7);
    const [y, mon] = m.split('-').map(Number);
    if (!y || !mon) return new Date().toISOString().slice(0, 7);
    return new Date(y, mon, 1).toISOString().slice(0, 7);
  };

  const [formData, setFormData] = useState({
    reporting_month: getNextMonth(latestMonth),
    financial_progress: '',
    physical_progress: '',
    expenditure: '',
    revised_cost: '',
    schedule_deviation_months: '',
    completion_date: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.reporting_month.trim()) {
      setError('Reporting month is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        reporting_month: formData.reporting_month.trim(),
        financial_progress: formData.financial_progress !== '' ? parseFloat(formData.financial_progress) : null,
        physical_progress: formData.physical_progress !== '' ? parseFloat(formData.physical_progress) : null,
        expenditure: formData.expenditure !== '' ? parseFloat(formData.expenditure) : null,
        revised_cost: formData.revised_cost !== '' ? parseFloat(formData.revised_cost) : null,
        schedule_deviation_months: formData.schedule_deviation_months !== '' ? parseFloat(formData.schedule_deviation_months) : null,
        completion_date: formData.completion_date.trim() || null,
        notes: formData.notes.trim() || null,
      };

      const res = await submitObservation(projectId, payload);
      setResult(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-[#161922] border border-[#262a3a] rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#12141e] border-b border-[#262a3a]">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#eef0f6] font-semibold">
              Submit Monthly Observation
            </h3>
            <p className="text-[11px] text-amber-500 font-mono mt-0.5">{projectId} · {projectName}</p>
          </div>
          <button onClick={handleClose} className="text-[#6b7194] hover:text-[#eef0f6] transition-colors p-1">
            <X size={15} />
          </button>
        </div>

        {result ? (
          <div className="p-5 space-y-4 text-xs">
            <div className="p-4 bg-[#0f1117] border border-[#1e2235] rounded space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle size={15} />
                <span>Inference Evaluated for {result.reporting_month}:</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
                <div>
                  <span className="text-[#6b7194]">Calibrated Risk:</span>{' '}
                  <strong className="text-amber-400 text-sm">{formatPercent(result.pred_prob, 2)}</strong>
                </div>
                <div>
                  <span className="text-[#6b7194]">Risk Tier:</span>{' '}
                  <strong className="text-[#eef0f6]">{result.risk_tier}</strong>
                </div>
                <div>
                  <span className="text-[#6b7194]">Governance Action:</span>{' '}
                  <strong className="text-[#eef0f6]">{result.action || 'NONE'}</strong>
                </div>
                <div>
                  <span className="text-[#6b7194]">Trajectory:</span>{' '}
                  <span className="text-[#8e94ad]">{result.trajectory_status}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleClose}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-[#0f1117] text-xs font-semibold rounded transition-colors"
              >
                Close & Refresh
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mx-5 mt-4 p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
                    Reporting Month (YYYY-MM) *
                  </label>
                  <input
                    type="text"
                    name="reporting_month"
                    required
                    placeholder="2025-06"
                    value={formData.reporting_month}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded font-mono text-xs focus:outline-none focus:border-amber-600/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
                    Cumulative Spend (₹ Cr)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="expenditure"
                    placeholder="e.g. 35.5"
                    value={formData.expenditure}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded font-mono text-xs focus:outline-none focus:border-amber-600/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
                    Financial Progress (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="financial_progress"
                    placeholder="e.g. 15.0"
                    value={formData.financial_progress}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded font-mono text-xs focus:outline-none focus:border-amber-600/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
                    Schedule Deviation (Months)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="schedule_deviation_months"
                    placeholder="0 for on schedule"
                    value={formData.schedule_deviation_months}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded font-mono text-xs focus:outline-none focus:border-amber-600/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
                  Site Notes & Observations
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Operational remarks, milestone status..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded text-xs focus:outline-none focus:border-amber-600/50 resize-none"
                />
              </div>
            </form>

            <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-[#12141e] border-t border-[#262a3a]">
              <button
                type="button"
                onClick={handleClose}
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
                {loading ? 'Evaluating...' : 'Record Observation'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
