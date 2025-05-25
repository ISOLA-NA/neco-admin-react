// DynamicModal.tsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom";

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
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const widthClass = size === "large" ? "w-full max-w-5xl" : "w-full max-w-2xl";

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative bg-white rounded-lg p-6 overflow-y-auto max-h-[80vh] shadow-lg transform transition-all duration-300 ${
          modalClassName ?? widthClass
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-3 right-4 text-gray-600 hover:text-gray-900 text-xl z-[9999]"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="mt-2">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default DynamicModal;
