// src/components/ControllerForms/SeqenialNumber.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { useTranslation } from "react-i18next";

interface SeqenialNumberProps {
  onMetaChange?: (data: {
    metaType1: string;
    metaType2: string | number;
    metaType3: string;
    metaTypeJson: string | null;
    CountInReject: boolean;
  }) => void;

  onMetaExtraChange?: (data: { metaType4: string | number }) => void;

  data?: {
    metaType1?: string;
    metaType2?: string | number;
    metaType3?: string;
    metaType4?: string | number;
    metaTypeJson?: string | null;
    CountInReject?: boolean;
  };
}

type ModeState = {
  afterSubmit: boolean;
  afterAccept: boolean;
  afterReject: boolean;
  afterClose: boolean;
};

const DEFAULT_MODES: ModeState = {
  afterSubmit: false,
  afterAccept: false,
  afterReject: false,
  afterClose: false,
};

const parseMetaTypeJsonToModes = (value?: string | null): ModeState => {
  if (!value || typeof value !== "string") {
    return DEFAULT_MODES;
  }

  return {
    afterSubmit: value.includes("AfterSubmit"),
    afterAccept: value.includes("AfterAccept"),
    afterReject: value.includes("AfterReject"),
    afterClose: value.includes("AfterClose"),
  };
};

const buildMetaTypeJsonFromModes = (modes: ModeState): string | null => {
  let result = "";

  if (modes.afterAccept) result += "AfterAccept-";
  if (modes.afterClose) result += "AfterClose-";
  if (modes.afterReject) result += "AfterReject-";
  if (modes.afterSubmit) result += "AfterSubmit-";

  return result || null;
};

const SeqenialNumber: React.FC<SeqenialNumberProps> = ({
  onMetaChange,
  onMetaExtraChange,
  data = {},
}) => {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language?.toLowerCase().startsWith("fa");

  const labels = {
    afterSubmit: isFa ? "بعد از ثبت" : "After Submit",
    afterAccept: isFa ? "بعد از تایید" : "After Accept",
    afterReject: isFa ? "بعد از رد" : "After Reject",
    afterClose: isFa ? "بعد از بستن" : "After Close",
    countInReject: isFa ? "شمارش در رد" : "Count In Reject",
  };

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
  const [countInReject, setCountInReject] = useState<boolean>(
    !!data.CountInReject
  );

  const [modes, setModes] = useState<ModeState>(() =>
    parseMetaTypeJsonToModes(data.metaTypeJson)
  );

  useEffect(() => {
    setCommand((prev) => (prev === (data.metaType1 ?? "") ? prev : data.metaType1 ?? ""));
    setNumberOfDigit((prev) =>
      prev === (data.metaType2 ?? "") ? prev : data.metaType2 ?? ""
    );
    setSeparatorCharacter((prev) =>
      prev === (data.metaType3 ?? "") ? prev : data.metaType3 ?? ""
    );
    setCountOfConst((prev) =>
      prev === (data.metaType4 ?? "") ? prev : data.metaType4 ?? ""
    );
    setCountInReject((prev) =>
      prev === !!data.CountInReject ? prev : !!data.CountInReject
    );

    const parsedModes = parseMetaTypeJsonToModes(data.metaTypeJson);
    setModes((prev) => {
      const prevStr = JSON.stringify(prev);
      const nextStr = JSON.stringify(parsedModes);
      return prevStr === nextStr ? prev : parsedModes;
    });
  }, [
    data.metaType1,
    data.metaType2,
    data.metaType3,
    data.metaType4,
    data.metaTypeJson,
    data.CountInReject,
  ]);

  const metaTypeJsonValue = useMemo(() => {
    return buildMetaTypeJsonFromModes(modes);
  }, [modes]);

  const prevCoreStr = useRef("");
  useEffect(() => {
    if (!onMetaChange) return;

    const core = {
      metaType1: command,
      metaType2: numberOfDigit,
      metaType3: separatorCharacter,
      metaTypeJson: metaTypeJsonValue,
      CountInReject: countInReject,
    };

    const serialized = JSON.stringify(core);
    if (serialized !== prevCoreStr.current) {
      prevCoreStr.current = serialized;
      onMetaChange(core);
    }
  }, [
    command,
    numberOfDigit,
    separatorCharacter,
    metaTypeJsonValue,
    countInReject,
    onMetaChange,
  ]);

  const prevExtra = useRef<string | number | "">("");
  useEffect(() => {
    if (!onMetaExtraChange) return;

    if (prevExtra.current !== countOfConst) {
      prevExtra.current = countOfConst;
      onMetaExtraChange({ metaType4: countOfConst });
    }
  }, [countOfConst, onMetaExtraChange]);

  const handleModeChange = (key: keyof ModeState, checked: boolean) => {
    setModes((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  return (
    <div
      dir="rtl"
      className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex justify-center"
    >
      <div className="p-4 w-full max-w-lg space-y-6 text-right [&_input]:text-right [&_textarea]:text-right">
        <div className="w-full">
          <DynamicInput
            name={t("SeqenialNumber.Labels.Command")}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder={t("SeqenialNumber.Placeholders.Command")}
          />
        </div>

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

          <div className="min-w-0 flex items-center h-10">
            <label className="inline-flex flex-row-reverse items-center gap-1 cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={countInReject}
                onChange={(e) => setCountInReject(e.target.checked)}
                className="h-3.5 w-3.5 text-indigo-600 border-gray-300 rounded"
              />
              <span className="text-sm font-medium leading-none">
                {labels.countInReject}
              </span>
            </label>
          </div>
        </div>

        <div className="w-full">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <label className="inline-flex flex-row-reverse items-center gap-1 cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={modes.afterSubmit}
                onChange={(e) =>
                  handleModeChange("afterSubmit", e.target.checked)
                }
                className="h-3.5 w-3.5 text-orange-500 border-gray-300 rounded-sm"
              />
              <span className="text-sm font-medium leading-none">
                {labels.afterSubmit}
              </span>
            </label>

            <label className="inline-flex flex-row-reverse items-center gap-1 cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={modes.afterAccept}
                onChange={(e) =>
                  handleModeChange("afterAccept", e.target.checked)
                }
                className="h-3.5 w-3.5 text-orange-500 border-gray-300 rounded-sm"
              />
              <span className="text-sm font-medium leading-none">
                {labels.afterAccept}
              </span>
            </label>

            <label className="inline-flex flex-row-reverse items-center gap-1 cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={modes.afterReject}
                onChange={(e) =>
                  handleModeChange("afterReject", e.target.checked)
                }
                className="h-3.5 w-3.5 text-orange-500 border-gray-300 rounded-sm"
              />
              <span className="text-sm font-medium leading-none">
                {labels.afterReject}
              </span>
            </label>

            <label className="inline-flex flex-row-reverse items-center gap-1 cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={modes.afterClose}
                onChange={(e) =>
                  handleModeChange("afterClose", e.target.checked)
                }
                className="h-3.5 w-3.5 text-orange-500 border-gray-300 rounded-sm"
              />
              <span className="text-sm font-medium leading-none">
                {labels.afterClose}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeqenialNumber;