// src/components/ControllerForms/ViewControllers/CtrTextBoxView.tsx
import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface CtrTextBoxViewProps {
  data?: {
    metaType1?: string;
    metaType2?: string | null;
    metaType3?: string | null;
    metaType4?: string | null;
  };
  isDisable?: boolean;
}

const CtrTextBoxView: React.FC<CtrTextBoxViewProps> = ({
  data,
  isDisable = true,
}) => {
  const [metaTypes, setMetaTypes] = useState({
    metaType1: data?.metaType1 || "",
    metaType2: data?.metaType2 || null,
    metaType3: data?.metaType3 || null,
    metaType4: data?.metaType4 || null,
  });

  useEffect(() => {
    if (data) {
      setMetaTypes({
        metaType1: data.metaType1 || "",
        metaType2: data.metaType2 || null,
        metaType3: data.metaType3 || null,
        metaType4: data.metaType4 || null,
      });
    }
  }, [data]);

  return (
    <div className="mt-10 bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
      <DynamicInput
        name="Default Value"
        type="text"
        value={metaTypes.metaType1}
        placeholder=" "
        disabled={isDisable}
        className="w-full p-2 border rounded focus:outline-none focus:border-gray-700"
      />
    </div>
  );
};

export default CtrTextBoxView;
