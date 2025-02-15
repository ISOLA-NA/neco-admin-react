import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface TextControllerProps {

  onMetaChange: (meta: {
    metaType1: string;
    metaType2: string | null;
    metaType3: string | null;
    metaType4: string | null;
  }) => void;

  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
    metaType4?: string;
  };

  isDisable?: boolean;
}

const TextController: React.FC<TextControllerProps> = ({ onMetaChange, data, isDisable = false }) => {
  // مقداردهی اولیه state از prop data؛ در صورت عدم وجود مقدار، از "" استفاده می‌کنیم
  const [metaTypes, setMetaTypes] = useState({
    metaType1: data?.metaType1 || "",
    metaType2: data?.metaType2 || null,
    metaType3: data?.metaType3 || null,
    metaType4: data?.metaType4 || null,
  });

  // در صورتی که prop data تغییر کند (مثلاً در حالت ادیت)، state به‌روز می‌شود.
  useEffect(() => {
    if (data) {
      setMetaTypes({
        metaType1: data.metaType1 || "",
        metaType2: data.metaType2 || null,
        metaType3: data.metaType3 || null,
        metaType4: data.metaType4 || null,
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMetaTypes((prev) => ({ ...prev, metaType1: newValue }));
  };

  // هر بار که metaTypes تغییر کند، onMetaChange فراخوانی می‌شود.
  useEffect(() => {
    onMetaChange(metaTypes);
  }, [metaTypes, onMetaChange]);

  return (
    <div className="mt-10 bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
      <div className="mb-4">

      </div>
      <div>
        <DynamicInput
          name=" Default Value"
          type="text"
          value={metaTypes.metaType1}
          onChange={handleChange}
          placeholder=" "
          disabled={isDisable}
          className="w-full p-2 border rounded focus:outline-none focus:border-gray-700"
        />
      </div>
    </div>
  );
};

export default TextController;
