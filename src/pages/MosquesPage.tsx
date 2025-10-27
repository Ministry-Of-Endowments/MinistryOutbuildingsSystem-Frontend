import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import MosquesTable from '../components/MosquesTable';
import MosqueDetailsModal from '../components/MosqueDetailsModal';
import MosqueEditModal from '../components/MosqueEditModal';
import AddOutbuildingModal from '../components/AddOutbuildingModal';
import OutbuildingsListModal from '../components/OutbuildingsListModal';
import OutbuildingDetailsModal from '../components/OutbuildingDetailsModal';
import OutbuildingEditModal from '../components/OutbuildingEditModal';
import ContractModal from '../components/ContractModal';

type Mosque = {
  id: number;
  name: string;
  directorate: string;
  address: string;
  notes: string;
};

type Outbuilding = {
  id: number;
  name: string;
  address: string;
  type: number;
  status: boolean;
  startDate: string;
  endDate: string;
  acceptanceDate: string;
  price: number;
  space: number;
  notes: string;
  tenantName?: string;
  tenantNationalId?: string;
  contractUrl?: string;
};

export default function MosquesPage() {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Mosque | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchKey, setSearchKey] = useState('');
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
    name: '',
    address: '',
    type: 0,
    price: '',
    space: '',
    notes: '',
    status: false,
    startDate: '',
    endDate: '',
    acceptanceDate: '',
  });
  const [contractLoading, setContractLoading] = useState(false);
  const [outbuildingEditLoading, setOutbuildingEditLoading] = useState(false);
  const [showAddOutbuildingModal, setShowAddOutbuildingModal] = useState(false);
  const [addOutbuildingForm, setAddOutbuildingForm] = useState({
    name: '',
    address: '',
    type: '',
    price: '',
    space: '',
    notes: '',
  });
  const [addOutbuildingLoading, setAddOutbuildingLoading] = useState(false);

  async function fetchMosques() {
    setLoading(true);
    try {
      const url = '/Mosques';
      const res = await apiFetch(url);
      const data = await res.json();
      
      if (data.status === 'success') {
        setMosques(data.data || []);
      } else {
        setMosques([]);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setMosques([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchKey.trim()) {
      fetchMosques();
      return;
    }

    setLoading(true);
    try {
      const url = `/Mosques/Search/${encodeURIComponent(searchKey)}`;
      const res = await apiFetch(url);
      const data = await res.json();
      
      if (data.status === 'success') {
        setMosques(data.data || []);
      } else {
        setMosques([]);
      }
    } catch (e) {
      console.error('Search error:', e);
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
      directorate: mosque.directorate,
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

  async function fetchOutbuildings(mosqueId: number) {
    setOutbuildingsLoading(true);
    try {
      const url = `/Outbuildings/${mosqueId}`;
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
    fetchOutbuildings(mosque.id);
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
      name: item.name,
      address: item.address,
      type: item.type,
      price: item.price.toString(),
      space: item.space.toString(),
      notes: item.notes || '',
      status: item.status,
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      acceptanceDate: item.acceptanceDate || '',
    });
    setShowOutbuildingEditModal(true);
  }

  async function handleOutbuildingEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOutbuilding) return;
    setOutbuildingEditLoading(true);

    try {
      const payload = {
        name: outbuildingEditForm.name,
        address: outbuildingEditForm.address,
        type: outbuildingEditForm.type,
        notes: outbuildingEditForm.notes || null,
        price: parseFloat(outbuildingEditForm.price),
        space: parseFloat(outbuildingEditForm.space),
        status: outbuildingEditForm.status,
        startDate: outbuildingEditForm.startDate || null,
        endDate: outbuildingEditForm.endDate || null,
        acceptanceDate: outbuildingEditForm.acceptanceDate || null,
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
          await fetchOutbuildings(selected.id);
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
    if (!confirm(`هل أنت متأكد من حذف الملحق "${selectedOutbuilding.name}"؟`)) return;

    const res = await apiFetch(`/Outbuildings/${selectedOutbuilding.id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('تم حذف الملحق بنجاح');
      setShowOutbuildingDetailsModal(false);
      await fetchOutbuildings(selected.id);
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
      if (contractForm.startDate) formData.append('startDate', contractForm.startDate);
      if (contractForm.endDate) formData.append('endDate', contractForm.endDate);
      if (contractForm.tenantName) formData.append('tenantName', contractForm.tenantName);
      if (contractForm.tenantNationalId) formData.append('tenantNationalId', contractForm.tenantNationalId);
      if (contractForm.contract) formData.append('contract', contractForm.contract);

      const res = await apiFetch(`/Outbuildings/Contract/${selectedOutbuilding.id}?startDate=${contractForm.startDate}&endDate=${contractForm.endDate}&tenantName=${encodeURIComponent(contractForm.tenantName)}&tenantNationalId=${encodeURIComponent(contractForm.tenantNationalId)}`, {
        method: 'PUT',
        body: contractForm.contract ? formData : undefined,
      });

      const data = await res.json();
      if (data.status === 'success') {
        alert('تم إضافة العقد بنجاح');
        setShowContractModal(false);
        await fetchOutbuildings(selected.id);
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
      name: '',
      address: '',
      type: '',
      price: '',
      space: '',
      notes: '',
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
        name: addOutbuildingForm.name,
        address: addOutbuildingForm.address,
        type: parseInt(addOutbuildingForm.type),
        price: parseFloat(addOutbuildingForm.price),
        space: parseFloat(addOutbuildingForm.space),
        notes: addOutbuildingForm.notes,
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
        await fetchOutbuildings(selected.id);
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
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <input
          type="text"
          placeholder="ابحث عن مسجد..."
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-(--primary)"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 rounded"
          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
        >
          بحث
        </button>
        <button
          onClick={fetchMosques}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          عرض الكل
        </button>
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
          outbuildingName={selectedOutbuilding.name}
          form={outbuildingEditForm}
          loading={outbuildingEditLoading}
          onClose={() => setShowOutbuildingEditModal(false)}
          onSubmit={handleOutbuildingEdit}
          onChange={setOutbuildingEditForm}
        />
      )}

      {showContractModal && selectedOutbuilding && (
        <ContractModal
          outbuildingName={selectedOutbuilding.name}
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
