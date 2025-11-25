import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import type { Mosque, Outbuilding } from '../utils/types';
import MosquesTable from '../components/MosquesTable';
import MosqueDetailsModal from '../components/MosqueDetailsModal';
import MosqueEditModal from '../components/MosqueEditModal';
import AddOutbuildingModal from '../components/AddOutbuildingModal';
import OutbuildingsListModal from '../components/OutbuildingsListModal';
import OutbuildingDetailsModal from '../components/OutbuildingDetailsModal';
import OutbuildingEditModal from '../components/OutbuildingEditModal';
import ContractModal from '../components/ContractModal';

export default function MosquesPage() {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [allMosques, setAllMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Mosque | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>('');
  const [selectedAdministration, setSelectedAdministration] = useState<string>('');
  const [editForm, setEditForm] = useState({
    name: '',
    directorate: '',
    address: '',
    notes: '',
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
  });
  const [contractLoading, setContractLoading] = useState(false);
  const [outbuildingEditLoading, setOutbuildingEditLoading] = useState(false);
  const [showAddOutbuildingModal, setShowAddOutbuildingModal] = useState(false);
  const [addOutbuildingForm, setAddOutbuildingForm] = useState({
    description: '',
    address: '',
    type: '',
    price: '',
    space: '',
    notes: '',
    purpose: 1,
    customPurpose: '',
    legalStatus: null as number | null,
  });
  const [addOutbuildingLoading, setAddOutbuildingLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<any>({});

  async function fetchMosques() {
    setLoading(true);
    try {
      const url = '/Mosques';
      const res = await apiFetch(url);
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

    if (selectedDirectorate) {
      filtered = filtered.filter(m => m.directorateName === selectedDirectorate);
    }

    if (selectedAdministration) {
      filtered = filtered.filter(m => m.administrationName === selectedAdministration);
    }

    setMosques(filtered);
  }

  function handleDirectorateChange(directorate: string) {
    setSelectedDirectorate(directorate);
    setSelectedAdministration('');
  }

  function handleAdministrationChange(administration: string) {
    setSelectedAdministration(administration);
  }

  function handleResetFilters() {
    setSelectedDirectorate('');
    setSelectedAdministration('');
    setSearchKey('');
    fetchMosques();
  }

  useEffect(() => {
    applyFilters();
  }, [selectedDirectorate, selectedAdministration]);

  const uniqueDirectorates = Array.from(new Set(allMosques.map(m => m.directorateName))).sort();
  const uniqueAdministrations = Array.from(
    new Set(
      allMosques
        .filter(m => !selectedDirectorate || m.directorateName === selectedDirectorate)
        .map(m => m.administrationName)
    )
  ).sort();

  async function handleSearch() {
    if (!searchKey.trim()) {
      applyFilters();
      return;
    }

    setLoading(true);
    try {
      const url = `/Mosques/Search/${encodeURIComponent(searchKey)}`;
      const res = await apiFetch(url);
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
      directorate: mosque.directorateName,
      address: mosque.address,
      notes: mosque.notes || '',
    });
    setShowModal(false);
    setShowEditModal(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    setEditLoading(true);
    try {
      console.log('Sending update request:', editForm);
      const res = await apiFetch(`/Mosques/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          directorate: editForm.directorate,
          address: editForm.address,
          notes: editForm.notes,
        }),
      });
      const data = await res.json();
      console.log('Update response:', data);
      
      if (data.status === 'success') {
        alert('تم تعديل المسجد بنجاح');
        setShowEditModal(false);
        fetchMosques();
      } else {
        console.error('Update failed:', data);
        alert(data.message || 'حدث خطأ أثناء التعديل');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('فشل الاتصال بالسيرفر');
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    if (!confirm(`هل أنت متأكد من حذف المسجد "${selected.name}"؟`)) return;

    try {
      const res = await apiFetch(`/Mosques/${selected.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        alert('تم حذف المسجد بنجاح');
        setShowModal(false);
        fetchMosques();
      } else {
        alert(data.message || 'حدث خطأ أثناء الحذف');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال بالسيرفر');
    }
  }

  useEffect(() => { fetchMosques(); }, []);

  async function fetchOutbuildings(mosqueId: number, filter?: any) {
    setOutbuildingsLoading(true);
    try {
      let url = `/Outbuildings/${mosqueId}`;
      
      // Add query parameters if filter is provided
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
        
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
      }
      
      const res = await apiFetch(url);
      const data = await res.json();
      
      if (data.status === 'success' && data.data) {
        const outbuildingData = data.data;
        const apiOutbuildings = Array.isArray(outbuildingData) ? outbuildingData : [outbuildingData];
        setOutbuildings(apiOutbuildings.filter(item => item != null));
      } else {
        setOutbuildings([]);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setOutbuildings([]);
    } finally {
      setOutbuildingsLoading(false);
    }
  }

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
    setShowContractModal(true);
  }

  function openOutbuildingEditModal(item: Outbuilding) {
    setSelectedOutbuilding(item);
    setOutbuildingEditForm({
      description: item.description,
      address: item.address,
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
        address: outbuildingEditForm.address,
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
        if (selected) {
          await fetchOutbuildings(selected.id, currentFilter);
        }
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
    if (!selectedOutbuilding || !selected) return;
    if (!confirm(`هل أنت متأكد من حذف الملحق "${selectedOutbuilding.description}"؟`)) return;

    const res = await apiFetch(`/Outbuildings/${selectedOutbuilding.id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('تم حذف الملحق بنجاح');
      setShowOutbuildingDetailsModal(false);
      await fetchOutbuildings(selected.id, currentFilter);
    } else {
      const err = await res.json();
      alert(err.message || 'حدث خطأ');
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
      if (contractForm.contract) {
        formData.append('contract', contractForm.contract);
      }

      const res = await apiFetch(`/Outbuildings/Contract/${selectedOutbuilding.id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (data.status === 'success') {
        alert('تم إضافة العقد بنجاح');
        setShowContractModal(false);
        await fetchOutbuildings(selected.id, currentFilter);
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

  function openAddOutbuildingModal(mosque: Mosque) {
    setSelected(mosque);
    setAddOutbuildingForm({
      description: '',
      address: '',
      type: '',
      price: '',
      space: '',
      notes: '',
      purpose: 1,
      customPurpose: '',
      legalStatus: null,
    });
    setShowModal(false);
    setShowAddOutbuildingModal(true);
  }

  async function handleAddOutbuilding(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    setAddOutbuildingLoading(true);
    try {
      const basicPayload = {
        description: addOutbuildingForm.description,
        address: addOutbuildingForm.address,
        type: parseInt(addOutbuildingForm.type),
        price: parseFloat(addOutbuildingForm.price),
        space: parseFloat(addOutbuildingForm.space),
        notes: addOutbuildingForm.notes,
        purpose: addOutbuildingForm.purpose,
        customPurpose: addOutbuildingForm.customPurpose || null,
        legalStatus: addOutbuildingForm.legalStatus,
      };
      
      const res = await apiFetch(`/Outbuildings/${selected.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basicPayload),
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        alert('تم إضافة الملحق بنجاح');
        setShowAddOutbuildingModal(false);
        await fetchOutbuildings(selected.id, currentFilter);
      } else {
        alert(data.message || 'حدث خطأ أثناء الإضافة');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال بالسيرفر');
    } finally {
      setAddOutbuildingLoading(false);
    }
  }


  return (
    <div className="text-right h-full flex flex-col overflow-hidden">
      {/* Filters Section */}
      <div className="mb-4 p-4 bg-gray-50 border rounded shrink-0">
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
              className="px-4 py-2 rounded text-white flex-1"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              بحث
            </button>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              إعادة تعيين
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
    </div>
  );
}
