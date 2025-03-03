// src/utilities/DynamicSwitcher.tsx
import React from "react";

interface DynamicSwitcherProps {
  isChecked: boolean;
  onChange: () => void;
  leftLabel: string;
  rightLabel: string;
  disabled?: boolean; // <- امکان غیرفعال شدن سوییچر
}

const DynamicSwitcher: React.FC<DynamicSwitcherProps> = ({
  isChecked,
  onChange,
  leftLabel,
  rightLabel,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-6">
      <span className="text-black text-sm sm:text-base">{leftLabel}</span>
      <label
        className={`inline-flex items-center ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <input
          type="checkbox"
          className="hidden"
          checked={isChecked}
          onChange={!disabled ? onChange : undefined}
          disabled={disabled}
          aria-label="Toggle Switch"
        />
        <div
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            isChecked ? "bg-purple-400" : "bg-indigo-400"
          } ${disabled ? "opacity-50" : ""}`}
        >
          <span
            className={`absolute w-6 h-6 bg-white rounded-full shadow-md top-0 left-0 transform transition-transform duration-300 ${
              isChecked ? "translate-x-6" : "translate-x-0"
            }`}
          ></span>
        </div>
      </label>
      <span className="text-black text-sm sm:text-base">{rightLabel}</span>
    </div>
  );
};

export default DynamicSwitcher;
