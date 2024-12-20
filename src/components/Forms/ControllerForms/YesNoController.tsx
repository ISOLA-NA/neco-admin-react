import React, { useState } from "react";

interface YesNoProps {
  defaultValue?: "yes" | "no";
  onChange?: (value: "yes" | "no") => void;
}

const YesNo: React.FC<YesNoProps> = ({ defaultValue = "yes", onChange }) => {
  const [selected, setSelected] = useState<"yes" | "no">(defaultValue);

  const handleChange = (value: "yes" | "no") => {
    setSelected(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <span className="text-gray-700 font-medium">Default value:</span>
      <label className="flex items-center space-x-1 cursor-pointer">
        <input
          type="radio"
          name="yesno"
          value="yes"
          checked={selected === "yes"}
          onChange={() => handleChange("yes")}
          className="appearance-none w-4 h-4 rounded-full border-2 border-purple-500 checked:bg-purple-500"
        />
        <span className="text-gray-800">Yes</span>
      </label>
      <label className="flex items-center space-x-1 cursor-pointer">
        <input
          type="radio"
          name="yesno"
          value="no"
          checked={selected === "no"}
          onChange={() => handleChange("no")}
          className="appearance-none w-4 h-4 rounded-full border-2 border-purple-500 checked:bg-purple-500"
        />
        <span className="text-gray-800">No</span>
      </label>
    </div>
  );
};

export default YesNo;
