import type { Outbuilding, OutbuildingWithMosque } from '../utils/types';
import { getBackendUrl } from '../utils/api';

type OutbuildingDetailsModalProps = {
  outbuilding: Outbuilding | OutbuildingWithMosque;
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
    <div className="modal-backdrop fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="modal-container bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-900">تفاصيل الملحق</h3>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" onClick={onClose} aria-label="إغلاق">✕</button>
        </div>

        <div className="rounded-lg overflow-hidden border border-gray-100 mb-6">
          <table className="w-full text-right">
            <tbody className="divide-y divide-gray-100">
              {'mosqueName' in outbuilding && outbuilding.mosqueName && (
                <>
                  <tr>
                    <td className="px-4 py-3 bg-gray-50 font-semibold w-1/3 text-gray-600">اسم المسجد</td>
                    <td className="px-4 py-3 text-gray-900">{outbuilding.mosqueName || '-'}</td>
                  </tr>
                  {outbuilding.directorateName && (
                    <tr>
                      <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">المديرية</td>
                      <td className="px-4 py-3 text-gray-900">{outbuilding.directorateName}</td>
                    </tr>
                  )}
                  {outbuilding.administrationName && (
                    <tr>
                      <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">الإدارة</td>
                      <td className="px-4 py-3 text-gray-900">{outbuilding.administrationName}</td>
                    </tr>
                  )}
                </>
              )}
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">الوصف</td>
                <td className="px-4 py-3 text-gray-900">{outbuilding.description || '-'}</td>
              </tr>
              {outbuilding.governorateName && (
                <tr>
                  <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">المحافظة</td>
                  <td className="px-4 py-3 text-gray-900">{outbuilding.governorateName}</td>
                </tr>
              )}
              {outbuilding.departmentName && (
                <tr>
                  <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">القسم</td>
                  <td className="px-4 py-3 text-gray-900">{outbuilding.departmentName}</td>
                </tr>
              )}
              {outbuilding.sheikhdomName && (
                <tr>
                  <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">الشياخة</td>
                  <td className="px-4 py-3 text-gray-900">{outbuilding.sheikhdomName}</td>
                </tr>
              )}
              {outbuilding.street && (
                <tr>
                  <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">الشارع</td>
                  <td className="px-4 py-3 text-gray-900">{outbuilding.street}</td>
                </tr>
              )}
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">النشاط</td>
                <td className="px-4 py-3 text-gray-900">{outbuilding.purposeText || '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">الحالة القانونية</td>
                <td className="px-4 py-3 text-gray-900">{outbuilding.legalStatusText || '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">الحالة</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${outbuilding.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {outbuilding.status ? 'مستغل' : 'غير مستغل'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">اسم المنتفع</td>
                <td className="px-4 py-3 text-gray-900">{outbuilding.tenantName || '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">الرقم القومي</td>
                <td className="px-4 py-3 text-gray-900">{outbuilding.tenantNationalId || '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">المساحة</td>
                <td className="px-4 py-3 text-gray-900">{outbuilding.space || '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">قيمة حق الانتفاع</td>
                <td className="px-4 py-3 text-gray-900">{outbuilding.price || '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">تاريخ بدء العقد</td>
                <td className="px-4 py-3 text-gray-900">{outbuilding.startDate ? new Date(outbuilding.startDate).toLocaleDateString('ar-EG') : '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">تاريخ انتهاء العقد</td>
                <td className="px-4 py-3 text-gray-900">{outbuilding.endDate ? new Date(outbuilding.endDate).toLocaleDateString('ar-EG') : '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">تاريخ قبول اللجنة</td>
                <td className="px-4 py-3 text-gray-900">{outbuilding.acceptanceDate ? new Date(outbuilding.acceptanceDate).toLocaleDateString('ar-EG') : '-'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">عداد كهرباء</td>
                <td className="px-4 py-3 text-gray-900">{outbuilding.hasElectricityMeter ? 'نعم' : 'لا'}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">عداد مياه</td>
                <td className="px-4 py-3 text-gray-900">{outbuilding.hasWaterMeter ? 'نعم' : 'لا'}</td>
              </tr>
              {outbuilding.notes && (
                <tr>
                  <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">ملاحظات</td>
                  <td className="px-4 py-3 text-gray-900">{outbuilding.notes}</td>
                </tr>
              )}
              {outbuilding.contractUrl && (
                <tr>
                  <td className="px-4 py-3 bg-gray-50 font-semibold text-gray-600">العقد</td>
                  <td className="px-4 py-3">
                    <a href={getBackendUrl(outbuilding.contractUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      فتح العقد
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2">
          {!outbuilding.status && !outbuilding.contractUrl && (
            <button
              className="px-4 py-2 rounded-lg text-white transition-colors active:scale-95 duration-150"
              style={{ backgroundColor: 'var(--primary)' }}
              onClick={onAddContract}
            >
              إضافة عقد
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 text-white rounded-lg transition-colors active:scale-95 duration-150"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            تعديل
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors active:scale-95 duration-150"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
