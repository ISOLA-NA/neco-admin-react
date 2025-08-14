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
        className={`relative bg-white rounded-lg shadow-lg transform transition-all duration-300 ${
          modalClassName ?? widthClass
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر استیکی با ضربدر بزرگ‌تر و بالاتر */}
        <div className="sticky top-0 z-[9999] flex justify-end -mt-2 pr-4 pt-2 bg-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="
          p-1
          text-red-600 hover:text-gray-900
          font-bold
          text-3xl     /* اندازه بزرگ‌تر */
        "
          >
            ×
          </button>
        </div>

        {/* محتوای اسکرول‌شونده */}
        <div className="overflow-y-auto max-h-[calc(80vh-2.5rem)] px-6 pb-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DynamicModal;
