import React from 'react';

type Administration = {
  id: number;
  name: string;
};

type DirectorateWithAdmins = {
  id: number;
  name: string;
  administrations: Administration[];
};

type MosqueEditModalProps = {
  form: {
    name: string;
    directorateName: string;
    administrationId: number | null;
    address: string;
    street: string;
    notes: string;
    governorateId: string;
    departmentId: string;
    sheikhdomId: string;
  };
  directorates: DirectorateWithAdmins[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (form: {
    name: string;
    address: string;
    street: string;
    notes: string;
    governorateId: string;
    departmentId: string;
    sheikhdomId: string;
  }) => void;
  onChange: (form: { name: string; directorateName: string; administrationId: number | null; address: string; notes: string }) => void;
};

export default function MosqueEditModal({
  form,
  directorates,
  loading,
  onClose,
  onSubmit,
  onChange,
}: MosqueEditModalProps) {
  const selectedDirectorate = directorates.find(d => d.name === form.directorateName);
  const availableAdministrations = selectedDirectorate?.administrations || [];

  return (
    <div className="modal-backdrop fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="modal-container bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">تعديل المسجد</h3>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" onClick={onClose} aria-label="إغلاق">✕</button>
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
              value={form.directorateName}
              onChange={(e) => onChange({ ...form, directorateName: e.target.value, administrationId: null })}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">اختر المديرية</option>
              {directorates.map((dir) => (
                <option key={dir.id} value={dir.name}>
                  {dir.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${!form.directorateName ? 'text-gray-400' : ''}`}>الإدارة</label>
            <select
              value={form.administrationId ?? ''}
              onChange={(e) => onChange({ ...form, administrationId: e.target.value ? parseInt(e.target.value) : null })}
              required
              disabled={!form.directorateName}
              className={`w-full border rounded px-3 py-2 ${!form.directorateName ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
            >
              <option value="">اختر الإدارة</option>
              {availableAdministrations.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
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

          <AddressFields
            governorateId={form.governorateId}
            departmentId={form.departmentId}
            sheikhdomId={form.sheikhdomId}
            street={form.street}
            onGovernorateChange={(id) => onChange({ ...form, governorateId: String(id), departmentId: '', sheikhdomId: '' })}
            onDepartmentChange={(id) => onChange({ ...form, departmentId: String(id), sheikhdomId: '' })}
            onSheikhdomChange={(id) => onChange({ ...form, sheikhdomId: String(id) })}
            onStreetChange={(street) => onChange({ ...form, street })}
            required={true}
          />

          <div>
            <label className="block mb-1 font-semibold">الملاحظات</label>
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
