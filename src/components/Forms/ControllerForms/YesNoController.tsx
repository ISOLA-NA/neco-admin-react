import React, { useState, useEffect } from "react";

interface YesNoProps {
  defaultValue?: "yes" | "no";
  onMetaChange: (meta: { metaType1: "yes" | "no" }) => void;
  data?: { metaType1?: "yes" | "no" };
}

const YesNo: React.FC<YesNoProps> = ({
  defaultValue = "yes",
  onMetaChange,
  data,
}) => {
  // تعیین مقدار اولیه
  const getInitialValue = () => {
    if (data && (data.metaType1 === "yes" || data.metaType1 === "no")) {
      return data.metaType1;
    }
    return defaultValue;
  };

  const [selected, setSelected] = useState<"yes" | "no">(getInitialValue());

  // سینک کردن مقدار state با تغییر props
  useEffect(() => {
    const newValue = getInitialValue();
    setSelected(newValue);
    onMetaChange({ metaType1: newValue });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.metaType1, defaultValue]);

  const handleChange = (value: "yes" | "no") => {
    setSelected(value);
    onMetaChange({ metaType1: value });
  };

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex items-center justify-center">
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">Default value:</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="yesno"
            value="yes"
            checked={selected === "yes"}
            onChange={() => handleChange("yes")}
            className="appearance-none w-4 h-4 rounded-full border-2 border-purple-500 checked:bg-purple-500"
          />
          <span className="text-gray-800">Yes</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="yesno"
            value="no"
            checked={selected === "no"}
            onChange={() => handleChange("no")}
            className="appearance-none w-4 h-4 rounded-full border-2 border-purple-500 checked:bg-purple-500"
          />
          <span className="text-gray-800">No</span>
        </label>
      </div>
    </div>
  );
};

export default YesNo;
