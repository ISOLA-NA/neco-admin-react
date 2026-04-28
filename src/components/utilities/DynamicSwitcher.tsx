// src/utilities/DynamicSwitcher.tsx
import React from "react";
import { useTranslation } from "react-i18next";

interface DynamicSwitcherProps {
  isChecked: boolean;
  onChange: () => void;
  leftLabel: string;
  rightLabel: string;
  disabled?: boolean;
}

const DynamicSwitcher: React.FC<DynamicSwitcherProps> = ({
  isChecked,
  onChange,
  leftLabel,
  rightLabel,
  disabled = false,
}) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  // ✅ در RTL وقتی checked است دایره باید به راست برود (سمت leftLabel که در RTL راست است)
  // در LTR وقتی checked است دایره باید به چپ برود (سمت leftLabel که در LTR چپ است)
  const checkedTranslate = isRtl ? "translate-x-6" : "translate-x-0";
  const uncheckedTranslate = isRtl ? "translate-x-0" : "translate-x-6";

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
            isChecked ? "bg-[#ec4899]" : "bg-gray-400"
          } ${disabled ? "opacity-50" : ""}`}
        >
          <span
            className={`absolute w-6 h-6 bg-white rounded-full shadow-md top-0 left-0 transform transition-transform duration-300 ${
              isChecked ? checkedTranslate : uncheckedTranslate
            }`}
          ></span>
        </div>
      </label>
      <span className="text-black text-sm sm:text-base">{rightLabel}</span>
    </div>
  );
};

export default DynamicSwitcher;