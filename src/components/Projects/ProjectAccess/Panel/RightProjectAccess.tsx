import React, { useEffect, useState } from "react";
import {
  RightProjectData,
  RightItem,
} from "../../../../components/TabHandler/tab/tabData";

interface RightProjectAccessProps {
  selectedRow: any; // اینجا expects {id: string, ...}
}

interface CheckItem extends RightItem {
  checked: boolean;
}

const RightProjectAccess: React.FC<RightProjectAccessProps> = ({
  selectedRow,
}) => {
  const [items, setItems] = useState<CheckItem[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (selectedRow && selectedRow.id && RightProjectData[selectedRow.id]) {
      const data = RightProjectData[selectedRow.id];
      const mapped = data.map((d) => ({ ...d }));
      setItems(mapped);
      const allSelected =
        mapped.length > 0 && mapped.every((item) => item.checked);
      setSelectAll(allSelected);
    } else {
      setItems([]);
      setSelectAll(false);
    }
  }, [selectedRow]);

  const handleCheckboxChange = (index: number) => {
    const newItems = [...items];
    newItems[index].checked = !newItems[index].checked;
    setItems(newItems);

    const allSelected =
      newItems.length > 0 && newItems.every((item) => item.checked);
    setSelectAll(allSelected);
  };

  const handleSelectAllChange = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    const newItems = items.map((item) => ({ ...item, checked: newSelectAll }));
    setItems(newItems);
  };

  if (!selectedRow || !selectedRow.id) {
    return (
      <div className="text-gray-500 flex justify-center items-center h-full">
        No row selected.
      </div>
    );
  }

  if (!RightProjectData[selectedRow.id]) {
    return (
      <div className="text-gray-500 flex justify-center items-center h-full">
        No data found for this selection.
      </div>
    );
  }

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
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="selectAll"
          checked={selectAll}
          onChange={handleSelectAllChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="selectAll" className="ml-2 text-gray-700">
          Select All
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center border border-gray-400 p-2 rounded bg-white shadow-md hover:shadow-lg transition"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => handleCheckboxChange(index)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              className="ml-2 text-gray-700 whitespace-nowrap overflow-hidden overflow-ellipsis"
              title={item.detail}
            >
              {item.detail}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightProjectAccess;
