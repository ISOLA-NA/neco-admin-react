// src/components/ControllerForms/NumberController.tsx
import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface NumberControllerProps {
  onMetaChange: (meta: {
    metaType1: string; // default value
    metaType2: string; // minimum value
    metaType3: string; // maximum value
  }) => void;
  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
  };
}

const NumberController: React.FC<NumberControllerProps> = ({ onMetaChange, data }) => {
  // مقدارهای اولیه بدون مقدار پیش‌فرض
  const [minValue, setMinValue] = useState<number | "">("");
  const [maxValue, setMaxValue] = useState<number | "">("");
  const [defaultValue, setDefaultValue] = useState<number | "">("");

  // در صورتی که داده (data) ارسال شده باشد، مقداردهی اولیه انجام می‌شود.
  useEffect(() => {
    if (data) {
      setDefaultValue(data.metaType1 && data.metaType1 !== "" ? parseFloat(data.metaType1) : "");
      setMinValue(data.metaType2 && data.metaType2 !== "" ? parseFloat(data.metaType2) : "");
      setMaxValue(data.metaType3 && data.metaType3 !== "" ? parseFloat(data.metaType3) : "");
    }
  }, [data]);

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

  // هر تغییر در state باعث به‌روزرسانی meta به صورت رشته می‌شود.
  useEffect(() => {
    onMetaChange({
      metaType1: defaultValue === "" ? "" : defaultValue.toString(),
      metaType2: minValue === "" ? "" : minValue.toString(),
      metaType3: maxValue === "" ? "" : maxValue.toString(),
    });
  }, [defaultValue, minValue, maxValue, onMetaChange]);

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
