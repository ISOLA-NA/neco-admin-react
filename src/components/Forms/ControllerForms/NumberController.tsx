// src/components/ControllerForms/NumberController.tsx
import React, { useState, useEffect, useRef } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface NumberControllerProps {
  onMetaChange: (meta: {
    metaType1: string;
    metaType2: string;
    metaType3: string;
  }) => void;
  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
  };
}

const NumberController: React.FC<NumberControllerProps> = ({
  onMetaChange,
  data,
}) => {
  const [minValue, setMinValue] = useState<number | "">("");
  const [maxValue, setMaxValue] = useState<number | "">("");
  const [defaultValue, setDefaultValue] = useState<number | "">("");

  // جلوگیری از reset شدن ورودی بعد از اولین بار
  const isFirstDataInit = useRef(true);
  // جلوگیری از ارسال اولیه‌ی onMetaChange
  const isFirstMetaUpdate = useRef(true);

  // 1) مقداردهی اولیه از props.data **فقط یک‌بار**
  useEffect(() => {
    if (data && isFirstDataInit.current) {
      setDefaultValue(
        data.metaType1 && data.metaType1 !== "" ? parseFloat(data.metaType1) : ""
      );
      setMinValue(
        data.metaType2 && data.metaType2 !== "" ? parseFloat(data.metaType2) : ""
      );
      setMaxValue(
        data.metaType3 && data.metaType3 !== "" ? parseFloat(data.metaType3) : ""
      );
      isFirstDataInit.current = false;
    }
  }, [data]);

  // هندلرهای تغییر ورودی
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value === "" ? "" : parseFloat(e.target.value);
    setMinValue(v);
  };
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value === "" ? "" : parseFloat(e.target.value);
    setMaxValue(v);
  };
  const handleDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value === "" ? "" : parseFloat(e.target.value);
    setDefaultValue(v);
  };

  // 2) ارسال onMetaChange **بعد از اولین mount** و فقط زمانی که واقعاً کاربر مقدار رو تغییر داده
  useEffect(() => {
    if (isFirstMetaUpdate.current) {
      isFirstMetaUpdate.current = false;
      return;
    }
    onMetaChange({
      metaType1: defaultValue === "" ? "" : defaultValue.toString(),
      metaType2: minValue === "" ? "" : minValue.toString(),
      metaType3: maxValue === "" ? "" : maxValue.toString(),
    });
    // ⚠️ فقط روی stateهای عددی وابسته‌ایم
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, minValue, maxValue]);

  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg space-y-4">
      <DynamicInput
        name="minValue"
        type="number"
        value={minValue}
        onChange={handleMinChange}
        placeholder="Minimum Value (metaType2)"
        className="border-b-gray-400 focus-within:border-b-gray-700"
      />
      <DynamicInput
        name="maxValue"
        type="number"
        value={maxValue}
        onChange={handleMaxChange}
        placeholder="Maximum Value (metaType3)"
        className="border-b-gray-400 focus-within:border-b-gray-700"
      />
      <DynamicInput
        name="defaultValue"
        type="number"
        value={defaultValue}
        onChange={handleDefaultChange}
        placeholder="Default Value (metaType1)"
        className="border-b-gray-400 focus-within:border-b-gray-700"
      />
    </div>
  );
};

export default NumberController;
