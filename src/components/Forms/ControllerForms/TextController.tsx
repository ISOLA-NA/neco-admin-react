import React, { useState, useEffect, useRef } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface TextControllerProps {
  onMetaChange: (meta: any) => void;
  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
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
  });

  const prevMetaRef = useRef<string | undefined>();

  // فقط وقتی مقدار اولیه واقعاً تغییر کنه، مقداردهی مجدد کنیم
  useEffect(() => {
    if (data?.metaType1 !== prevMetaRef.current) {
      prevMetaRef.current = data?.metaType1;
      setMetaTypes({
        metaType1: data?.metaType1 || "",
        metaType2: data?.metaType2 || null,
        metaType3: data?.metaType3 || null,
      });
    }
  }, [data?.metaType1, data?.metaType2, data?.metaType3]);

  // فقط metaTypes رو ارسال کنیم نه data دوباره
  useEffect(() => {
    onMetaChange({
      metaType1: metaTypes.metaType1,
      metaType2: metaTypes.metaType2,
      metaType3: metaTypes.metaType3,
    });
  }, [metaTypes]);

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
        placeholder="Default Value"
        disabled={isDisable}
        className="w-full p-2 border rounded"
      />
    </div>
  );
};

export default TextController;
