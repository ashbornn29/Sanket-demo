import React, { useState } from 'react';
import { submitContractorResponse } from '../../services/api';
import { X } from 'lucide-react';

export default function WarningResponseModal({ isOpen, onClose, projectId, warning, onSuccess }) {
  const [formData, setFormData] = useState({
    response_text: '',
    corrective_action: '',
    expected_recovery_date: '',
    responsible_person: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !warning) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.response_text.trim() || !formData.corrective_action.trim()) {
      setError('Explanation and corrective action are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        acknowledged: true,
        response_text: formData.response_text.trim(),
        corrective_action: formData.corrective_action.trim(),
        expected_recovery_date: formData.expected_recovery_date.trim() || null,
        responsible_person: formData.responsible_person.trim() || null,
      };

      const result = await submitContractorResponse(projectId, warning.warning_id, payload);
      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-[#161922] border border-[#262a3a] rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#12141e] border-b border-[#262a3a]">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#eef0f6] font-semibold">
              Log Contractor Response
            </h3>
            <p className="text-[11px] text-amber-500 font-mono mt-0.5">Notice: {warning.warning_id} · Month: {warning.reporting_month}</p>
          </div>
          <button onClick={onClose} className="text-[#6b7194] hover:text-[#eef0f6] transition-colors p-1">
            <X size={15} />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
              Contractor Explanation / Root Cause *
            </label>
            <textarea
              name="response_text"
              required
              rows={2}
              placeholder="e.g. Subcontractor site dispute caused temporary suspension..."
              value={formData.response_text}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded text-xs focus:outline-none focus:border-amber-600/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
              Corrective Action Plan *
            </label>
            <textarea
              name="corrective_action"
              required
              rows={3}
              placeholder="e.g. 1. Mobilized 2 additional shifts. 2. Cleared pending disbursements."
              value={formData.corrective_action}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded font-mono text-xs focus:outline-none focus:border-amber-600/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
                Target Recovery Month
              </label>
              <input
                type="text"
                name="expected_recovery_date"
                placeholder="2025-08"
                value={formData.expected_recovery_date}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded font-mono text-xs focus:outline-none focus:border-amber-600/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8e94ad] mb-1">
                Authorized Signatory
              </label>
              <input
                type="text"
                name="responsible_person"
                placeholder="Name / Designation"
                value={formData.responsible_person}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-[#0f1117] border border-[#262a3a] text-[#c8ccd8] rounded text-xs focus:outline-none focus:border-amber-600/50"
              />
            </div>
          </div>
        </form>

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
            {loading ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      </div>
    </div>
  );
}
