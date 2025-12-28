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
            <label className="block mb-1 font-semibold">تاريخ بدء العقد <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => onChange({ ...form, startDate: e.target.value })}
              required
              max={form.endDate || undefined}
              className="w-full border rounded px-3 py-2"
            />
            {form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate) && (
              <p className="text-red-500 text-sm mt-1">تاريخ البداية يجب أن يكون قبل تاريخ النهاية</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">تاريخ انتهاء العقد <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => onChange({ ...form, endDate: e.target.value })}
              required
              min={form.startDate || undefined}
              className="w-full border rounded px-3 py-2"
            />
            {form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate) && (
              <p className="text-red-500 text-sm mt-1">تاريخ النهاية يجب أن يكون بعد تاريخ البداية</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">اسم المنتفع <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.tenantName}
              onChange={(e) => onChange({ ...form, tenantName: e.target.value })}
              required
              minLength={3}
              maxLength={100}
              className="w-full border rounded px-3 py-2"
              placeholder="أدخل اسم المنتفع..."
            />
            {form.tenantName && form.tenantName.length < 3 && (
              <p className="text-red-500 text-sm mt-1">يجب أن يكون الاسم على الأقل 3 أحرف</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">رقم بطاقة المنتفع <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.tenantNationalId}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 14) {
                  onChange({ ...form, tenantNationalId: value });
                }
              }}
              required
              maxLength={14}
              className="w-full border rounded px-3 py-2"
              placeholder="14 رقم"
            />
            {form.tenantNationalId && form.tenantNationalId.length !== 14 && form.tenantNationalId.length > 0 && (
              <p className="text-red-500 text-sm mt-1">يجب أن يكون الرقم القومي 14 رقم</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">قيمة حق الانتفاع <span className="text-red-500">*</span></label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                  onChange({ ...form, price: value });
                }
              }}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="0.00"
            />
            {form.price && (isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) && (
              <p className="text-red-500 text-sm mt-1">يجب أن تكون القيمة رقم موجب</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">تاريخ قبول اللجنة</label>
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
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const maxSize = 10 * 1024 * 1024;
                  if (file.size > maxSize) {
                    alert('حجم الملف يجب أن يكون أقل من 10 ميجابايت');
                    return;
                  }
                  const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                  if (!validTypes.includes(file.type)) {
                    alert('نوع الملف غير مدعوم. يرجى اختيار ملف PDF أو صورة');
                    return;
                  }
                }
                onChange({ ...form, contract: file || null });
              }}
              className="w-full border rounded px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">يُسمح بملفات PDF والصور (JPG, PNG) بحد أقصى 10 ميجابايت</p>
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
