import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface ExcelCalculatorProps {
  onMetaChange?: (meta: { metaType1: string; metaType2: string }) => void;
  data?: {
    metaType1?: string;
    metaType2?: string;
  };
}

const ExcelCalculator: React.FC<ExcelCalculatorProps> = ({ onMetaChange, data }) => {
  const [inputValue, setInputValue] = useState(data?.metaType1 || "");
  const [outputValue, setOutputValue] = useState(data?.metaType2 || "");

  // هر تغییر در ورودی یا خروجی، مقادیر جدید به والد ارسال می‌شود.
  useEffect(() => {
    if (onMetaChange) {
      onMetaChange({
        metaType1: inputValue,
        metaType2: outputValue,
      });
    }
  }, [inputValue, outputValue, onMetaChange]);

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        {/* Input Field */}
        <div className="mb-6">
          <DynamicInput
            name="Input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter input value"
            className="w-full"
          />
        </div>

        {/* Output Field */}
        <div className="mb-6">
          <DynamicInput
            name="Output"
            type="text"
            value={outputValue}
            onChange={(e) => setOutputValue(e.target.value)}
            placeholder="Enter output value"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ExcelCalculator;
