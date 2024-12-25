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
  placeholder = " ",
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

      {/* تکست اریا */}
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
          "peer w-full border border-purple-600 rounded-md px-4 py-2 pl-2 pr-10 bg-white appearance-none",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300",
          "text-gray-800 text-sm sm:text-base resize-none", // اجازه یا عدم‌اجازه ریسایز را می‌توانید تغییر دهید
          error
            ? "border-red-500 focus:border-red-500"
            : "border-purple-600 focus:border-indigo-500",
          leftIcon ? "pl-10" : "",
          rightIcon ? "pr-10" : "",
          disabled ? "bg-gray-100 text-gray-500" : ""
        )}
      />

      {/* برچسب بالای تکست اریا */}
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

export default CustomTextarea;
