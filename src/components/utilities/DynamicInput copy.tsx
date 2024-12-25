// src/utilities/DynamicInput.tsx

import { classNames } from "primereact/utils";
import React, { ReactNode } from "react";

interface DynamicInputProps {
  name: string; // نام ورودی
  type: "text" | "number" | "password"; // نوع ورودی (text، number یا password)
  value?: string | number | null; // مقدار ورودی
  placeholder?: string; // جای‌نما
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // مدیریت تغییر
  leftElement?: ReactNode; // عنصر سمت چپ
  rightElement?: ReactNode; // عنصر سمت راست
  required?: boolean; // الزامی بودن
  className?: string; // کلاس سفارشی برای سبک‌دهی
  error?: boolean; // نمایش وضعیت خطا
  errorMessage?: string; // پیام خطا
  disabled?: boolean; // غیرفعال کردن ورودی
}

const DynamicInput: React.FC<DynamicInputProps> = ({
  name,
  type,
  value,
  placeholder = " ",
  onChange,
  leftElement,
  rightElement,
  required = false,
  className = "",
  error = false,
  errorMessage = "",
  disabled = false, // پیش‌فرض: فعال
}) => {
  return (
    <div
      className={classNames(
        "mb-6 relative",
        className,
        disabled ? "opacity-50 cursor-not-allowed" : "" // استایل غیرفعال
      )}
    >
      {/* عنصر سمت چپ */}
      {leftElement && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
          {leftElement}
        </div>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""} // تبدیل null به ""
        placeholder={placeholder}
        onChange={onChange}
        inputMode={type === "number" ? "numeric" : undefined}
        className={classNames(
          "peer w-full border-b-2 bg-white",
          error ? "border-red-500" : "border-purple-600",
          leftElement ? "pl-10" : "pl-3",
          rightElement ? "pr-10" : "pr-3",
          "pb-2 focus:outline-none",
          error ? "focus:border-red-500" : "focus:border-indigo-500",
          "transition-colors duration-300 text-gray-800 text-sm sm:text-base",
          disabled ? "cursor-not-allowed bg-gray-200" : "" // استایل ورودی غیرفعال
        )}
        required={required}
        aria-label={name}
        autoComplete="off"
        disabled={disabled} // غیرفعال کردن ورودی
      />

      <label
        htmlFor={name}
        className={classNames(
          "absolute",
          leftElement ? "left-10" : "left-3",
          "transform transition-all duration-300 cursor-text top-0 text-sm text-gray-600 -translate-y-full",
          "peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-600 peer-placeholder-shown:-translate-y-1/2",
          "peer-focus:top-0 peer-focus:text-sm peer-focus:text-gray-600 peer-focus:-translate-y-full"
        )}
      >
        {name}
      </label>

      {/* عنصر سمت راست */}
      {rightElement && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          {rightElement}
        </div>
      )}

      {/* پیام خطا */}
      {error && errorMessage && (
        <p className="mt-1 text-red-500 text-xs">{errorMessage}</p>
      )}
    </div>
  );
};

export default DynamicInput;
