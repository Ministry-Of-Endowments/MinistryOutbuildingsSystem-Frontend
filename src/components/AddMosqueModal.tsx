import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import AddressFields from './AddressFields';
import Portal from './Portal';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddMosqueModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    name: '',
    governorateId: '',
    departmentId: '',
    sheikhdomId: '',
    street: '',
    address: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/Mosques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          governorateId: parseInt(form.governorateId),
          departmentId: parseInt(form.departmentId),
          sheikhdomId: parseInt(form.sheikhdomId),
          street: form.street,
          address: form.address,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'حدث خطأ أثناء الإضافة');
      }
    } catch {
      setError('فشل الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Portal>
      <div className="modal-backdrop fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-9999">
        <div className="modal-container bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">إضافة مسجد جديد</h3>
            <button
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              onClick={onClose}
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-full">
              <label className="block mb-1 font-semibold">اسم المسجد <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <AddressFields
              governorateId={form.governorateId}
              departmentId={form.departmentId}
              sheikhdomId={form.sheikhdomId}
              street={form.street}
              onGovernorateChange={(id) => setForm({ ...form, governorateId: String(id), departmentId: '', sheikhdomId: '' })}
              onDepartmentChange={(id) => setForm({ ...form, departmentId: String(id), sheikhdomId: '' })}
              onSheikhdomChange={(id) => setForm({ ...form, sheikhdomId: String(id) })}
              onStreetChange={(street) => setForm({ ...form, street })}
              required={true}
            />

            <div className="col-span-full">
              <label className="block mb-1 font-semibold">العنوان <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="col-span-full">
              <label className="block mb-1 font-semibold">الملاحظات (اختياري)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="col-span-full flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border rounded hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-white rounded hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {loading ? 'جارٍ الحفظ...' : 'إضافة مسجد'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
