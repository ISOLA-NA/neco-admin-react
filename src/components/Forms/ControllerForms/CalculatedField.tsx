import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface CalculatedFieldProps {
  onMetaChange?: (meta: {
    metaType1: string;
    metaType2: string;
    metaType3: string;
    metaType4: string;
  }) => void;
  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
    metaType4?: string;
  };
}

const CalculatedField: React.FC<CalculatedFieldProps> = ({ onMetaChange, data }) => {
  const [expression, setExpression] = useState(data?.metaType1 || "");
  const [type, setType] = useState(data?.metaType2 === "1" ? "number" : data?.metaType2 === "2" ? "date" : "number");
  const [format, setFormat] = useState(data?.metaType3 || "#,#.########");
  const [unit, setUnit] = useState(data?.metaType4 || "");

  // به روز رسانی meta در هر تغییر
  useEffect(() => {
    if (onMetaChange) {
      onMetaChange({
        metaType1: expression,
        metaType2: type === "number" ? "1" : "2", // مقدار به صورت رشته ارسال می‌شود
        metaType3: format,
        metaType4: unit,
      });
    }
  }, [expression, type, format, unit, onMetaChange]);

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        {/* ورودی Expression */}
        <div className="mb-6">
          <DynamicInput
            name="Expression"
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="Enter expression"
            className="w-full"
          />
        </div>

        {/* انتخاب Type */}
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

        {/* ورودی Format */}
        <div className="mb-6">
          <DynamicInput
            name="Format"
            type="text"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            placeholder="Enter format"
            className="w-full"
          />
        </div>

        {/* ورودی Unit */}
        <div className="mb-6">
          <DynamicInput
            name="Unit"
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Enter unit"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default CalculatedField;
