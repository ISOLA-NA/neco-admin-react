// src/components/ExcellCalculatorView.tsx
import React from "react";
import { useTranslation } from "react-i18next";

interface ExcellCalculatorViewProps {
  data?: {
    DisplayName?: string;
  };
  /** از FormGeneratorView پاس داده می‌شود؛ فقط همین کنترل RTL/LTR شود */
  rtl?: boolean;
}

const ExcellCalculatorView: React.FC<ExcellCalculatorViewProps> = ({
  data,
  rtl = false,
}) => {
  const { t } = useTranslation();

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="flex flex-col gap-4 p-6 bg-white rounded-lg border border-gray-300"
      style={{
        unicodeBidi: "plaintext",
        textAlign: rtl ? "right" : "left",
      }}
    >
      {/* عنوان پنل */}
      {data?.DisplayName && (
        <div className="text-xl font-bold text-gray-800 mb-4">
          {data.DisplayName}
        </div>
      )}

      {/* دکمه‌ها در جهت منطقی */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition duration-300"
        >
          {t("excelcalculator.Buttons.Calculated")}
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
        >
          {t("excelcalculator.Buttons.Show")}
        </button>
      </div>

      {/* اصلاح جزئی فاصله‌ها در حالت RTL (فقط همین کنترل) */}
      <style>
        {`
          [dir="rtl"] .ml-2 { margin-right: .5rem; margin-left: 0; }
          [dir="rtl"] .mr-2 { margin-left: .5rem; margin-right: 0; }
        `}
      </style>
    </div>
  );
};

export default ExcellCalculatorView;
