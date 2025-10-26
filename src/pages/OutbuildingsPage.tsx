import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

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

export default function OutbuildingsPage() {
  const [selectedMosqueId, setSelectedMosqueId] = useState<number | null>(null);
  const [outbuildings, setOutbuildings] = useState<Outbuilding[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Outbuilding | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [contractForm, setContractForm] = useState({
    startDate: '',
    endDate: '',
    tenantName: '',
    tenantNationalId: '',
    contract: null as File | null,
  });
  const [editForm, setEditForm] = useState({
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
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchAllOutbuildings();
  }, []);

  async function fetchOutbuildings(mosqueId: number) {
    setLoading(true);
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
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchKey.trim()) {
      setSelectedMosqueId(null);
      setOutbuildings([]);
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(`/Mosques/Search/${encodeURIComponent(searchKey)}`);
      const data = await res.json();
      
      if (data.status === 'success' && data.data && data.data.length > 0) {
        const firstMosque = data.data[0];
        setSelectedMosqueId(firstMosque.id);
        await fetchOutbuildings(firstMosque.id);
      } else {
        setSelectedMosqueId(null);
        setOutbuildings([]);
        setLoading(false);
        alert('لم يتم العثور على مسجد بهذا الاسم');
      }
    } catch (e) {
      console.error('Search error:', e);
      setLoading(false);
      alert('حدث خطأ أثناء البحث');
    }
  }

  function showDetails(outbuilding: Outbuilding) {
    setSelected(outbuilding);
    setShowModal(true);
  }

  function getOutbuildingTypeName(type: number): string {
    switch (type) {
      case 0: return 'محل';
      case 1: return 'شقة';
      default: return 'غير محدد';
    }
  }

  function openContractModal(item: Outbuilding) {
    setSelected(item);
    setShowContractModal(true);
  }

  function openEditModal(item: Outbuilding) {
    setSelected(item);
    setEditForm({
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
    setShowEditModal(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setEditLoading(true);

    try {
      const payload = {
        name: editForm.name,
        address: editForm.address,
        type: editForm.type,
        notes: editForm.notes || null,
        price: parseFloat(editForm.price),
        space: parseFloat(editForm.space),
        status: editForm.status,
        startDate: editForm.startDate || null,
        endDate: editForm.endDate || null,
        acceptanceDate: editForm.acceptanceDate || null,
      };

      const res = await apiFetch(`/Outbuildings/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (data.status === 'success') {
        alert('تم تحديث الملحق بنجاح');
        setShowEditModal(false);
        if (selectedMosqueId && selectedMosqueId !== -1) {
          await fetchOutbuildings(selectedMosqueId);
        } else {
          await fetchAllOutbuildings();
        }
      } else {
        alert(data.message || 'حدث خطأ أثناء التحديث');
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
    if (!confirm(`هل أنت متأكد من حذف الملحق "${selected.name}"؟`)) return;

    const res = await apiFetch(`/Outbuildings/${selected.id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('تم حذف الملحق بنجاح');
      setShowModal(false);
      await fetchAllOutbuildings();
    } else {
      const err = await res.json();
      alert(err.message || 'حدث خطأ');
    }
  }

  async function handleContract(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    setContractLoading(true);
    try {
      const formData = new FormData();
      if (contractForm.startDate) formData.append('startDate', contractForm.startDate);
      if (contractForm.endDate) formData.append('endDate', contractForm.endDate);
      if (contractForm.tenantName) formData.append('tenantName', contractForm.tenantName);
      if (contractForm.tenantNationalId) formData.append('tenantNationalId', contractForm.tenantNationalId);
      if (contractForm.contract) formData.append('contract', contractForm.contract);

      const res = await apiFetch(`/Outbuildings/Contract/${selected.id}?startDate=${contractForm.startDate}&endDate=${contractForm.endDate}&tenantName=${encodeURIComponent(contractForm.tenantName)}&tenantNationalId=${encodeURIComponent(contractForm.tenantNationalId)}`, {
        method: 'PUT',
        body: contractForm.contract ? formData : undefined,
      });

      const data = await res.json();
      if (data.status === 'success') {
        alert('تم إضافة العقد بنجاح');
        setShowContractModal(false);
        if (selectedMosqueId && selectedMosqueId !== -1) {
          await fetchOutbuildings(selectedMosqueId);
        } else {
          await fetchAllOutbuildings();
        }
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

  async function fetchAllOutbuildings() {
    setLoading(true);
    setSearchKey('');
    setSelectedMosqueId(-1);
    try {
      const mosqueRes = await apiFetch('/Mosques');
      const mosqueData = await mosqueRes.json();
      
      if (mosqueData.status === 'success' && mosqueData.data) {
        const mosques = mosqueData.data;
        const allOutbuildings: Outbuilding[] = [];
        
        for (const mosque of mosques) {
          try {
            const res = await apiFetch(`/Outbuildings/${mosque.id}`);
            const data = await res.json();
            
            if (data.status === 'success' && data.data) {
              const outbuildingData = data.data;
              const apiOutbuildings = Array.isArray(outbuildingData) ? outbuildingData : [outbuildingData];
              allOutbuildings.push(...apiOutbuildings.filter(item => item != null));
            }
          } catch (e) {
            console.error(`Error fetching outbuildings for mosque ${mosque.id}:`, e);
          }
        }
        
        setOutbuildings(allOutbuildings);
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

  useEffect(() => {}, []);

  return (
    <div className="text-right h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <input
          type="text"
          placeholder="ابحث عن مسجد..."
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
          onClick={fetchAllOutbuildings}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          عرض الكل
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-white border rounded min-h-0">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 border">#</th>
              <th className="p-3 border">الاسم</th>
              <th className="p-3 border">العنوان</th>
              <th className="p-3 border">النوع</th>
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
              <tr><td colSpan={12} className="p-6 text-center">جارٍ التحميل...</td></tr>
            ) : outbuildings.length === 0 ? (
              <tr><td colSpan={12} className="p-6 text-center text-gray-500">
                {selectedMosqueId === null ? 'يرجى اختيار مسجد لعرض الملحقات' : 'لا توجد ملحقات'}
              </td></tr>
            ) : outbuildings.filter(item => item != null).map((item, idx) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-3 border">{idx + 1}</td>
                <td className="p-3 border">{item.name || '-'}</td>
                <td className="p-3 border">{item.address || '-'}</td>
                <td className="p-3 border">{getOutbuildingTypeName(item.type)}</td>
                <td className="p-3 border">
                  <span className={`px-2 py-1 rounded text-xs ${item.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.status ? 'مؤجر' : 'غير مؤجر'}
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
                    onClick={() => showDetails(item)}
                  >
                    عرض
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">تفاصيل الملحق</h3>
              <button className="text-gray-600" onClick={() => setShowModal(false)}>✖</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-6">
              <div><b>الاسم:</b> {selected.name || '-'}</div>
              <div><b>العنوان:</b> {selected.address || '-'}</div>
              <div><b>النوع:</b> {getOutbuildingTypeName(selected.type)}</div>
              <div><b>الحالة:</b> {selected.status ? 'نشط' : 'غير نشط'}</div>
              <div><b>اسم المستأجر:</b> {selected.tenantName || '-'}</div>
              <div><b>الرقم القومي:</b> {selected.tenantNationalId || '-'}</div>
              <div><b>المساحة:</b> {selected.space || '-'}</div>
              <div><b>السعر:</b> {selected.price || '-'}</div>
              <div><b>تاريخ البدء:</b> {selected.startDate ? new Date(selected.startDate).toLocaleDateString('ar-EG') : '-'}</div>
              <div><b>تاريخ الانتهاء:</b> {selected.endDate ? new Date(selected.endDate).toLocaleDateString('ar-EG') : '-'}</div>
              <div><b>تاريخ القبول:</b> {selected.acceptanceDate ? new Date(selected.acceptanceDate).toLocaleDateString('ar-EG') : '-'}</div>
              {selected.notes && (
                <div className="col-span-2"><b>ملاحظات:</b> {selected.notes}</div>
              )}
              {selected.contractUrl && (
                <div className="col-span-2">
                  <b>العقد:</b>{' '}
                  <a href={selected.contractUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    فتح العقد
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {!selected.status && (
                <button
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                  onClick={() => openContractModal(selected)}
                >
                  إضافة عقد
                </button>
              )}
              <button
                type="button"
                onClick={() => openEditModal(selected)}
                className="px-4 py-2 text-white rounded"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                تعديل
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {showContractModal && selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">إضافة عقد - {selected.name}</h3>
              <button className="text-gray-600" onClick={() => setShowContractModal(false)}>✖</button>
            </div>

            <form onSubmit={handleContract} className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">تاريخ البداية</label>
                <input
                  type="date"
                  value={contractForm.startDate}
                  onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">تاريخ النهاية</label>
                <input
                  type="date"
                  value={contractForm.endDate}
                  onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">اسم المستأجر</label>
                <input
                  type="text"
                  value={contractForm.tenantName}
                  onChange={(e) => setContractForm({ ...contractForm, tenantName: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">رقم بطاقة المستأجر</label>
                <input
                  type="text"
                  value={contractForm.tenantNationalId}
                  onChange={(e) => setContractForm({ ...contractForm, tenantNationalId: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">ملف العقد (اختياري)</label>
                <input
                  type="file"
                  onChange={(e) => setContractForm({ ...contractForm, contract: e.target.files?.[0] || null })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded border"
                  onClick={() => setShowContractModal(false)}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={contractLoading}
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {contractLoading ? 'جارٍ الحفظ...' : 'حفظ العقد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">تعديل الملحق</h3>
              <button className="text-gray-600" onClick={() => setShowEditModal(false)}>✖</button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">الاسم</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">العنوان</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">النوع</label>
                <select
                  value={editForm.type}
                  onChange={e => setEditForm({ ...editForm, type: parseInt(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value={0}>محل</option>
                  <option value={1}>شقة</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold">السعر</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">المساحة</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.space}
                  onChange={e => setEditForm({ ...editForm, space: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">الحالة</label>
                <select
                  value={editForm.status ? 'true' : 'false'}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value === 'true' })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="false">غير مؤجر</option>
                  <option value="true">مؤجر</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold">تاريخ البداية</label>
                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">تاريخ النهاية</label>
                <input
                  type="date"
                  value={editForm.endDate}
                  onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">تاريخ القبول</label>
                <input
                  type="date"
                  value={editForm.acceptanceDate}
                  onChange={e => setEditForm({ ...editForm, acceptanceDate: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">ملاحظات</label>
                <textarea
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded border"
                  onClick={() => setShowEditModal(false)}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded text-white bg-green-500 disabled:opacity-50"
                >
                  {editLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
