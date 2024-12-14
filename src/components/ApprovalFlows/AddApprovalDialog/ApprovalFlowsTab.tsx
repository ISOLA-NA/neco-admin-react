// ApprovalFlowsTab.tsx
import React, { useState } from "react";
import DynamicInput from "../../utilities/DynamicInput";

const ApprovalFlowsTab: React.FC = () => {
  const [acceptChecked, setAcceptChecked] = useState<boolean>(false);
  const [rejectChecked, setRejectChecked] = useState<boolean>(false);

  const [nameValue, setNameValue] = useState<string>("");
  const [minAcceptValue, setMinAcceptValue] = useState<string>("1");
  const [minRejectValue, setMinRejectValue] = useState<string>("1");
  const [actDurationValue, setActDurationValue] = useState<string>("1");

  return (
    <div className="flex flex-row h-full">
      {/* Main content on the left */}
      <main className="flex-1 p-4 bg-white overflow-auto">
        {/* Input row */}
        <div className="flex flex-row gap-x-4 w-full mt-4 items-start">
          {/* Name field (بدون چک‌باکس) */}
          <div className="flex flex-col items-start flex-1">
            {/* فاصله خالی برای حفظ تراز */}
            <div className="flex items-center gap-x-2 mb-1 h-6"></div>
            <DynamicInput
              name="Name"
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
            />
          </div>

          {/* Min Accept با چک‌باکس */}
          <div className="flex flex-col items-start flex-1">
            {/* چک‌باکس بالای اینپوت */}
            <div className="flex items-center gap-x-2 mb-1 h-6">
              <input
                type="checkbox"
                checked={acceptChecked}
                onChange={(e) => setAcceptChecked(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700"> Min Accept</span>
            </div>
            <DynamicInput
              name=""
              type="number"
              value={minAcceptValue}
              onChange={(e) => setMinAcceptValue(e.target.value)}
              disabled={acceptChecked}
            />
          </div>

          {/* Min Reject با چک‌باکس */}
          <div className="flex flex-col items-start flex-1">
            <div className="flex items-center gap-x-2 mb-1 h-6">
              <input
                type="checkbox"
                checked={rejectChecked}
                onChange={(e) => setRejectChecked(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700"> Min Reject</span>
            </div>
            <DynamicInput
              name=""
              type="number"
              value={minRejectValue}
              onChange={(e) => setMinRejectValue(e.target.value)}
              disabled={rejectChecked}
            />
          </div>

          {/* Act Duration (بدون چک‌باکس) */}
          <div className="flex flex-col items-start flex-1">
            {/* فاصله خالی برای حفظ تراز */}
            <div className="flex items-center gap-x-2 mb-1 h-6"></div>
            <DynamicInput
              name="Act Duration"
              type="number"
              value={actDurationValue}
              onChange={(e) => setActDurationValue(e.target.value)}
            />
          </div>
        </div>
      </main>

      {/* Right sidebar */}
      <aside className="w-64 bg-gray-100 p-4 border-l border-gray-300 overflow-auto">
        <h3 className="text-lg font-semibold mb-2">Sidebar</h3>
        <ul className="space-y-2">
          <li>Sidebar Item 1</li>
          <li>Sidebar Item 2</li>
          <li>Sidebar Item 3</li>
        </ul>
      </aside>
    </div>
  );
};

export default ApprovalFlowsTab;
