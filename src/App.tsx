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
import { useAuth } from './context/AuthContext';
import { useStudy } from './context/StudyContext';
import { ToastProvider } from './context/ToastContext';
import { StudyProvider } from './context/StudyContext';
import { SocialProvider } from './context/SocialContext';
import Admin from './pages/Admin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useStudy();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ToastProvider>
      <StudyProvider>
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
                    <Admin />
                  </AdminRoute>
                } />
              </Route>
            </Routes>
          </BrowserRouter>
        </SocialProvider>
      </StudyProvider>
    </ToastProvider>
  );
}

export default App;
