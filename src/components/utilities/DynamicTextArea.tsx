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
  rows = 5,
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
      className={`textarea textarea-error ${className}`}
    ></textarea>
  );
};

export default CustomTextarea;
