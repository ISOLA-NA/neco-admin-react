// src/components/ControllerForms/ExcelCalculator.tsx
import React, { useState, useEffect, useRef } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface ExcelCalculatorProps {
  /** اعلام تغییرات metaType1 و metaType2 به والد */
  onMetaChange?: (meta: { metaType1: string; metaType2: string }) => void;

  /** مقادیر اولیه در حالت ویرایش */
  data?: { metaType1?: string; metaType2?: string };
}

const ExcelCalculator: React.FC<ExcelCalculatorProps> = ({
  onMetaChange,
  data = {},
}) => {
  /* ---------- local state ---------- */
  const [inputValue, setInputValue] = useState<string>(data.metaType1 ?? "");
  const [outputValue, setOutputValue] = useState<string>(data.metaType2 ?? "");

  /* ---------- sync props→state فقط در صورت تفاوت ---------- */
  useEffect(() => {
    setInputValue((p) => (p === (data.metaType1 ?? "") ? p : data.metaType1 ?? ""));
    setOutputValue((p) => (p === (data.metaType2 ?? "") ? p : data.metaType2 ?? ""));
  }, [data.metaType1, data.metaType2]);

  /* ---------- propagate meta upward، جلوگیری از حلقه ---------- */
  const prevMetaStr = useRef("");
  useEffect(() => {
    if (!onMetaChange) return;
    const meta = { metaType1: inputValue, metaType2: outputValue };
    const str = JSON.stringify(meta);
    if (str !== prevMetaStr.current) {
      prevMetaStr.current = str;
      onMetaChange(meta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, outputValue]);

  /* ---------- UI ---------- */
  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex justify-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 space-y-6">
        <DynamicInput
          name="Input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter input value"
          className="w-full"
        />

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
  );
};

export default ExcelCalculator;
