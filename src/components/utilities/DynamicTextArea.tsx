// src/components/common/CustomTextarea.tsx

import React from "react";

interface CustomTextareaProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = "",
  rows = 1,
  className = "",
}) => {
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`peer w-full border-2 border-[#7e3af2] pl-3 pr-3 py-1 bg-transparent text-black focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-colors duration-300 rounded-md resize ${className}`}
    />
  );
};

export default CustomTextarea;
