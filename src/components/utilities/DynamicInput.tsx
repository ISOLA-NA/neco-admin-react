import React, { ReactNode } from "react";
import { classNames } from "primereact/utils";

interface DynamicInputProps {
  name: string;
  type: "text" | "number" | "password";
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
  min,
  max,
  step,
}) => {
  return (
    <div
      className={classNames(
        "relative flex items-center gap-2",
        className,
        disabled ? "opacity-50 cursor-not-allowed" : ""
      )}
    >
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600 pointer-events-none">
          {leftIcon}
        </div>
      )}

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
        min={typeof min !== "undefined" ? min : undefined}
        max={typeof max !== "undefined" ? max : undefined}
        step={typeof step !== "undefined" ? step : undefined}
        className={classNames(
          "peer w-full border border-purple-600 rounded-md px-4 py-2 pl-10 pr-10 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300 text-gray-800 text-sm sm:text-base truncate",
          error
            ? "border-red-500 focus:border-red-500"
            : "border-purple-600 focus:border-indigo-500",
          disabled || loading ? "bg-gray-100 text-gray-500" : ""
        )}
      />

      <label
        htmlFor={name}
        className={classNames(
          "absolute -top-3 left-3 bg-pink-100 px-2 text-sm text-gray-800",
          "max-w-[calc(100%-24px)] overflow-hidden whitespace-nowrap",
          "md:overflow-visible md:max-w-none",
          "max-md:truncate max-md:after:content-['...']",
          disabled ? "-top-4 transition-all duration-300" : ""
        )}
        title={name}
      >
        {name}
      </label>

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

      {rightIcon && !loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600">
          {rightIcon}
        </div>
      )}

      {error && errorMessage && (
        <p className="absolute mt-1 text-red-500 text-xs">{errorMessage}</p>
      )}
    </div>
  );
};

export default DynamicInput;
