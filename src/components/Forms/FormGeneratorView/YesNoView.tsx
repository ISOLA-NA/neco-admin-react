// src/components/ControllerForms/ViewControllers/YesNoView.tsx
import React from "react";
import { useTranslation } from "react-i18next";

interface YesNoViewProps {
  data?: {
    metaType1?: "yes" | "no";
    DisplayName?: string;
    PersianName?: string;
  };
  dir?: "ltr" | "rtl";
  isFaMode?: boolean;
}

const YesNoView: React.FC<YesNoViewProps> = ({
  data,
  dir,
  isFaMode = false,
}) => {
  const { t } = useTranslation();

  const selected = data?.metaType1 || "yes";

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || ""
    : data?.DisplayName || data?.PersianName || "";

  return (
    <div
      dir={dir ?? (isFaMode ? "rtl" : "ltr")}
      className="rounded-lg flex items-center gap-4"
    >
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="yesnoView"
            value="yes"
            checked={selected === "yes"}
            disabled
            className="appearance-none w-4 h-4 rounded-full border-2 border-purple-500 checked:bg-purple-500"
            readOnly
          />
          <span className="text-gray-800">{t("YesNo.Yes")}</span>
        </label>

        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="yesnoView"
            value="no"
            checked={selected === "no"}
            disabled
            className="appearance-none w-4 h-4 rounded-full border-2 border-purple-500 checked:bg-purple-500"
            readOnly
          />
          <span className="text-gray-800">{t("YesNo.No")}</span>
        </label>
      </div>
    </div>
  );
};

export default YesNoView;
