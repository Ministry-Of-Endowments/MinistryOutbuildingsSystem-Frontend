import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

export default function MainLayout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function handleLogout() {
    try { localStorage.removeItem('auth'); } catch {}
    window.location.href = '/';
  }

  const navLink = (to: string, label: string, active: boolean) => (
    <Link
      to={to}
      className={`
        flex items-center px-4 py-2.5 rounded-lg font-medium transition-all duration-150
        ${active
          ? 'text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
      style={active ? { backgroundColor: 'var(--primary)' } : {}}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo-white.png" alt="وزارة الأوقاف" className="h-12 w-auto" />
          <div className="text-right">
            <div className="font-bold text-gray-900">نظام إدارة الملحقات</div>
            <div className="text-sm text-gray-500">وزارة الأوقاف المصرية</div>
          </div>
        </div>
        <button
          className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors active:scale-95 duration-150"
          onClick={() => setShowLogoutConfirm(true)}
        >
          تسجيل الخروج
        </button>
      </header>

      <div className="w-full px-4 py-5 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 h-[calc(100vh-72px)] overflow-hidden" dir="rtl">
        <aside className="bg-white rounded-xl shadow-sm p-3 shrink-0 flex flex-col gap-1">
          {navLink('/mosques', 'المساجد', isActive('/mosques') || isActive('/'))}
          {navLink('/add-mosque', 'إضافة مسجد', isActive('/add-mosque'))}
          {navLink('/outbuildings', 'جميع الملحقات', isActive('/outbuildings'))}
        </aside>

        <main className="bg-white rounded-xl shadow-sm p-4 overflow-hidden flex flex-col min-h-0">
          <Outlet />
        </main>
      </div>

      {showLogoutConfirm && (
        <ConfirmModal
          message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
          confirmLabel="تسجيل الخروج"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  );
}
