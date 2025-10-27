type Mosque = {
  id: number;
  name: string;
  directorate: string;
  address: string;
  notes: string;
};

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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded shadow max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">تفاصيل المسجد</h3>
          <button className="text-gray-600" onClick={onClose}>✖</button>
        </div>

        <table className="w-full text-right mb-6">
          <tbody>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold w-1/3">الاسم</td>
              <td className="p-3">{mosque.name || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold">المديرية</td>
              <td className="p-3">{mosque.directorate || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold">العنوان</td>
              <td className="p-3">{mosque.address || '-'}</td>
            </tr>
            {mosque.notes && (
              <tr className="border-b">
                <td className="p-3 bg-gray-50 font-semibold">ملاحظات</td>
                <td className="p-3">{mosque.notes}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
            onClick={onDelete}
          >
            حذف
          </button>
          <button
            className="px-4 py-2 rounded text-white"
            style={{ backgroundColor: 'var(--primary)' }}
            onClick={onEdit}
          >
            تعديل
          </button>
          <button className="px-4 py-2 rounded border" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
