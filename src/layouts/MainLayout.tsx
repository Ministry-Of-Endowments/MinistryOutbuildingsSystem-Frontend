import { Link, Outlet, useLocation } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  function logout() {
    if (!window.confirm('هل أنت متأكد أنك تريد تسجيل الخروج؟')) return;
    try { localStorage.removeItem('auth'); } catch {}
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="flex items-center gap-3">
          <img src="/logo-white.png" alt="وزارة الأوقاف" className="h-14 w-auto" />
          <div className="text-right">
            <div className="font-semibold">نظام إدارة الملحقات</div>
            <div className="text-sm text-gray-600">وزارة الأوقاف المصرية</div>
          </div>
        </div>
        <button className="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700" onClick={logout}>تسجيل الخروج</button>
      </header>

      <div className="w-full px-4 py-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 h-[calc(100vh-100px)] overflow-hidden" dir="rtl">
        <aside className="bg-white border rounded p-2 flex-shrink-0">
          <nav className="flex md:flex-col gap-2">
            <Link to="/mosques" className={`px-3 py-2 rounded text-sm ${isActive('/mosques') || isActive('/') ? 'bg-(--primary) text-white' : 'hover:bg-gray-100'}`}>المساجد</Link>
            <Link to="/add-mosque" className={`px-3 py-2 rounded text-sm ${isActive('/add-mosque') ? 'bg-(--primary) text-white' : 'hover:bg-gray-100'}`}>إضافة مسجد</Link>
          </nav>
        </aside>

        <main className="bg-white border rounded p-3 overflow-hidden flex flex-col min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
