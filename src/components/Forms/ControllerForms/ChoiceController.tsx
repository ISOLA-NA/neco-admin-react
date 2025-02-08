// src/components/ControllerForms/ChoiceController.tsx
import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import CustomTextarea from "../../utilities/DynamicTextArea";

interface ChoiceControllerProps {
  onMetaChange: (meta: {
    metaType1: string; // default value
    metaType2: "drop" | "radio" | "check"; // display type
    metaType3: string; // choices list (each on a separate line)
  }) => void;
  data?: {
    metaType1?: string;
    metaType2?: "drop" | "radio" | "check";
    metaType3?: string;
  };
}

const ChoiceController: React.FC<ChoiceControllerProps> = ({ onMetaChange, data }) => {
  const [metaType1, setMetaType1] = useState<string>("");
  const [metaType2, setMetaType2] = useState<"drop" | "radio" | "check">("drop");
  const [metaType3, setMetaType3] = useState<string>("");

  useEffect(() => {
    if (data) {
      setMetaType1(data.metaType1 || "");
      setMetaType2(data.metaType2 || "drop");
      setMetaType3(data.metaType3 || "");
    }
  }, [data]);

  useEffect(() => {
    onMetaChange({ metaType1, metaType2, metaType3 });
  }, [metaType1, metaType2, metaType3, onMetaChange]);

  return (
    <div className="p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* انتخاب نوع نمایش */}
        <div>
          <div className="mb-2 font-medium text-gray-700">
            Display choices using:
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="metaType2"
                value="drop"
                checked={metaType2 === "drop"}
                onChange={() => setMetaType2("drop")}
                className="text-purple-600"
              />
              <span>Drop-Down Menu</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="metaType2"
                value="radio"
                checked={metaType2 === "radio"}
                onChange={() => setMetaType2("radio")}
                className="text-purple-600"
              />
              <span>Radio Buttons</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="metaType2"
                value="check"
                checked={metaType2 === "check"}
                onChange={() => setMetaType2("check")}
                className="text-purple-600"
              />
              <span>Check Box</span>
            </label>
          </div>
        </div>
        {/* لیست انتخاب‌ها و مقدار پیش‌فرض */}
        <div>
          <div className="mb-2 font-medium text-gray-700">
            Type each choice on a separate line:
          </div>
          <CustomTextarea
            name="metaType3"
            value={metaType3}
            onChange={(e) => setMetaType3(e.target.value)}
            placeholder=""
            rows={3}
            className="resize-none"
          />
          <div className="mt-4 font-medium text-gray-700">Default value:</div>
          <DynamicInput
            name="metaType1"
            type="text"
            value={metaType1}
            onChange={(e) => setMetaType1(e.target.value)}
            placeholder=""
          />
        </div>
      </div>
    </div>
  );
};

export default ChoiceController;
