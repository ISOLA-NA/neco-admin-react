// src/components/ControllerForms/NumberController.tsx
//
// نسخهٔ پایدار بدون چشمک‌زدن و ریست ورودی‌ها

import React, { useState, useEffect, useRef } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { useTranslation } from "react-i18next";

interface NumberControllerProps {
  onMetaChange: (meta: {
    metaType1: string; // default
    metaType2: string; // min
    metaType3: string; // max
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
  const { t } = useTranslation();
  /* ───────────────────── Local state (strings) ───────────────────── */
  const [defaultValue, setDefaultValue] = useState<string>(
    data?.metaType1 ?? ""
  );
  const [minValue, setMinValue] = useState<string>(data?.metaType2 ?? "");
  const [maxValue, setMaxValue] = useState<string>(data?.metaType3 ?? "");

  /* ────────── Sync from props فقط وقتی واقعاً تغییر کند ──────────── */
  useEffect(() => {
    if (
      data &&
      (data.metaType1 !== defaultValue ||
        data.metaType2 !== minValue ||
        data.metaType3 !== maxValue)
    ) {
      setDefaultValue(data.metaType1 ?? "");
      setMinValue(data.metaType2 ?? "");
      setMaxValue(data.metaType3 ?? "");
    }
  }, [data?.metaType1, data?.metaType2, data?.metaType3]); // وابستگی به مقادیر ساده

  /* ─────────────── Notify parent؛ فقط روی تغییر واقعی ────────────── */
  const lastSent = useRef<{
    metaType1: string;
    metaType2: string;
    metaType3: string;
  } | null>(null);

  useEffect(() => {
    const current = {
      metaType1: defaultValue,
      metaType2: minValue,
      metaType3: maxValue,
    };
    if (
      !lastSent.current ||
      current.metaType1 !== lastSent.current.metaType1 ||
      current.metaType2 !== lastSent.current.metaType2 ||
      current.metaType3 !== lastSent.current.metaType3
    ) {
      onMetaChange(current);
      lastSent.current = current;
    }
  }, [defaultValue, minValue, maxValue, onMetaChange]);

  /* ─────────────────────────── Render ────────────────────────────── */
  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg space-y-4">
      <DynamicInput
        name={t("NumberController.MinValuePlaceholder")}
        type="number"
        value={minValue}
        onChange={(e) => setMinValue(e.target.value)}
        className="border-b-gray-400 focus-within:border-b-gray-700"
      />

      <DynamicInput
        name={t("NumberController.MaxValuePlaceholder")}
        type="number"
        value={maxValue}
        onChange={(e) => setMaxValue(e.target.value)}
        className="border-b-gray-400 focus-within:border-b-gray-700"
      />

      <DynamicInput
        name={t("NumberController.DefaultValuePlaceholder")}
        type="number"
        value={defaultValue}
        onChange={(e) => setDefaultValue(e.target.value)}
        className="border-b-gray-400 focus-within:border-b-gray-700"
      />
    </div>
  );
};

export default NumberController;
