// src/components/utilities/Alert/DynamicAlert.tsx
import React from "react";
import { ToastContainer, toast, type ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Alert.css"; // 👈 فایل استایل سفارشی ما

type AlertType = "success" | "error" | "warning" | "info";

const toastStyles: Record<AlertType, string> = {
  success: "toast-success",
  error: "toast-error",
  warning: "toast-warning",
  info: "toast-info",
};

export const showAlert = (
  type: AlertType,
  customContent?: React.ReactNode,
  title?: string,
  description?: string
) => {
  const opts: ToastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    rtl: true,
    className: toastStyles[type], // ⬅ تعیین رنگ پس‌زمینه
  };

  toast(
    <div className="toast-content">
      {title && <div className="toast-title">{title}</div>}
      {description && <div className="toast-description">{description}</div>}
      {customContent && <div className="toast-custom">{customContent}</div>}
    </div>,
    opts
  );
};

const DynamicAlert: React.FC = () => (
  <ToastContainer
    className="custom-toast-container"
    newestOnTop
    closeOnClick
    draggable
    pauseOnHover
    bodyClassName="toast-body"
  />
);

export default DynamicAlert;
