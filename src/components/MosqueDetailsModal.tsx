import type { Mosque } from '../utils/types';

type MosqueDetailsModalProps = {
  mosque: Mosque;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function MosqueDetailsModal({
  mosque,
  onClose,
  onEdit,
  onDelete,
}: MosqueDetailsModalProps) {
  return (
    <div className="modal-backdrop fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="modal-container bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-900">تفاصيل المسجد</h3>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" onClick={onClose} aria-label="إغلاق">✕</button>
        </div>

        <div className="rounded-lg overflow-hidden border border-gray-100 mb-6">
          <table className="w-full text-right">
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold w-1/3 text-gray-600">الاسم</td>
                <td className="px-4 py-3 text-gray-900">{mosque.name || '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">المديرية</td>
                <td className="px-4 py-3 text-gray-900">{mosque.directorateName || '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">الإدارة</td>
                <td className="px-4 py-3 text-gray-900">{mosque.administrationName || '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">العنوان</td>
                <td className="px-4 py-3 text-gray-900">{mosque.address || '-'}</td>
              </tr>
              {mosque.notes && (
                <tr>
                  <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">ملاحظات</td>
                  <td className="px-4 py-3 text-gray-900">{mosque.notes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors active:scale-95 duration-150"
            onClick={onDelete}
          >
            حذف
          </button>
          <button
            className="px-4 py-2 rounded-lg text-white transition-colors active:scale-95 duration-150"
            style={{ backgroundColor: 'var(--primary)' }}
            onClick={onEdit}
          >
            تعديل
          </button>
          <button className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
