// src/components/utilities/Confirm/DynamicConfirm.tsx

import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

/**
 * variant = 'delete' => رنگ قرمز / دکمه قرمز
 * variant = 'edit'   => رنگ زرد / دکمه زرد
 */
type VariantType = "delete" | "edit";

interface DynamicConfirmProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onClose: () => void;
  variant: VariantType;
}

const DynamicConfirm: React.FC<DynamicConfirmProps> = ({
  isOpen,
  title = "Confirmation",
  message = "Are you sure you want to proceed?",
  onConfirm,
  onClose,
  variant,
}) => {
  if (!isOpen) return null;

  // بر اساس variant تعیین رنگ‌ها
  const headerColor =
    variant === "delete"
      ? "text-red-500"
      : variant === "edit"
      ? "text-yellow-500"
      : "text-gray-700";

  const confirmButtonColor =
    variant === "delete"
      ? "bg-red-500 hover:bg-red-600"
      : variant === "edit"
      ? "bg-yellow-500 hover:bg-yellow-600"
      : "bg-blue-500 hover:bg-blue-600";

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center 
        bg-gradient-to-r from-[#E44AA5]/20 via-[#A036DE]/20 to-[#DE45A6]/20
        backdrop-blur-sm
      "
      style={{ overflow: "hidden" }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative flex flex-col items-center">
        {/* هدر و آیکون */}
        <div className={`mb-4 flex items-center justify-center ${headerColor}`}>
          <FiAlertTriangle size={24} className="mr-2" />
          <h2 className="text-lg font-bold">{title}</h2>
        </div>

        {/* توضیحات اصلی */}
        <p className="text-gray-700 text-center mb-6">{message}</p>

        {/* دکمه‌ها (وسط‌چین) */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-white ${confirmButtonColor}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicConfirm;
