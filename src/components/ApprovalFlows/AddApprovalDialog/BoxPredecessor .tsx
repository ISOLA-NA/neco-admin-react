import React from "react";
import { classNames } from "primereact/utils";
import { BoxTemplate } from "../../../services/api.services";

interface BoxPredecessorProps {
  className?: string;
  boxTemplates: BoxTemplate[];
  selectedPredecessors: number[];
  onSelectionChange: (selected: number[]) => void;
  currentBoxId?: number; // آی‌دی باکسی که داریم ویرایش می‌کنیم (نباید در چک‌باکس‌ها دیده شود)
}

const BoxPredecessor: React.FC<BoxPredecessorProps> = ({
  className,
  boxTemplates,
  selectedPredecessors,
  onSelectionChange,
  currentBoxId = 0,
}) => {
  const handleCheckboxChange = (value: number) => {
    if (selectedPredecessors.includes(value)) {
      onSelectionChange(selectedPredecessors.filter((item) => item !== value));
    } else {
      onSelectionChange([...selectedPredecessors, value]);
    }
  };

  const filteredBoxTemplates = boxTemplates.filter(
    (box) => box.ID !== currentBoxId
  );

  return (
    <div className={classNames("w-full", className)}>
      <div className="flex justify-center items-center p-2 rounded-t-md bg-gradient-to-r from-purple-600 to-indigo-500 h-10">
        <h3 className="text-sm font-semibold text-white">Predecessor</h3>
      </div>

      <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-b-md p-3 border border-t-0 border-gray-200">
        <div className="flex flex-col space-y-2">
          {filteredBoxTemplates.map((box) => (
            <label
              key={box.ID}
              className="flex items-center space-x-2 p-2 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow"
            >
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-purple-600"
                checked={selectedPredecessors.includes(box.ID)}
                onChange={() => handleCheckboxChange(box.ID)}
              />
              <span className="text-gray-700">{box.Name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoxPredecessor;
