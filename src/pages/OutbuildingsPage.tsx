import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import type { OutbuildingWithMosque, Directorate, PurposeOption } from '../utils/types';
import { getLegalStatusLabel, LegalStatus } from '../utils/types';
import OutbuildingDetailsModal from '../components/OutbuildingDetailsModal';
import OutbuildingEditModal from '../components/OutbuildingEditModal';
import ContractModal from '../components/ContractModal';

export default function OutbuildingsPage() {
  const [outbuildings, setOutbuildings] = useState<OutbuildingWithMosque[]>([]);
  const [loading, setLoading] = useState(false);
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
    customPurpose: '',
    legalStatus: null as number | null,
    hasElectricityMeter: null as boolean | null,
    hasWaterMeter: null as boolean | null,
  });
  const [selectedOutbuilding, setSelectedOutbuilding] = useState<OutbuildingWithMosque | null>(null);
  const [showOutbuildingDetailsModal, setShowOutbuildingDetailsModal] = useState(false);
  const [showOutbuildingEditModal, setShowOutbuildingEditModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractForm, setContractForm] = useState({
    startDate: '',
    endDate: '',
    tenantName: '',
    tenantNationalId: '',
    price: '',
    committeeApprovalDate: '',
    contract: null as File | null,
  });
  const [outbuildingEditForm, setOutbuildingEditForm] = useState({
    description: '',
    address: '',
    type: 0,
    price: '',
    space: '',
    notes: '',
    status: false,
    startDate: '',
    endDate: '',
    acceptanceDate: '',
    tenantName: '',
    tenantNationalId: '',
    purpose: 1,
    customPurpose: '',
    legalStatus: null as number | null,
    hasElectricityMeter: false,
    hasWaterMeter: false,
  });
  const [contractLoading, setContractLoading] = useState(false);
  const [outbuildingEditLoading, setOutbuildingEditLoading] = useState(false);

  async function fetchOutbuildings() {
    setLoading(true);
    try {
      let url = '/Outbuildings/all';
      
      const params = new URLSearchParams();
      if (filterForm.directorateName) params.append('directorateName', filterForm.directorateName);
      if (filterForm.administrationName) params.append('administrationName', filterForm.administrationName);
      if (filterForm.mosqueName) params.append('mosqueName', filterForm.mosqueName);
      if (filterForm.status !== null && filterForm.status !== undefined) params.append('status', filterForm.status.toString());
      if (filterForm.purpose !== null && filterForm.purpose !== undefined) params.append('purpose', filterForm.purpose.toString());
      if (filterForm.customPurpose) params.append('customPurpose', filterForm.customPurpose);
      if (filterForm.legalStatus !== null && filterForm.legalStatus !== undefined) params.append('legalStatus', filterForm.legalStatus.toString());
      if (filterForm.minSize) params.append('minSpace', filterForm.minSize);
      if (filterForm.maxSize) params.append('maxSpace', filterForm.maxSize);
      if (filterForm.hasElectricityMeter !== null && filterForm.hasElectricityMeter !== undefined) params.append('hasElectricityMeter', filterForm.hasElectricityMeter.toString());
      if (filterForm.hasWaterMeter !== null && filterForm.hasWaterMeter !== undefined) params.append('hasWaterMeter', filterForm.hasWaterMeter.toString());
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      const res = await apiFetch(url);
      const data = await res.json();
      
      if (data.status === 'success' && data.data) {
        const apiOutbuildings = Array.isArray(data.data) ? data.data : [data.data];
        setOutbuildings(apiOutbuildings.filter((item: OutbuildingWithMosque | null) => item != null));
      } else {
        setOutbuildings([]);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setOutbuildings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
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

  const [filterErrors, setFilterErrors] = useState<Record<string, string>>({});

  function validateFilters(): boolean {
    const errors: Record<string, string> = {};

    if (filterForm.minSize && (isNaN(parseFloat(filterForm.minSize)) || parseFloat(filterForm.minSize) < 0)) {
      errors.minSize = 'يجب أن تكون المساحة الدنيا رقم موجب';
    }

    if (filterForm.maxSize && (isNaN(parseFloat(filterForm.maxSize)) || parseFloat(filterForm.maxSize) < 0)) {
      errors.maxSize = 'يجب أن تكون المساحة القصوى رقم موجب';
    }

    if (filterForm.minSize && filterForm.maxSize) {
      const min = parseFloat(filterForm.minSize);
      const max = parseFloat(filterForm.maxSize);
      if (!isNaN(min) && !isNaN(max) && min > max) {
        errors.minSize = 'المساحة الدنيا يجب أن تكون أقل من المساحة القصوى';
        errors.maxSize = 'المساحة القصوى يجب أن تكون أكبر من المساحة الدنيا';
      }
    }

    if (filterForm.mosqueName && filterForm.mosqueName.length > 200) {
      errors.mosqueName = 'اسم المسجد يجب أن يكون أقل من 200 حرف';
    }

    if (filterForm.customPurpose && filterForm.customPurpose.length > 100) {
      errors.customPurpose = 'النشاط المخصص يجب أن يكون أقل من 100 حرف';
    }

    setFilterErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleApplyFilters() {
    if (!validateFilters()) {
      return;
    }
    fetchOutbuildings();
  }

  function handleResetFilters() {
    const resetForm = {
      directorateName: '',
      administrationName: '',
      mosqueName: '',
      minSize: '',
      maxSize: '',
      status: null,
      purpose: null,
      customPurpose: '',
      legalStatus: null,
      hasElectricityMeter: null,
      hasWaterMeter: null,
    };
    setFilterForm(resetForm);
    setFilterErrors({});
    
    const url = '/Outbuildings/all';
    const res = apiFetch(url);
    res.then(response => response.json()).then(data => {
      if (data.status === 'success' && data.data) {
        const apiOutbuildings = Array.isArray(data.data) ? data.data : [data.data];
        setOutbuildings(apiOutbuildings.filter((item: OutbuildingWithMosque | null) => item != null));
      } else {
        setOutbuildings([]);
      }
    }).catch(e => {
      console.error('Fetch error:', e);
      setOutbuildings([]);
    });
  }

  function handleDirectorateChange(directorateName: string) {
    setFilterForm({
      ...filterForm,
      directorateName,
      administrationName: '',
    });
  }

  const selectedDirectorate = directorates.find(d => d.name === filterForm.directorateName);
  const availableAdministrations = selectedDirectorate?.administrations || [];

  function showOutbuildingDetails(outbuilding: OutbuildingWithMosque) {
    setSelectedOutbuilding(outbuilding);
    setShowOutbuildingDetailsModal(true);
  }

  function openContractModal(item: OutbuildingWithMosque) {
    setSelectedOutbuilding(item);
    setContractForm({
      startDate: '',
      endDate: '',
      tenantName: '',
      tenantNationalId: '',
      price: '',
      committeeApprovalDate: '',
      contract: null,
    });
    setShowContractModal(true);
  }

  function openOutbuildingEditModal(item: OutbuildingWithMosque) {
    setSelectedOutbuilding(item);
    setOutbuildingEditForm({
      description: item.description,
      type: item.type,
      price: item.price?.toString() || '',
      space: item.space?.toString() || '',
      notes: item.notes || '',
      status: item.status,
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      acceptanceDate: item.acceptanceDate || '',
      tenantName: item.tenantName || '',
      tenantNationalId: item.tenantNationalId || '',
      purpose: item.purpose,
      customPurpose: item.customPurpose || '',
      legalStatus: item.legalStatus ?? null,
      hasElectricityMeter: item.hasElectricityMeter ?? false,
      hasWaterMeter: item.hasWaterMeter ?? false,
    });
    setShowOutbuildingEditModal(true);
  }

  async function handleOutbuildingEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOutbuilding) return;
    setOutbuildingEditLoading(true);

    try {
      const payload = {
        description: outbuildingEditForm.description,
        type: outbuildingEditForm.type,
        notes: outbuildingEditForm.notes || null,
        price: parseFloat(outbuildingEditForm.price),
        space: parseFloat(outbuildingEditForm.space),
        status: outbuildingEditForm.status,
        startDate: outbuildingEditForm.startDate || null,
        endDate: outbuildingEditForm.endDate || null,
        acceptanceDate: outbuildingEditForm.acceptanceDate || null,
        tenantName: outbuildingEditForm.tenantName || null,
        tenantNationalId: outbuildingEditForm.tenantNationalId || null,
        purpose: outbuildingEditForm.purpose,
        customPurpose: outbuildingEditForm.customPurpose || null,
        legalStatus: outbuildingEditForm.legalStatus,
        hasElectricityMeter: outbuildingEditForm.hasElectricityMeter,
        hasWaterMeter: outbuildingEditForm.hasWaterMeter,
      };

      const res = await apiFetch(`/Outbuildings/${selectedOutbuilding.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (data.status === 'success') {
        alert('تم تحديث الملحق بنجاح');
        setShowOutbuildingEditModal(false);
        await fetchOutbuildings();
      } else {
        alert(data.message || 'حدث خطأ أثناء التحديث');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('فشل الاتصال بالسيرفر');
    } finally {
      setOutbuildingEditLoading(false);
    }
  }

  async function handleOutbuildingDelete() {
    if (!selectedOutbuilding) return;
    if (!confirm(`هل أنت متأكد من حذف الملحق "${selectedOutbuilding.description}"؟`)) return;

    const res = await apiFetch(`/Outbuildings/${selectedOutbuilding.id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('تم حذف الملحق بنجاح');
      setShowOutbuildingDetailsModal(false);
      await fetchOutbuildings();
    } else {
      const err = await res.json();
      alert(err.message || 'حدث خطأ');
    }
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams();
      
      if (filterForm.directorateName) params.append('DirectorateName', filterForm.directorateName);
      if (filterForm.administrationName) params.append('AdministrationName', filterForm.administrationName);
      if (filterForm.mosqueName) params.append('MosqueName', filterForm.mosqueName);
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
  }

  async function handleContract(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOutbuilding) return;

    setContractLoading(true);
    try {
      const formData = new FormData();
      if (contractForm.contract) {
        formData.append('contract', contractForm.contract);
      }

      const queryParams = new URLSearchParams({
        startDate: contractForm.startDate,
        endDate: contractForm.endDate,
        tenantName: contractForm.tenantName,
        tenantNationalId: contractForm.tenantNationalId,
        price: contractForm.price,
      });

      if (contractForm.committeeApprovalDate) {
        queryParams.append('committeeApprovalDate', contractForm.committeeApprovalDate);
      }

      const res = await apiFetch(`/Outbuildings/Contract/${selectedOutbuilding.id}?${queryParams}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (data.status === 'success') {
        alert('تم إضافة العقد بنجاح');
        setShowContractModal(false);
        await fetchOutbuildings();
      } else {
        alert(data.message || 'حدث خطأ أثناء إضافة العقد');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال بالسيرفر');
    } finally {
      setContractLoading(false);
    }
  }

  useEffect(() => { 
    fetchOutbuildings(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="text-right h-full flex flex-col overflow-hidden">
      <div className="mb-4 p-4 bg-gray-50 border rounded shrink-0">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-xl font-bold mb-2">جميع الملحقات</h2>
            <p className="text-sm text-gray-600">عرض جميع الملحقات في النظام</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            {showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 p-4 border rounded bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 font-semibold text-sm">المديرية</label>
                <select
                  value={filterForm.directorateName}
                  onChange={e => handleDirectorateChange(e.target.value)}
                  className="w-full border rounded px-3 py-2"
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
                >
                  <option value="">الكل</option>
                  {availableAdministrations.map(admin => (
                    <option key={admin.id} value={admin.name}>{admin.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-sm">اسم المسجد</label>
                <input
                  type="text"
                  value={filterForm.mosqueName}
                  onChange={e => {
                    const value = e.target.value;
                    if (value.length <= 200) {
                      setFilterForm({ ...filterForm, mosqueName: value });
                      if (filterErrors.mosqueName) {
                        setFilterErrors({ ...filterErrors, mosqueName: '' });
                      }
                    }
                  }}
                  maxLength={200}
                  placeholder="ابحث عن مسجد..."
                  className={`w-full border rounded px-3 py-2 ${filterErrors.mosqueName ? 'border-red-500' : ''}`}
                />
                {filterErrors.mosqueName && (
                  <p className="text-red-500 text-xs mt-1">{filterErrors.mosqueName}</p>
                )}
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
                  min="0"
                  value={filterForm.minSize}
                  onChange={e => {
                    const value = e.target.value;
                    setFilterForm({ ...filterForm, minSize: value });
                    if (filterErrors.minSize) {
                      setFilterErrors({ ...filterErrors, minSize: '' });
                    }
                  }}
                  placeholder="الحد الأدنى"
                  className={`w-full border rounded px-3 py-2 ${filterErrors.minSize ? 'border-red-500' : ''}`}
                />
                {filterErrors.minSize && (
                  <p className="text-red-500 text-xs mt-1">{filterErrors.minSize}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-semibold text-sm">المساحة (إلى)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filterForm.maxSize}
                  onChange={e => {
                    const value = e.target.value;
                    setFilterForm({ ...filterForm, maxSize: value });
                    if (filterErrors.maxSize) {
                      setFilterErrors({ ...filterErrors, maxSize: '' });
                    }
                  }}
                  placeholder="الحد الأقصى"
                  className={`w-full border rounded px-3 py-2 ${filterErrors.maxSize ? 'border-red-500' : ''}`}
                />
                {filterErrors.maxSize && (
                  <p className="text-red-500 text-xs mt-1">{filterErrors.maxSize}</p>
                )}
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
                تطبيق الفلاتر
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

      <div className="flex-1 overflow-auto bg-white border rounded min-h-0">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 border">#</th>
              <th className="p-3 border">اسم الملحق</th>
              <th className="p-3 border">اسم المسجد</th>
              <th className="p-3 border">المديرية</th>
              <th className="p-3 border">الإدارة</th>
              <th className="p-3 border">الغرض</th>
              <th className="p-3 border">الحالة</th>
              <th className="p-3 border">المساحة</th>
              <th className="p-3 border w-48">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="p-6 text-center">جارٍ التحميل...</td></tr>
            ) : outbuildings.length === 0 ? (
              <tr><td colSpan={9} className="p-6 text-center">لا توجد بيانات لعرضها</td></tr>
            ) : outbuildings.map((outbuilding, idx) => (
              <tr key={outbuilding.id} className="hover:bg-gray-50">
                <td className="p-3 border">{idx + 1}</td>
                <td className="p-3 border">{outbuilding.description || '-'}</td>
                <td className="p-3 border">{outbuilding.mosqueName || '-'}</td>
                <td className="p-3 border">{outbuilding.directorateName || '-'}</td>
                <td className="p-3 border">{outbuilding.administrationName || '-'}</td>
                <td className="p-3 border">{outbuilding.purposeText || '-'}</td>
                <td className="p-3 border">{outbuilding.status ? 'مؤجر' : 'غير مؤجر'}</td>
                <td className="p-3 border">{outbuilding.space || '-'}</td>
                <td className="p-2 border w-64">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: 'var(--primary)' }}
                      onClick={() => showOutbuildingDetails(outbuilding)}
                    >
                      عرض
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showOutbuildingDetailsModal && selectedOutbuilding && (
        <OutbuildingDetailsModal
          outbuilding={selectedOutbuilding}
          onClose={() => setShowOutbuildingDetailsModal(false)}
          onEdit={() => openOutbuildingEditModal(selectedOutbuilding)}
          onDelete={handleOutbuildingDelete}
          onAddContract={() => openContractModal(selectedOutbuilding)}
        />
      )}

      {showOutbuildingEditModal && selectedOutbuilding && (
        <OutbuildingEditModal
          outbuildingDescription={selectedOutbuilding.description}
          form={outbuildingEditForm}
          loading={outbuildingEditLoading}
          onClose={() => setShowOutbuildingEditModal(false)}
          onSubmit={handleOutbuildingEdit}
          onChange={setOutbuildingEditForm}
        />
      )}

      {showContractModal && selectedOutbuilding && (
        <ContractModal
          outbuildingName={selectedOutbuilding.description}
          form={contractForm}
          loading={contractLoading}
          onClose={() => setShowContractModal(false)}
          onSubmit={handleContract}
          onChange={setContractForm}
        />
      )}
    </div>
  );
}

