import React, { useState } from "react";
import DynamicInput from "../../utilities/DynamicInput";

const CalculatedField: React.FC = () => {
  const [expression, setExpression] = useState("");
  const [type, setType] = useState("number");
  const [format, setFormat] = useState("#,#.########");
  const [unit, setUnit] = useState("");

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100  rounded-lg flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        {/* Expression Input */}
        <div className="mb-6">
          <DynamicInput
            name="Expression"
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder=""
            className="w-full"
          />
        </div>

        {/* Type Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Type:
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="type"
                value="number"
                checked={type === "number"}
                onChange={() => setType("number")}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Number</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="type"
                value="date"
                checked={type === "date"}
                onChange={() => setType("date")}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Date</span>
            </label>
          </div>
        </div>

        {/* Format Input */}
        <div className="mb-6">
          <DynamicInput
            name="Format"
            type="text"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            placeholder=""
            className="w-full"
          />
        </div>

        {/* Unit Input */}
        <div className="mb-6">
          <DynamicInput
            name="Unit"
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder=""
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default CalculatedField;
