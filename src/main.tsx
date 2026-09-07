import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppErrorBoundary } from './app/AppErrorBoundary';
import { NotFoundPage } from './app/NotFoundPage';
import { registerBuiltinCases } from './cases';
import { CaseDetailPage } from './features/details/CaseDetailPage';
import { LibraryPage } from './features/library/LibraryPage';
import { PresentationPage } from './features/presentation/PresentationPage';
import './styles/tokens.css';
import './styles/global.css';

registerBuiltinCases();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('找不到 #root 挂载点');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/cases/:caseId" element={<CaseDetailPage />} />
          <Route path="/cases/:caseId/present" element={<PresentationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
);
