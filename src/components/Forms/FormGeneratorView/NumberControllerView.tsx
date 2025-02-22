// src/components/ControllerForms/ViewControllers/NumberControllerView.tsx
import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface NumberControllerViewProps {
  data?: {
    metaType3?: string; // مقدار ماکزیمم ذخیره شده به عنوان رشته
  };
  isDisable?: boolean;
}

const NumberControllerView: React.FC<NumberControllerViewProps> = ({
  data,
  isDisable = true,
}) => {
  const [maxValue, setMaxValue] = useState<string>("");

  useEffect(() => {
    if (data && data.metaType3 !== undefined) {
      setMaxValue(data.metaType3);
    }
  }, [data]);

  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
      <DynamicInput
        name="maxValueView"
        type="number"
        value={maxValue}
        placeholder="Maximum Value"
        disabled={isDisable}
        className="w-full p-2 border rounded focus:outline-none focus:border-gray-700"
      />
    </div>
  );
};

export default NumberControllerView;
