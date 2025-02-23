// src/components/LookUpImageView.tsx
import React, { useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";

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
  useEffect(() => {
    console.log("LookUpImageView data:", data);
  }, [data]);

  return (
    <div className="w-full">
      <DynamicSelector
        name="lookupView"
        label={data?.DisplayName || "Select Option"}
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
