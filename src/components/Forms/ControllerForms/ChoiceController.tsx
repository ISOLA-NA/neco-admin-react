import React, { useState, useEffect, useRef } from "react";
import DynamicInput    from "../../utilities/DynamicInput";
import CustomTextarea  from "../../utilities/DynamicTextArea";

interface ChoiceControllerProps {
  onMetaChange: (meta: {
    metaType1: string;
    metaType2: "drop" | "radio" | "check";
    metaType3: string;
  }) => void;
  data?: {
    metaType1?: string;
    metaType2?: "drop" | "radio" | "check";
    metaType3?: string;
  };
}

const ChoiceController: React.FC<ChoiceControllerProps> = ({ onMetaChange, data }) => {
  /* ─────────────────── Local state ─────────────────── */
  const [metaType1, setMetaType1] = useState<string>(data?.metaType1 ?? "");
  const [metaType2, setMetaType2] = useState<"drop" | "radio" | "check">(data?.metaType2 ?? "drop");
  const [metaType3, setMetaType3] = useState<string>(data?.metaType3 ?? "");

  /* ─── Sync from props only when real changes detected ─── */
  useEffect(() => {
    if (
      data &&
      (data.metaType1 !== metaType1 ||
        data.metaType2 !== metaType2 ||
        data.metaType3 !== metaType3)
    ) {
      setMetaType1(data.metaType1 ?? "");
      setMetaType2(data.metaType2 ?? "drop");
      setMetaType3(data.metaType3 ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.metaType1, data?.metaType2, data?.metaType3]);

  /* ─── Inform parent only when values really change ─── */
  const lastSentRef = useRef<{ metaType1: string; metaType2: string; metaType3: string } | null>(null);

  useEffect(() => {
    const current = { metaType1, metaType2, metaType3 };
    if (
      !lastSentRef.current ||
      current.metaType1 !== lastSentRef.current.metaType1 ||
      current.metaType2 !== lastSentRef.current.metaType2 ||
      current.metaType3 !== lastSentRef.current.metaType3
    ) {
      lastSentRef.current = current;
      onMetaChange(current);
    }
  }, [metaType1, metaType2, metaType3, onMetaChange]);

  /* ─────────────────── Render ─────────────────── */
  return (
    <div className="choice-controller p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg space-y-4">
      <style>
        {`
          /* فاصله‌ی 3px برای همه spanها فقط داخل همین کامپوننت در حالت RTL */
          [dir="rtl"] .choice-controller span { margin-right: 3px; }

          /* بهبود دسترسی و تمرکز روی رادیو/چک‌باکس‌ها (اختیاری) */
          .choice-controller input[type="radio"],
          .choice-controller input[type="checkbox"] {
            accent-color: #9333ea; /* مشابه text-purple-600 */
          }
        `}
      </style>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* نوع نمایش گزینه‌ها */}
        <div>
          <div className="mb-2 font-medium text-gray-700">Display choices using:</div>
          <div className="space-y-2">
            {(["drop", "radio", "check"] as const).map((mode) => (
              <label
                key={mode}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="metaType2"
                  value={mode}
                  checked={metaType2 === mode}
                  onChange={() => setMetaType2(mode)}
                  className="text-purple-600"
                />
                <span>
                  {mode === "drop"
                    ? "Drop-Down Menu"
                    : mode === "radio"
                    ? "Radio Buttons"
                    : "Check Box"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* فهرست گزینه‌ها + مقدار پیش‌فرض */}
        <div>
          <div className="mb-2 font-medium text-gray-700">Type each choice on a separate line:</div>
          <CustomTextarea
            name="metaType3"
            value={metaType3}
            onChange={(e) => setMetaType3(e.target.value)}
            placeholder="Enter each choice on a new line"
            rows={4}
            className="resize-none w-full"
          />

          <div className="mt-4 font-medium text-gray-700">Default value:</div>
          <DynamicInput
            name="metaType1"
            type="text"
            value={metaType1}
            onChange={(e) => setMetaType1(e.target.value)}
            placeholder="Enter default value"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ChoiceController;
