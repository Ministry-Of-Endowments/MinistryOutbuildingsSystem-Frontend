import type { Mosque } from '../utils/types';

type MosquesTableProps = {
  mosques: Mosque[];
  loading: boolean;
  onShowDetails: (mosque: Mosque) => void;
  onViewOutbuildings: (mosque: Mosque) => void;
};

export default function MosquesTable({ mosques, loading, onShowDetails, onViewOutbuildings }: MosquesTableProps) {
  return (
    <div className="flex-1 overflow-auto bg-white border rounded min-h-0">
      <table className="w-full text-right">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 border">#</th>
            <th className="p-3 border">الاسم</th>
            <th className="p-3 border">المديرية</th>
            <th className="p-3 border">الإدارة</th>
            <th className="p-3 border">العنوان</th>
            <th className="p-3 border">ملاحظات</th>
            <th className="p-3 border w-48">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} className="p-6 text-center">جارٍ التحميل...</td></tr>
          ) : mosques.length === 0 ? (
            <tr><td colSpan={7} className="p-6 text-center">لا توجد بيانات لعرضها</td></tr>
          ) : mosques.map((mosque, idx) => (
            <tr key={mosque.id} className="hover:bg-gray-50">
              <td className="p-3 border">{idx + 1}</td>
              <td className="p-3 border">{mosque.name || '-'}</td>
              <td className="p-3 border">{mosque.directorateName || '-'}</td>
              <td className="p-3 border">{mosque.administrationName || '-'}</td>
              <td className="p-3 border">{mosque.address || '-'}</td>
              <td className="p-3 border">{mosque.notes || '-'}</td>
              <td className="p-2 border w-64">
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 rounded"
                    style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                    onClick={() => onShowDetails(mosque)}
                  >
                    عرض البيانات
                  </button>
                  <button
                    className="px-3 py-1 rounded"
                    style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                    onClick={() => onViewOutbuildings(mosque)}
                  >
                    عرض الملحقات
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
