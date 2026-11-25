import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ChapterPage from './pages/ChapterPage';
import PlanPage from './pages/PlanPage';
import ProgressPage from './pages/ProgressPage';
import { lazy, Suspense } from 'react';

// The editor (CodeMirror) is the heaviest dependency — load it only on problem pages.
const ProblemPage = lazy(() => import('./pages/ProblemPage'));

// HashRouter so deep links work on GitHub Pages without server rewrites.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="plan" element={<PlanPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="ch/:slug" element={<ChapterPage />} />
          <Route path="p/:code" element={<Suspense fallback={<p className="muted">กำลังโหลด…</p>}><ProblemPage /></Suspense>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
