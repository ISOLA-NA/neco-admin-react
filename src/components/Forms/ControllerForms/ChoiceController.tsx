// src/components/ControllerForms/ChoiceController.tsx
import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import CustomTextarea from "../../utilities/DynamicTextArea";

interface ChoiceControllerProps {
  onMetaChange: (meta: {
    metaType1: string;
    metaType2: "drop" | "radio" | "check";
    metaType3: string;
    metaType4: string;
  }) => void;
  initialMeta?: {
    metaType1?: string;
    metaType2?: "drop" | "radio" | "check";
    metaType3?: string;
    metaType4?: string;
  };
}

const ChoiceController: React.FC<ChoiceControllerProps> = ({
  onMetaChange,
  initialMeta,
}) => {
  const [metaTypes, setMetaTypes] = useState({
    metaType1: initialMeta?.metaType1 || "",
    metaType2: initialMeta?.metaType2 || "drop",
    metaType3: initialMeta?.metaType3 || "",
    metaType4: initialMeta?.metaType4 || "",
  });

  useEffect(() => {
    onMetaChange(metaTypes);
  }, [metaTypes, onMetaChange]);

  const handleDisplayTypeChange = (type: "drop" | "radio" | "check") => {
    setMetaTypes((prev) => ({ ...prev, metaType2: type }));
  };

  const handleChoicesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMetaTypes((prev) => ({ ...prev, metaType3: e.target.value }));
  };

  const handleDefaultValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetaTypes((prev) => ({ ...prev, metaType1: e.target.value }));
  };

  return (
    <div className="bg-gradient-to-r from-pink-100 to-blue-100 p-6 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Display Type Selection */}
        <div className="space-y-4">
          <h3 className="text-gray-700 font-medium">
            Display choices using:
          </h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="displayType"
                value="drop"
                checked={metaTypes.metaType2 === "drop"}
                onChange={() => handleDisplayTypeChange("drop")}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Drop-Down Menu</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="displayType"
                value="radio"
                checked={metaTypes.metaType2 === "radio"}
                onChange={() => handleDisplayTypeChange("radio")}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Radio Buttons</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="displayType"
                value="check"
                checked={metaTypes.metaType2 === "check"}
                onChange={() => handleDisplayTypeChange("check")}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Checkboxes</span>
            </label>
          </div>
        </div>

        {/* Choices Input */}
        <div className="space-y-4">
          <CustomTextarea
            name="choices"
            value={metaTypes.metaType3}
            onChange={handleChoicesChange}
            placeholder="Type each choice on a separate line"
            rows={4}
            className="w-full resize-none"
          />
        </div>
      </div>

      {/* Default Value Input */}
      <div className="mt-4">
        <DynamicInput
          name="defaultValue"
          type="text"
          value={metaTypes.metaType1}
          onChange={handleDefaultValueChange}
          placeholder="Default value"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ChoiceController;