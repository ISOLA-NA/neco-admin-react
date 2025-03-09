// src/components/utilities/DynamicCheckbox.tsx
import React from "react";

interface DynamicCheckboxViewProps {
  name: string;
  checked: boolean;
  title?: string;
  className?: string;
}

const DynamicCheckboxView: React.FC<DynamicCheckboxViewProps> = ({
  name,
  checked,
  title,
  className,
}) => {
  return (
    <div className={`flex items-start space-x-4 ${className || ""}`}>
      {title && (
        <span className="text-base font-semibold whitespace-nowrap ">
          {title}
        </span>
      )}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          disabled
          className="form-checkbox h-4 w-4 text-purple-600"
        />
        <label htmlFor={name} className="text-gray-700">
          {name}
        </label>
      </div>
    </div>
  );
};

export default DynamicCheckboxView;
