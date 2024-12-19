import React, { useState } from "react";
import DynamicInput from "../../utilities/DynamicInput";

const NumberController: React.FC = () => {
  const [minValue, setMinValue] = useState<number | "">("");
  const [maxValue, setMaxValue] = useState<number | "">("");
  const [defaultValue, setDefaultValue] = useState<number | "">("");

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinValue(e.target.value === "" ? "" : parseFloat(e.target.value));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxValue(e.target.value === "" ? "" : parseFloat(e.target.value));
  };

  const handleDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultValue(e.target.value === "" ? "" : parseFloat(e.target.value));
  };

  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg space-y-4">
      <div>
        <DynamicInput
          name="minValue"
          type="number"
          value={minValue}
          onChange={handleMinChange}
          placeholder=" "
          className="border-b-gray-400 focus-within:border-b-gray-700"
        />
      </div>

      <div>
        <DynamicInput
          name="maxValue"
          type="number"
          value={maxValue}
          onChange={handleMaxChange}
          placeholder=" "
          className="border-b-gray-400 focus-within:border-b-gray-700"
        />
      </div>

      <div>
        <DynamicInput
          name="defaultValue"
          type="number"
          value={defaultValue}
          onChange={handleDefaultChange}
          placeholder=" "
          className="border-b-gray-400 focus-within:border-b-gray-700"
        />
      </div>
    </div>
  );
};

export default NumberController;
