import React from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface InventoryFieldViewProps {
  data?: {
    DisplayName?: string;
    metaType2?: string | number | null; // Min
  };
}

const toStr = (v: any, fallback = "") =>
  v === undefined || v === null ? fallback : String(v);

const InventoryFieldView: React.FC<InventoryFieldViewProps> = ({ data }) => {
  return (
    <div className="p-4">
      <DynamicInput
        name={data?.DisplayName || "Inventory Field"}
        type="text"
        value={toStr(data?.metaType2)}
        placeholder=""
        disabled={true}
        className="w-full p-2 border rounded focus:outline-none"
      />
    </div>
  );
};

export default InventoryFieldView;
