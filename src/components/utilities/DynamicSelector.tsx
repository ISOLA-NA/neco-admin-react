// src/utilities/DynamicSelector.tsx
import { classNames } from "primereact/utils";
import React from "react";
import { FaChevronDown } from "react-icons/fa";

interface Option {
  value: string;
  label: string;
}

interface DynamicSelectorProps {
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
  className?: string; // افزودن پراپ className
}

const DynamicSelector: React.FC<DynamicSelectorProps> = ({
  options,
  selectedValue,
  onChange,
  label = "Select",
  showButton = false,
  onButtonClick,
  leftIcon,
  rightIcon,
  error = false,
  errorMessage = "",
  className, // دریافت className از پراپ‌ها
}) => {
  return (
    <div className={classNames("relative flex items-center gap-2 ", className)}>
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <select
          value={selectedValue}
          onChange={onChange}
          className={classNames(
            "peer w-full border-b-2",
            error ? "border-red-500" : "border-purple-600",
            "pl-10 pr-10 bg-transparent appearance-none focus:outline-none",
            error ? "focus:border-red-500" : "focus:border-indigo-500",
            "transition-colors duration-300 text-gray-800 text-sm sm:text-base",
            "rounded-none"
          )}
          aria-label={label}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 pointer-events-none">
          {rightIcon ? rightIcon : <FaChevronDown size={16} />}
        </div>

        <label className="absolute left-10 transform transition-all duration-300 cursor-text top-0 text-sm text-gray-600 -translate-y-full peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-600 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-0 peer-focus:text-sm peer-focus:text-gray-600 peer-focus:-translate-y-full">
          {label}
        </label>

        {error && errorMessage && (
          <p className="mt-1 text-red-500 text-xs">{errorMessage}</p>
        )}
      </div>

      {showButton && (
        <button
          type="button"
          className="btn btn-sm bg-purple-600 text-white hover:bg-indigo-500 px-3 py-2 rounded-md shadow-sm transition-colors duration-300"
          onClick={onButtonClick}
        >
          ...
        </button>
      )}
    </div>
  );
};

export default DynamicSelector;
