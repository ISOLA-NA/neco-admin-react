// src/components/LookupImageRealValueView.tsx
import React, { useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useTranslation } from "react-i18next";

interface LookupImageRealValueViewProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onButtonClick?: () => void;
  data?: {
    DisplayName?: string;
    PersianName?: string;
    [key: string]: any;
  };
  isFaMode?: boolean;
}

const LookupImageRealValueView: React.FC<LookupImageRealValueViewProps> = ({
  options,
  selectedValue,
  onChange,
  onButtonClick,
  data,
  isFaMode = false,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    console.log("LookupImageRealValueView data:", data);
  }, [data]);

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || "انتخاب کنید"
    : data?.DisplayName || data?.PersianName || t("LookupUmage.View.SelectOption");

  return (
    <div className="w-full" dir={isFaMode ? "rtl" : "ltr"}>
      <DynamicSelector
        name="lookupView"
        label={label}
        options={options}
        selectedValue={selectedValue}
        onChange={onChange}
        showButton={true}
        onButtonClick={onButtonClick}
        disabled={true}
      />
    </div>
  );
};

export default LookupImageRealValueView;