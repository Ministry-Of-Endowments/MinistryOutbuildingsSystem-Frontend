import { useState, useEffect } from 'react';
import { apiFetch, getBackendUrl } from '../utils/api';
import { fetchPurposesCached } from '../utils/cache';
import type { Outbuilding, PurposeOption } from '../utils/types';
import { getLegalStatusLabel, LegalStatus } from '../utils/types';

type OutbuildingsListModalProps = {
  mosqueName: string;
  outbuildings: Outbuilding[];
  loading: boolean;
  onClose: () => void;
  onShowDetails: (outbuilding: Outbuilding) => void;
  onAddOutbuilding: () => void;
  onFilter: (filter: {
    minSize?: number | null;
    maxSize?: number | null;
    status?: boolean | null;
    purpose?: number | null;
    customPurpose?: string;
    legalStatus?: number | null;
    hasElectricityMeter?: boolean | null;
    hasWaterMeter?: boolean | null;
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
  const [purposes, setPurposes] = useState<PurposeOption[]>([]);
  const [filterForm, setFilterForm] = useState({
    minSize: '',
    maxSize: '',
    status: null as boolean | null,
    purpose: null as number | null,
    customPurpose: '',
    legalStatus: null as number | null,
    hasElectricityMeter: null as boolean | null,
    hasWaterMeter: null as boolean | null,
  });

  useEffect(() => {
    fetchPurposesCached()
      .then(data => setPurposes([...data].sort((a: PurposeOption, b: PurposeOption) => a.label.localeCompare(b.label, 'ar'))))
      .catch(() => {});
  }, []);

  const handleApplyFilters = () => {
    onFilter({
      minSize: filterForm.minSize ? parseFloat(filterForm.minSize) : null,
      maxSize: filterForm.maxSize ? parseFloat(filterForm.maxSize) : null,
      status: filterForm.status,
      purpose: filterForm.purpose,
      customPurpose: filterForm.customPurpose || undefined,
      legalStatus: filterForm.legalStatus,
      hasElectricityMeter: filterForm.hasElectricityMeter,
      hasWaterMeter: filterForm.hasWaterMeter,
    });
  };

  const handleResetFilters = () => {
    setFilterForm({
      minSize: '',
      maxSize: '',
      status: null,
      purpose: null,
      customPurpose: '',
      legalStatus: null,
      hasElectricityMeter: null,
      hasWaterMeter: null,
    });
    onFilter({});
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();

      // Always scope export to this mosque
      params.append('MosqueName', mosqueName);
      if (filterForm.minSize) params.append('MinSpace', filterForm.minSize);
      if (filterForm.maxSize) params.append('MaxSpace', filterForm.maxSize);
      if (filterForm.status !== null) params.append('Status', String(filterForm.status));
      if (filterForm.purpose !== null) params.append('Purpose', String(filterForm.purpose));
      if (filterForm.customPurpose) params.append('CustomPurpose', filterForm.customPurpose);
      if (filterForm.legalStatus !== null) params.append('LegalStatus', String(filterForm.legalStatus));
      if (filterForm.hasElectricityMeter !== null) params.append('HasElectricityMeter', String(filterForm.hasElectricityMeter));
      if (filterForm.hasWaterMeter !== null) params.append('HasWaterMeter', String(filterForm.hasWaterMeter));

      const queryString = params.toString();
      const url = `/Outbuildings/export-mosques-outbuildings${queryString ? `?${queryString}` : ''}`;
      
      const res = await apiFetch(url);
      
      if (!res.ok) {
        throw new Error('فشل في تصدير البيانات');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `MosquesOutbuildings_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('حدث خطأ أثناء التصدير');
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="modal-container bg-white rounded-xl shadow-xl w-[98vw] max-w-[1800px] h-[90vh] p-6 flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="text-lg font-semibold">ملحقات مسجد: {mosqueName}</h3>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" onClick={onClose} aria-label="إغلاق">✕</button>
        </div>

        {/* Filter Section */}
        <div className="mb-4 shrink-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-white transition-colors text-sm"
          >
            <span>{showFilters ? 'إخفاء التصفية' : 'خيارات التصفية'}</span>
            <span className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}>▾</span>
          </button>
          
          {showFilters && (
            <div className="mt-3 p-4 border rounded bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="block mb-1 font-semibold text-sm">النشاط</label>
                  <select
                    value={filterForm.customPurpose || (filterForm.purpose ?? '')}
                    onChange={e => {
                      const selectedValue = e.target.value;
                      const selectedPurpose = purposes.find(p => 
                        p.isCustom ? p.label === selectedValue : String(p.value) === selectedValue
                      );
                      
                      if (selectedPurpose?.isCustom) {
                        setFilterForm({ ...filterForm, purpose: null, customPurpose: selectedPurpose.label });
                      } else {
                        setFilterForm({ ...filterForm, purpose: selectedValue ? parseInt(selectedValue) : null, customPurpose: '' });
                      }
                    }}
                    className="w-full border rounded px-3 py-2"
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                    size={1}
                  >
                    <option value="">الكل</option>
                    {purposes.map((p, idx) => (
                      <option key={idx} value={p.isCustom ? p.label : p.value}>
                        {p.label}
                      </option>
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

                <div>
                  <label className="block mb-1 font-semibold text-sm">عداد كهرباء</label>
                  <select
                    value={filterForm.hasElectricityMeter === null ? '' : String(filterForm.hasElectricityMeter)}
                    onChange={e => setFilterForm({ ...filterForm, hasElectricityMeter: e.target.value === '' ? null : e.target.value === 'true' })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">الكل</option>
                    <option value="true">يوجد</option>
                    <option value="false">لا يوجد</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-sm">عداد مياه</label>
                  <select
                    value={filterForm.hasWaterMeter === null ? '' : String(filterForm.hasWaterMeter)}
                    onChange={e => setFilterForm({ ...filterForm, hasWaterMeter: e.target.value === '' ? null : e.target.value === 'true' })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">الكل</option>
                    <option value="true">يوجد</option>
                    <option value="false">لا يوجد</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  تطبيق التصفية
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  إعادة تعيين
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
                >
                  تصدير إلى Excel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto bg-white rounded-lg shadow-sm min-h-0">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">#</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">الوصف</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">النشاط</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">الحالة القانونية</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">الحالة</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">اسم المنتفع</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">الرقم القومي</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">المساحة</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">قيمة حق الانتفاع</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">عداد كهرباء</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">عداد مياه</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">بدء العقد</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">انتهاء العقد</th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={14} className="px-4 py-8 text-center text-gray-400">جارٍ التحميل...</td></tr>
              ) : outbuildings.length === 0 ? (
                <tr><td colSpan={14} className="px-4 py-8 text-center text-gray-400">لا توجد ملحقات</td></tr>
              ) : outbuildings.filter(item => item != null).map((item, idx) => {
                let rowHighlight = '';
                if (item.endDate && item.status) {
                  const endDate = new Date(item.endDate);
                  const today = new Date();
                  const threeMonthsFromNow = new Date();
                  threeMonthsFromNow.setMonth(today.getMonth() + 3);
                  if (endDate <= threeMonthsFromNow && endDate >= today) {
                    rowHighlight = 'bg-orange-50';
                  }
                }
                return (
                  <tr key={item.id} className={`hover:bg-gray-50/70 transition-colors duration-150 ${rowHighlight}`}>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{idx + 1}</td>
                    <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{item.description || '-'}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.purposeText || '-'}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.legalStatusText || '-'}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${item.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.status ? 'مستغل' : 'غير مستغل'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.tenantName || '-'}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.tenantNationalId || '-'}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.space || '-'}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.price || '-'}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.hasElectricityMeter ? 'نعم' : 'لا'}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.hasWaterMeter ? 'نعم' : 'لا'}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.startDate ? new Date(item.startDate).toLocaleDateString('ar-EG') : '-'}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.endDate ? new Date(item.endDate).toLocaleDateString('ar-EG') : '-'}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex gap-1.5">
                        <button
                          className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 active:scale-95"
                          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                          onClick={() => onShowDetails(item)}
                        >
                          عرض
                        </button>
                        {item.contractUrl && (
                          <a
                            href={getBackendUrl(item.contractUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-150 active:scale-95"
                          >
                            العقد
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
