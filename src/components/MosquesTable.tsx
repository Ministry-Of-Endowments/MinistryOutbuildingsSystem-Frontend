import type { Mosque } from '../utils/types';

type MosquesTableProps = {
  mosques: Mosque[];
  loading: boolean;
  onShowDetails: (mosque: Mosque) => void;
  onViewOutbuildings: (mosque: Mosque) => void;
};

export default function MosquesTable({ mosques, loading, onShowDetails, onViewOutbuildings }: MosquesTableProps) {
  return (
    <div className="flex-1 overflow-auto bg-white rounded-lg shadow-sm min-h-0">
      <table className="w-full text-right">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-sm font-semibold text-gray-600">#</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-600">الاسم</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-600">المديرية</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-600">الإدارة</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-600">العنوان</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-600">ملاحظات</th>
            <th className="px-4 py-3 text-sm font-semibold text-gray-600 w-48">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">جارٍ التحميل...</td></tr>
          ) : mosques.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">لا توجد بيانات لعرضها</td></tr>
          ) : mosques.map((mosque, idx) => (
            <tr key={mosque.id} className="hover:bg-gray-50/70 transition-colors duration-150">
              <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{mosque.name || '-'}</td>
              <td className="px-4 py-3 text-gray-600">{mosque.directorateName || '-'}</td>
              <td className="px-4 py-3 text-gray-600">{mosque.administrationName || '-'}</td>
              <td className="px-4 py-3 text-gray-600">{mosque.address || '-'}</td>
              <td className="px-4 py-3 text-gray-500">{mosque.notes || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 active:scale-95"
                    style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                    onClick={() => onShowDetails(mosque)}
                  >
                    عرض البيانات
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 active:scale-95"
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
