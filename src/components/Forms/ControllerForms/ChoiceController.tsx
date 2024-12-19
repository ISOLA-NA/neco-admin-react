import React, { useState } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import CustomTextarea from "../../utilities/DynamicTextArea";

interface ChoiceControllerProps {
  onChoicesChange?: (choices: string[]) => void; // مدیریت تغییر انتخاب‌ها
  onDisplayTypeChange?: (type: "dropdown" | "radio" | "checkbox") => void; // تغییر نوع نمایش
}

const ChoiceController: React.FC<ChoiceControllerProps> = ({
  onChoicesChange,
  onDisplayTypeChange,
}) => {
  const [choices, setChoices] = useState<string>("");
  const [displayType, setDisplayType] = useState<
    "dropdown" | "radio" | "checkbox"
  >("dropdown");
  const [defaultValue, setDefaultValue] = useState<string>("");

  const handleChoicesChange = (value: string) => {
    const updatedChoices = value
      .split("\n")
      .map((choice) => choice.trim())
      .filter(Boolean);
    setChoices(value);
    onChoicesChange?.(updatedChoices);
  };

  const handleDisplayTypeChange = (type: "dropdown" | "radio" | "checkbox") => {
    setDisplayType(type);
    onDisplayTypeChange?.(type);
  };

  return (
    <div className="p-4 bg-gray-50 rounded shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* انتخاب نوع نمایش */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            Display choices using:
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="displayType"
                value="dropdown"
                checked={displayType === "dropdown"}
                onChange={() => handleDisplayTypeChange("dropdown")}
                className="text-purple-600"
              />
              <span>Drop-Down Menu</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="displayType"
                value="radio"
                checked={displayType === "radio"}
                onChange={() => handleDisplayTypeChange("radio")}
                className="text-purple-600"
              />
              <span>Radio Buttons</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="displayType"
                value="checkbox"
                checked={displayType === "checkbox"}
                onChange={() => handleDisplayTypeChange("checkbox")}
                className="text-purple-600"
              />
              <span>Checkboxes (allow multiple selections)</span>
            </label>
          </div>
        </div>

        {/* لیست انتخاب‌ها */}
        <div>
          {/* <label className="block text-gray-700 mb-2 font-medium">
            Type each choice on a separate line:
          </label> */}
          <CustomTextarea
            id="choices"
            name="Type each choice on a separate line:"
            value={choices}
            onChange={(e) => handleChoicesChange(e.target.value)}
            placeholder=""
            rows={3}
            className="resize-none mt-10"
          />
        </div>
      </div>

      {/* مقدار پیش‌فرض */}
      <div className="mt-4">
        {/* <label className="block text-gray-700 mb-2 font-medium">
          Default value:
        </label> */}
        <DynamicInput
          name="defaultValue"
          type="text"
          value={defaultValue}
          placeholder=""
          onChange={(e) => setDefaultValue(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ChoiceController;
