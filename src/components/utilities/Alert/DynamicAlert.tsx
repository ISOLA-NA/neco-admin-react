import React from 'react';
import { toast, ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Alert.css'; // استایل سفارشی خود را اضافه کنید

type AlertType = 'success' | 'error' | 'warning' | 'info';

const typeStyles: Record<AlertType, string> = {
    success: 'bg-green-500 text-white rounded-md shadow-md',
    error: 'bg-red-500 text-white rounded-md shadow-md',
    warning: 'bg-yellow-500 text-white rounded-md shadow-md',
    info: 'bg-blue-500 text-white rounded-md shadow-md',
};

export const showAlert = (
    type: AlertType,
    customContent?: React.ReactNode,
    title?: string,
    description?: string
) => {
    const options: ToastOptions = {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        rtl: true,
        closeButton: (
            <button className="absolute top-1 left-1 text-white opacity-80 hover:opacity-100">
                ✕
            </button>
        ),
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

const Alert: React.FC = () => {
    return <ToastContainer className="custom-toast-container" />;
};

export default Alert;
