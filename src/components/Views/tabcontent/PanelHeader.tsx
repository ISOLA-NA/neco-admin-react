// src/components/MyPanel/MyPanel.tsx

import React from "react";
import {
  FiSave,
  FiX,
  FiMaximize2,
  FiMinimize2,
  FiRefreshCw,
} from "react-icons/fi";

interface MyPanelProps {
  isExpanded: boolean;
  toggleExpand: () => void;
  onSave?: () => void; // تغییر به حالت اختیاری
  onClose: () => void;
  onUpdate?: () => void; // تغییر به حالت اختیاری
}

const MyPanel: React.FC<MyPanelProps> = ({
  isExpanded,
  toggleExpand,
  onSave,
  onClose,
  onUpdate,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-md rounded-t-md">
      {/* سمت چپ: دکمه Save و Update */}
      <div className="flex items-center space-x-4">
        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center text-green-600 hover:text-green-800 transition"
          >
            <FiSave size={20} className="mr-2" />
            <span className="font-medium">Save</span>
          </button>
        )}

        {onUpdate && (
          <button
            onClick={onUpdate}
            className="flex items-center text-yellow-600 hover:text-yellow-800 transition"
          >
            <FiRefreshCw size={20} className="mr-2" />
            <span className="font-medium">Update</span>
          </button>
        )}
      </div>

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
