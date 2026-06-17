import { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../utils/api';
import { fetchDirectoratesCached } from '../utils/cache';
import type { Mosque, Outbuilding } from '../utils/types';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import MosquesTable from '../components/MosquesTable';
import MosqueDetailsModal from '../components/MosqueDetailsModal';
import MosqueEditModal from '../components/MosqueEditModal';
import AddOutbuildingModal from '../components/AddOutbuildingModal';
import OutbuildingsListModal from '../components/OutbuildingsListModal';
import OutbuildingDetailsModal from '../components/OutbuildingDetailsModal';
import OutbuildingEditModal from '../components/OutbuildingEditModal';
import ContractModal from '../components/ContractModal';
import AddMosqueModal from '../components/AddMosqueModal';

type Administration = { id: number; name: string };
type DirectorateWithAdmins = { id: number; name: string; administrations: Administration[] };

export default function MosquesPage() {
  const { toast } = useToast();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [allMosques, setAllMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Mosque | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>('');
  const [selectedAdministration, setSelectedAdministration] = useState<string>('');
  const [selectedDirectorateId, setSelectedDirectorateId] = useState<number | null>(null);
  const [selectedAdministrationId, setSelectedAdministrationId] = useState<number | null>(null);
  const [directorates, setDirectorates] = useState<DirectorateWithAdmins[]>([]);
  const [editForm, setEditForm] = useState({
    name: '',
    directorateName: '',
    administrationId: null as number | null,
    address: '',
    street: '',
    notes: '',
    governorateId: '',
    departmentId: '',
    sheikhdomId: '',
  });
  const [editLoading, setEditLoading] = useState(false);

  const [showOutbuildingsModal, setShowOutbuildingsModal] = useState(false);
  const [outbuildings, setOutbuildings] = useState<Outbuilding[]>([]);
  const [outbuildingsLoading, setOutbuildingsLoading] = useState(false);
  const [selectedOutbuilding, setSelectedOutbuilding] = useState<Outbuilding | null>(null);
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
  const [showAddOutbuildingModal, setShowAddOutbuildingModal] = useState(false);
  const [addOutbuildingForm, setAddOutbuildingForm] = useState({
    description: '',
    governorateId: '',
    departmentId: '',
    sheikhdomId: '',
    street: '',
    space: '',
    notes: '',
    purpose: 1,
    customPurpose: '',
    legalStatus: null as number | null,
    hasElectricityMeter: false,
    hasWaterMeter: false,
  });
  const [addOutbuildingLoading, setAddOutbuildingLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<any>({});
  const [confirmState, setConfirmState] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [showAddMosqueModal, setShowAddMosqueModal] = useState(false);

  function promptConfirm(message: string, action: () => void) {
    setConfirmState({ message, onConfirm: action });
  }

  async function fetchDirectorates() {
    try {
      const data = await fetchDirectoratesCached();
      setDirectorates(data);
    } catch (e) {
      console.error('Failed to fetch directorates:', e);
    }
  }

  async function fetchMosques() {
    setLoading(true);
    try {
      const res = await apiFetch('/Mosques');
      const data = await res.json();
      if (data.status === 'success') {
        const fetchedMosques = data.data || [];
        setAllMosques(fetchedMosques);
        applyFilters(fetchedMosques);
      } else {
        setAllMosques([]);
        setMosques([]);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setAllMosques([]);
      setMosques([]);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters(mosquesToFilter?: Mosque[]) {
    const dataToFilter = mosquesToFilter || allMosques;
    let filtered = [...dataToFilter];
    if (selectedDirectorate) filtered = filtered.filter(m => m.directorateName === selectedDirectorate);
    if (selectedAdministration) filtered = filtered.filter(m => m.administrationName === selectedAdministration);
    setMosques(filtered);
  }

  function handleDirectorateChange(directorate: string) {
    setSelectedDirectorate(directorate);
    setSelectedAdministration('');
    setSelectedAdministrationId(null);
    if (directorate) {
      const mosque = allMosques.find(m => m.directorateName === directorate);
      setSelectedDirectorateId(mosque?.directorateId ?? null);
    } else {
      setSelectedDirectorateId(null);
    }
  }

  function handleAdministrationChange(administration: string) {
    setSelectedAdministration(administration);
    if (administration) {
      const mosque = allMosques.find(m => m.administrationName === administration);
      setSelectedAdministrationId(mosque?.administrationId ?? null);
    } else {
      setSelectedAdministrationId(null);
    }
  }

  function handleResetFilters() {
    setSelectedDirectorate('');
    setSelectedAdministration('');
    setSelectedDirectorateId(null);
    setSelectedAdministrationId(null);
    setSearchKey('');
    fetchMosques();
  }

  useEffect(() => { applyFilters(); }, [selectedDirectorate, selectedAdministration]);

  const uniqueDirectorates = useMemo(
    () => Array.from(new Set(allMosques.map(m => m.directorateName))).sort(),
    [allMosques]
  );

  const uniqueAdministrations = useMemo(
    () => Array.from(
      new Set(
        allMosques
          .filter(m => !selectedDirectorate || m.directorateName === selectedDirectorate)
          .map(m => m.administrationName)
      )
    ).sort(),
    [allMosques, selectedDirectorate]
  );

  async function handleSearch() {
    if (!searchKey.trim()) { applyFilters(); return; }
    setLoading(true);
    try {
      const res = await apiFetch(`/Mosques/Search/${encodeURIComponent(searchKey)}`);
      const data = await res.json();
      if (data.status === 'success') {
        const searchResults = data.data || [];
        setAllMosques(searchResults);
        applyFilters(searchResults);
      } else {
        setAllMosques([]);
        setMosques([]);
      }
    } catch (e) {
      console.error('Search error:', e);
      setAllMosques([]);
      setMosques([]);
    } finally {
      setLoading(false);
    }
  }

  function showDetails(mosque: Mosque) {
    setSelected(mosque);
    setShowModal(true);
  }

  function openEditModal(mosque: Mosque) {
    setSelected(mosque);
    setEditForm({
      name: mosque.name,
      directorateName: mosque.directorateName,
      administrationId: mosque.administrationId,
      address: mosque.address,
      street: mosque.street || '',
      notes: mosque.notes || '',
      governorateId: mosque.governorateId?.toString() || '',
      departmentId: mosque.departmentId?.toString() || '',
      sheikhdomId: mosque.sheikhdomId?.toString() || '',
    });
    setShowModal(false);
    setShowEditModal(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !editForm.administrationId) return;
    setEditLoading(true);
    try {
      const res = await apiFetch(`/Mosques/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          directorate: editForm.directorateName,
          address: editForm.address,
          street: editForm.street,
          notes: editForm.notes,
          administrationId: editForm.administrationId,
          governorateId: editForm.governorateId ? parseInt(editForm.governorateId) : null,
          departmentId: parseInt(editForm.departmentId),
          sheikhdomId: parseInt(editForm.sheikhdomId),
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast('تم تعديل المسجد بنجاح');
        setShowEditModal(false);
        fetchMosques();
      } else {
        toast(data.message || 'حدث خطأ أثناء التعديل', 'error');
      }
    } catch {
      toast('فشل الاتصال بالسيرفر', 'error');
    } finally {
      setEditLoading(false);
    }
  }

  function handleDelete() {
    if (!selected) return;
    promptConfirm(`هل أنت متأكد من حذف المسجد "${selected.name}"؟`, async () => {
      try {
        const res = await apiFetch(`/Mosques/${selected.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.status === 'success') {
          toast('تم حذف المسجد بنجاح');
          setShowModal(false);
          fetchMosques();
        } else {
          toast(data.message || 'حدث خطأ أثناء الحذف', 'error');
        }
      } catch {
        toast('فشل الاتصال بالسيرفر', 'error');
      }
    });
  }

  useEffect(() => {
    fetchMosques();
    fetchDirectorates();
  }, []);

  async function fetchOutbuildings(mosqueId: number, filter?: any) {
    setOutbuildingsLoading(true);
    try {
      let url = `/Outbuildings/${mosqueId}`;
      if (filter && Object.keys(filter).length > 0) {
        const params = new URLSearchParams();
        if (filter.administrationName) params.append('administrationName', filter.administrationName);
        if (filter.directorateName) params.append('directorateName', filter.directorateName);
        if (filter.mosqueName) params.append('mosqueName', filter.mosqueName);
        if (filter.status !== undefined && filter.status !== null) params.append('status', filter.status.toString());
        if (filter.purpose !== undefined && filter.purpose !== null) params.append('purpose', filter.purpose.toString());
        if (filter.legalStatus !== undefined && filter.legalStatus !== null) params.append('legalStatus', filter.legalStatus.toString());
        if (filter.minSize !== undefined && filter.minSize !== null) params.append('minSpace', filter.minSize.toString());
        if (filter.maxSize !== undefined && filter.maxSize !== null) params.append('maxSpace', filter.maxSize.toString());
        if (filter.hasElectricityMeter !== undefined && filter.hasElectricityMeter !== null) params.append('hasElectricityMeter', filter.hasElectricityMeter.toString());
        if (filter.hasWaterMeter !== undefined && filter.hasWaterMeter !== null) params.append('hasWaterMeter', filter.hasWaterMeter.toString());
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
      }
      const res = await apiFetch(url);
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        const apiOutbuildings = Array.isArray(data.data) ? data.data : [data.data];
        setOutbuildings(apiOutbuildings.filter((item: any) => item != null));
      } else {
        setOutbuildings([]);
      }
    } catch {
      setOutbuildings([]);
    } finally {
      setOutbuildingsLoading(false);
    }
  }

  useEffect(() => {
    if (selectedOutbuilding) {
      const updated = outbuildings.find((o: Outbuilding) => o.id === selectedOutbuilding.id);
      if (updated) setSelectedOutbuilding(updated);
    }
  }, [outbuildings]);

  function showOutbuildingsForMosque(mosque: Mosque) {
    setSelected(mosque);
    setShowModal(false);
    setShowOutbuildingsModal(true);
    setCurrentFilter({});
    fetchOutbuildings(mosque.id);
  }

  function handleOutbuildingFilter(filter: any) {
    if (!selected) return;
    setCurrentFilter(filter);
    fetchOutbuildings(selected.id, filter);
  }

  function showOutbuildingDetails(outbuilding: Outbuilding) {
    setSelectedOutbuilding(outbuilding);
    setShowOutbuildingDetailsModal(true);
  }

  function openContractModal(item: Outbuilding) {
    setSelectedOutbuilding(item);
    setContractForm({ startDate: '', endDate: '', tenantName: '', tenantNationalId: '', price: '', committeeApprovalDate: '', contract: null });
    setShowContractModal(true);
  }

  function openOutbuildingEditModal(item: Outbuilding) {
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
        if (selected) await fetchOutbuildings(selected.id, currentFilter);
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
    if (!selectedOutbuilding || !selected) return;
    promptConfirm(`هل أنت متأكد من حذف الملحق "${selectedOutbuilding.description}"؟`, async () => {
      const res = await apiFetch(`/Outbuildings/${selectedOutbuilding.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('تم حذف الملحق بنجاح');
        setShowOutbuildingDetailsModal(false);
        await fetchOutbuildings(selected.id, currentFilter);
      } else {
        const err = await res.json();
        toast(err.message || 'حدث خطأ', 'error');
      }
    });
  }

  async function handleExportExcel() {
    try {
      let url = '/Outbuildings/export-mosques-outbuildings';
      const params = new URLSearchParams();
      if (selectedDirectorateId) params.append('directorateId', selectedDirectorateId.toString());
      if (selectedAdministrationId) params.append('administrationId', selectedAdministrationId.toString());
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      const res = await apiFetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `MosquesOutbuildings_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      } else {
        toast('فشل تصدير البيانات', 'error');
      }
    } catch {
      toast('فشل تصدير البيانات', 'error');
    }
  }

  async function handleContract(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOutbuilding || !selected) return;
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

      const res = await apiFetch(`/Outbuildings/Contract/${selectedOutbuilding.id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast('تم إضافة العقد بنجاح');
        setShowContractModal(false);
        await fetchOutbuildings(selected.id, currentFilter);
      } else {
        toast(data.message || 'حدث خطأ أثناء إضافة العقد', 'error');
      }
    } catch {
      toast('فشل الاتصال بالسيرفر', 'error');
    } finally {
      setContractLoading(false);
    }
  }

  function openAddOutbuildingModal(mosque: Mosque) {
    setSelected(mosque);
    setAddOutbuildingForm({
      description: '',
      governorateId: mosque.governorateId ? String(mosque.governorateId) : '',
      departmentId: mosque.departmentId ? String(mosque.departmentId) : '',
      sheikhdomId: mosque.sheikhdomId ? String(mosque.sheikhdomId) : '',
      street: '',
      space: '',
      notes: '',
      purpose: 1,
      customPurpose: '',
      legalStatus: null,
      hasElectricityMeter: false,
      hasWaterMeter: false,
    });
    setShowModal(false);
    setShowAddOutbuildingModal(true);
  }

  async function handleAddOutbuilding(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setAddOutbuildingLoading(true);
    try {
      const payload = {
        description: addOutbuildingForm.description,
        governorateId: parseInt(addOutbuildingForm.governorateId),
        departmentId: parseInt(addOutbuildingForm.departmentId),
        sheikhdomId: parseInt(addOutbuildingForm.sheikhdomId),
        street: addOutbuildingForm.street,
        space: parseFloat(addOutbuildingForm.space),
        notes: addOutbuildingForm.notes || null,
        purpose: addOutbuildingForm.purpose,
        customPurpose: addOutbuildingForm.customPurpose || null,
        legalStatus: addOutbuildingForm.legalStatus,
        hasElectricityMeter: addOutbuildingForm.hasElectricityMeter,
        hasWaterMeter: addOutbuildingForm.hasWaterMeter,
      };
      const res = await apiFetch(`/Outbuildings/${selected.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast('تم إضافة الملحق بنجاح');
        setShowAddOutbuildingModal(false);
        await fetchOutbuildings(selected.id, currentFilter);
      } else {
        toast(data.message || 'حدث خطأ أثناء الإضافة', 'error');
      }
    } catch {
      toast('فشل الاتصال بالسيرفر', 'error');
    } finally {
      setAddOutbuildingLoading(false);
    }
  }

  return (
    <div className="text-right h-full flex flex-col overflow-hidden">
      <div className="mb-4 p-4 bg-gray-50/60 rounded-lg shadow-sm shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block mb-1 font-semibold text-sm">المديرية</label>
            <select
              value={selectedDirectorate}
              onChange={(e) => handleDirectorateChange(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">جميع المديريات</option>
              {uniqueDirectorates.map(dir => (
                <option key={dir} value={dir}>{dir}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block mb-1 font-semibold text-sm ${!selectedDirectorate ? 'text-gray-400' : ''}`}>
              الإدارة
            </label>
            <select
              value={selectedAdministration}
              onChange={(e) => handleAdministrationChange(e.target.value)}
              className={`w-full border rounded px-3 py-2 ${!selectedDirectorate ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
              disabled={!selectedDirectorate}
            >
              <option value="">جميع الإدارات</option>
              {uniqueAdministrations.map(admin => (
                <option key={admin} value={admin}>{admin}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-sm">بحث بالاسم</label>
            <input
              type="text"
              placeholder="ابحث عن مسجد..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              بحث
            </button>
            <button onClick={handleResetFilters} className="px-4 py-2 border rounded hover:bg-gray-50">
              إعادة تعيين
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
            >
              تصدير
            </button>
            <button
              onClick={() => setShowAddMosqueModal(true)}
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              + إضافة مسجد
            </button>
          </div>
        </div>
      </div>

      <MosquesTable
        mosques={mosques}
        loading={loading}
        onShowDetails={showDetails}
        onViewOutbuildings={showOutbuildingsForMosque}
      />

      {showModal && selected && (
        <MosqueDetailsModal
          mosque={selected}
          onClose={() => setShowModal(false)}
          onEdit={() => openEditModal(selected)}
          onDelete={handleDelete}
        />
      )}

      {showEditModal && selected && (
        <MosqueEditModal
          form={editForm}
          directorates={directorates}
          loading={editLoading}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEdit}
          onChange={setEditForm}
        />
      )}

      {showAddOutbuildingModal && selected && (
        <AddOutbuildingModal
          mosqueName={selected.name}
          form={addOutbuildingForm}
          loading={addOutbuildingLoading}
          onClose={() => setShowAddOutbuildingModal(false)}
          onSubmit={handleAddOutbuilding}
          onChange={setAddOutbuildingForm}
        />
      )}

      {showOutbuildingsModal && selected && (
        <OutbuildingsListModal
          mosqueName={selected.name}
          outbuildings={outbuildings}
          loading={outbuildingsLoading}
          onClose={() => setShowOutbuildingsModal(false)}
          onShowDetails={showOutbuildingDetails}
          onAddOutbuilding={() => openAddOutbuildingModal(selected)}
          onFilter={handleOutbuildingFilter}
        />
      )}

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

      {showAddMosqueModal && (
        <AddMosqueModal
          onClose={() => setShowAddMosqueModal(false)}
          onSuccess={() => { fetchMosques(); }}
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
