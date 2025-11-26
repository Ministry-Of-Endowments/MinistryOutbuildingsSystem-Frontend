type ContractModalProps = {
  outbuildingName: string;
  form: {
    startDate: string;
    endDate: string;
    tenantName: string;
    tenantNationalId: string;
    price: string;
    committeeApprovalDate: string;
    contract: File | null;
  };
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (form: {
    startDate: string;
    endDate: string;
    tenantName: string;
    tenantNationalId: string;
    price: string;
    committeeApprovalDate: string;
    contract: File | null;
  }) => void;
};

export default function ContractModal({
  outbuildingName,
  form,
  loading,
  onClose,
  onSubmit,
  onChange,
}: ContractModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-70">
      <div className="bg-white rounded shadow max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">إضافة عقد - {outbuildingName}</h3>
          <button className="text-gray-600" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">تاريخ البداية</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => onChange({ ...form, startDate: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">تاريخ النهاية</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => onChange({ ...form, endDate: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">اسم المستأجر</label>
            <input
              type="text"
              value={form.tenantName}
              onChange={(e) => onChange({ ...form, tenantName: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">رقم بطاقة المستأجر</label>
            <input
              type="text"
              value={form.tenantNationalId}
              onChange={(e) => onChange({ ...form, tenantNationalId: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">قيمة حق الانتفاع</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => onChange({ ...form, price: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">تاريخ موافقة اللجنة</label>
            <input
              type="date"
              value={form.committeeApprovalDate}
              onChange={(e) => onChange({ ...form, committeeApprovalDate: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">ملف العقد (اختياري)</label>
            <input
              type="file"
              onChange={(e) => onChange({ ...form, contract: e.target.files?.[0] || null })}
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
              {loading ? 'جارٍ الحفظ...' : 'حفظ العقد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
