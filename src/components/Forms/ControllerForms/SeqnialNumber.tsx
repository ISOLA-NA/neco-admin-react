// src/components/ControllerForms/SeqenialNumber.tsx
import React, { useState, useEffect, useRef } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import { useTranslation } from "react-i18next";

interface SeqenialNumberProps {
  /** هربار متادیتا (به جز metaType4) تغییر کند، والد را خبر کن */
  onMetaChange?: (data: {
    metaType1: string; // Command
    metaType2: string | number; // NumberOfDigit
    metaType3: string; // SeparatorCharacter
    metaTypeJson: string | null; // Modes
    CountInReject: boolean; // Checkbox
  }) => void;

  /** برای فیلد metaType4 (CountOfConst) از این پروپ جداگانه استفاده می‌کنیم */
  onMetaExtraChange?: (data: { metaType4: string | number }) => void;

  /** مقادیر اولیه هنگام ادیت */
  data?: {
    metaType1?: string;
    metaType2?: string | number;
    metaType3?: string;
    metaType4?: string | number;
    metaTypeJson?: string;
    CountInReject?: boolean;
  };
}

const modeOptions = [
  { value: "AfterSubmit", label: "AfterSubmit" },
  { value: "AfterAccept", label: "AfterAccept" },
];

const SeqenialNumber: React.FC<SeqenialNumberProps> = ({
  onMetaChange,
  onMetaExtraChange,
  data = {},
}) => {
  const { t } = useTranslation();
  /* ------------ local state ------------ */
  const [command, setCommand] = useState(data.metaType1 ?? "");
  const [numberOfDigit, setNumberOfDigit] = useState<string | number>(
    data.metaType2 ?? ""
  );
  const [separatorCharacter, setSeparatorCharacter] = useState(
    data.metaType3 ?? ""
  );
  const [countOfConst, setCountOfConst] = useState<string | number>(
    data.metaType4 ?? ""
  );
  const [mode, setMode] = useState(data.metaTypeJson ?? "");
  const [countInReject, setCountInReject] = useState<boolean>(
    !!data.CountInReject
  );

  /* -------- sync props→state فقط در صورت تفاوت -------- */
  useEffect(() => {
    setCommand((p) =>
      p === (data.metaType1 ?? "") ? p : data.metaType1 ?? ""
    );
    setNumberOfDigit((p) =>
      p === (data.metaType2 ?? "") ? p : data.metaType2 ?? ""
    );
    setSeparatorCharacter((p) =>
      p === (data.metaType3 ?? "") ? p : data.metaType3 ?? ""
    );
    setCountOfConst((p) =>
      p === (data.metaType4 ?? "") ? p : data.metaType4 ?? ""
    );
    setMode((p) =>
      p === (data.metaTypeJson ?? "") ? p : data.metaTypeJson ?? ""
    );
    setCountInReject((p) =>
      p === !!data.CountInReject ? p : !!data.CountInReject
    );
  }, [
    data.metaType1,
    data.metaType2,
    data.metaType3,
    data.metaType4,
    data.metaTypeJson,
    data.CountInReject,
  ]);

  /* -------- push metaCore up (به جز metaType4) -------- */
  const prevCoreStr = useRef("");
  useEffect(() => {
    if (!onMetaChange) return;
    const core = {
      metaType1: command,
      metaType2: numberOfDigit,
      metaType3: separatorCharacter,
      metaTypeJson: mode || null,
      CountInReject: countInReject,
    };
    const s = JSON.stringify(core);
    if (s !== prevCoreStr.current) {
      prevCoreStr.current = s;
      onMetaChange(core);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command, numberOfDigit, separatorCharacter, mode, countInReject]);

  /* -------- push metaType4 up -------- */
  const prevExtra = useRef<string | number | "">("");
  useEffect(() => {
    if (!onMetaExtraChange) return;
    if (prevExtra.current !== countOfConst) {
      prevExtra.current = countOfConst;
      onMetaExtraChange({ metaType4: countOfConst });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countOfConst]);

  /* ------------ UI ------------ */
  return (
    <div
      dir="rtl"
      className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex justify-center"
    >
      <div className="p-4 w-full max-w-lg space-y-6 text-right [&_input]:text-right [&_select]:text-right [&_textarea]:text-right">
        {/* Command: تمام عرض */}
        <div className="w-full">
          <DynamicInput
            name={t("SeqenialNumber.Labels.Command")}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder={t("SeqenialNumber.Placeholders.Command")}
          />
        </div>

        {/* Number Of Digit + Separator Character: مجموع = عرض Command */}
        <div className="grid grid-cols-2 gap-4 w-full items-end">
          <div className="min-w-0">
            <DynamicInput
              name={t("SeqenialNumber.Labels.NumberOfDigit")}
              type="number"
              value={numberOfDigit}
              onChange={(e) => setNumberOfDigit(e.target.value)}
              placeholder={t("SeqenialNumber.Placeholders.NumberOfDigit")}
            />
          </div>
          <div className="min-w-0">
            <DynamicInput
              name={t("SeqenialNumber.Labels.SeparatorCharacter")}
              type="text"
              value={separatorCharacter}
              onChange={(e) => setSeparatorCharacter(e.target.value)}
              placeholder={t("SeqenialNumber.Placeholders.SeparatorCharacter")}
            />
          </div>
        </div>

        {/* Count of Const + Count In Reject: مجموع = عرض Command */}
        <div className="grid grid-cols-2 gap-4 w-full items-end">
          <div className="min-w-0">
            <DynamicInput
              name={t("SeqenialNumber.Labels.CountOfConst")}
              type="number"
              value={countOfConst}
              onChange={(e) => setCountOfConst(e.target.value)}
              placeholder={t("SeqenialNumber.Placeholders.CountOfConst")}
            />
          </div>

          {/* Count In Reject: هم‌تراز با چک‌باکس، بدون پس‌زمینه، فاصله کم بین چک‌باکس و متن */}
          <div className="min-w-0">
            <label className="inline-flex flex-row-reverse items-center gap-1 h-10 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={countInReject}
                onChange={(e) => setCountInReject(e.target.checked)}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
              />
              <span className="font-medium leading-tight">
                {" "}
                {t("SeqenialNumber.Labels.CountInReject")}
              </span>
            </label>
          </div>
        </div>

        {/* Modes: تمام عرض */}
        <div className="w-full">
          <DynamicSelector
            name="Modes"
            label={t("SeqenialNumber.Labels.Modes")}
            options={modeOptions}
            selectedValue={mode}
            onChange={(e) => setMode(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default SeqenialNumber;
