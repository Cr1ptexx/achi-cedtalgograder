import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ChapterPage from './pages/ChapterPage';
import PlanPage from './pages/PlanPage';
import ExamPage from './pages/ExamPage';
import AssignedPage from './pages/AssignedPage';
import ReviewPage from './pages/ReviewPage';
import MockPage from './pages/MockPage';
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
          <Route path="exam" element={<ExamPage />} />
          <Route path="assigned" element={<AssignedPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="mock" element={<MockPage />} />
          <Route path="plan" element={<PlanPage />} />
          <Route path="progress" element={<Navigate to="/" replace />} />
          <Route path="ch/:slug" element={<ChapterPage />} />
          <Route path="p/:code" element={<Suspense fallback={<p className="muted">กำลังโหลด…</p>}><ProblemPage /></Suspense>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
