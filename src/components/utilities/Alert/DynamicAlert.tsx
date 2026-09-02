// src/components/utilities/Alert/DynamicAlert.tsx

import React from "react";
import { toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Alert.css";

import CloseButton from "../CloseButton";
import i18n from "../../../i18n";

export type AlertType =
  | "success"
  | "error"
  | "warning"
  | "info";

const typeStyles: Record<AlertType, string> = {
  success: "bg-green-500 text-white rounded-md shadow-md",
  error: "bg-red-500 text-white rounded-md shadow-md",
  warning: "bg-yellow-500 text-white rounded-md shadow-md",
  info: "bg-blue-500 text-white rounded-md shadow-md",
};

export const showAlert = (
  type: AlertType,
  customContent?: React.ReactNode,
  title?: string,
  description?: string
) => {
  const language = i18n.language?.toLowerCase() || "en";

  const isFa = language.startsWith("fa");

  const options: ToastOptions = {
    position: isFa ? "top-right" : "top-left",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    rtl: isFa,
    closeButton: <CloseButton />,
  };

  toast(
    <div
      dir={isFa ? "rtl" : "ltr"}
      className={`
        relative
        p-4
        ${typeStyles[type]}
        bg-opacity-90
        ${isFa ? "text-right" : "text-left"}
      `}
    >
      {customContent ? (
        customContent
      ) : (
        <div className="flex flex-col gap-1">
          {title && (
            <h4 className="font-bold text-base">
              {title}
            </h4>
          )}

          {description && (
            <p className="text-sm leading-6">
              {description}
            </p>
          )}
        </div>
      )}
    </div>,
    options
  );
};