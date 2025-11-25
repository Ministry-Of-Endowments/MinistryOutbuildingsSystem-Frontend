import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import type { Outbuilding, Directorate, PurposeOption } from '../utils/types';
import { getOutbuildingTypeLabel, getLegalStatusLabel, LegalStatus } from '../utils/types';

type OutbuildingsListModalProps = {
  mosqueName: string;
  outbuildings: Outbuilding[];
  loading: boolean;
  onClose: () => void;
  onShowDetails: (outbuilding: Outbuilding) => void;
  onAddOutbuilding: () => void;
  onFilter: (filter: {
    directorateName?: string;
    administrationName?: string;
    mosqueName?: string;
    minSize?: number | null;
    maxSize?: number | null;
    status?: boolean | null;
    purpose?: number | null;
    legalStatus?: number | null;
  }) => void;
};

export default function OutbuildingsListModal({
  mosqueName,
  outbuildings,
  loading,
  onClose,
  onShowDetails,
  onAddOutbuilding,
  onFilter,
}: OutbuildingsListModalProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [directorates, setDirectorates] = useState<Directorate[]>([]);
  const [purposes, setPurposes] = useState<PurposeOption[]>([]);
  const [filterForm, setFilterForm] = useState({
    directorateName: '',
    administrationName: '',
    mosqueName: '',
    minSize: '',
    maxSize: '',
    status: null as boolean | null,
    purpose: null as number | null,
    legalStatus: null as number | null,
  });

  useEffect(() => {
    // Fetch directorates with administrations
    async function fetchDirectorates() {
      try {
        const res = await apiFetch('/Outbuildings/Directorates/WithAdministrations');
        const data = await res.json();
        if (data.status === 'success') {
          const sorted = (data.data || []).map((dir: Directorate) => ({
            ...dir,
            administrations: [...dir.administrations].sort((a, b) => a.name.localeCompare(b.name, 'ar'))
          })).sort((a: Directorate, b: Directorate) => a.name.localeCompare(b.name, 'ar'));
          setDirectorates(sorted);
        }
      } catch (e) {
        console.error('Failed to fetch directorates:', e);
      }
    }

    // Fetch purposes
    async function fetchPurposes() {
      try {
        const res = await apiFetch('/Outbuildings/purposes');
        const data = await res.json();
        if (data.status === 'success') {
          const sorted = [...(data.data || [])].sort((a: PurposeOption, b: PurposeOption) => 
            a.label.localeCompare(b.label, 'ar')
          );
          setPurposes(sorted);
        }
      } catch (e) {
        console.error('Failed to fetch purposes:', e);
      }
    }

    fetchDirectorates();
    fetchPurposes();
  }, []);

  const handleApplyFilters = () => {
    onFilter({
      directorateName: filterForm.directorateName || undefined,
      administrationName: filterForm.administrationName || undefined,
      mosqueName: filterForm.mosqueName || undefined,
      minSize: filterForm.minSize ? parseFloat(filterForm.minSize) : null,
      maxSize: filterForm.maxSize ? parseFloat(filterForm.maxSize) : null,
      status: filterForm.status,
      purpose: filterForm.purpose,
      legalStatus: filterForm.legalStatus,
    });
  };

  const handleResetFilters = () => {
    setFilterForm({
      directorateName: '',
      administrationName: '',
      mosqueName: '',
      minSize: '',
      maxSize: '',
      status: null,
      purpose: null,
      legalStatus: null,
    });
    onFilter({});
  };

  // Get administrations for selected directorate
  const selectedDirectorate = directorates.find(d => d.name === filterForm.directorateName);
  const availableAdministrations = selectedDirectorate?.administrations || [];

  const handleDirectorateChange = (directorateName: string) => {
    setFilterForm({
      ...filterForm,
      directorateName,
      administrationName: '', // Reset administration when directorate changes
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded shadow w-[95vw] max-w-[1400px] h-[90vh] p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="text-lg font-semibold">ملحقات مسجد: {mosqueName}</h3>
          <button className="text-gray-600" onClick={onClose}>✖</button>
        </div>

        {/* Filter Section */}
        <div className="mb-4 shrink-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            {showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
          </button>
          
          {showFilters && (
            <div className="mt-3 p-4 border rounded bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 font-semibold text-sm">المديرية</label>
                  <select
                    value={filterForm.directorateName}
                    onChange={e => handleDirectorateChange(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                    size={1}
                  >
                    <option value="">الكل</option>
                    {directorates.map(dir => (
                      <option key={dir.id} value={dir.name}>{dir.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block mb-1 font-semibold text-sm ${!filterForm.directorateName ? 'text-gray-400' : ''}`}>الإدارة</label>
                  <select
                    value={filterForm.administrationName}
                    onChange={e => setFilterForm({ ...filterForm, administrationName: e.target.value })}
                    disabled={!filterForm.directorateName}
                    className={`w-full border rounded px-3 py-2 ${!filterForm.directorateName ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                    size={1}
                  >
                    <option value="">الكل</option>
                    {availableAdministrations.map(admin => (
                      <option key={admin.id} value={admin.name}>{admin.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 font-semibold text-sm">الحالة</label>
                  <select
                    value={filterForm.status === null ? '' : filterForm.status.toString()}
                    onChange={e => setFilterForm({ ...filterForm, status: e.target.value === '' ? null : e.target.value === 'true' })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">الكل</option>
                    <option value="true">مستغل</option>
                    <option value="false">غير مستغل</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 font-semibold text-sm">الغرض</label>
                  <select
                    value={filterForm.purpose ?? ''}
                    onChange={e => setFilterForm({ ...filterForm, purpose: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full border rounded px-3 py-2"
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                    size={1}
                  >
                    <option value="">الكل</option>
                    {purposes.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 font-semibold text-sm">الحالة القانونية</label>
                  <select
                    value={filterForm.legalStatus ?? ''}
                    onChange={e => setFilterForm({ ...filterForm, legalStatus: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">الكل</option>
                    <option value={LegalStatus.Litigation}>{getLegalStatusLabel(LegalStatus.Litigation)}</option>
                    <option value={LegalStatus.Encroachment}>{getLegalStatusLabel(LegalStatus.Encroachment)}</option>
                    <option value={LegalStatus.Stable}>{getLegalStatusLabel(LegalStatus.Stable)}</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-sm">المساحة (من)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filterForm.minSize}
                    onChange={e => setFilterForm({ ...filterForm, minSize: e.target.value })}
                    placeholder="الحد الأدنى"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-sm">المساحة (إلى)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filterForm.maxSize}
                    onChange={e => setFilterForm({ ...filterForm, maxSize: e.target.value })}
                    placeholder="الحد الأقصى"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  تطبيق الفلاتر
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  إعادة تعيين
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto bg-white border rounded min-h-0">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 border">#</th>
                <th className="p-3 border">الوصف</th>
                <th className="p-3 border">العنوان</th>
                <th className="p-3 border">النوع</th>
                <th className="p-3 border">الغرض</th>
                <th className="p-3 border">الحالة القانونية</th>
                <th className="p-3 border">الحالة</th>
                <th className="p-3 border">اسم المستأجر</th>
                <th className="p-3 border">الرقم القومي</th>
                <th className="p-3 border">المساحة</th>
                <th className="p-3 border">السعر</th>
                <th className="p-3 border">تاريخ البدء</th>
                <th className="p-3 border">تاريخ الانتهاء</th>
                <th className="p-3 border">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={14} className="p-6 text-center">جارٍ التحميل...</td></tr>
              ) : outbuildings.length === 0 ? (
                <tr><td colSpan={14} className="p-6 text-center text-gray-500">لا توجد ملحقات</td></tr>
              ) : outbuildings.filter(item => item != null).map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{idx + 1}</td>
                  <td className="p-3 border">{item.description || '-'}</td>
                  <td className="p-3 border">{item.address || '-'}</td>
                  <td className="p-3 border">{getOutbuildingTypeLabel(item.type)}</td>
                  <td className="p-3 border">{item.purposeText || '-'}</td>
                  <td className="p-3 border">{item.legalStatusText || '-'}</td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 rounded text-xs ${item.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.status ? 'مستغل' : 'غير مستغل'}
                    </span>
                  </td>
                  <td className="p-3 border">{item.tenantName || '-'}</td>
                  <td className="p-3 border">{item.tenantNationalId || '-'}</td>
                  <td className="p-3 border">{item.space || '-'}</td>
                  <td className="p-3 border">{item.price || '-'}</td>
                  <td className="p-3 border">{item.startDate ? new Date(item.startDate).toLocaleDateString('ar-EG') : '-'}</td>
                  <td className="p-3 border">{item.endDate ? new Date(item.endDate).toLocaleDateString('ar-EG') : '-'}</td>
                  <td className="p-3 border">
                    <button
                      className="px-3 py-1 rounded"
                      style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                      onClick={() => onShowDetails(item)}
                    >
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end gap-2 shrink-0">
          <button
            className="px-4 py-2 rounded text-white"
            style={{ backgroundColor: 'var(--primary)' }}
            onClick={onAddOutbuilding}
          >
            إضافة ملحق
          </button>
          <button
            className="px-4 py-2 rounded border"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
