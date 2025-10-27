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

type OutbuildingsListModalProps = {
  mosqueName: string;
  outbuildings: Outbuilding[];
  loading: boolean;
  onClose: () => void;
  onShowDetails: (outbuilding: Outbuilding) => void;
  onAddOutbuilding: () => void;
};

function getOutbuildingTypeName(type: number): string {
  switch (type) {
    case 0: return 'محل';
    case 1: return 'شقة';
    default: return 'غير محدد';
  }
}

export default function OutbuildingsListModal({
  mosqueName,
  outbuildings,
  loading,
  onClose,
  onShowDetails,
  onAddOutbuilding,
}: OutbuildingsListModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded shadow w-[95vw] max-w-[1400px] h-[90vh] p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="text-lg font-semibold">ملحقات مسجد: {mosqueName}</h3>
          <button className="text-gray-600" onClick={onClose}>✖</button>
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
                <tr><td colSpan={12} className="p-6 text-center text-gray-500">لا توجد ملحقات</td></tr>
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
                      onClick={() => onShowDetails(item)}
                    >
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end gap-2 shrink-0">
          <button
            className="px-4 py-2 rounded text-white"
            style={{ backgroundColor: 'var(--primary)' }}
            onClick={onAddOutbuilding}
          >
            إضافة ملحق
          </button>
          <button
            className="px-4 py-2 rounded border"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
