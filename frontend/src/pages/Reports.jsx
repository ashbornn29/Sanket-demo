import React, { useState, useEffect } from 'react';
import { FileText, Eye, Download, RefreshCw } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Loading from '../components/common/Loading';
import { useToast } from '../components/common/Toast';
import { getReports } from '../services/api';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const { addToast } = useToast();

  useEffect(() => { loadReports(); }, []);
  async function loadReports() { setLoading(true); const data = await getReports(); setReports(data); setLoading(false); }

  const statusColors = { Available: 'bg-green-50 text-green-700', Generating: 'bg-amber-50 text-amber-700', Draft: 'bg-navy-50 text-navy-600' };

  return (
    <PageContainer title="Reports" subtitle="Generate, view, and export infrastructure monitoring reports.">
      {loading ? <Loading /> : (
        <div className="space-y-3">{reports.map((report) => (
          <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0"><FileText size={18} className="text-navy-600" /></div>
                <div><h3 className="text-sm font-semibold text-navy-800">{report.title}</h3><p className="text-xs text-navy-500 mt-0.5">{report.description}</p><div className="flex items-center gap-3 mt-2"><span className="text-[10px] text-navy-400">{report.type}</span><span className="text-[10px] text-navy-400">•</span><span className="text-[10px] text-navy-400">{report.date}</span><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusColors[report.status]}`}>{report.status}</span></div></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => addToast('Report opened in new tab.', 'info')} className="h-8 px-3 text-xs font-medium text-navy-600 bg-white border border-gray-200 rounded-lg hover:bg-navy-50 flex items-center gap-1.5"><Eye size={12} />View</button>
                <button onClick={() => addToast('Report generation started.', 'success')} className="h-8 px-3 text-xs font-medium text-navy-600 bg-white border border-gray-200 rounded-lg hover:bg-navy-50 flex items-center gap-1.5"><RefreshCw size={12} />Generate</button>
                <button onClick={() => addToast('PDF export started. This may take a moment.', 'info')} className="h-8 px-3 text-xs font-medium text-white bg-navy-700 rounded-lg hover:bg-navy-800 flex items-center gap-1.5"><Download size={12} />Export PDF</button>
              </div>
            </div>
          </div>))}</div>
      )}
    </PageContainer>
  );
}
