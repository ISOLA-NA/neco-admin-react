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
      className="modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleDialogClick}
    >
      <div
        className={`modal-box bg-white rounded-xl p-8 relative overflow-y-auto max-h-[90vh] transition-transform duration-300 ease-in-out transform scale-95 sm:scale-100 shadow-xl ${
          modalClassName ? modalClassName : "max-w-3xl sm:max-w-4xl md:max-w-5xl lg:max-w-6xl"
        }`}
      >
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          onClick={handleClose}
          aria-label="بستن"
          style={{ zIndex: 10 }}
        >
          ✕
        </button>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
};

export default DynamicModal;
