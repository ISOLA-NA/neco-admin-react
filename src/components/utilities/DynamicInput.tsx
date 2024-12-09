// src/utilities/DynamicInput.tsx

import React, { ReactNode } from "react";

interface DynamicInputProps {
  name: string; // نام ورودی
  type: "text" | "number" | "password"; // نوع ورودی (text، number یا password)
  value: string; // مقدار ورودی
  placeholder?: string; // جای‌نما
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // مدیریت تغییر
  leftElement?: ReactNode; // عنصر سمت چپ
  rightElement?: ReactNode; // عنصر سمت راست
  required?: boolean; // الزامی بودن
  className?: string; // کلاس سفارشی برای سبک‌دهی
}

const DynamicInput: React.FC<DynamicInputProps> = ({
  name,
  type,
  value,
  placeholder = " ",
  onChange,
  leftElement,
  rightElement,
  required = false,
  className = "", // مقدار پیش‌فرض برای جلوگیری از undefined
}) => {
  return (
    <div className={`mb-6 relative ${className}`}>
      {/* عنصر سمت چپ */}
      {leftElement && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {leftElement}
        </div>
      )}
      <input
        name={name}
        type={type} // نوع ورودی بر اساس پراپ
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        inputMode={type === "number" ? "numeric" : undefined} // فعال‌سازی کیبورد مناسب برای اعداد
        className={`peer w-full border-b-2 border-[#7e3af2] bg-[#f3f4f6] ${
          leftElement ? "pl-8" : ""
        } ${
          rightElement ? "pr-8" : ""
        } pb-2 focus:outline-none focus:border-[#6366f1] transition-colors duration-300 text-black text-sm sm:text-base`}
        required={required}
      />
      <label
        className={`absolute ${
          leftElement ? "left-8" : "left-0"
        } transform transition-all duration-300 cursor-text top-0 text-sm text-black -translate-y-full peer-placeholder-shown:top-[30%] peer-placeholder-shown:text-base peer-placeholder-shown:text-black peer-placeholder-shown:-translate-y-1/2 peer-focus:top-0 peer-focus:text-sm peer-focus:text-black peer-focus:-translate-y-full`}
      >
        {name}
      </label>
      {/* عنصر سمت راست */}
      {rightElement && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  );
};

export default DynamicInput;
