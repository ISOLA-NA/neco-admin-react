// src/components/ControllerForms/SeqenialNumberView.tsx
import React from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface SeqenialNumberViewProps {
  data?: {
    DisplayName?: string;
    PersianName?: string;
  };
  isFaMode?: boolean;
}

const SeqenialNumberView: React.FC<SeqenialNumberViewProps> = ({
  data,
  isFaMode = false,
}) => {
  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || ""
    : data?.DisplayName || data?.PersianName || "";

  return (
    <div dir={isFaMode ? "rtl" : "ltr"}>
      <DynamicInput
        name={label}
        type="text"
        value=""
        placeholder=""
        disabled={true}
      />
    </div>
  );
};

export default SeqenialNumberView;
