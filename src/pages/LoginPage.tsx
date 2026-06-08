import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

type LoginResponseDto = {
  token: string;
  fullName?: string;
  role?: string;
  email?: string;
};

type ApiResponse<T> = {
  status: 'success' | 'error';
  message: string;
  data: T | null;
  errors?: string[];
};

type ValidationError = {
  type: string;
  title: string;
  status: number;
  errors: Record<string, string[]>;
  traceId?: string;
};

export type AuthInfo = {
  token: string;
  role: string;
  fullName?: string;
  email?: string;
};

export default function LoginPage(props: { onLoggedIn: (auth: AuthInfo) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    document.title = 'وزارة الأوقاف المصرية - نظام إدارة الملحقات';
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!email || !password) {
      const fe: Record<string, string[]> = {};
      if (!email) fe.Email = ['Email is required.'];
      if (!password) fe.Password = ['Password is required.'];
      setFieldErrors(fe);
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/Auth/Login', {
        method: 'POST',
        attachJson: true,
        body: JSON.stringify({ Email: email, Password: password })
      });

      const text = await res.text();
      let json: any = null;
      try { json = text ? JSON.parse(text) : null; } catch { json = null; }

      if (!res.ok) {
        const ve = json as ValidationError | null;
        if (ve && ve.errors) {
          setFieldErrors(ve.errors);
          setError(ve.title || 'حدث خطأ في التحقق من صحة البيانات');
        } else {
          setError('فشل الاتصال بالخادم');
        }
        return;
      }

      const data = json as ApiResponse<LoginResponseDto>;
      if (data.status === 'success' && data.data && data.data.token) {
        const role = data.data.role || '';
        props.onLoggedIn({
          token: data.data.token,
          role,
          fullName: data.data.fullName,
          email: data.data.email,
        });
        return;
      }

      if (data.status === 'error') {
        setError(data.message || 'بيانات الدخول غير صحيحة');
        return;
      }

      setError('استجابة غير متوقعة من الخادم');
    } catch (err) {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow border p-8">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-white.png" alt="وزارة الأوقاف" className="h-36 w-auto mb-4" />
          <h1 className="text-center text-2xl font-semibold">وزارة الأوقاف المصرية - نظام إدارة الملحقات</h1>
        </div>

        {error && (
          <div className="mb-4 text-red-700 bg-red-50 border border-red-200 rounded p-3 text-right">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          <div className="text-right">
            <label className="block mb-1 font-medium">البريد الإليكتروني</label>
            <input
              type="email"
              className="w-full border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.Email && (
              <div className="text-sm text-red-600 mt-1">{fieldErrors.Email[0]}</div>
            )}
          </div>

          <div className="text-right">
            <label className="block mb-1 font-medium">كلمة المرور</label>
            <input
              type="password"
              className="w-full border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.Password && (
              <div className="text-sm text-red-600 mt-1">{fieldErrors.Password[0]}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded text-white disabled:opacity-60 text-base"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
