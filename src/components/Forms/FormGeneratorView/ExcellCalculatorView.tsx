// src/components/ExcellCalculatorView.tsx
import React from "react";
import { useTranslation } from "react-i18next";

interface ExcellCalculatorViewProps {
  data?: {
    DisplayName?: string;
    PersianName?: string;
  };
  dir?: "ltr" | "rtl";
  isFaMode?: boolean;
}

const ExcellCalculatorView: React.FC<ExcellCalculatorViewProps> = ({
  data,
  dir,
  isFaMode = false,
}) => {
  const { t } = useTranslation();

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || ""
    : data?.DisplayName || data?.PersianName || "";

  return (
    <div
      dir={dir ?? (isFaMode ? "rtl" : "ltr")}
      className="flex flex-col gap-4 p-6 bg-white rounded-lg border border-gray-300 items-center justify-center"
    >
      {label && (
        <div className="text-xs font-semibold text-gray-800">{label}</div>
      )}

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
    </div>
  );
};

export default ExcellCalculatorView;