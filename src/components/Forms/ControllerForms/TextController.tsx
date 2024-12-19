import React, { useState } from "react";
import DynamicInput from "../../utilities/DynamicInput";

const TextController: React.FC = () => {
  const [value, setValue] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className="bg-gray-100 p-6 rounded-md shadow-md ">
      {/* <label className="text-sm font-medium text-gray-700 mb-2 block">
        Default value:
      </label> */}
      <DynamicInput
        name="defaultValue"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder=" "
        className="border-b-gray-400 focus-within:border-b-gray-700"
      />
    </div>
  );
};

export default TextController;
