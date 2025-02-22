import React from "react";
import { classNames } from "primereact/utils";

interface Option {
  value: string;
  label: string;
}

interface DynamicSelectorProps {
  name?: string;
  options: Option[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: string;
  showButton?: boolean;
  onButtonClick?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  errorMessage?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

const DynamicSelector: React.FC<DynamicSelectorProps> = ({
  name,
  options = [],
  selectedValue,
  onChange,
  label = "Select",
  showButton = false,
  onButtonClick,
  leftIcon,
  rightIcon,
  error = false,
  errorMessage = "",
  className,
  disabled = false,
  loading = false,
}) => {
  return (
    <div
      className={classNames(
        "relative flex flex-col gap-1",
        className,
        disabled ? "opacity-75 cursor-not-allowed" : ""
      )}
    >
      {/* لیبل شناور با فاصله مناسب */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm text-gray-600 mb-1"
          title={label}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* آیکون سمت چپ */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <select
          className={classNames(
            "select select-primary w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition",
            disabled ? "bg-gray-300 text-gray-800" : "bg-white"
          )}
          id={name}
          name={name}
          value={selectedValue}
          onChange={onChange}
          disabled={disabled}
          aria-label={label}
        >
          <option value="" disabled hidden>
            {loading ? "Loading..." : "Select an option"}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="truncate">
              {option.label}
            </option>
          ))}
        </select>

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

        {showButton && !loading && (
          <button
            type="button"
            onClick={onButtonClick}
            disabled={disabled}
            className={classNames(
              "absolute right-3 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-3 py-1 rounded-md shadow-sm transition-colors duration-300",
              disabled ? "bg-gray-500 cursor-not-allowed" : "hover:bg-pink-500"
            )}
            title="اضافه کردن"
          >
            ...
          </button>
        )}
      </div>

      {error && errorMessage && (
        <p className="mt-1 text-red-500 text-xs">{errorMessage}</p>
      )}
    </div>
  );
};

export default DynamicSelector;
