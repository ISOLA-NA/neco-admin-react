// src/components/ControllerForms/CalculatedField.tsx
import React, { useState, useEffect, useRef } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface CalculatedFieldProps {
  /** متاهای اصلی (به جز metaType4) */
  onMetaChange?: (meta: {
    metaType1: string;             // Expression
    metaType2: string;             // "1" | "2"
    metaType3: string;             // Format
  }) => void;

  /** فقط برای metaType4 (Unit) */
  onMetaExtraChange?: (meta: { metaType4: string }) => void;

  /** مقادیر اولیه در حالت ویرایش */
  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
    metaType4?: string;
  };
}

const CalculatedField: React.FC<CalculatedFieldProps> = ({
  onMetaChange,
  onMetaExtraChange,
  data = {},
}) => {
  /* ---------- state ---------- */
  const [expression, setExpression] = useState<string>(data.metaType1 ?? "");
  const [type, setType] = useState<"number" | "date">(
    data.metaType2 === "2" ? "date" : "number"
  );
  const [format, setFormat] = useState<string>(
    data.metaType3 ?? "#,#.########"
  );
  const [unit, setUnit] = useState<string>(data.metaType4 ?? "");

  /* ---------- sync props→state only if different ---------- */
  useEffect(() => {
    setExpression((p) => (p === (data.metaType1 ?? "") ? p : data.metaType1 ?? ""));
    setType((p) =>
      p === (data.metaType2 === "2" ? "date" : "number")
        ? p
        : data.metaType2 === "2"
        ? "date"
        : "number"
    );
    setFormat((p) =>
      p === (data.metaType3 ?? "#,#.########") ? p : data.metaType3 ?? "#,#.########"
    );
    setUnit((p) => (p === (data.metaType4 ?? "") ? p : data.metaType4 ?? ""));
  }, [data.metaType1, data.metaType2, data.metaType3, data.metaType4]);

  /* ---------- push core meta (1‑3) upward ---------- */
  const prevCoreStr = useRef("");
  useEffect(() => {
    if (!onMetaChange) return;
    const core = {
      metaType1: expression,
      metaType2: type === "number" ? "1" : "2",
      metaType3: format,
    };
    const s = JSON.stringify(core);
    if (s !== prevCoreStr.current) {
      prevCoreStr.current = s;
      onMetaChange(core);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, type, format]);

  /* ---------- push metaType4 (Unit) upward ---------- */
  const prevUnit = useRef("");
  useEffect(() => {
    if (!onMetaExtraChange) return;
    if (unit !== prevUnit.current) {
      prevUnit.current = unit;
      onMetaExtraChange({ metaType4: unit });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  /* ---------- UI ---------- */
  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex justify-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 space-y-6">
        {/* Expression */}
        <DynamicInput
          name="Expression"
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="Enter expression"
          className="w-full"
        />

        {/* Type */}
        <label className="block text-sm font-medium text-gray-700">Type:</label>
        <div className="flex items-center space-x-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="calc-type"
              value="number"
              checked={type === "number"}
              onChange={() => setType("number")}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span>Number</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="calc-type"
              value="date"
              checked={type === "date"}
              onChange={() => setType("date")}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span>Date</span>
          </label>
        </div>

        {/* Format */}
        <DynamicInput
          name="Format"
          type="text"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          placeholder="Enter format"
          className="w-full"
        />

        {/* Unit (metaType4) */}
        <DynamicInput
          name="Unit"
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Enter unit"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default CalculatedField;
