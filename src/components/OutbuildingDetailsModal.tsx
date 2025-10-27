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

type OutbuildingDetailsModalProps = {
  outbuilding: Outbuilding;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddContract: () => void;
};

function getOutbuildingTypeName(type: number): string {
  switch (type) {
    case 0: return 'محل';
    case 1: return 'شقة';
    default: return 'غير محدد';
  }
}

export default function OutbuildingDetailsModal({
  outbuilding,
  onClose,
  onEdit,
  onDelete,
  onAddContract,
}: OutbuildingDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-60">
      <div className="bg-white rounded shadow max-w-4xl w-full p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">تفاصيل الملحق</h3>
          <button className="text-gray-600" onClick={onClose}>✖</button>
        </div>

        <table className="w-full text-right mb-6">
          <tbody>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold w-1/3">الاسم</td>
              <td className="p-3">{outbuilding.name || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold">العنوان</td>
              <td className="p-3">{outbuilding.address || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold">النوع</td>
              <td className="p-3">{getOutbuildingTypeName(outbuilding.type)}</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold">الحالة</td>
              <td className="p-3">{outbuilding.status ? 'نشط' : 'غير نشط'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold">اسم المستأجر</td>
              <td className="p-3">{outbuilding.tenantName || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold">الرقم القومي</td>
              <td className="p-3">{outbuilding.tenantNationalId || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold">المساحة</td>
              <td className="p-3">{outbuilding.space || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold">السعر</td>
              <td className="p-3">{outbuilding.price || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold">تاريخ البدء</td>
              <td className="p-3">{outbuilding.startDate ? new Date(outbuilding.startDate).toLocaleDateString('ar-EG') : '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold">تاريخ الانتهاء</td>
              <td className="p-3">{outbuilding.endDate ? new Date(outbuilding.endDate).toLocaleDateString('ar-EG') : '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 bg-gray-50 font-semibold">تاريخ القبول</td>
              <td className="p-3">{outbuilding.acceptanceDate ? new Date(outbuilding.acceptanceDate).toLocaleDateString('ar-EG') : '-'}</td>
            </tr>
            {outbuilding.notes && (
              <tr className="border-b">
                <td className="p-3 bg-gray-50 font-semibold">ملاحظات</td>
                <td className="p-3">{outbuilding.notes}</td>
              </tr>
            )}
            {outbuilding.contractUrl && (
              <tr className="border-b">
                <td className="p-3 bg-gray-50 font-semibold">العقد</td>
                <td className="p-3">
                  <a href={outbuilding.contractUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    فتح العقد
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end gap-2">
          {!outbuilding.status && (
            <button
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: 'var(--primary)' }}
              onClick={onAddContract}
            >
              إضافة عقد
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 text-white rounded"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            تعديل
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
