// src/components/DynamicModal.tsx
import React, { useEffect, useRef } from "react";

interface DynamicModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  modalClassName?: string;
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  isOpen,
  onClose,
  children,
  modalClassName,
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

  return (
    <dialog
      ref={dialogRef}
      className="modal backdrop-blur-sm transition-all duration-300 transform"
      onClick={handleDialogClick}
    >
      <div
        className={`modal-box bg-white rounded-lg p-6 relative overflow-y-auto max-h-[90vh] transition-transform duration-300 transform scale-95 sm:scale-100 ${
          modalClassName ? modalClassName : "max-w-3xl sm:max-w-4xl md:max-w-5xl lg:max-w-6xl"
        }`}
      >
        <button
          type="button"
          className="absolute top-4 right-4 btn btn-error btn-sm"
          onClick={handleClose}
          aria-label="بستن"
          style={{ zIndex: 10 }}
        >
          ✕
        </button>
        <div className="mt-8">{children}</div>
      </div>
    </dialog>
  );
};

export default DynamicModal;
