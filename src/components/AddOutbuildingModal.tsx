import { useState, useEffect, type MouseEvent } from 'react';
import { fetchPurposesCached } from '../utils/cache';
import { OutbuildingPurpose, LegalStatus, getOutbuildingPurposeLabel, getLegalStatusLabel, type PurposeOption } from '../utils/types';
import Portal from './Portal';

type AddOutbuildingForm = {
  description: string;
  governorateId: string;
  departmentId: string;
  sheikhdomId: string;
  street: string;
  space: string;
  notes: string;
  purpose: number;
  customPurpose: string;
  legalStatus: number | null;
  hasElectricityMeter: boolean;
  hasWaterMeter: boolean;
  status: boolean;
  price: string;
  tenantName: string;
  tenantNationalId: string;
  startDate: string;
  endDate: string;
  acceptanceDate: string;
  contractFile: File | null;
};

type AddOutbuildingModalProps = {
  mosqueName: string;
  form: AddOutbuildingForm;
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (form: AddOutbuildingForm) => void;
};

export default function AddOutbuildingModal({
  mosqueName,
  form,
  loading,
  onClose,
  onSubmit,
  onChange,
}: AddOutbuildingModalProps) {
  const [purposes, setPurposes] = useState<PurposeOption[]>([]);

  useEffect(() => {
    fetchPurposesCached()
      .then(setPurposes)
      .catch(() => setPurposes([
        { value: OutbuildingPurpose.QuranOffices, label: getOutbuildingPurposeLabel(OutbuildingPurpose.QuranOffices) },
        { value: OutbuildingPurpose.Nurseries, label: getOutbuildingPurposeLabel(OutbuildingPurpose.Nurseries) },
        { value: OutbuildingPurpose.SewingWorkshops, label: getOutbuildingPurposeLabel(OutbuildingPurpose.SewingWorkshops) },
        { value: OutbuildingPurpose.EducationalCenters, label: getOutbuildingPurposeLabel(OutbuildingPurpose.EducationalCenters) },
        { value: OutbuildingPurpose.SpeechAndSkillsCenters, label: getOutbuildingPurposeLabel(OutbuildingPurpose.SpeechAndSkillsCenters) },
        { value: OutbuildingPurpose.ClinicsAndMedicalCenters, label: getOutbuildingPurposeLabel(OutbuildingPurpose.ClinicsAndMedicalCenters) },
        { value: OutbuildingPurpose.Other, label: getOutbuildingPurposeLabel(OutbuildingPurpose.Other) },
      ]));
  }, []);

  return (
    <Portal>
      <div className="modal-backdrop fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-9999" onClick={onClose}>
        <div className="modal-container bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden" onClick={(e: MouseEvent) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">إضافة ملحق - {mosqueName}</h3>
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" onClick={onClose} aria-label="إغلاق">✕</button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">

            {/* Description */}
            <div>
              <label className="block mb-1 font-semibold">وصف الملحق <span className="text-red-500">*</span></label>
              <textarea
                value={form.description}
                onChange={e => onChange({ ...form, description: e.target.value })}
                required
                minLength={3}
                maxLength={500}
                rows={3}
                className="w-full border rounded px-3 py-2"
                placeholder="أدخل وصف الملحق..."
              />
              {form.description && form.description.length < 3 && (
                <p className="text-red-500 text-sm mt-1">يجب أن يكون الوصف على الأقل 3 أحرف</p>
              )}
            </div>

            {/* Core fields row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 font-semibold">النشاط</label>
                <select
                  value={form.purpose}
                  onChange={e => onChange({ ...form, purpose: parseInt(e.target.value) })}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">اختر النشاط</option>
                  {purposes.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {form.purpose === OutbuildingPurpose.Other && (
                <div>
                  <label className="block mb-1 font-semibold">نشاط آخر <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.customPurpose}
                    onChange={e => onChange({ ...form, customPurpose: e.target.value })}
                    required
                    minLength={3}
                    maxLength={100}
                    className="w-full border rounded px-3 py-2"
                    placeholder="اكتب النشاط المخصص..."
                  />
                </div>
              )}

              <div>
                <label className="block mb-1 font-semibold">الحالة القانونية</label>
                <select
                  value={form.legalStatus ?? ''}
                  onChange={e => onChange({ ...form, legalStatus: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">اختر الحالة</option>
                  <option value={LegalStatus.Litigation}>{getLegalStatusLabel(LegalStatus.Litigation)}</option>
                  <option value={LegalStatus.Encroachment}>{getLegalStatusLabel(LegalStatus.Encroachment)}</option>
                  <option value={LegalStatus.Stable}>{getLegalStatusLabel(LegalStatus.Stable)}</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">المساحة (متر مربع) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.space}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                      onChange({ ...form, space: value });
                    }
                  }}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Meters */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasElectricityMeter}
                  onChange={e => onChange({ ...form, hasElectricityMeter: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-semibold">يوجد عداد كهرباء</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasWaterMeter}
                  onChange={e => onChange({ ...form, hasWaterMeter: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-semibold">يوجد عداد مياه</span>
              </label>
            </div>

            {/* حالة الانتفاع */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-3 mb-1">
                <label className="font-semibold text-gray-700">حالة الانتفاع</label>
                <select
                  value={form.status ? 'true' : 'false'}
                  onChange={e => onChange({
                    ...form,
                    status: e.target.value === 'true',
                    // clear tenant fields when switching to غير منتفع به
                    ...(e.target.value === 'false' ? {
                      price: '',
                      tenantName: '',
                      tenantNationalId: '',
                      startDate: '',
                      endDate: '',
                      acceptanceDate: '',
                    } : {}),
                  })}
                  className="border rounded px-3 py-1.5 text-sm font-medium"
                >
                  <option value="false">غير منتفع به</option>
                  <option value="true">منتفع به</option>
                </select>
              </div>

              {/* Animated tenant fields */}
              <div
                style={{
                  maxHeight: form.status ? '600px' : '0px',
                  opacity: form.status ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.4s ease, opacity 0.3s ease',
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="block mb-1 font-semibold text-sm">اسم المنتفع <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.tenantName}
                      onChange={e => onChange({ ...form, tenantName: e.target.value })}
                      required={form.status}
                      className="w-full border rounded px-3 py-2"
                      placeholder="اسم المنتفع"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-sm">الرقم القومي <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.tenantNationalId}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 14) onChange({ ...form, tenantNationalId: value });
                      }}
                      required={form.status}
                      maxLength={14}
                      className="w-full border rounded px-3 py-2"
                      placeholder="14 رقم"
                    />
                    {form.tenantNationalId && form.tenantNationalId.length > 0 && form.tenantNationalId.length !== 14 && (
                      <p className="text-red-500 text-xs mt-1">يجب أن يكون الرقم القومي 14 رقم</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-sm">قيمة حق الانتفاع <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={e => {
                        const value = e.target.value;
                        if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                          onChange({ ...form, price: value });
                        }
                      }}
                      required={form.status}
                      className="w-full border rounded px-3 py-2"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-sm">تاريخ القبول</label>
                    <input
                      type="date"
                      value={form.acceptanceDate}
                      onChange={e => onChange({ ...form, acceptanceDate: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-sm">تاريخ البداية</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={e => onChange({ ...form, startDate: e.target.value })}
                      max={form.endDate || undefined}
                      className="w-full border rounded px-3 py-2"
                    />
                    {form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate) && (
                      <p className="text-red-500 text-xs mt-1">تاريخ البداية يجب أن يكون قبل تاريخ النهاية</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-sm">تاريخ النهاية</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={e => onChange({ ...form, endDate: e.target.value })}
                      min={form.startDate || undefined}
                      className="w-full border rounded px-3 py-2"
                    />
                    {form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate) && (
                      <p className="text-red-500 text-xs mt-1">تاريخ النهاية يجب أن يكون بعد تاريخ البداية</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-1 font-semibold text-sm">ملف العقد</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) { e.target.value = ''; return; }
                          const valid = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                          if (!valid.includes(file.type)) { e.target.value = ''; return; }
                        }
                        onChange({ ...form, contractFile: file });
                      }}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">PDF أو صورة، بحد أقصى 10 ميجابايت</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block mb-1 font-semibold">الملاحظات</label>
              <textarea
                value={form.notes}
                onChange={e => onChange({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-3 mt-2">
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
    </Portal>
  );
}
