// src/components/ControllerForms/NumberControllerView.tsx
import React from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { useTranslation } from "react-i18next";

interface NumberControllerViewProps {
  data?: {
    metaType3?: string;
    DisplayName?: string;
    PersianName?: string;
  };
  isFaMode?: boolean;
}

const NumberControllerView: React.FC<NumberControllerViewProps> = ({
  data,
  isFaMode = false,
}) => {
  const { t } = useTranslation();

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || t("NumberController.MaxValueLabel")
    : data?.DisplayName || data?.PersianName || t("NumberController.MaxValueLabel");

  return (
    <div>
      <DynamicInput
        name={label}
        type="number"
        value={data?.metaType3 ?? ""}
        placeholder={t("NumberController.MaximumValuePlaceholder")}
        disabled={true}
      />
    </div>
  );
};

export default NumberControllerView;