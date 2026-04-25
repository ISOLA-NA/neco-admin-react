// src/components/ControllerForms/ViewControllers/HyperLinkView.tsx
import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface HyperLinkViewProps {
  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string | null;
    metaType4?: string | null;
    DisplayName?: string;
    PersianName?: string;
  };
  isFaMode?: boolean;
}

const HyperLinkView: React.FC<HyperLinkViewProps> = ({
  data,
  isFaMode = false,
}) => {
  const [linkValue, setLinkValue] = useState("");

  useEffect(() => {
    if (data) {
      setLinkValue(data.metaType1 || "");
    }
  }, [data]);

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || ""
    : data?.DisplayName || data?.PersianName || "";

  return (
    <div>
      {label && (
        <span className="mr-4 text-sm font-medium text-gray-700">
          {label}
        </span>
      )}
      <DynamicInput
        name=""
        type="text"
        value={linkValue}
        placeholder=""
        disabled
      />
    </div>
  );
};

export default HyperLinkView;