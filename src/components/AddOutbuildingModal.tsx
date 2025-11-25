import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { OutbuildingPurpose, LegalStatus, getOutbuildingPurposeLabel, getLegalStatusLabel, type PurposeOption } from '../utils/types';

type AddOutbuildingModalProps = {
  mosqueName: string;
  form: {
    description: string;
    address: string;
    type: string;
    price: string;
    space: string;
    notes: string;
    purpose: number;
    customPurpose: string;
    legalStatus: number | null;
  };
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (form: { 
    description: string; 
    address: string; 
    type: string; 
    price: string; 
    space: string; 
    notes: string;
    purpose: number;
    customPurpose: string;
    legalStatus: number | null;
  }) => void;
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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-70">
      <div className="bg-white rounded shadow max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">إضافة ملحق - {mosqueName}</h3>
          <button className="text-gray-600" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-1 font-semibold">وصف الملحق</label>
            <input
              type="text"
              value={form.description}
              onChange={e => onChange({ ...form, description: e.target.value })}
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
            <label className="block mb-1 font-semibold">الغرض من الملحق</label>
            <select
              value={form.purpose}
              onChange={e => onChange({ ...form, purpose: parseInt(e.target.value) })}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">اختر الغرض</option>
              {purposes.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {form.purpose === OutbuildingPurpose.Other && (
            <div>
              <label className="block mb-1 font-semibold">غرض آخر (يرجى التحديد)</label>
              <input
                type="text"
                value={form.customPurpose}
                onChange={e => onChange({ ...form, customPurpose: e.target.value })}
                required
                className="w-full border rounded px-3 py-2"
                placeholder="اكتب الغرض المخصص..."
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
