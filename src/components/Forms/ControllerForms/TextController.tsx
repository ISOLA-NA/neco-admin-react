import React, { useState, useEffect, useRef } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface TextControllerProps {
  onMetaChange: (meta: any) => void;
  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
    metaType4?: string;
  };
  isDisable?: boolean;
}

const TextController: React.FC<TextControllerProps> = ({
  onMetaChange,
  data,
  isDisable = false,
}) => {
  const [metaTypes, setMetaTypes] = useState({
    metaType1: "",
    metaType2: null as string | null,
    metaType3: null as string | null,
    metaType4: null as string | null,
  });

  // این ref برای رد کردن اولین اجرای افکت زیره
  const isFirstUpdate = useRef(true);

  // مقداردهی اولیه از props
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

  // فقط بعد از mount اولیه اجرا بشه
  useEffect(() => {
    if (isFirstUpdate.current) {
      isFirstUpdate.current = false;
      return;
    }
    // وقتی کاربر تایپ می‌کنه یا داده تغییر واقعی داره
    onMetaChange({
      metaType1: metaTypes.metaType1,
      metaType2: metaTypes.metaType2,
      metaType3: metaTypes.metaType3,
    });
  }, [metaTypes.metaType1, metaTypes.metaType2, metaTypes.metaType3]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetaTypes((prev) => ({
      ...prev,
      metaType1: e.target.value,
    }));
  };

  return (
    <div className="mt-10 p-6 rounded-lg">
      <DynamicInput
        name="Default Value"
        type="text"
        value={metaTypes.metaType1}
        onChange={handleChange}
        placeholder=" "
        disabled={isDisable}
        className="w-full p-2 border rounded"
      />
    </div>
  );
};

export default TextController;
