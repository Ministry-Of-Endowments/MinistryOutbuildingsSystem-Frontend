import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { OutbuildingPurpose, LegalStatus, getOutbuildingPurposeLabel, getLegalStatusLabel, type PurposeOption } from '../utils/types';
import AddressFields from './AddressFields';

type OutbuildingEditModalProps = {
  outbuildingDescription: string;
  form: {
    description: string;
    governorateId: string;
    departmentId: string;
    sheikhdomId: string;
    street: string;
    type: number;
    price: string;
    space: string;
    notes: string;
    status: boolean;
    startDate: string;
    endDate: string;
    acceptanceDate: string;
    tenantName: string;
    tenantNationalId: string;
    purpose: number;
    customPurpose: string;
    legalStatus: number | null;
    hasElectricityMeter: boolean;
    hasWaterMeter: boolean;
  };
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (form: {
    description: string;
    governorateId: string;
    departmentId: string;
    sheikhdomId: string;
    street: string;
    type: number;
    price: string;
    space: string;
    notes: string;
    status: boolean;
    startDate: string;
    endDate: string;
    acceptanceDate: string;
    tenantName: string;
    tenantNationalId: string;
    purpose: number;
    customPurpose: string;
    legalStatus: number | null;
    hasElectricityMeter: boolean;
    hasWaterMeter: boolean;
  }) => void;
};

export default function OutbuildingEditModal({
  outbuildingDescription,
  form,
  loading,
  onClose,
  onSubmit,
  onChange,
}: OutbuildingEditModalProps) {
  const [purposes, setPurposes] = useState<PurposeOption[]>([]);
  
  useEffect(() => {
    // Fetch purposes from backend
    async function fetchPurposes() {
      try {
        const res = await apiFetch('/Outbuildings/purposes');
        const data = await res.json();
        if (data.status === 'success') {
          setPurposes(data.data || []);
        }
      } catch (e) {
        console.error('Failed to fetch purposes:', e);
        // Fallback to hardcoded values
        setPurposes([
          { value: OutbuildingPurpose.QuranOffices, label: getOutbuildingPurposeLabel(OutbuildingPurpose.QuranOffices) },
          { value: OutbuildingPurpose.Nurseries, label: getOutbuildingPurposeLabel(OutbuildingPurpose.Nurseries) },
          { value: OutbuildingPurpose.SewingWorkshops, label: getOutbuildingPurposeLabel(OutbuildingPurpose.SewingWorkshops) },
          { value: OutbuildingPurpose.EducationalCenters, label: getOutbuildingPurposeLabel(OutbuildingPurpose.EducationalCenters) },
          { value: OutbuildingPurpose.SpeechAndSkillsCenters, label: getOutbuildingPurposeLabel(OutbuildingPurpose.SpeechAndSkillsCenters) },
          { value: OutbuildingPurpose.ClinicsAndMedicalCenters, label: getOutbuildingPurposeLabel(OutbuildingPurpose.ClinicsAndMedicalCenters) },
          { value: OutbuildingPurpose.Other, label: getOutbuildingPurposeLabel(OutbuildingPurpose.Other) },
        ]);
      }
    }
    fetchPurposes();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded shadow max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">تعديل الملحق - {outbuildingDescription}</h3>
          <button className="text-gray-600" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">وصف الملحق <span className="text-red-500">*</span></label>
            <textarea
              value={form.description}
              onChange={e => onChange({ ...form, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
              minLength={3}
              maxLength={500}
              rows={3}
              placeholder="أدخل وصف الملحق..."
            />
            {form.description && form.description.length < 3 && (
              <p className="text-red-500 text-sm mt-1">يجب أن يكون الوصف على الأقل 3 أحرف</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
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
              {form.customPurpose && form.customPurpose.length < 3 && (
                <p className="text-red-500 text-sm mt-1">يجب أن يكون النشاط على الأقل 3 أحرف</p>
              )}
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
            <label className="block mb-1 font-semibold">قيمة حق الانتفاع <span className="text-red-500">*</span></label>
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
              className="w-full border rounded px-3 py-2"
              required
              placeholder="0.00"
            />
            {form.price && (isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) && (
              <p className="text-red-500 text-sm mt-1">يجب أن تكون القيمة رقم موجب</p>
            )}
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
              className="w-full border rounded px-3 py-2"
              required
              placeholder="0.00"
            />
            {form.space && (isNaN(parseFloat(form.space)) || parseFloat(form.space) < 0) && (
              <p className="text-red-500 text-sm mt-1">يجب أن تكون المساحة رقم موجب</p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-semibold">الحالة</label>
            <select
              value={form.status ? 'true' : 'false'}
              onChange={e => onChange({ ...form, status: e.target.value === 'true' })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="false">غير مستغل</option>
              <option value="true">مستغل</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">تاريخ البداية</label>
            <input
              type="date"
              value={form.startDate}
              onChange={e => onChange({ ...form, startDate: e.target.value })}
              max={form.endDate || undefined}
              className="w-full border rounded px-3 py-2"
            />
            {form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate) && (
              <p className="text-red-500 text-sm mt-1">تاريخ البداية يجب أن يكون قبل تاريخ النهاية</p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-semibold">تاريخ النهاية</label>
            <input
              type="date"
              value={form.endDate}
              onChange={e => onChange({ ...form, endDate: e.target.value })}
              min={form.startDate || undefined}
              className="w-full border rounded px-3 py-2"
            />
            {form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate) && (
              <p className="text-red-500 text-sm mt-1">تاريخ النهاية يجب أن يكون بعد تاريخ البداية</p>
            )}
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
            <label className="block mb-1 font-semibold">اسم المنتفع</label>
            <input
              type="text"
              value={form.tenantName}
              onChange={e => onChange({ ...form, tenantName: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="اسم المنتفع (اختياري)"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">الرقم القومي للمستأجر</label>
            <input
              type="text"
              value={form.tenantNationalId}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 14) {
                  onChange({ ...form, tenantNationalId: value });
                }
              }}
              maxLength={14}
              className="w-full border rounded px-3 py-2"
              placeholder="الرقم القومي (14 رقم)"
            />
            {form.tenantNationalId && form.tenantNationalId.length !== 14 && form.tenantNationalId.length > 0 && (
              <p className="text-red-500 text-sm mt-1">يجب أن يكون الرقم القومي 14 رقم</p>
            )}
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
