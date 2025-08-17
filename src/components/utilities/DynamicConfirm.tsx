// src/components/utilities/Confirm/DynamicConfirm.tsx

import React from "react";
import { FiAlertTriangle, FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";

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
  title,
  message,
  onConfirm,
  onClose,
  variant,
  hideCancelButton = false,
}) => {
  // طبق درخواست شما: بدون namespace
  const { t } = useTranslation();

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

  const resolvedTitle =
    title ?? t("DynamicConfirm.Confirmations.Default.Title");
  const resolvedMessage =
    message ?? t("DynamicConfirm.Confirmations.Default.Message");

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center 
        bg-gradient-to-r from-[#E44AA5]/20 via-[#A036DE]/20 to-[#DE45A6]/20
        backdrop-blur-sm
      "
      style={{ overflow: "hidden" }}
      role="dialog"
      aria-modal="true"
      aria-label={resolvedTitle}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative flex flex-col items-center">
        {/* هدر و آیکون */}
        <div className={`mb-4 flex items-center justify-center gap-2 ${headerColor}`}>
          <IconComponent size={iconSize} aria-hidden />
          <h2 className="text-lg font-bold">{resolvedTitle}</h2>
        </div>

        {/* متن پیام */}
        <p className="text-gray-700 text-center mb-6 whitespace-pre-line">
          {resolvedMessage}
        </p>

        {/* دکمه‌ها */}
        <div className="flex justify-center items-center gap-4">
          {!hideCancelButton && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-700"
            >
              {t("DynamicConfirm.Buttons.Cancel")}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-white ${confirmButtonColor}`}
          >
            {hideCancelButton
              ? t("DynamicConfirm.Buttons.Ok")
              : t("DynamicConfirm.Buttons.Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicConfirm;
