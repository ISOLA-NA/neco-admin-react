import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";

interface HyperLinkControllerProps {

  onMetaChange: (meta: {
    metaType1: string;
    metaType2: string;
    metaType3: string | null;
    metaType4: string | null;
  }) => void;
 
  data?: {
    metaType1?: string;
    metaType2?: string;
    metaType3?: string;
    metaType4?: string;
  };

  isDisable?: boolean;
}

const HyperLinkController: React.FC<HyperLinkControllerProps> = ({
  onMetaChange,
  data,
  isDisable = false,
}) => {
  const [metaTypes, setMetaTypes] = useState({
    metaType1: data?.metaType1 || "",
    metaType2: "hyper",
    metaType3: data?.metaType3 || null,
    metaType4: data?.metaType4 || null,
  });

  useEffect(() => {
    if (data) {
      setMetaTypes({
        metaType1: data.metaType1 || "",
        metaType2: "hyper",
        metaType3: data.metaType3 || null,
        metaType4: data.metaType4 || null,
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMetaTypes((prev) => ({ ...prev, metaType1: newValue, metaType2: "hyper" }));
  };

  useEffect(() => {
    onMetaChange(metaTypes);
  }, [metaTypes, onMetaChange]);

  return (
    <div className="mt-10 bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg">
      <div className="mb-4 flex items-center">
        <span className="mr-2 font-medium">Forma Url as:</span>
        <input
          type="radio"
          checked
          readOnly
          className="mr-2"
        />
      </div>
      <div>
        <DynamicInput
          name="Hyper Link"
          type="text"
          value={metaTypes.metaType1}
          onChange={handleChange}
          placeholder=" "
          disabled={isDisable}
          className="w-full p-2 border rounded focus:outline-none focus:border-gray-700"
        />
      </div>
    </div>
  );
};

export default HyperLinkController;

