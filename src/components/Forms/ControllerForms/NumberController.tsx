// src/components/ControllerForms/NumberController.tsx
import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface NumberControllerProps {
  onMetaChange: (meta: {
    minValue: number | "";
    maxValue: number | "";
    defaultValue: number | "";
  }) => void;
  // پراپ اختیاری برای دریافت مقادیر اولیه
  initialMeta?: {
    minValue: number | "";
    maxValue: number | "";
    defaultValue: number | "";
  };
}

const NumberController: React.FC<NumberControllerProps> = ({
  onMetaChange,
  initialMeta,
}) => {
  // مقداردهی اولیه از initialMeta (یا مقدار خالی)
  const [minValue, setMinValue] = useState<number | "">(
    initialMeta?.minValue ?? ""
  );
  const [maxValue, setMaxValue] = useState<number | "">(
    initialMeta?.maxValue ?? ""
  );
  const [defaultValue, setDefaultValue] = useState<number | "">(
    initialMeta?.defaultValue ?? ""
  );
  // flag برای انجام مقداردهی اولیه تنها یکبار
  const [initialized, setInitialized] = useState(false);

  // اگر initialMeta وجود داشته باشد و هنوز مقداردهی اولیه انجام نشده باشد، مقادیر را ست می‌کنیم
  useEffect(() => {
    if (initialMeta && !initialized) {
      setMinValue(initialMeta.minValue);
      setMaxValue(initialMeta.maxValue);
      setDefaultValue(initialMeta.defaultValue);
      setInitialized(true);
    }
  }, [initialMeta, initialized]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
    setMinValue(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
    setMaxValue(value);
  };

  const handleDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
    setDefaultValue(value);
  };

  // ارسال مقادیر به والد در هر تغییر
  useEffect(() => {
    onMetaChange({ minValue, maxValue, defaultValue });
  }, [minValue, maxValue, defaultValue, onMetaChange]);

  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg space-y-4">
      <div>
        <DynamicInput
          name="minValue"
          type="number"
          value={minValue}
          onChange={handleMinChange}
          placeholder="Minimum Value (metaType2)"
          className="border-b-gray-400 focus-within:border-b-gray-700"
        />
      </div>
      <div>
        <DynamicInput
          name="maxValue"
          type="number"
          value={maxValue}
          onChange={handleMaxChange}
          placeholder="Maximum Value (metaType3)"
          className="border-b-gray-400 focus-within:border-b-gray-700"
        />
      </div>
      <div>
        <DynamicInput
          name="defaultValue"
          type="number"
          value={defaultValue}
          onChange={handleDefaultChange}
          placeholder="Default Value (metaType1)"
          className="border-b-gray-400 focus-within:border-b-gray-700"
        />
      </div>
    </div>
  );
};

export default NumberController;
