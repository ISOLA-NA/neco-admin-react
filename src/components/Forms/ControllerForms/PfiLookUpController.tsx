import React, { useState } from "react";
import DynamicSelector from "../../utilities/DynamicSelector"; // مسیر فایل DynamicSelector را اصلاح کنید

const PfiLookup: React.FC = () => {
  const [entityType, setEntityType] = useState("");
  const [mode, setMode] = useState("");

  const entityTypeOptions = [
    { value: "type1", label: "Entity Type 1" },
    { value: "type2", label: "Entity Type 2" },
    { value: "type3", label: "Entity Type 3" },
  ];

  const modeOptions = [
    { value: "mode1", label: "Mode 1" },
    { value: "mode2", label: "Mode 2" },
    { value: "mode3", label: "Mode 3" },
  ];

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100  rounded-lg flex items-center justify-center">
      <div className="flex flex-col gap-4 w-64">
        <DynamicSelector
          name="entityType"
          options={entityTypeOptions}
          selectedValue={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          label="Select Entity Types"
          rightIcon={null} // بدون آیکون اضافه
        />

        <DynamicSelector
          name="mode"
          options={modeOptions}
          selectedValue={mode}
          onChange={(e) => setMode(e.target.value)}
          label="Modes"
          rightIcon={null} // بدون آیکون اضافه
        />
      </div>
    </div>
  );
};

export default PfiLookup;
