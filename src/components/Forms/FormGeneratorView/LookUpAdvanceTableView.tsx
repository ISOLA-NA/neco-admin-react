// src/components/LookUpAdvanceTableView.tsx
import React, { useEffect } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";

interface LookUpAdvanceTableViewProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onButtonClick?: () => void;
  data?: { DisplayName?: string; [key: string]: any };
}

const LookUpAdvanceTableView: React.FC<LookUpAdvanceTableViewProps> = ({
  options,
  selectedValue,
  onChange,
  onButtonClick,
  data,
}) => {
  useEffect(() => {
    console.log("LookUpAdvanceTableView data:", data);
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

export default LookUpAdvanceTableView;
