type AddOutbuildingModalProps = {
  mosqueName: string;
  form: {
    name: string;
    address: string;
    type: string;
    price: string;
    space: string;
    notes: string;
  };
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (form: { name: string; address: string; type: string; price: string; space: string; notes: string }) => void;
};

export default function AddOutbuildingModal({
  mosqueName,
  form,
  loading,
  onClose,
  onSubmit,
  onChange,
}: AddOutbuildingModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-70">
      <div className="bg-white rounded shadow max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">إضافة ملحق - {mosqueName}</h3>
          <button className="text-gray-600" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-1 font-semibold">اسم الملحق</label>
            <input
              type="text"
              value={form.name}
              onChange={e => onChange({ ...form, name: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">العنوان</label>
            <input
              type="text"
              value={form.address}
              onChange={e => onChange({ ...form, address: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">النوع</label>
            <select
              value={form.type}
              onChange={e => onChange({ ...form, type: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">اختر النوع</option>
              <option value="0">محل</option>
              <option value="1">شقة</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">السعر</label>
            <input
              type="text"
              value={form.price}
              onChange={e => onChange({ ...form, price: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">المساحة</label>
            <input
              type="text"
              value={form.space}
              onChange={e => onChange({ ...form, space: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="col-span-full">
            <label className="block mb-1 font-semibold">الملاحظات (اختياري)</label>
            <textarea
              value={form.notes}
              onChange={e => onChange({ ...form, notes: e.target.value })}
              rows={4}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="col-span-full flex justify-end gap-3 mt-4">
            <button
              type="button"
              className="px-6 py-2 border rounded hover:bg-gray-50"
              onClick={onClose}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white rounded hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {loading ? 'جارٍ الحفظ...' : 'إضافة ملحق'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
