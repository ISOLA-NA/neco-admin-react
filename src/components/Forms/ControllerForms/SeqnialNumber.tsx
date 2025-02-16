// src/components/ControllerForms/SeqnialNumber.tsx
import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";

interface SeqenialNumberProps {
  onMetaChange?: (data: any) => void;
  data?: any;
}

const SeqenialNumber: React.FC<SeqenialNumberProps> = ({ onMetaChange, data }) => {
  const [command, setCommand] = useState(data?.metaType1 || "");
  const [numberOfDigit, setNumberOfDigit] = useState<number | string>(data?.metaType2 || "");
  const [separatorCharacter, setSeparatorCharacter] = useState(data?.metaType3 || "");
  const [countOfConst, setCountOfConst] = useState<number | string>(data?.metaType4 || "");
  const [mode, setMode] = useState(data?.metaTypeJson || "");

  const modeOptions = [
    { value: "AfterSubmit", label: "AfterSubmit" },
    { value: "AfterAccept", label: "AfterAccept" },
  ];

  // به‌روزرسانی metaData و ارسال آن به کامپوننت پدر
  useEffect(() => {
    if (onMetaChange) {
      onMetaChange({
        metaType1: command,
        metaType2: numberOfDigit,
        metaType3: separatorCharacter,
        metaType4: countOfConst,
        metaTypeJson: mode || null, // اگر mode انتخاب نشده باشد، null خواهد بود
      });
    }
  }, [command, numberOfDigit, separatorCharacter, countOfConst, mode, onMetaChange]);

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex items-center justify-center">
      <div className="p-4 w-full max-w-lg space-y-6">
        {/* Command Input */}
        <DynamicInput
          name="Command"
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Command"
        />

        <div className="flex items-center space-x-4">
          {/* Number Of Digit */}
          <DynamicInput
            name="Number Of Digit"
            type="number"
            value={numberOfDigit}
            onChange={(e) => setNumberOfDigit(e.target.value)}
            placeholder="Number Of Digit"
          />

          {/* Separator Character */}
          <DynamicInput
            name="Separator Character"
            type="text"
            value={separatorCharacter}
            onChange={(e) => setSeparatorCharacter(e.target.value)}
            placeholder="Separator Character"
          />
        </div>

        <div className="flex items-center space-x-4">
          {/* Count of Const */}
          <DynamicInput
            name="Count of Const"
            type="number"
            value={countOfConst}
            onChange={(e) => setCountOfConst(e.target.value)}
            placeholder="Count of Const"
          />

          {/* Count In Reject */}
          <div className="flex items-center space-x-2">
            {/* اگر نیاز به استفاده از Count In Reject به عنوان یک چک‌باکس دارید، می‌توانید این قسمت را اضافه کنید */}
          </div>
        </div>

        {/* Modes Selector */}
        <DynamicSelector
          name="Modes"
          options={modeOptions}
          selectedValue={mode}
          onChange={(e) => setMode(e.target.value)}
          label="Modes"
        />
      </div>
    </div>
  );
};

export default SeqenialNumber;
