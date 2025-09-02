// src/components/LookUpImageView.tsx
import React, { useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useTranslation } from "react-i18next";


interface LookUpImageViewProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onButtonClick?: () => void;
  data?: { DisplayName?: string; [key: string]: any };
}

const LookUpImageView: React.FC<LookUpImageViewProps> = ({
  options,
  selectedValue,
  onChange,
  onButtonClick,
  data,
}) => {
  const { t } = useTranslation();
  useEffect(() => {
    console.log("LookUpImageView data:", data);
  }, [data]);

  return (
    <div className="w-full">
      <DynamicSelector
        name="lookupView"
        label={data?.DisplayName || t("LookupUmage.View.SelectOption")}
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

export default LookUpImageView;
