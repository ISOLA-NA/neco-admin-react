import React, { useState } from "react";
import DynamicSelector from "../../utilities/DynamicSelector"; // داینامیک سلکتور
import DefaultValue from "./PostPickerList"; // کامپوننت جدید برای مدیریت default values

const DynamicForm: React.FC = () => {
  const [infoSource, setInfoSource] = useState<string>(""); // مقدار انتخاب‌شده برای "Get information from"
  const [displayColumn, setDisplayColumn] = useState<string>(""); // مقدار انتخاب‌شده برای "What Column To Display"
  const [mode, setMode] = useState<string>(""); // مقدار انتخاب‌شده برای "Modes"
  const [defaultValues, setDefaultValues] = useState<string[][]>([[]]); // مقادیر انتخاب‌شده

  // داده‌های تیبل سلکتور
  const columnDefs = [{ headerName: "Position", field: "position" }];

  const rowData = [
    { position: "POS1" },
    { position: "POS2" },
    { position: "POS3" },
    { position: "POS4" },
  ];

  return (
    <div className="flex gap-8 p-4 bg-gray-50 rounded shadow-lg">
      {/* بخش سمت چپ: Selectors */}
      <div className="flex flex-col space-y-6 w-1/2">
        {/* Get information from */}
        <DynamicSelector
          name="infoSource"
          options={[
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
            { value: "option3", label: "Option 3" },
          ]}
          selectedValue={infoSource}
          onChange={(e) => setInfoSource(e.target.value)}
          label="Get information from"
        />

        {/* What Column To Display */}
        <DynamicSelector
          name="displayColumn"
          options={[
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
            { value: "option3", label: "Option 3" },
          ]}
          selectedValue={displayColumn}
          onChange={(e) => setDisplayColumn(e.target.value)}
          label="What Column To Display"
        />

        {/* Modes */}
        <DynamicSelector
          name="mode"
          options={[
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
            { value: "option3", label: "Option 3" },
          ]}
          selectedValue={mode}
          onChange={(e) => setMode(e.target.value)}
          label="Modes"
        />

        {/* Default Values Section */}
        <DefaultValue
          defaultValues={defaultValues}
          setDefaultValues={setDefaultValues}
          columnDefs={columnDefs}
          rowData={rowData}
        />
      </div>

      {/* بخش سمت راست: تنظیمات اضافی */}
      <div className="flex flex-col space-y-6 w-1/2">
        {/* Display choices using */}
        <div className="space-y-2">
          <label className="block font-medium">Display choices using:</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="displayType"
                value="dropdown"
                checked={false}
                onChange={() => {}}
              />
              Drop-Down Menu
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="displayType"
                value="radio"
                checked={false}
                onChange={() => {}}
              />
              Radio Buttons
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="displayType"
                value="checkbox"
                checked={false}
                onChange={() => {}}
              />
              Checkboxes (allow multiple selections)
            </label>
          </div>
        </div>

        {/* Additional Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={false} onChange={() => {}} />
            Remove Same Name
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={false} onChange={() => {}} />
            Old Lookup
          </label>
        </div>
      </div>
    </div>
  );
};

export default DynamicForm;
