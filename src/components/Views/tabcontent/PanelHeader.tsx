// src/components/MyPanel/MyPanel.tsx

import React from "react";
import { FiSave, FiX, FiMaximize2, FiMinimize2 } from "react-icons/fi";

interface MyPanelProps {
  isExpanded: boolean;
  toggleExpand: () => void;
  onSave: () => void;
  onClose: () => void;
}

const MyPanel: React.FC<MyPanelProps> = ({
  isExpanded,
  toggleExpand,
  onSave,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-md rounded-t-md">
      {/* سمت چپ: دکمه Save */}
      <button
        onClick={onSave}
        className="flex items-center text-green-600 hover:text-green-800 transition"
      >
        <FiSave size={20} className="mr-2" />
        <span className="font-medium">Save</span>
      </button>

      {/* سمت راست: آیکون بزرگ‌نمایی/کوچک‌نمایی و دکمه Close */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleExpand}
          className="text-gray-600 hover:text-gray-800 transition"
          title={isExpanded ? "Minimize" : "Maximize"}
        >
          {isExpanded ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
        </button>
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800 transition"
          title="Close"
        >
          <FiX size={20} />
        </button>
      </div>
    </div>
  );
};

export default MyPanel;
