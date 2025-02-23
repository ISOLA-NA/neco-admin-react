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
  };
}

const HyperLinkView: React.FC<HyperLinkViewProps> = ({ data }) => {
  const [linkValue, setLinkValue] = useState("");

  useEffect(() => {
    if (data) {
      setLinkValue(data.metaType1 || "");
    }
  }, [data]);

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center">
      {data?.DisplayName && (
        <span className="mr-4 text-sm font-medium text-gray-700">
          {data.DisplayName}
        </span>
      )}
      <DynamicInput
        name=""
        type="text"
        value={linkValue}
        placeholder=""
        disabled
        className="w-full p-2 border rounded focus:outline-none focus:border-gray-700"
      />
    </div>
  );
};

export default HyperLinkView;
