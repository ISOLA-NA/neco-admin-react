// src/utilities/DynamicSelector.tsx
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
}) => {
  return (
    <div className="relative flex items-center gap-2">
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-[#7e3af2] pointer-events-none">
            {leftIcon}
          </div>
        )}

        <select
          value={selectedValue}
          onChange={onChange}
          className={`peer w-full border-b-2 ${
            error ? "border-red-500" : "border-[#7e3af2]"
          } pl-8 pb-2 pr-8 bg-transparent appearance-none focus:outline-none ${
            error ? "focus:border-red-500" : "focus:border-[#6366f1]"
          } transition-colors duration-300 relative text-black text-sm sm:text-base`}
          aria-label={label}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-[#7e3af2] pointer-events-none">
          {rightIcon ? rightIcon : <FaChevronDown size={20} />}
        </div>

        <label className="absolute left-8 transform transition-all duration-300 cursor-text top-0 text-sm text-black -translate-y-full peer-placeholder-shown:top-[30%] peer-placeholder-shown:text-base peer-placeholder-shown:text-black peer-placeholder-shown:-translate-y-1/2 peer-focus:top-0 peer-focus:text-sm peer-focus:text-black peer-focus:-translate-y-full">
          {label}
        </label>

        {error && errorMessage && (
          <p className="mt-1 text-red-500 text-xs">{errorMessage}</p>
        )}
      </div>

      {showButton && (
        <button
          type="button"
          className="btn bg-[#7e3af2] text-white hover:bg-[#6366f1] px-2 py-1"
          onClick={onButtonClick}
        >
          ...
        </button>
      )}
    </div>
  );
};

export default DynamicSelector;
