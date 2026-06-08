type ConfirmModalProps = {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  message,
  confirmLabel = 'تأكيد',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="modal-backdrop fixed inset-0 bg-black/40 flex items-center justify-center z-[99999] p-4">
      <div className="modal-container bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-right">
        <p className="mb-6 text-gray-800 text-base leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button
            className="px-4 py-2 rounded border hover:bg-gray-50 transition-colors"
            onClick={onCancel}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
