// src/components/common/CustomTextarea.tsx

import { classNames } from "primereact/utils";
import React, { ReactNode } from "react";

interface CustomTextareaProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  label?: string; // افزودن برچسب
  leftElement?: ReactNode; // عنصر سمت چپ
  rightElement?: ReactNode; // عنصر سمت راست
  required?: boolean; // الزامی بودن
  error?: boolean; // نمایش وضعیت خطا
  errorMessage?: string; // پیام خطا
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = " ",
  rows = 1,
  className = "",
  label = "",
  leftElement,
  rightElement,
  required = false,
  error = false,
  errorMessage = "",
}) => {
  return (
    <div className={classNames("mb-6 relative", className)}>
      {/* عنصر سمت چپ */}
      {leftElement && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
          {leftElement}
        </div>
      )}

      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        aria-label={name}
        className={classNames(
          "peer w-full border-b-2 bg-white",
          error ? "border-red-500" : "border-purple-600",
          leftElement ? "pl-10" : "pl-3",
          rightElement ? "pr-10" : "pr-3",
          "pb-2 focus:outline-none",
          error ? "focus:border-red-500" : "focus:border-indigo-500",
          "transition-colors duration-300 text-gray-800 text-sm sm:text-base resize-y" // اجازه ریسایز عمودی
        )}
        autoComplete="off" // غیرفعال‌سازی autocomplete برای جلوگیری از تغییرات ناخواسته
      />

      <label
        htmlFor={id}
        className={classNames(
          "absolute",
          leftElement ? "left-10" : "left-3",
          "transform transition-all duration-300 cursor-text top-0 text-sm text-gray-600 -translate-y-full",
          "peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-600 peer-placeholder-shown:-translate-y-1/2",
          "peer-focus:top-0 peer-focus:text-sm peer-focus:text-gray-600 peer-focus:-translate-y-full"
        )}
      >
        {label || name}
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

export default CustomTextarea;
