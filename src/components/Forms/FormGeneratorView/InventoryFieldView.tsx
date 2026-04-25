import React from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface InventoryFieldViewProps {
  data?: {
    DisplayName?: string;
    PersianName?: string;
    metaType2?: string | number | null;
  };
  isFaMode?: boolean;
}

const toStr = (v: any, fallback = "") =>
  v === undefined || v === null ? fallback : String(v);

const InventoryFieldView: React.FC<InventoryFieldViewProps> = ({
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
        value={toStr(data?.metaType2)}
        placeholder=""
        disabled={true}
      />
    </div>
  );
};

export default InventoryFieldView;
