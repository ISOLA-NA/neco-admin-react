// src/components/utilities/Alert/DynamicAlert.tsx
import React from "react";
import { toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Alert.css"; // استایل سفارشی شما
import CloseButton from "../CloseButton"; // اگه نداری، می‌تونی حذفش کنی

type AlertType = "success" | "error" | "warning" | "info";

const typeStyles: Record<AlertType, string> = {
  success: "bg-green-500 text-white rounded-md shadow-md",
  error: "bg-red-500 text-white rounded-md shadow-md",
  warning: "bg-yellow-500 text-white rounded-md shadow-md",
  info: "bg-blue-500 text-white rounded-md shadow-md",
};

/**
 * نمایش پیام توست
 */
export const showAlert = (
  type: AlertType,
  customContent?: React.ReactNode,
  title?: string,
  description?: string
) => {
  const options: ToastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    rtl: true,
    closeButton: <CloseButton />,
  };

  toast(
    <div className={`relative p-4 ${typeStyles[type]} bg-opacity-90`}>
      {customContent ? (
        customContent
      ) : (
        <>
          {title && <div className="font-bold">{title}</div>}
          {description && <div>{description}</div>}
        </>
      )}
    </div>,
    options
  );
};
