// src/components/General/Configuration/PostPickerList.tsx

import React, { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import DynamicModal from "../../utilities/DynamicModal"; // داینامیک مودال
import TableSelector from "../../General/Configuration/TableSelector"; // تیبل سلکتور

interface DefaultValueProps {
  defaultValues: string[][];
  setDefaultValues: React.Dispatch<React.SetStateAction<string[][]>>;
  columnDefs: { headerName: string; field: string }[];
  rowData: { position: string }[];
  fullWidth?: boolean; // پراپ جدید
}

const PostPickerList: React.FC<DefaultValueProps> = ({
  defaultValues,
  setDefaultValues,
  columnDefs,
  rowData,
  fullWidth = false, // مقدار پیش‌فرض
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const handleSelect = () => {
    if (selectedRow) {
      const newDefaultValues = [...defaultValues];
      if (
        newDefaultValues.length === 0 ||
        newDefaultValues[newDefaultValues.length - 1].length >= 3
      ) {
        newDefaultValues.push([selectedRow.position]);
      } else {
        newDefaultValues[newDefaultValues.length - 1].push(
          selectedRow.position
        );
      }
      setDefaultValues(newDefaultValues);
      setSelectedRow(null); // پاک کردن انتخاب
      setIsModalOpen(false);
    }
  };

  const handleRemoveDefaultValue = (lineIndex: number, valueIndex: number) => {
    const newDefaultValues = [...defaultValues];
    newDefaultValues[lineIndex].splice(valueIndex, 1);
    if (newDefaultValues[lineIndex].length === 0) {
      newDefaultValues.splice(lineIndex, 1);
    }
    setDefaultValues(newDefaultValues);
  };

  return (
    <div className={`relative mt-4 ${fullWidth ? "w-1/2 mx-auto" : "w-full"}`}>
      <label className="text-gray-500 text-sm">Default Value</label>
      <div
        className={`flex flex-col space-y-2 mt-2 ${
          fullWidth
            ? "border-b-2 border-gray-300 pb-2 w-1/2 mx-auto"
            : "border-b-2 border-gray-300 pb-2"
        }`}
      >
        {defaultValues.map((line, lineIndex) => (
          <div key={lineIndex} className="flex items-center flex-wrap gap-2">
            {line.map((value, valueIndex) => (
              <div
                key={valueIndex}
                className="relative px-2 py-1 bg-gray-100 rounded-lg flex items-center"
              >
                <span className="text-gray-800">{value}</span>
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveDefaultValue(lineIndex, valueIndex)
                  }
                  className="absolute -top-2 -right-2 text-red-500 hover:text-red-700"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`absolute right-0 top-0 flex items-center justify-center text-indigo-500 hover:text-indigo-700 ${
          fullWidth ? "right-auto left-1/2 transform -translate-x-1/2 mt-2" : ""
        }`}
      >
        <FaPlus size={18} />
      </button>

      {/* مودال انتخاب */}
      <DynamicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TableSelector
          columnDefs={columnDefs}
          rowData={rowData}
          onRowDoubleClick={(row) => {
            const newDefaultValues = [...defaultValues];
            if (
              newDefaultValues.length === 0 ||
              newDefaultValues[newDefaultValues.length - 1].length >= 3
            ) {
              newDefaultValues.push([row.position]);
            } else {
              newDefaultValues[newDefaultValues.length - 1].push(row.position);
            }
            setDefaultValues(newDefaultValues);
            setIsModalOpen(false);
          }}
          onRowClick={(row) => setSelectedRow(row)}
          onSelectButtonClick={handleSelect}
          isSelectDisabled={!selectedRow}
        />
      </DynamicModal>
    </div>
  );
};

export default PostPickerList;
