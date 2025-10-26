import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { DIRECTORATES } from '../utils/constants';

type Mosque = {
  id: number;
  name: string;
  directorate: string;
  address: string;
  notes: string;
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

  return (
    <div className="text-right h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <input
          type="text"
          placeholder="ابحث عن مسجد..."
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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

      <div className="flex-1 overflow-auto bg-white border rounded min-h-0">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 border">#</th>
              <th className="p-3 border">الاسم</th>
              <th className="p-3 border">المديرية</th>
              <th className="p-3 border">العنوان</th>
              <th className="p-3 border">ملاحظات</th>
              <th className="p-3 border">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center">جارٍ التحميل...</td></tr>
            ) : mosques.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center">لا توجد بيانات لعرضها</td></tr>
            ) : mosques.map((mosque, idx) => (
              <tr key={mosque.id} className="hover:bg-gray-50">
                <td className="p-3 border">{idx + 1}</td>
                <td className="p-3 border">{mosque.name || '-'}</td>
                <td className="p-3 border">{mosque.directorate || '-'}</td>
                <td className="p-3 border">{mosque.address || '-'}</td>
                <td className="p-3 border">{mosque.notes || '-'}</td>
                <td className="p-3 border">
                  <button
                    className="px-3 py-1 rounded"
                    style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                    onClick={() => showDetails(mosque)}
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
          <div className="bg-white rounded shadow max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">تفاصيل المسجد</h3>
              <button className="text-gray-600" onClick={() => setShowModal(false)}>✖</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-6">
              <div><b>الاسم:</b> {selected.name || '-'}</div>
              <div><b>المديرية:</b> {selected.directorate || '-'}</div>
              <div><b>العنوان:</b> {selected.address || '-'}</div>
              {selected.notes && (
                <div className="col-span-2"><b>ملاحظات:</b> {selected.notes}</div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                حذف
              </button>
              <button
                className="px-4 py-2 rounded text-white"
                style={{ backgroundColor: 'var(--primary)' }}
                onClick={() => openEditModal(selected)}
              >
                تعديل
              </button>
              <button className="px-4 py-2 rounded border" onClick={() => setShowModal(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">تعديل المسجد</h3>
              <button className="text-gray-600" onClick={() => setShowEditModal(false)}>✖</button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">اسم المسجد</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">المديرية</label>
                <select
                  value={editForm.directorate}
                  onChange={(e) => setEditForm({ ...editForm, directorate: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">اختر المديرية</option>
                  {DIRECTORATES.map((dir) => (
                    <option key={dir} value={dir}>
                      {dir}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">العنوان</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">الملاحظات (اختياري)</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  className="w-full border rounded px-3 py-2"
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
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {editLoading ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
