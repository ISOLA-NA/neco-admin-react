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
}) => {
  return (
    <div
      className={classNames(
        "relative flex items-center gap-2",
        className,
        disabled ? "opacity-50 cursor-not-allowed" : ""
      )}
    >
      {/* آیکون سمت چپ */}
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
        disabled={disabled}
        aria-label={name}
        className={classNames(
          "peer w-full border border-purple-600 rounded-md px-4 py-2 pl-2 pr-10  bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300 text-gray-800 text-sm sm:text-base truncate",
          error
            ? "border-red-500 focus:border-red-500"
            : "border-purple-600 focus:border-indigo-500",
          leftIcon ? "pl-10" : "",
          rightIcon ? "pr-10" : "", 
          disabled ? "bg-gray-100 text-gray-500" : ""
        )}
      />

      {/* برچسب بالای ورودی */}
      <label
        htmlFor={name}
        className="absolute -top-3 left-3 bg-pink-100 px-2 text-sm text-gray-800"
      >
        {name}
      </label>

      {/* آیکون سمت راست */}
      {rightIcon && (
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
