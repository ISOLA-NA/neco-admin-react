// src/components/ControllerForms/ViewControllers/CtrTextBoxView.tsx
import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface CtrTextBoxViewProps {
  data?: {
    metaType1?: string;
    metaType2?: string | null;
    metaType3?: string | null;
    metaType4?: string | null;
    DisplayName?: string;
    PersianName?: string;
  };
  isDisable?: boolean;
  isFaMode?: boolean;
}

const CtrTextBoxView: React.FC<CtrTextBoxViewProps> = ({
  data,
  isDisable = true,
  isFaMode = false,
}) => {
  const [metaTypes, setMetaTypes] = useState({
    metaType1: data?.metaType1 || "",
    metaType2: data?.metaType2 || "",
    metaType3: data?.metaType3 || "",
    metaType4: data?.metaType4 || "",
  });

  useEffect(() => {
    if (data) {
      setMetaTypes({
        metaType1: data.metaType1 || "",
        metaType2: data.metaType2 || "",
        metaType3: data.metaType3 || "",
        metaType4: data.metaType4 || "",
      });
    }
  }, [data]);

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || ""
    : data?.DisplayName || data?.PersianName || "";

  return (
    <div>
      <DynamicInput
        name={label}
        type="text"
        value={metaTypes.metaType1}
        placeholder=" "
        disabled={isDisable}
      />
    </div>
  );
};

export default CtrTextBoxView;