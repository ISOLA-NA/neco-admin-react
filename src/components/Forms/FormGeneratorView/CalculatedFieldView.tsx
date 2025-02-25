// src/components/ControllerForms/CalculatedFieldView.tsx
import React from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface CalculatedFieldViewProps {
  data?: {
    DisplayName?: string;
  };
}

const CalculatedFieldView: React.FC<CalculatedFieldViewProps> = ({ data }) => {
  return (
    <div className="p-4">
      <DynamicInput
        name={data?.DisplayName || "CalculatedFieldView"}
        type="text"
        value=""
        placeholder=""
        disabled={true}
        className="w-full p-2 border rounded focus:outline-none"
      />
    </div>
  );
};

export default CalculatedFieldView;
