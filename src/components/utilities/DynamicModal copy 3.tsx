// src/components/DynamicModal.tsx
import React, { useEffect, useRef } from "react";

interface DynamicModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  isOpen,
  onClose,
  children,
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
      <div className="modal-box w-11/12 max-w-5xl bg-white rounded-lg p-6 relative">
        {/* دکمه بستن */}
        <button
          className="absolute top-4 right-4 btn btn-error btn-sm"
          onClick={handleClose}
          aria-label="بستن"
        >
          ✕
        </button>

        {/* محتوای مودال */}
        {children}
      </div>
    </dialog>
  );
};

export default DynamicModal;
