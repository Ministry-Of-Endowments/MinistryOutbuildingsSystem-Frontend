type OutbuildingEditModalProps = {
  outbuildingName: string;
  form: {
    name: string;
    address: string;
    type: number;
    price: string;
    space: string;
    notes: string;
    status: boolean;
    startDate: string;
    endDate: string;
    acceptanceDate: string;
  };
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (form: {
    name: string;
    address: string;
    type: number;
    price: string;
    space: string;
    notes: string;
    status: boolean;
    startDate: string;
    endDate: string;
    acceptanceDate: string;
  }) => void;
};

export default function OutbuildingEditModal({
  outbuildingName,
  form,
  loading,
  onClose,
  onSubmit,
  onChange,
}: OutbuildingEditModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-70">
      <div className="bg-white rounded shadow max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">تعديل الملحق - {outbuildingName}</h3>
          <button className="text-gray-600" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">الاسم</label>
            <input
              type="text"
              value={form.name}
              onChange={e => onChange({ ...form, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">العنوان</label>
            <input
              type="text"
              value={form.address}
              onChange={e => onChange({ ...form, address: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">النوع</label>
            <select
              value={form.type}
              onChange={e => onChange({ ...form, type: parseInt(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value={0}>محل</option>
              <option value={1}>شقة</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">السعر</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={e => onChange({ ...form, price: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">المساحة</label>
            <input
              type="number"
              step="0.01"
              value={form.space}
              onChange={e => onChange({ ...form, space: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">الحالة</label>
            <select
              value={form.status ? 'true' : 'false'}
              onChange={e => onChange({ ...form, status: e.target.value === 'true' })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="false">غير مؤجر</option>
              <option value="true">مؤجر</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">تاريخ البداية</label>
            <input
              type="date"
              value={form.startDate}
              onChange={e => onChange({ ...form, startDate: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">تاريخ النهاية</label>
            <input
              type="date"
              value={form.endDate}
              onChange={e => onChange({ ...form, endDate: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">تاريخ القبول</label>
            <input
              type="date"
              value={form.acceptanceDate}
              onChange={e => onChange({ ...form, acceptanceDate: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">ملاحظات</label>
            <textarea
              value={form.notes}
              onChange={e => onChange({ ...form, notes: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded text-white bg-primary disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={onClose}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
