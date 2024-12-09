// src/utilities/DynamicRadioGroup.tsx
import React from "react";

interface DynamicRadioGroupProps {
  options: { value: string; label: string }[];
  title: string;
  name: string;
  selectedValue: string;
  onChange: (selectedValue: string) => void;
}

const DynamicRadioGroup: React.FC<DynamicRadioGroupProps> = ({
  options,
  title,
  name,
  selectedValue,
  onChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-lg font-semibold whitespace-nowrap">{title}</span>
      <div className="flex items-center space-x-2">
        {options.map((option, index) => (
          <label
            key={index}
            className="flex items-center cursor-pointer space-x-1 whitespace-nowrap"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => onChange(option.value)}
              className="radio radio-primary"
            />
            <span className="text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default DynamicRadioGroup;
