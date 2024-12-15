import React from "react";
import { classNames } from "primereact/utils";

interface BoxPredecessorProps {
  className?: string;
  selectedPredecessors: number[];
  onSelectionChange: (selected: number[]) => void;
}

const BoxPredecessor: React.FC<BoxPredecessorProps> = ({
  className,
  selectedPredecessors,
  onSelectionChange,
}) => {
  // مدیریت تغییر وضعیت چک‌باکس‌ها
  const handleCheckboxChange = (value: number) => {
    if (selectedPredecessors.includes(value)) {
      onSelectionChange(selectedPredecessors.filter((item) => item !== value));
    } else {
      onSelectionChange([...selectedPredecessors, value]);
    }
  };

  return (
    <div className={classNames("w-full", className)}>
      {/* هدر */}
      <div className="flex justify-center items-center p-2 rounded-t-md bg-gradient-to-r from-purple-600 to-indigo-500 h-10">
        <h3 className="text-sm font-semibold text-white">Predecessor</h3>
      </div>

      {/* محتوای چک‌باکس‌ها با قابلیت اسکرول عمودی */}
      <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-b-md p-3 border border-t-0 border-gray-200">
        <div className="flex flex-col space-y-2">
          {Array.from({ length: 30 }, (_, index) => {
            const value = index + 1;
            return (
              <label
                key={value}
                className="flex items-center space-x-2 p-2 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-purple-600"
                  checked={selectedPredecessors.includes(value)}
                  onChange={() => handleCheckboxChange(value)}
                />
                <span className="text-gray-700">Predecessor {value}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BoxPredecessor;
