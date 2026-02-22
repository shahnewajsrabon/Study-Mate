import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SubjectDetails from './pages/SubjectDetails';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Timer from './pages/Timer';
import Chat from './pages/Chat';
import Layout from './components/Layout';
import Login from './pages/Login';
import Planner from './pages/Planner';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useProfile } from './hooks/useProfile';
import { ProfileProvider } from './context/ProfileProvider';
import { StudyProvider } from './context/StudyProvider';
import { PlannerProvider } from './context/PlannerProvider';
import { SocialProvider } from './context/SocialProvider';
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
