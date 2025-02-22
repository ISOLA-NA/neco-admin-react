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

  switch (data.metaType2) {
    case "drop":
      return (
        <DynamicSelector
          name="choiceView"
          options={options}
          selectedValue={data.metaType1 || ""}
          onChange={() => {}}
          label="Select an option"
          disabled={true}
        />
      );
    case "radio":
      return (
        <DynamicRadioGroup
          options={options}
          title="Choose an option:"
          name="choiceView"
          selectedValue={data.metaType1 || ""}
          onChange={() => {}}
          isRowClicked={true}
        />
      );
    case "check":
      {
        const selectedValues = data.metaType1
          ? data.metaType1.split(",").map((v) => v.trim())
          : [];
        return (
          <div className="flex flex-row gap-2">
            {options.map((option, index) => (
              <DynamicCheckboxView
                key={index}
                name={option.label}
                checked={selectedValues.includes(option.value)}
              />
            ))}
          </div>
        );
      }
    default:
      return null;
  }
};

export default ChoiceControllerView;
