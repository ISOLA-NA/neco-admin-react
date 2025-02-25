// src/components/ControllerForms/SeqenialNumberView.tsx
import React from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface SeqenialNumberViewProps {
  data?: {
    DisplayName?: string;
  };
}

const SeqenialNumberView: React.FC<SeqenialNumberViewProps> = ({ data }) => {
  return (
    <div className="p-4">
      <DynamicInput
        name={data?.DisplayName || "SeqenialNumberView"}
        type="text"
        value=""
        placeholder=""
        disabled={true}
        className="w-full p-2 border rounded focus:outline-none"
      />
    </div>
  );
};

export default SeqenialNumberView;
