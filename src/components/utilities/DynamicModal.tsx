import React from "react";

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
  if (!isOpen) return null;

  const widthClass = size === "large" ? "w-full max-w-5xl" : "w-full max-w-2xl";

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div
        className={`modal-box bg-white rounded-lg p-6 relative overflow-y-auto max-h-[80vh]
        transition-transform duration-300 ease-in-out transform scale-95 sm:scale-100 shadow-lg
        ${modalClassName ? modalClassName : widthClass}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-3 right-4 text-gray-600 hover:text-gray-900 text-xl z-10"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};

export default DynamicModal;
