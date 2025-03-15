// src/components/utilities/Confirm/DynamicConfirm.tsx

import React from "react";
import { FiAlertTriangle, FiCheck } from "react-icons/fi";

/**
 * بسته به سلیقه می‌توانید Variantهای بیشتری اضافه کنید،
 * اینجا پنج تا گذاشته‌ایم: add, edit, delete, notice, error
 */
type VariantType = "add" | "edit" | "delete" | "notice" | "error";

interface DynamicConfirmProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onClose: () => void;
  variant: VariantType;
  /**
   * اگر بخواهیم کادر Cancel را مخفی کنیم (مثلاً در پیام‌های اطلاع‌رسانی)،
   * می‌توانیم از این استفاده کنیم.
   */
  hideCancelButton?: boolean;
}

const DynamicConfirm: React.FC<DynamicConfirmProps> = ({
  isOpen,
  title = "Confirmation",
  message = "Are you sure you want to proceed?",
  onConfirm,
  onClose,
  variant,
  hideCancelButton = false,
}) => {
  if (!isOpen) return null;

  // تعیین رنگ‌ها بر اساس variant
  let headerColor = "text-gray-700";
  let confirmButtonColor = "bg-blue-500 hover:bg-blue-600";
  let IconComponent = FiAlertTriangle;
  let iconSize = 24;

  switch (variant) {
    case "delete":
      headerColor = "text-red-500";
      confirmButtonColor = "bg-red-500 hover:bg-red-600";
      IconComponent = FiAlertTriangle;
      iconSize = 24;
      break;
    case "edit":
      headerColor = "text-yellow-500";
      confirmButtonColor = "bg-yellow-500 hover:bg-yellow-600";
      IconComponent = FiAlertTriangle;
      iconSize = 24;
      break;
    case "add":
      headerColor = "text-green-500";
      confirmButtonColor = "bg-green-500 hover:bg-green-600";
      IconComponent = FiCheck;
      iconSize = 30;
      break;
    case "notice":
      // پیام اطلاع‌رسانی (سبز کم‌رنگ) با دکمه OK
      headerColor = "text-green-500";
      confirmButtonColor = "bg-green-500 hover:bg-green-600";
      IconComponent = FiCheck;
      iconSize = 30;
      break;
    case "error":
      // پیام خطا (قرمز)
      headerColor = "text-red-500";
      confirmButtonColor = "bg-red-500 hover:bg-red-600";
      IconComponent = FiAlertTriangle;
      iconSize = 24;
      break;
  }

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
          <IconComponent size={iconSize} className="mr-2" />
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        {/* متن پیام */}
        <p className="text-gray-700 text-center mb-6 whitespace-pre-line">
          {message}
        </p>
        {/* دکمه‌ها */}
        <div className="flex justify-center space-x-4">
          {!hideCancelButton && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-700"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-white ${confirmButtonColor}`}
          >
            {hideCancelButton ? "OK" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicConfirm;
