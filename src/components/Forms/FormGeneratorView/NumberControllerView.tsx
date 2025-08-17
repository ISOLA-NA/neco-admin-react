// src/components/ControllerForms/NumberControllerView.tsx
import React from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { useTranslation } from "react-i18next";

interface NumberControllerViewProps {
  data?: {
    metaType3?: string; // مقدار max
    DisplayName?: string; // عنوان ورودی
  };
}

const NumberControllerView: React.FC<NumberControllerViewProps> = ({
  data,
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
      <DynamicInput
        name={data?.DisplayName || t("NumberController.MaxValueLabel")}
        type="number"
        value={data?.metaType3 ?? ""}
        placeholder={t("NumberController.MaximumValuePlaceholder")}
        disabled={true}
        className="border-b-gray-400 focus-within:border-b-gray-700"
      />
    </div>
  );
};

export default NumberControllerView;
