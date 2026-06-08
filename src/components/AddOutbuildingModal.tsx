import { useState, useEffect } from 'react';
import { fetchPurposesCached } from '../utils/cache';
import { OutbuildingPurpose, LegalStatus, getOutbuildingPurposeLabel, getLegalStatusLabel, type PurposeOption } from '../utils/types';
import AddressFields from './AddressFields';
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
      <div className="modal-backdrop fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-9999">
        <div className="modal-container bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">إضافة ملحق - {mosqueName}</h3>
            <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" onClick={onClose} aria-label="إغلاق">✕</button>
          </div>

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-full">
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
                <label className="block mb-1 font-semibold">نشاط آخر (يرجى التحديد) <span className="text-red-500">*</span></label>
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

            <div className="col-span-full">
              <label className="block mb-1 font-semibold">الملاحظات (اختياري)</label>
              <textarea
                value={form.notes}
                onChange={e => onChange({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasElectricityMeter}
                  onChange={e => onChange({ ...form, hasElectricityMeter: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-semibold">يوجد عداد كهرباء</span>
              </label>
            </div>

            <div>
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
    </Portal>
  );
}
