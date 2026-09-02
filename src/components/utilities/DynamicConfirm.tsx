// src/components/utilities/Confirm/DynamicConfirm.tsx

import React from "react";
import {
  FiAlertTriangle,
  FiCheck,
  FiInfo,
} from "react-icons/fi";

import { useTranslation } from "react-i18next";

export type VariantType =
  | "add"
  | "edit"
  | "delete"
  | "notice"
  | "error";

interface DynamicConfirmProps {
  isOpen: boolean;

  title?: string;

  message?: string;

  onConfirm: () => void | Promise<void>;

  onClose: () => void;

  variant?: VariantType;

  hideCancelButton?: boolean;

  confirmText?: string;

  cancelText?: string;
}

const DynamicConfirm: React.FC<DynamicConfirmProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  variant = "notice",
  hideCancelButton = false,
  confirmText,
  cancelText,
}) => {
  const { t, i18n } = useTranslation();

  if (!isOpen) {
    return null;
  }

  const language =
    i18n.language?.toLowerCase() || "en";

  const isFa = language.startsWith("fa");

  const dir = isFa ? "rtl" : "ltr";

  let headerColor = "text-gray-700";

  let confirmButtonColor =
    "bg-blue-500 hover:bg-blue-600";

  let IconComponent = FiInfo;

  let iconSize = 24;

  switch (variant) {
    case "delete":
      headerColor = "text-red-500";
      confirmButtonColor =
        "bg-red-500 hover:bg-red-600";
      IconComponent = FiAlertTriangle;
      iconSize = 24;
      break;

    case "edit":
      headerColor = "text-yellow-500";
      confirmButtonColor =
        "bg-yellow-500 hover:bg-yellow-600";
      IconComponent = FiAlertTriangle;
      iconSize = 24;
      break;

    case "add":
      headerColor = "text-green-500";
      confirmButtonColor =
        "bg-green-500 hover:bg-green-600";
      IconComponent = FiCheck;
      iconSize = 30;
      break;

    case "notice":
      headerColor = "text-blue-500";
      confirmButtonColor =
        "bg-blue-500 hover:bg-blue-600";
      IconComponent = FiInfo;
      iconSize = 26;
      break;

    case "error":
      headerColor = "text-red-500";
      confirmButtonColor =
        "bg-red-500 hover:bg-red-600";
      IconComponent = FiAlertTriangle;
      iconSize = 24;
      break;
  }

  const resolvedTitle =
    title ??
    t("DynamicConfirm.Confirmations.Default.Title");

  const resolvedMessage =
    message ??
    t("DynamicConfirm.Confirmations.Default.Message");

  return (
    <div
      dir={dir}
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/20
        backdrop-blur-sm
        px-4
      "
      role="dialog"
      aria-modal="true"
      aria-label={resolvedTitle}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-md
          rounded-xl
          bg-white
          shadow-2xl
          border
          border-gray-200
          p-6
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`
            mb-4
            flex
            items-center
            justify-center
            gap-2
            ${headerColor}
          `}
        >
          <IconComponent size={iconSize} />

          <h3 className="text-lg font-bold">
            {resolvedTitle}
          </h3>
        </div>

        {/* Message */}
        <p
          className={`
            text-gray-700
            mb-6
            whitespace-pre-line
            leading-7
            w-full
            ${
              dir === "rtl"
                ? "text-right"
                : "text-left"
            }
          `}
        >
          {resolvedMessage}
        </p>

        {/* Buttons */}
        <div className="flex justify-center items-center gap-4">
          {!hideCancelButton && (
            <button
              type="button"
              onClick={onClose}
              className="
                min-w-[90px]
                px-4
                py-2
                rounded-md
                bg-gray-200
                hover:bg-gray-300
                text-gray-700
                transition-colors
              "
            >
              {cancelText ??
                t("DynamicConfirm.Buttons.Cancel")}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            className={`
              min-w-[90px]
              px-4
              py-2
              rounded-md
              text-white
              transition-colors
              ${confirmButtonColor}
            `}
          >
            {confirmText ??
              (hideCancelButton
                ? t("DynamicConfirm.Buttons.Ok")
                : t(
                    "DynamicConfirm.Buttons.Confirm"
                  ))}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicConfirm;