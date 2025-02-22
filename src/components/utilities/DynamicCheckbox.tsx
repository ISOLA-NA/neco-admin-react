import React from "react";

interface DynamicCheckboxViewProps {
  name: string;
  checked: boolean;
}

const DynamicCheckboxView: React.FC<DynamicCheckboxViewProps> = ({
  name,
  checked,
}) => {
  return (
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
  );
};

export default DynamicCheckboxView;
