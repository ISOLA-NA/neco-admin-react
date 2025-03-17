import React, { ReactNode } from "react";
import { classNames } from "primereact/utils";

interface CustomTextareaProps {
  /** نام یا آیدی برای textarea */
  name: string;
  /** مقدار متنی */
  value?: string;
  /** تابع مدیریت تغییر */
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** جای‌نما */
  placeholder?: string;
  /** تعداد ردیف‌ها (ارتفاع پیش‌فرض) */
  rows?: number;
  /** آیکون/عنصر سمت چپ */
  leftIcon?: ReactNode;
  /** آیکون/عنصر سمت راست */
  rightIcon?: ReactNode;
  /** الزامی بودن فیلد */
  required?: boolean;
  /** کلاس‌های اضافی */
  className?: string;
  /** وضعیت خطا */
  error?: boolean;
  /** پیام خطا */
  errorMessage?: string;
  /** غیرفعال کردن فیلد */
  disabled?: boolean;
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({
  name,
  value,
  onChange,
  placeholder = "",
  rows = 3,
  leftIcon,
  rightIcon,
  required = false,
  className = "",
  error = false,
  errorMessage = "",
  disabled = false,
}) => {
  return (
    <div className={classNames("w-full", className)}>
      {/* برچسب بالای تکست اریا */}
      <label htmlFor={name} className="block text-xs text-gray-600 mb-1">
        {name}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <div className={classNames("relative", disabled ? "opacity-50 cursor-not-allowed" : "")}>
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-600">
            {leftIcon}
          </div>
        )}

        <textarea
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          disabled={disabled}
          aria-label={name}
          className={classNames(
            "w-full text-xs border rounded-md px-4 py-2 transition duration-300 focus:outline-none focus:ring-1",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-purple-500 focus:border-indigo-500 focus:ring-purple-200",
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            disabled ? "bg-gray-100 text-gray-500" : "bg-white text-gray-800"
          )}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-purple-600">
            {rightIcon}
          </div>
        )}
      </div>

      {error && errorMessage && (
        <p className="mt-1 text-red-500 text-xs">{errorMessage}</p>
      )}
    </div>
  );
};

export default CustomTextarea;
