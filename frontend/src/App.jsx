import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import { ToastProvider } from './components/common/Toast';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Warnings from './pages/Warnings';
import Escalations from './pages/Escalations';
import AuditTrail from './pages/AuditTrail';
import DemoMode from './pages/DemoMode';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen bg-[#0f1117] text-[#c8ccd8] antialiased grid" style={{ gridTemplateColumns: '220px 1fr' }}>
          <div className="h-screen sticky top-0 overflow-y-auto overflow-x-hidden">
            <Sidebar />
          </div>
          <div className="min-w-0 flex flex-col min-h-screen">
            <Topbar />
            <main className="flex-1 min-w-0">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/overview" element={<Navigate to="/" replace />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/warnings" element={<Warnings />} />
                <Route path="/escalations" element={<Escalations />} />
                <Route path="/audit" element={<AuditTrail />} />
                <Route path="/demo" element={<DemoMode />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <footer className="px-6 py-2.5 border-t border-[#262a3a] text-[11px] text-[#6b7194] flex items-center justify-between">
              <span>VIGIL · Infrastructure Early-Warning System</span>
              <span className="font-mono text-[10px]">Engine v1.0.0 · Deterministic Inference</span>
            </footer>
          </div>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
