import type { Outbuilding } from '../utils/types';
import { getBackendUrl } from '../utils/api';

type OutbuildingDetailsModalProps = {
  outbuilding: Outbuilding;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddContract: () => void;
};

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

        <table className="w-full text-right mb-6 border-collapse border border-gray-300">
          <tbody>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold w-1/3 border border-gray-300">الوصف</td>
              <td className="p-3 border border-gray-300">{outbuilding.description || '-'}</td>
            </tr>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold border border-gray-300">العنوان</td>
              <td className="p-3 border border-gray-300">{outbuilding.address || '-'}</td>
            </tr>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold border border-gray-300">النشاط</td>
              <td className="p-3 border border-gray-300">{outbuilding.purposeText || '-'}</td>
            </tr>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold border border-gray-300">الحالة القانونية</td>
              <td className="p-3 border border-gray-300">{outbuilding.legalStatusText || '-'}</td>
            </tr>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold border border-gray-300">الحالة</td>
              <td className="p-3 border border-gray-300">{outbuilding.status ? 'مستغل' : 'غير مستغل'}</td>
            </tr>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold border border-gray-300">اسم المنتفع</td>
              <td className="p-3 border border-gray-300">{outbuilding.tenantName || '-'}</td>
            </tr>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold border border-gray-300">الرقم القومي</td>
              <td className="p-3 border border-gray-300">{outbuilding.tenantNationalId || '-'}</td>
            </tr>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold border border-gray-300">المساحة</td>
              <td className="p-3 border border-gray-300">{outbuilding.space || '-'}</td>
            </tr>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold border border-gray-300">قيمة حق الانتفاع</td>
              <td className="p-3 border border-gray-300">{outbuilding.price || '-'}</td>
            </tr>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold border border-gray-300">تاريخ البدء</td>
              <td className="p-3 border border-gray-300">{outbuilding.startDate ? new Date(outbuilding.startDate).toLocaleDateString('ar-EG') : '-'}</td>
            </tr>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold border border-gray-300">تاريخ الانتهاء</td>
              <td className="p-3 border border-gray-300">{outbuilding.endDate ? new Date(outbuilding.endDate).toLocaleDateString('ar-EG') : '-'}</td>
            </tr>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold border border-gray-300">تاريخ القبول</td>
              <td className="p-3 border border-gray-300">{outbuilding.acceptanceDate ? new Date(outbuilding.acceptanceDate).toLocaleDateString('ar-EG') : '-'}</td>
            </tr>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold border border-gray-300">عداد كهرباء</td>
              <td className="p-3 border border-gray-300">{outbuilding.hasElectricityMeter ? 'نعم' : 'لا'}</td>
            </tr>
            <tr>
              <td className="p-3 bg-gray-50 font-semibold border border-gray-300">عداد مياه</td>
              <td className="p-3 border border-gray-300">{outbuilding.hasWaterMeter ? 'نعم' : 'لا'}</td>
            </tr>
            {outbuilding.notes && (
              <tr>
                <td className="p-3 bg-gray-50 font-semibold border border-gray-300">ملاحظات</td>
                <td className="p-3 border border-gray-300">{outbuilding.notes}</td>
              </tr>
            )}
            {outbuilding.contractUrl && (
              <tr>
                <td className="p-3 bg-gray-50 font-semibold border border-gray-300">العقد</td>
                <td className="p-3 border border-gray-300">
                  <a href={getBackendUrl(outbuilding.contractUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
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
