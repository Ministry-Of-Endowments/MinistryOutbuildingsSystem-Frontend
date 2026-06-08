import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error';
type Toast = { id: number; message: string; type: ToastType };
type ToastContextType = { toast: (message: string, type?: ToastType) => void };

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    if (type === 'success') {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }
  }, []);

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 items-end" dir="rtl">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`toast-item flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm max-w-sm ${
                t.type === 'success' ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="text-white/70 hover:text-white shrink-0"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
