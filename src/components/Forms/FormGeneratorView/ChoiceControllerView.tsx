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
    PersianName?: string;
  };
  isFaMode?: boolean;
}

const ChoiceControllerView: React.FC<ChoiceControllerViewProps> = ({
  data,
  isFaMode = false,
}) => {
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

  // ✅ نمایش نام بر اساس زبان
  const displayName = isFaMode
    ? data.PersianName || data.DisplayName || "یک گزینه انتخاب کنید"
    : data.DisplayName || data.PersianName || "Choose an option:";

  let content: JSX.Element | null = null;

  switch (data.metaType2) {
    case "drop":
      content = (
        <DynamicSelector
          name="choiceView"
          options={options}
          selectedValue={data.metaType1 || ""}
          onChange={() => {}}
          label={displayName}
          disabled={true}
        />
      );
      break;

    case "radio":
      content = (
        <div className="option-row radio-row flex items-center gap-4">
          <span className="section-title text-lg font-semibold whitespace-nowrap">
            {displayName}
          </span>
          <div className="option-list radio-list">
            <DynamicRadioGroup
              options={options}
              title=""
              name="choiceView"
              selectedValue={data.metaType1 || ""}
              onChange={() => {}}
              isRowClicked={true}
            />
          </div>
        </div>
      );
      break;

    case "check": {
      const selectedValues = data.metaType1
        ? data.metaType1.split(",").map((v) => v.trim())
        : [];

      content = (
        <div className="option-row checkbox-row flex items-center gap-4">
          <span className="section-title text-lg font-semibold whitespace-nowrap">
            {displayName}
          </span>
          <div className="option-list checkbox-list">
            {options.map((option) => (
              <div key={option.value} className="option-item checkbox-item">
                <DynamicCheckboxView
                  name={option.label}
                  checked={selectedValues.includes(option.value)}
                />
              </div>
            ))}
          </div>
        </div>
      );
      break;
    }

    default:
      content = null;
  }

  return (
    <div className="choice-controller-view">
      <style>
        {`
          .choice-controller-view {
            --title-gap: 1rem;
            --group-gap: 0.75rem;
            --label-gap: 0.375rem;
          }

          .choice-controller-view .option-row {
            align-items: center;
            gap: var(--title-gap);
          }

          .choice-controller-view .option-list {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--group-gap);
          }

          .choice-controller-view .option-list :where(label, div, span):has(> input[type="radio"]),
          .choice-controller-view .option-list :where(label, div, span):has(> input[type="checkbox"]) {
            display: inline-flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: var(--label-gap) !important;
            line-height: 1.25;
          }

          .choice-controller-view :is(input[type="radio"], input[type="checkbox"]) + * {
            margin-inline-start: var(--label-gap) !important;
          }

          .choice-controller-view * + :is(input[type="radio"], input[type="checkbox"]) {
            margin-inline-start: var(--label-gap) !important;
          }

          .choice-controller-view input[type="radio"],
          .choice-controller-view input[type="checkbox"] {
            vertical-align: middle;
            accent-color: #9333ea;
          }

          .choice-controller-view .radio-list :is(legend, .title, .group-title, [class*="title"]) {
            display: none !important;
          }

          [dir="rtl"] .choice-controller-view .option-row span,
          [dir="rtl"] .choice-controller-view .option-list span {
            margin-right: 0 !important;
          }
        `}
      </style>

      {content}
    </div>
  );
};

export default ChoiceControllerView;