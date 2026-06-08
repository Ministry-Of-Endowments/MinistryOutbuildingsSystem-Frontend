import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { fetchDirectoratesCached, fetchPurposesCached } from '../utils/cache';
import type { OutbuildingWithMosque, Directorate, PurposeOption, Mosque } from '../utils/types';
import { getLegalStatusLabel, LegalStatus } from '../utils/types';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import OutbuildingDetailsModal from '../components/OutbuildingDetailsModal';
import OutbuildingEditModal from '../components/OutbuildingEditModal';
import ContractModal from '../components/ContractModal';

export default function OutbuildingsPage() {
  const { toast } = useToast();
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
    governorateId: '',
    departmentId: '',
    sheikhdomId: '',
    street: '',
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
  const [filterErrors, setFilterErrors] = useState<Record<string, string>>({});
  const [confirmState, setConfirmState] = useState<{ message: string; onConfirm: () => void } | null>(null);

  function promptConfirm(message: string, action: () => void) {
    setConfirmState({ message, onConfirm: action });
  }

  function filterMosques(mosques: Mosque[], form: typeof filterForm): Mosque[] {
    let filtered = mosques;
    if (form.directorateName) {
      filtered = filtered.filter(m => m.directorateName === form.directorateName);
    }
    if (form.administrationName) {
      filtered = filtered.filter(m => m.administrationName === form.administrationName);
    }
    if (form.mosqueName.trim()) {
      const term = form.mosqueName.trim();
      filtered = filtered.filter(m => m.name.includes(term));
    }
    return filtered;
  }

  function buildOutbuildingQuery(form: typeof filterForm): string {
    const params = new URLSearchParams();
    if (form.status !== null && form.status !== undefined) params.append('status', form.status.toString());
    if (form.purpose !== null && form.purpose !== undefined) params.append('purpose', form.purpose.toString());
    if (form.customPurpose) params.append('customPurpose', form.customPurpose);
    if (form.legalStatus !== null && form.legalStatus !== undefined) params.append('legalStatus', form.legalStatus.toString());
    if (form.minSize) params.append('minSpace', form.minSize);
    if (form.maxSize) params.append('maxSpace', form.maxSize);
    if (form.hasElectricityMeter !== null && form.hasElectricityMeter !== undefined) {
      params.append('hasElectricityMeter', form.hasElectricityMeter.toString());
    }
    if (form.hasWaterMeter !== null && form.hasWaterMeter !== undefined) {
      params.append('hasWaterMeter', form.hasWaterMeter.toString());
    }
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  async function fetchOutbuildings(form = filterForm) {
    setLoading(true);
    try {
      const mosquesRes = await apiFetch('/Mosques');
      const mosquesData = await mosquesRes.json();
      if (mosquesData.status !== 'success' || !mosquesData.data) {
        setOutbuildings([]);
        return;
      }

      const mosques = filterMosques(mosquesData.data as Mosque[], form);
      const query = buildOutbuildingQuery(form);

      const batches = await Promise.all(
        mosques.map(async (mosque) => {
          try {
            const res = await apiFetch(`/Outbuildings/${mosque.id}${query}`);
            const data = await res.json();
            if (data.status !== 'success' || !data.data) return [];
            const items = Array.isArray(data.data) ? data.data : [data.data];
            return items
              .filter((item: OutbuildingWithMosque | null) => item != null)
              .map((item: OutbuildingWithMosque) => ({
                ...item,
                mosqueId: mosque.id,
                mosqueName: item.mosqueName ?? mosque.name,
                mosqueAddress: item.mosqueAddress ?? mosque.address,
                administrationId: item.administrationId ?? mosque.administrationId,
                administrationName: item.administrationName ?? mosque.administrationName,
                directorateId: item.directorateId ?? mosque.directorateId,
                directorateName: item.directorateName ?? mosque.directorateName,
              }));
          } catch {
            return [];
          }
        })
      );

      setOutbuildings(batches.flat());
    } catch {
      setOutbuildings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOutbuildings();
    fetchDirectoratesCached().then(setDirectorates).catch(() => {});
    fetchPurposesCached()
      .then(data => setPurposes([...data].sort((a, b) => a.label.localeCompare(b.label, 'ar'))))
      .catch(() => {});
  }, []);

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
    if (!validateFilters()) return;
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
    fetchOutbuildings(resetForm);
  }

  function handleDirectorateChange(directorateName: string) {
    setFilterForm({ ...filterForm, directorateName, administrationName: '' });
  }

  const selectedDirectorate = directorates.find(d => d.name === filterForm.directorateName);
  const availableAdministrations = selectedDirectorate?.administrations || [];

  function showOutbuildingDetails(outbuilding: OutbuildingWithMosque) {
    setSelectedOutbuilding(outbuilding);
    setShowOutbuildingDetailsModal(true);
  }

  function openContractModal(item: OutbuildingWithMosque) {
    setSelectedOutbuilding(item);
    setContractForm({ startDate: '', endDate: '', tenantName: '', tenantNationalId: '', price: '', committeeApprovalDate: '', contract: null });
    setShowContractModal(true);
  }

  function openOutbuildingEditModal(item: OutbuildingWithMosque) {
    setSelectedOutbuilding(item);
    setOutbuildingEditForm({
      description: item.description,
      governorateId: item.governorateId?.toString() || '',
      departmentId: item.departmentId?.toString() || '',
      sheikhdomId: item.sheikhdomId?.toString() || '',
      street: item.street || '',
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
        governorateId: parseInt(outbuildingEditForm.governorateId),
        departmentId: parseInt(outbuildingEditForm.departmentId),
        sheikhdomId: parseInt(outbuildingEditForm.sheikhdomId),
        street: outbuildingEditForm.street,
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
        toast('تم تحديث الملحق بنجاح');
        setShowOutbuildingEditModal(false);
        await fetchOutbuildings();
      } else {
        toast(data.message || 'حدث خطأ أثناء التحديث', 'error');
      }
    } catch {
      toast('فشل الاتصال بالسيرفر', 'error');
    } finally {
      setOutbuildingEditLoading(false);
    }
  }

  function handleOutbuildingDelete() {
    if (!selectedOutbuilding) return;
    promptConfirm(`هل أنت متأكد من حذف الملحق "${selectedOutbuilding.description}"؟`, async () => {
      const res = await apiFetch(`/Outbuildings/${selectedOutbuilding.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('تم حذف الملحق بنجاح');
        setShowOutbuildingDetailsModal(false);
        await fetchOutbuildings();
      } else {
        const err = await res.json();
        toast(err.message || 'حدث خطأ', 'error');
      }
    });
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
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `MosquesOutbuildings_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      toast('حدث خطأ أثناء التصدير', 'error');
    }
  }

  async function handleContract(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOutbuilding) return;
    setContractLoading(true);
    try {
      const formData = new FormData();
      formData.append('startDate', contractForm.startDate);
      formData.append('endDate', contractForm.endDate);
      formData.append('tenantName', contractForm.tenantName);
      formData.append('tenantNationalId', contractForm.tenantNationalId);
      formData.append('price', contractForm.price);
      if (contractForm.committeeApprovalDate) formData.append('committeeApprovalDate', contractForm.committeeApprovalDate);
      if (contractForm.contract) formData.append('contract', contractForm.contract);
      const res = await apiFetch(`/Outbuildings/Contract/${selectedOutbuilding.id}`, { method: 'PUT', body: formData });
      const data = await res.json();
      if (data.status === 'success') {
        toast('تم إضافة العقد بنجاح');
        setShowContractModal(false);
        await fetchOutbuildings();
      } else {
        toast(data.message || 'حدث خطأ أثناء إضافة العقد', 'error');
      }
    } catch {
      toast('فشل الاتصال بالسيرفر', 'error');
    } finally {
      setContractLoading(false);
    }
  }

  return (
    <div className="text-right h-full flex flex-col overflow-hidden">
      <div className="mb-4 p-4 bg-gray-50/60 rounded-lg shadow-sm shrink-0">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-xl font-bold mb-2">جميع الملحقات</h2>
            <p className="text-sm text-gray-600">عرض جميع الملحقات في النظام</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-white transition-colors text-sm"
          >
            <span>{showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}</span>
            <span className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}>▾</span>
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
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyFilters())}
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
                  onKeyDown={e => e.key === 'Enter' && filterForm.directorateName && (e.preventDefault(), handleApplyFilters())}
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
                  onChange={e => { if (e.target.value.length <= 200) setFilterForm({ ...filterForm, mosqueName: e.target.value }); }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyFilters())}
                  maxLength={200}
                  placeholder="ابحث عن مسجد..."
                  className={`w-full border rounded px-3 py-2 ${filterErrors.mosqueName ? 'border-red-500' : ''}`}
                />
                {filterErrors.mosqueName && <p className="text-red-500 text-sm mt-1">{filterErrors.mosqueName}</p>}
              </div>

              <div>
                <label className="block mb-1 font-semibold text-sm">الحالة</label>
                <select
                  value={filterForm.status === null ? '' : filterForm.status.toString()}
                  onChange={e => setFilterForm({ ...filterForm, status: e.target.value === '' ? null : e.target.value === 'true' })}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyFilters())}
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
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyFilters())}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">الكل</option>
                  {purposes.map((p, idx) => (
                    <option key={idx} value={p.isCustom ? p.label : p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-sm">الحالة القانونية</label>
                <select
                  value={filterForm.legalStatus ?? ''}
                  onChange={e => setFilterForm({ ...filterForm, legalStatus: e.target.value ? parseInt(e.target.value) : null })}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyFilters())}
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
                  type="number" step="0.01" min="0"
                  value={filterForm.minSize}
                  onChange={e => { setFilterForm({ ...filterForm, minSize: e.target.value }); if (filterErrors.minSize) setFilterErrors({ ...filterErrors, minSize: '' }); }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyFilters())}
                  placeholder="الحد الأدنى"
                  className={`w-full border rounded px-3 py-2 ${filterErrors.minSize ? 'border-red-500' : ''}`}
                />
                {filterErrors.minSize && <p className="text-red-500 text-sm mt-1">{filterErrors.minSize}</p>}
              </div>

              <div>
                <label className="block mb-1 font-semibold text-sm">المساحة (إلى)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={filterForm.maxSize}
                  onChange={e => { setFilterForm({ ...filterForm, maxSize: e.target.value }); if (filterErrors.maxSize) setFilterErrors({ ...filterErrors, maxSize: '' }); }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyFilters())}
                  placeholder="الحد الأقصى"
                  className={`w-full border rounded px-3 py-2 ${filterErrors.maxSize ? 'border-red-500' : ''}`}
                />
                {filterErrors.maxSize && <p className="text-red-500 text-sm mt-1">{filterErrors.maxSize}</p>}
              </div>

              <div>
                <label className="block mb-1 font-semibold text-sm">عداد كهرباء</label>
                <select
                  value={filterForm.hasElectricityMeter === null ? '' : String(filterForm.hasElectricityMeter)}
                  onChange={e => setFilterForm({ ...filterForm, hasElectricityMeter: e.target.value === '' ? null : e.target.value === 'true' })}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyFilters())}
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
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyFilters())}
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
              <button onClick={handleResetFilters} className="px-4 py-2 border rounded hover:bg-gray-50">
                إعادة تعيين
              </button>
              <button onClick={handleExport} className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700">
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
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">اسم الملحق</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">اسم المسجد</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">المديرية</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">الإدارة</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">الغرض</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">الحالة</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600">المساحة</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-600 w-32">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">جارٍ التحميل...</td></tr>
            ) : outbuildings.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">لا توجد بيانات لعرضها</td></tr>
            ) : outbuildings.map((outbuilding, idx) => (
              <tr key={outbuilding.id} className="hover:bg-gray-50/70 transition-colors duration-150">
                <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{outbuilding.description || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{outbuilding.mosqueName || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{outbuilding.directorateName || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{outbuilding.administrationName || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{outbuilding.purposeText || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${outbuilding.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {outbuilding.status ? 'مستغل' : 'غير مستغل'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{outbuilding.space || '-'}</td>
                <td className="px-4 py-3">
                  <button
                    className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 active:scale-95"
                    style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                    onClick={() => showOutbuildingDetails(outbuilding)}
                  >
                    عرض
                  </button>
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

      {confirmState && (
        <ConfirmModal
          message={confirmState.message}
          onConfirm={() => { setConfirmState(null); confirmState.onConfirm(); }}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}
