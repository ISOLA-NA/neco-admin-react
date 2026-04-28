// src/components/ControllerForms/CalculatedField.tsx
import React, { useState, useEffect, useRef } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { useTranslation } from "react-i18next";

interface CalculatedFieldProps {
  onMetaChange?: (meta: {
    metaType1: string;
    metaType2: string;
    metaType3: string;
  }) => void;
  onMetaExtraChange?: (meta: { metaType4: string }) => void;
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
  const { t, i18n } = useTranslation();

  /* ---------- direction detection ---------- */
  const [isRtl, setIsRtl] = useState<boolean>(
    document.documentElement.dir === "rtl" ||
      i18n.dir(i18n.language) === "rtl"
  );

  useEffect(() => {
    const handleLangChange = () => {
      setIsRtl(
        document.documentElement.dir === "rtl" ||
          i18n.dir(i18n.language) === "rtl"
      );
    };
    i18n.on("languageChanged", handleLangChange);
    return () => i18n.off("languageChanged", handleLangChange);
  }, [i18n]);

  const dir = isRtl ? "rtl" : "ltr";
  const textAlignClass = isRtl ? "text-right" : "text-left";

  /* ---------- state ---------- */
  const [expression, setExpression] = useState<string>(data.metaType1 ?? "");
  const [type, setType] = useState<"number" | "date">(
    data.metaType2 === "2" ? "date" : "number"
  );
  const [format, setFormat] = useState<string>(
    data.metaType3 ?? "#,#.########"
  );
  const [unit, setUnit] = useState<string>(data.metaType4 ?? "");

  /* ---------- sync props→state ---------- */
  useEffect(() => {
    setExpression((p) =>
      p === (data.metaType1 ?? "") ? p : data.metaType1 ?? ""
    );
    setType((p) =>
      p === (data.metaType2 === "2" ? "date" : "number")
        ? p
        : data.metaType2 === "2"
        ? "date"
        : "number"
    );
    setFormat((p) =>
      p === (data.metaType3 ?? "#,#.########")
        ? p
        : data.metaType3 ?? "#,#.########"
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
  <div
    dir={dir}
    className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex justify-center"
  >
    <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 space-y-6">

      {/* Expression */}
      <div className="flex flex-col gap-1" dir={dir}>
        <label
          className={`text-sm font-medium text-gray-700 block w-full ${textAlignClass}`}
        >
          {t("calculatedfield.Labels.Expression")}
        </label>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder={isRtl ? "عبارت را وارد کنید" : "Enter expression"}
          dir={dir}
          className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${textAlignClass}`}
        />
      </div>

      {/* Type (radios) */}
      <div className="flex flex-col gap-2" dir={dir}>
        <label
          className={`text-sm font-medium text-gray-700 block w-full ${textAlignClass}`}
        >
          {t("calculatedfield.Labels.Type")}
        </label>
        <div
          className={`flex items-center gap-4 w-full ${
            isRtl ? "flex-row-reverse justify-end" : "flex-row justify-start"
          }`}
        >
         <div
  className="flex items-center gap-4 w-full"

>
  {/* Number */}
  <label
    className={`inline-flex items-center gap-2 cursor-pointer ${
      isRtl ? "flex-row-reverse" : "flex-row"
    }`}
  >
    <span className="text-sm text-gray-700">
      {t("calculatedfield.Options.Number")}
    </span>
    <input
      type="radio"
      name="calc-type"
      value="number"
      checked={type === "number"}
      onChange={() => setType("number")}
      className="text-purple-600 focus:ring-purple-500"
    />
  </label>

  {/* Date */}
  <label
    className={`inline-flex items-center gap-2 cursor-pointer ${
      isRtl ? "flex-row-reverse" : "flex-row"
    }`}
  >
    <span className="text-sm text-gray-700">
      {t("calculatedfield.Options.Date")}
    </span>
    <input
      type="radio"
      name="calc-type"
      value="date"
      checked={type === "date"}
      onChange={() => setType("date")}
      className="text-purple-600 focus:ring-purple-500"
    />
  </label>
</div>
          
        </div>
      </div>

      {/* Format */}
      <div className="flex flex-col gap-1" dir={dir}>
        <label
          className={`text-sm font-medium text-gray-700 block w-full ${textAlignClass}`}
        >
          {t("calculatedfield.Labels.Format")}
        </label>
        <input
          type="text"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          placeholder={t("calculatedfield.Placeholders.EnterFormat")}
          dir={dir}
          className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${textAlignClass}`}
        />
      </div>

      {/* Unit (metaType4) */}
      <div className="flex flex-col gap-1" dir={dir}>
        <label
          className={`text-sm font-medium text-gray-700 block w-full ${textAlignClass}`}
        >
          {t("calculatedfield.Labels.Unit")}
        </label>
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder={t("calculatedfield.Placeholders.EnterUnit")}
          dir={dir}
          className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${textAlignClass}`}
        />
      </div>

    </div>
  </div>
);
};

export default CalculatedField;