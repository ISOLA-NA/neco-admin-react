import React, { useState } from "react";
import DynamicInput from "../../utilities/DynamicInput"; // مسیر فایل DynamicInput را اصلاح کنید
import DynamicSelector from "../../utilities/DynamicSelector"; // مسیر فایل DynamicSelector را اصلاح کنید

const SeqenialNumber: React.FC = () => {
  const [command, setCommand] = useState("");
  const [numberOfDigit, setNumberOfDigit] = useState<number | string>("");
  const [separatorCharacter, setSeparatorCharacter] = useState("");
  const [countOfConst, setCountOfConst] = useState<number | string>("");
  const [countInReject, setCountInReject] = useState(false);
  const [mode, setMode] = useState("");

  const modeOptions = [
    { value: "mode1", label: "Mode 1" },
    { value: "mode2", label: "Mode 2" },
    { value: "mode3", label: "Mode 3" },
  ];

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100  rounded-lg flex items-center justify-center">
      <div className="p-4 w-full max-w-lg space-y-6">
        {/* Command Input */}
        <DynamicInput
          name="Command"
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder=""
        />

        <div className="flex items-center space-x-4">
          {/* Number Of Digit */}
          <DynamicInput
            name="Number Of Digit"
            type="number"
            value={numberOfDigit}
            onChange={(e) => setNumberOfDigit(e.target.value)}
            placeholder=""
          />

          {/* Separator Character */}
          <DynamicInput
            name="Separator Character"
            type="text"
            value={separatorCharacter}
            onChange={(e) => setSeparatorCharacter(e.target.value)}
            placeholder=""
          />
        </div>

        <div className="flex items-center space-x-4">
          {/* Count of Const */}
          <DynamicInput
            name="Count of Const"
            type="number"
            value={countOfConst}
            onChange={(e) => setCountOfConst(e.target.value)}
            placeholder=""
          />

          {/* Count In Reject */}
          <div className="flex items-center space-x-2">
            <input
              id="countInReject"
              type="checkbox"
              checked={countInReject}
              onChange={(e) => setCountInReject(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="countInReject" className="text-gray-700">
              Count In Reject
            </label>
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
