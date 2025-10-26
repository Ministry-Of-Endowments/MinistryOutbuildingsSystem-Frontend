import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

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
  const [searchKey, setSearchKey] = useState('');

  async function fetchMosques() {
    setLoading(true);
    try {
      const url = '/Mosques/Mosques';
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
              <button className="px-4 py-2 rounded border" onClick={() => setShowModal(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
