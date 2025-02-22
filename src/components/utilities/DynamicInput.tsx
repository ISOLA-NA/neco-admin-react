import React, { ReactNode } from "react";
import { classNames } from "primereact/utils";

interface DynamicInputProps {
  name: string;
  type: "text" | "number" | "password" | "date" | "time";
  value?: string | number | null;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  required?: boolean;
  className?: string;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

const DynamicInput: React.FC<DynamicInputProps> = ({
  name,
  type,
  value,
  placeholder = "",
  onChange,
  leftIcon,
  rightIcon,
  required = false,
  className = "",
  error = false,
  errorMessage = "",
  disabled = false,
  loading = false,
  min,
  max,
  step,
}) => {
  return (
    <div className={classNames("w-full", className)}>
      {/* فقط در صورتی که name مقدار داشته باشد، برچسب نمایش داده شود */}
      {name && (
        <label
          htmlFor={name}
          className="block text-gray-700 text-sm font-medium mb-1"
        >
          {name}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      {/* Wrapper برای قرارگیری آیکون‌ها و Input */}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-600">
            {leftIcon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          // اگر value خالی یا null باشد، رشته‌ی خالی ارسال می‌کنیم
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled || loading}
          aria-label={name}
          min={min}
          max={max}
          step={step}
          // حذف اسپینر مرورگر در ورودی عددی
          style={
            type === "number"
              ? {
                  MozAppearance: "textfield",
                  WebkitAppearance: "none",
                }
              : {}
          }
          className={classNames(
            "w-full border rounded-md px-4 py-2 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-300",
            // افزایش padding-left اگر آیکون سمت چپ وجود داشته باشد
            leftIcon ? "pl-10" : "",
            // افزایش padding-right اگر آیکون سمت راست یا لودینگ باشد
            rightIcon || loading ? "pr-10" : "",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-purple-600 focus:border-indigo-500 focus:ring-purple-200",
            disabled || loading
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : ""
          )}
        />

        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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

        {rightIcon && !loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-purple-600">
            {rightIcon}
          </div>
        )}
      </div>

      {/* نمایش پیام خطا */}
      {error && errorMessage && (
        <p className="mt-1 text-red-500 text-xs">{errorMessage}</p>
      )}
    </div>
  );
};

export default DynamicInput;
