import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.tsx';
import SubjectDetails from './pages/SubjectDetails.tsx';
import Settings from './pages/Settings.tsx';
import Analytics from './pages/Analytics.tsx';
import Timer from './pages/Timer.tsx';
import Chat from './pages/Chat.tsx';
import Layout from './shared/components/layout/Layout.tsx';
import Login from './pages/Login.tsx';
import Planner from './pages/Planner.tsx';
import Flashcards from './pages/Flashcards.tsx';
import { ToastProvider } from './shared/context/ToastContext.tsx';
import { AuthProvider, useAuth } from './shared/context/AuthContext.tsx';
import { useProfile } from './features/profile/hooks/useProfile.ts';
import { ProfileProvider } from './features/profile/context/ProfileProvider.tsx';
import { StudyProvider } from './features/study/context/StudyProvider.tsx';
import { PlannerProvider } from './features/study/context/PlannerProvider.tsx';
import { SocialProvider } from './features/social/context/SocialProvider.tsx';
import { Suspense, lazy } from 'react';
const Admin = lazy(() => import('./pages/Admin.tsx'));

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
                <BrowserRouter basename="/Study-Mate/">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<Dashboard />} />
                      <Route path="subject/:id" element={<SubjectDetails />} />
                      <Route path="planner" element={<Planner />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="timer" element={<Timer />} />
                      <Route path="flashcards" element={<Flashcards />} />
                      <Route path="chat" element={<Chat />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="admin" element={
                        <AdminRoute>
                          <Suspense fallback={<div className="p-8 text-center">Loading Admin...</div>}>
                            <Admin />
                          </Suspense>
                        </AdminRoute>
                      } />
                    </Route>
                  </Routes>
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
