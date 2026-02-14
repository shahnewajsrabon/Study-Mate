import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SubjectDetails from './pages/SubjectDetails';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import AllChapters from './pages/AllChapters';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter basename="/Study-Track/">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="subject/:id" element={<SubjectDetails />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="chapters" element={<AllChapters />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
