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
    <div className="bg-gray-100 p-6 rounded-md shadow-md space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Min:
        </label>
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
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Max:
        </label>
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
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Default value:
        </label>
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
