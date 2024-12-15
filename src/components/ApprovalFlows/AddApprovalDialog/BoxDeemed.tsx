import React, { useState } from "react";
import DynamicSelector from "../../utilities/DynamicSelector";

const DeemedSection: React.FC = () => {
  const [deemedChecked, setDeemedChecked] = useState<boolean>(true);
  const [afterValue, setAfterValue] = useState<number>(0);
  const [fromValue, setFromValue] = useState<string>("");
  const [statusValue, setStatusValue] = useState<string>("");
  const [prevStateValue, setPrevStateValue] = useState<string>("");
  const [actionButtonValue, setActionButtonValue] = useState<string>("");

  const fromOptions = [
    { value: "duedate", label: "Due Date" },
    { value: "seendate", label: "Seen Date" },
    { value: "senddate", label: "Send Date" },
  ];

  const statusOptions = [
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "pending", label: "Pending" },
  ];

  const prevStateOptions = [
    { value: "state1", label: "State 1" },
    { value: "state2", label: "State 2" },
    { value: "state3", label: "State 3" }, // Add more states if needed
  ];

  const actionButtonOptions = [
    { value: "action1", label: "Action 1" },
    { value: "action2", label: "Action 2" },
  ];

  return (
    <div className="mt-4 bg-gray-200 p-2 flex flex-col space-y-2">
      {/* CheckBox in a separate line */}
      <div className="flex items-center">
        <label className="flex items-center space-x-1 text-orange-600 font-semibold mb-6">
          <input
            type="checkbox"
            checked={deemedChecked}
            onChange={(e) => setDeemedChecked(e.target.checked)}
            className="form-checkbox h-4 w-4 text-orange-600"
          />
          <span>Deemed as Approve Or Reject</span>
        </label>
      </div>

      {/* Other inputs in a single line */}
      <div className="flex flex-wrap items-center space-x-4 mb-12">
        {/* After */}
        <span className="text-sm text-gray-700">After</span>
        <input
          type="number"
          value={afterValue}
          onChange={(e) => setAfterValue(Number(e.target.value))}
          className="border border-gray-300 rounded p-1 w-12 text-sm"
        />
        {/* From */}
        <DynamicSelector
          options={fromOptions}
          selectedValue={fromValue}
          onChange={(e) => setFromValue(e.target.value)}
          label="From"
          className="w-20"
        />

        {/* The status will set to */}
        <DynamicSelector
          options={statusOptions}
          selectedValue={statusValue}
          onChange={(e) => setStatusValue(e.target.value)}
          label="The status will set to"
          className="w-44 text-xs"
        />

        {/* Previous State */}
        <DynamicSelector
          options={prevStateOptions}
          selectedValue={prevStateValue}
          onChange={(e) => setPrevStateValue(e.target.value)}
          label="Previous State"
          className="w-44"
        />

        {/* Select Action Button */}
        <DynamicSelector
          options={actionButtonOptions}
          selectedValue={actionButtonValue}
          onChange={(e) => setActionButtonValue(e.target.value)}
          label="Select Action Button"
          className="w-44"
        />
      </div>

      {/* Added Section Resembling the Uploaded Image */}
      <div className=" p-2 border border-gray-300 rounded bg-white">
        <p className="text-sm text-gray-700 mb-2">
          If user clicks on a button with command{" "}
          <span className="font-bold">"Go to Previous State By Admin"</span>,
          the previous state will set to:
        </p>
        <DynamicSelector
          options={prevStateOptions}
          selectedValue={prevStateValue}
          onChange={(e) => setPrevStateValue(e.target.value)}
          label="Previous State"
          className="w-44"
        />
      </div>
    </div>
  );
};

export default DeemedSection;
