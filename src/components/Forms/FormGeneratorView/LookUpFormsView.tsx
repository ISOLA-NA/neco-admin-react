// src/components/LookUpFormsView.tsx
import React, { useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";

interface LookUpFormsViewProps {
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

const LookUpFormsView: React.FC<LookUpFormsViewProps> = ({
  options,
  selectedValue,
  onChange,
  onButtonClick,
  data,
  isFaMode = false,
}) => {
  useEffect(() => {
    console.log("LookUpFormsView data:", data);
  }, [data]);

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || "انتخاب کنید"
    : data?.DisplayName || data?.PersianName || "Select Option";

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

export default LookUpFormsView;