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

const ChoiceControllerView: React.FC<ChoiceControllerViewProps> = ({
  data,
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

  const displayName = data.DisplayName || "Choose an option:";

  let content: JSX.Element | null = null;

  switch (data.metaType2) {
    case "drop":
      content = (
        <div className="ds-rtl-fix">
          <DynamicSelector
            name="choiceView"
            options={options}
            selectedValue={data.metaType1 || ""}
            onChange={() => {}}
            label={displayName}
            disabled={true}
          />
        </div>
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
              title="" // عنوان داخلی را پنهان می‌کنیم؛ عنوان بیرونی را داریم
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
          /* -----------------------------
             متغیرهای فاصله‌گذاری (قابل تنظیم)
             ----------------------------- */
          .choice-controller-view {
            --title-gap: 1rem;       /* فاصله عنوان از گروه گزینه‌ها */
            --group-gap: 0.75rem;    /* فاصله بین آیتم‌ها (12px) */
            --label-gap: 0.375rem;   /* فاصله input ↔ متن لیبل (6px) */
          }

          /* ردیف‌های عنوان + گروه گزینه‌ها: تراز وسط و فاصله ثابت */
          .choice-controller-view .option-row {
            align-items: center;
            gap: var(--title-gap);
          }

          /* گروه گزینه‌ها: همیشه فلکس با فاصله یکنواخت بین آیتم‌ها */
          .choice-controller-view .option-list {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--group-gap);
          }

          /* ——— یکسان‌سازی آیتم‌ها برای رادیو و چک‌باکس ———
             هر ظرفی که input مستقیمِ رادیو/چک‌باکس داخلش باشد را به inline-flex تبدیل کن
             تا فاصله‌ی input و متن با gap کنترل شود (حتی اگر متن «نود متنی» باشد). */
          .choice-controller-view .option-list :where(label, div, span):has(> input[type="radio"]),
          .choice-controller-view .option-list :where(label, div, span):has(> input[type="checkbox"]) {
            display: inline-flex !important;
            flex-direction: row !important;
            align-items: center !important;   /* تراز عمودی دقیق */
            gap: var(--label-gap) !important; /* فاصله‌ی 6px بین input و متن */
            line-height: 1.25;
          }

          /* اگر ساختار به صورت input + [هرچیز] بود: فاصله بعد از input */
          .choice-controller-view :is(input[type="radio"], input[type="checkbox"]) + * {
            margin-inline-start: var(--label-gap) !important;
          }

          /* اگر ساختار به صورت [هرچیز] + input بود: فاصله قبل از input */
          .choice-controller-view * + :is(input[type="radio"], input[type="checkbox"]) {
            margin-inline-start: var(--label-gap) !important;
          }

          /* خودِ کنترل‌ها: تراز و رنگ (اختیاری) */
          .choice-controller-view input[type="radio"],
          .choice-controller-view input[type="checkbox"] {
            vertical-align: middle;
            accent-color: #9333ea; /* نزدیک Tailwind purple-600 */
          }

          /* عنوان داخلی DynamicRadioGroup را اگر رندر شد پنهان کن */
          .choice-controller-view .radio-list :is(legend, .title, .group-title, [class*="title"]) {
            display: none !important;
          }

          /* ——— خنثی‌سازی قانون span سراسری در RTL که باعث چسبندگی می‌شد ——— */
          [dir="rtl"] .choice-controller-view .option-row span,
          [dir="rtl"] .choice-controller-view .option-list span {
            margin-right: 0 !important;
          }

          /* ==== RTL fix for DynamicSelector trigger (button + svg chevron) ==== */

/* خودِ دکمه‌ی تریگر: جا برای فلش در سمت start بده و متن رو راست‌چین کن */
.field-dir[dir="rtl"] .choice-controller-view .ds-rtl-fix
  button[aria-haspopup="listbox"] {
  /* سمت شروع در RTL = چپ؛ سمت پایان = راست */
  padding-inline-start: 2.5rem !important;  /* فضای فلش */
  padding-inline-end: .75rem !important;
  text-align: right !important;
  box-sizing: border-box;
}

/* متن داخل تریگر (span) هم راست‌چین شود و روی فلش نیفتد */
.field-dir[dir="rtl"] .choice-controller-view .ds-rtl-fix
  button[aria-haspopup="listbox"] > span {
  text-align: right !important;
  display: block;               /* برای احترام به text-align */
}

/* خودِ فلش (svg absolute) را بیا سمت start (چپ در RTL) */
.field-dir[dir="rtl"] .choice-controller-view .ds-rtl-fix
  button[aria-haspopup="listbox"] > svg {
  inset-inline-start: .5rem !important;
  inset-inline-end: auto !important;
}

        `}
      </style>

      {content}
    </div>
  );
};

export default ChoiceControllerView;
