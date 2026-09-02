import React, { useEffect, useRef } from "react";

interface DynamicModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  modalClassName?: string;
  size?: "normal" | "large";
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  isOpen,
  onClose,
  children,
  modalClassName,
  size = "normal",
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog) dialog.showModal();
    else if (dialog) dialog.close();
  }, [isOpen]);

  const handleClose = () => onClose();

  // نکته: کلیک روی بک‌دراپ (بیرون از modal-box) دیگر مودال را نمی‌بندد.
  // طبق تصمیم پروژه، بستن مودال فقط از طریق دکمه‌ی × یا دکمه‌ی Cancel داخل
  // فرم انجام می‌شود، نه با کلیک بیرون از آن.
  // (قبلاً اینجا handleDialogClick با onClick روی <dialog> این کار را می‌کرد؛
  // به همین دلیل onClick از تگ dialog حذف شده است.)

  // جلوگیری از بسته‌شدن با کلید Escape هم — چون این هم یکی از راه‌های
  // پیش‌فرض بستن <dialog> است و طبق خواسته باید فقط با × یا Cancel بسته شود.
  const handleCancelEvent = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
  };

  // عرض: large ≈ دو برابر، ولی از viewport تجاوز نکند
  const widthClass =
    size === "large"
      ? "w-full max-w-[min(1600px,95vw)]" // ~2x
      : "w-full max-w-2xl";

  return (
    <dialog
      ref={dialogRef}
      className="modal fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300"
      onCancel={handleCancelEvent}
    >
      <div
        className={`modal-box bg-white rounded-lg p-6 relative shadow-lg
        ${modalClassName ? modalClassName : widthClass}`}
        // parent را بدون overflow می‌گذاریم تا دکمه‌ی × ثابت بماند
      >
        <button
          type="button"
          className="absolute top-3 right-4 text-gray-600 hover:text-gray-900 text-xl"
          onClick={handleClose}
          aria-label="Close"
          style={{ zIndex: 10 }}
        >
          ✕
        </button>

        {/* ظرف اسکرول محتوا (افقی + عمودی) */}
        <div className="mt-2 max-h-[80vh] max-w-full overflow-y-auto overflow-x-auto">
          {children}
        </div>
      </div>
    </dialog>
  );
};

export default DynamicModal;