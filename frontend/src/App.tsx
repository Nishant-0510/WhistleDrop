import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { ModeratorLayout } from './layouts/ModeratorLayout';

import { LandingPage } from './pages/LandingPage';
import { SubmitReportPage } from './pages/SubmitReportPage';
import { SubmissionSuccessPage } from './pages/SubmissionSuccessPage';
import { TrackReportPage } from './pages/TrackReportPage';
import { ModeratorLoginPage } from './pages/ModeratorLoginPage';
import { ModeratorDashboardPage } from './pages/ModeratorDashboardPage';
import { ModeratorReportsPage } from './pages/ModeratorReportsPage';
import { ModeratorReportDetailPage } from './pages/ModeratorReportDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/submit" element={<SubmitReportPage />} />
              <Route path="/submit/success" element={<SubmissionSuccessPage />} />
              <Route path="/track" element={<TrackReportPage />} />
              <Route path="/moderator/login" element={<ModeratorLoginPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Protected Moderator Routes */}
            <Route path="/moderator" element={<ModeratorLayout />}>
              <Route index element={<Navigate to="/moderator/dashboard" replace />} />
              <Route path="dashboard" element={<ModeratorDashboardPage />} />
              <Route path="reports" element={<ModeratorReportsPage />} />
              <Route path="reports/:caseCode" element={<ModeratorReportDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
