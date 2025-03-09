// src/components/ControllerForms/ViewControllers/ChoiceControllerView.tsx
import React from "react";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicRadioGroup from "../../utilities/DynamicRadiogroup";
import DynamicCheckboxView from "../../utilities/DynamicCheckbox";

interface ChoiceControllerViewProps {
  data?: {
    metaType1?: string;
    metaType2?: "drop" | "radio" | "check";
    metaType3?: string;
    DisplayName?: string;
  };
}

const ChoiceControllerView: React.FC<ChoiceControllerViewProps> = ({ data }) => {
  if (!data) return null;

  const options = data.metaType3
    ? data.metaType3
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          return { value: trimmed, label: trimmed };
        })
        .filter((opt) => opt.value.length > 0)
    : [];

  const displayName = data.DisplayName || "Choose an option:";

  switch (data.metaType2) {
    case "drop":
      return (
        <DynamicSelector
          name="choiceView"
          options={options}
          selectedValue={data.metaType1 || ""}
          onChange={() => {}}
          label={displayName}
          disabled={true}
        />
      );
    case "radio":
      return (
        <DynamicRadioGroup
          options={options}
          title={displayName}
          name="choiceView"
          selectedValue={data.metaType1 || ""}
          onChange={() => {}}
          isRowClicked={true}
        />
      );
    case "check": {
      const selectedValues = data.metaType1
        ? data.metaType1.split(",").map((v) => v.trim())
        : [];
      return (
        <div className="flex items-start space-x-4">
          <span className="text-lg font-semibold whitespace-nowrap">
            {displayName}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {options.map((option) => (
              <DynamicCheckboxView
                key={option.value}
                name={option.label}
                checked={selectedValues.includes(option.value)}
              />
            ))}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
};

export default ChoiceControllerView;
