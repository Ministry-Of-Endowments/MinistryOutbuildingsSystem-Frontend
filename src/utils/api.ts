export type ApiOptions = RequestInit & { attachJson?: boolean };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5101/api';
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

console.log('Environment variables:', import.meta.env);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('BACKEND_BASE_URL:', BACKEND_BASE_URL);

export function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(input: string, init?: ApiOptions): Promise<Response> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (init?.attachJson && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const finalInit: RequestInit = {
    ...init,
    headers,
  };

  const url = input.startsWith('/') ? `${API_BASE_URL}${input}` : input;
  
  console.log('API call - input:', input, 'final URL:', url);

  return fetch(url, finalInit);
}

export function getBackendUrl(path: string): string {
  if (!path) return '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_BASE_URL}${cleanPath}`;
}
