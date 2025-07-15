// TextController.tsx
import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface TextControllerProps {
  /** والد باید این متادیتا را در state خودش نگه دارد و در هر تغییر آپدیت کند */
  onMetaChange: (meta: { metaType1: string }) => void;
  /** مقدار اولیه‌ای که در حالت ادیت از سرور / فرم بالادستی می‌آید */
  data?: { metaType1?: string };
  isDisable?: boolean;
}

const TextController: React.FC<TextControllerProps> = ({
  onMetaChange,
  data = {},
  isDisable = false,
}) => {
  // مقدار داخل input – در ابتدا از prop
  const [value, setValue] = useState<string>(data.metaType1 ?? "");

  /* وقتی والد مقدار جدید می‌فرستد (مثلاً رکورد دیگری را برای ادیت انتخاب می‌کند)
     state داخلی را با آن سینک کن */
  useEffect(() => {
    setValue(data.metaType1 ?? "");
  }, [data.metaType1]);

  // کاربر حروف می‌زند
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setValue(newVal);                 // به‌روزرسانی فوری UI
    onMetaChange({ metaType1: newVal }); // اطلاع به والد
  };

  return (
    <div className="mt-10 p-6 rounded-lg bg-white shadow-sm">
      <DynamicInput
        name="metaType1"              // حتماً کلید درست
        label="Default Value"
        type="text"
        value={value}                 // چون کنترل‑شده‌ایم
        onChange={handleChange}
        placeholder="Enter default value"
        disabled={isDisable}
        className="w-full p-2 border rounded"
      />
    </div>
  );
};

export default TextController;
