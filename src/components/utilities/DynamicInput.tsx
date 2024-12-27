// src/utilities/DynamicInput.tsx

import React, { ReactNode } from "react";
import { classNames } from "primereact/utils";

interface DynamicInputProps {
  name: string; // نام ورودی
  type: "text" | "number" | "password"; // نوع ورودی (text، number یا password)
  value?: string | number | null; // مقدار ورودی
  placeholder?: string; // جای‌نما
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // مدیریت تغییر
  leftIcon?: ReactNode; // عنصر سمت چپ
  rightIcon?: ReactNode; // عنصر سمت راست
  required?: boolean; // الزامی بودن
  className?: string; // کلاس سفارشی برای سبک‌دهی
  error?: boolean; // نمایش وضعیت خطا
  errorMessage?: string; // پیام خطا
  disabled?: boolean; // غیرفعال کردن ورودی
  loading?: boolean; // وضعیت بارگذاری
}

const DynamicInput: React.FC<DynamicInputProps> = ({
  name,
  type,
  value,
  placeholder = " ",
  onChange,
  leftIcon,
  rightIcon,
  required = false,
  className = "",
  error = false,
  errorMessage = "",
  disabled = false,
  loading = false,
}) => {
  return (
    <div
      className={classNames(
        "relative flex items-center gap-2",
        className,
        disabled ? "opacity-50 cursor-not-allowed" : ""
      )}
    >
      {/* آیکون سمت چپ - خارج از ورودی */}
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600 pointer-events-none">
          {leftIcon}
        </div>
      )}

      {/* ورودی */}
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled || loading}
        aria-label={name}
        className={classNames(
          "peer w-full border border-purple-600 rounded-md px-4 py-2 pl-10 pr-10 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300 text-gray-800 text-sm sm:text-base truncate",
          error
            ? "border-red-500 focus:border-red-500"
            : "border-purple-600 focus:border-indigo-500",
          disabled || loading ? "bg-gray-100 text-gray-500" : ""
        )}
      />

      {/* برچسب بالای ورودی */}
      <label
        htmlFor={name}
        className="absolute -top-3 left-3 bg-pink-100 px-2 text-sm text-gray-800"
      >
        {name}
      </label>

      {/* اسپینر بارگذاری سمت راست */}
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg
            className="animate-spin h-5 w-5 text-purple-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        </div>
      )}

      {/* آیکون سمت راست */}
      {rightIcon && !loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600">
          {rightIcon}
        </div>
      )}

      {/* پیام خطا */}
      {error && errorMessage && (
        <p className="absolute mt-1 text-red-500 text-xs">{errorMessage}</p>
      )}
    </div>
  );
};

export default DynamicInput;
