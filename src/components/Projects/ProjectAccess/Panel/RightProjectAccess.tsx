import React, { useState, useEffect } from "react";
import DynamicSwitcher from "../../../utilities/DynamicSwitcher";

interface RightProjectAccessProps {
  selectedRow: Record<string, any>;
  onRowChange?: (updatedRow: Record<string, any>) => void;
}

const RightProjectAccess: React.FC<RightProjectAccessProps> = ({
  selectedRow,
  onRowChange,
}) => {
  const booleanKeys = Object.keys(selectedRow).filter(
    (key) => typeof selectedRow[key] === "boolean"
  );

  const [localRow, setLocalRow] = useState<Record<string, any>>({
    ...selectedRow,
  });

  useEffect(() => {
    setLocalRow({ ...selectedRow });
  }, [selectedRow]);

  const isReadMode = localRow.AccessMode === 1;

  const handleToggleMode = () => {
    const newMode = isReadMode ? 2 : 1;
    const updatedRow = { ...localRow, AccessMode: newMode };
    setLocalRow(updatedRow);
    if (onRowChange) {
      onRowChange(updatedRow);
    }
  };

  const handleCheckboxChange = (key: string) => {
    const updatedRow = {
      ...localRow,
      [key]: !localRow[key],
    };
    setLocalRow(updatedRow);
    if (onRowChange) {
      onRowChange(updatedRow);
    }
  };

  return (
    <div
      className="p-4 h-full flex flex-col overflow-y-auto"
      style={{
        background: "linear-gradient(to bottom, #89CFF0, #FFC0CB)",
      }}
    >
      {/* Mode Switcher Section */}
      <div className="flex items-center justify-center mb-4">
        <span className="mr-4 font-bold text-gray-800 text-lg">Mode:</span>
        <DynamicSwitcher
          isChecked={isReadMode}
          onChange={handleToggleMode}
          leftLabel="Read"
          rightLabel="Write"
        />
      </div>

      {/* Access Title */}
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-4">
        Access
      </h2>

      {/* Boolean Checkboxes */}
      {booleanKeys.length === 0 ? (
        <p className="text-center text-gray-500">
          No boolean fields available.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {booleanKeys.map((key) => (
            <div
              key={key}
              className="flex items-center border border-gray-400 p-2 rounded bg-white shadow-md hover:shadow-lg transition"
            >
              <input
                type="checkbox"
                checked={localRow[key]}
                onChange={() => handleCheckboxChange(key)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                className="ml-2 text-gray-700 whitespace-nowrap overflow-hidden overflow-ellipsis"
                title={`${key}: ${localRow[key]}`}
              >
                {key}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RightProjectAccess;
