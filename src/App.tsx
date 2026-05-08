import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './shared/components/layout/Layout.tsx';
import Layout from './shared/components/layout/Layout.tsx';
import { ToastProvider } from './shared/context/ToastContext.tsx';
import { AuthProvider, useAuth } from './shared/context/AuthContext.tsx';
import { useProfile } from './features/profile/hooks/useProfile.ts';
import { ProfileProvider } from './features/profile/context/ProfileProvider.tsx';
import { StudyProvider } from './features/study/context/StudyProvider.tsx';
import { PlannerProvider } from './features/study/context/PlannerProvider.tsx';
import { SocialProvider } from './features/social/context/SocialProvider.tsx';
import { Suspense, lazy } from 'react';
const Admin = lazy(() => import('./pages/Admin.tsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const SubjectDetails = lazy(() => import('./pages/SubjectDetails.tsx'));
const Settings = lazy(() => import('./pages/Settings.tsx'));
const Analytics = lazy(() => import('./pages/Analytics.tsx'));
const Timer = lazy(() => import('./pages/Timer.tsx'));
const Chat = lazy(() => import('./pages/Chat.tsx'));
const Planner = lazy(() => import('./pages/Planner.tsx'));
const Notes = lazy(() => import('./pages/Notes.tsx'));
const Flashcards = lazy(() => import('./pages/Flashcards.tsx'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useProfile();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProfileProvider>
          <StudyProvider>
            <PlannerProvider>
              <SocialProvider>
                <BrowserRouter basename="/Track-ED/">
                  <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500">Loading...</div>}>
                    <Routes>
                      <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="subject/:id" element={<SubjectDetails />} />
                        <Route path="planner" element={<Planner />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="notes" element={<Notes />} />
                        <Route path="timer" element={<Timer />} />
                        <Route path="flashcards" element={<Flashcards />} />
                        <Route path="chat" element={<Chat />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="admin" element={
                          <AdminRoute>
                            <Admin />
                          </AdminRoute>
                        } />
                      </Route>
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </SocialProvider>
            </PlannerProvider>
          </StudyProvider>
        </ProfileProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
