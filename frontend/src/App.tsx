import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { AboutDrawer } from './components/AboutDrawer';
import { CommandCenter } from './pages/CommandCenter';
import { ProjectConsole } from './pages/ProjectConsole';
import { HistoricalReplay } from './pages/HistoricalReplay';

export function App() {
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Header onOpenAbout={() => setIsAboutOpen(true)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/projects/:projectId" element={<ProjectConsole />} />
            <Route path="/projects/:projectId/replay" element={<HistoricalReplay />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <AboutDrawer isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </div>
    </BrowserRouter>
  );
}

export default App;
