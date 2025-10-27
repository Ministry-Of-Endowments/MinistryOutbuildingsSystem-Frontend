import React from 'react';
import { DIRECTORATES } from '../utils/constants';

type MosqueEditModalProps = {
  form: {
    name: string;
    directorate: string;
    address: string;
    notes: string;
  };
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (form: { name: string; directorate: string; address: string; notes: string }) => void;
};

export default function MosqueEditModal({
  form,
  loading,
  onClose,
  onSubmit,
  onChange,
}: MosqueEditModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded shadow max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">تعديل المسجد</h3>
          <button className="text-gray-600" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">اسم المسجد</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">المديرية</label>
            <select
              value={form.directorate}
              onChange={(e) => onChange({ ...form, directorate: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">اختر المديرية</option>
              {DIRECTORATES.map((dir) => (
                <option key={dir} value={dir}>
                  {dir}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">العنوان</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => onChange({ ...form, address: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">الملاحظات (اختياري)</label>
            <textarea
              value={form.notes}
              onChange={(e) => onChange({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={onClose}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {loading ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
