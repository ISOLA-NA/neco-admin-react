// src/components/ListSelector.tsx
import React, { useState } from "react";
import DynamicDialog from "./DynamicDialog";

const ListSelector: React.FC<{ title: string }> = ({ title }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  const handleRowSelect = (data: any) => {
    const name = data.name;
    if (!selectedNames.includes(name)) {
      setSelectedNames([...selectedNames, name]);
    }
    setIsDialogOpen(false);
  };

  const handleRemoveName = (name: string) => {
    setSelectedNames(selectedNames.filter((n) => n !== name));
  };

  // این تابع را برای انتخاب ردیف از دکمه سلکت اضافه کنید
  const handleSelectFromButton = (data: any) => {
    handleRowSelect(data);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center p-2 rounded-t-md bg-gradient-to-r from-[#7e3af2] to-[#6366f1]">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <button
          className="btn btn-primary text-white bg-[#7e3af2] hover:bg-[#6366f1] px-3 py-1 rounded-md"
          onClick={() => setIsDialogOpen(true)}
        >
          +
        </button>
      </div>

      <div className="h-20 overflow-y-auto bg-[#f9fafb] rounded-b-md p-3">
        {selectedNames.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No items selected</p>
        ) : (
          selectedNames.map((name, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-100 p-2 mb-2 rounded-md hover:bg-[#ececec]"
              onDoubleClick={() => handleRemoveName(name)}
            >
              <span className="text-gray-700">{name}</span>
              <button
                className="btn btn-sm text-red-600 hover:text-red-800"
                onClick={() => handleRemoveName(name)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* Dialog */}
      {isDialogOpen && (
        <DynamicDialog
          onClose={() => setIsDialogOpen(false)}
          onRowSelect={handleRowSelect}
          onSelectFromButton={handleSelectFromButton} // پاس دادن تابع انتخاب از دکمه
        />
      )}
    </div>
  );
};

export default ListSelector;
