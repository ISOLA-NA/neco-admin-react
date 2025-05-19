import React, { useEffect, useRef } from "react";

interface DynamicModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  modalClassName?: string;
  size?: "normal" | "large"; // ← اضافه شد
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  isOpen,
  onClose,
  children,
  modalClassName,
  size = "normal", // مقدار پیش‌فرض
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog) {
      dialog.showModal();
    } else if (dialog) {
      dialog.close();
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  // کلاس عرض بر اساس سایز
  const widthClass =
    size === "large"
      ? "w-full max-w-5xl" // عرض زیاد (دو برابر معمولی)
      : "w-full max-w-2xl"; // عرض معمولی

  return (
    <dialog
      ref={dialogRef}
      className="modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleDialogClick}
    >
      <div
        className={`modal-box bg-white rounded-lg p-6 relative overflow-y-auto max-h-[80vh] transition-transform duration-300 ease-in-out transform scale-95 sm:scale-100 shadow-lg
        ${modalClassName ? modalClassName : widthClass}
        `}
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
        <div className="mt-2">{children}</div>
      </div>
    </dialog>
  );
};

export default DynamicModal;
