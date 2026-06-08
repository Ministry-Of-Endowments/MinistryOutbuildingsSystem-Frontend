import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage, { type AuthInfo } from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import MosquesPage from './pages/MosquesPage';
import AddMosquePage from './pages/AddMosquePage';
import OutbuildingsPage from './pages/OutbuildingsPage';
import { ToastProvider } from './components/Toast';

export default function App() {
  const [auth, setAuth] = useState<AuthInfo | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth');
      if (raw) {
        const parsed = JSON.parse(raw) as AuthInfo;
        setAuth(parsed);
      }
    } catch {}
  }, []);

  function handleLoggedIn(info: AuthInfo) {
    setAuth(info);
    try { localStorage.setItem('auth', JSON.stringify(info)); } catch {}
  }

  if (!auth) {
    return (
      <ToastProvider>
        <LoginPage onLoggedIn={handleLoggedIn} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<MosquesPage />} />
            <Route path="/mosques" element={<MosquesPage />} />
            <Route path="/add-mosque" element={<AddMosquePage />} />
            <Route path="/outbuildings" element={<OutbuildingsPage />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}
