import React from "react";

interface RightProjectAccessProps {
  selectedRow: Record<string, any>;
}

const RightProjectAccess: React.FC<RightProjectAccessProps> = ({
  selectedRow,
}) => {
  // تمام کلیدهایی که مقدارشان بولین است
  const booleanKeys = Object.keys(selectedRow).filter(
    (key) => typeof selectedRow[key] === "boolean"
  );

  return (
    <div
      className="p-4 h-full flex flex-col overflow-y-auto"
      style={{
        background: "linear-gradient(to bottom, #89CFF0, #FFC0CB)",
      }}
    >
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-4">
        Access
      </h2>

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
                checked={selectedRow[key]}
                readOnly
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                className="ml-2 text-gray-700 whitespace-nowrap overflow-hidden overflow-ellipsis"
                title={`${key}: ${selectedRow[key]}`}
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
