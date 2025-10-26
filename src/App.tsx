import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage, { type AuthInfo } from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import OutbuildingsPage from './pages/OutbuildingsPage';
import MosquesPage from './pages/MosquesPage';
import AddMosquePage from './pages/AddMosquePage';
import AddOutbuildingPage from './pages/AddOutbuildingPage';

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
    return <LoginPage onLoggedIn={handleLoggedIn} />;
  }

  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<OutbuildingsPage />} />
          <Route path="/mosques" element={<MosquesPage />} />
          <Route path="/add-mosque" element={<AddMosquePage />} />
          <Route path="/add-outbuilding" element={<AddOutbuildingPage />} />  
        </Route>
      </Routes>
    </Router>
  );
}
