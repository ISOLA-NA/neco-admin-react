// src/components/PanelHeader/PanelHeader.tsx

import React from "react";
import {
  FiSave,
  FiX,
  FiMaximize2,
  FiMinimize2,
  FiRefreshCw,
} from "react-icons/fi";

interface PanelHeaderProps {
  isExpanded: boolean;
  toggleExpand: () => void;
  onSave?: () => void;
  onClose: () => void;
  onUpdate?: () => void;
  onTogglePanelSizeFromRight: (maximize: boolean) => void;
  isRightMaximized: boolean; // اضافه شده
}

const PanelHeader: React.FC<PanelHeaderProps> = ({
  isExpanded,
  toggleExpand,
  onSave,
  onClose,
  onUpdate,
  onTogglePanelSizeFromRight,
  isRightMaximized
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-md rounded-t-md">
      {/* Left Side: Save and Update Buttons */}
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

      {/* Right Side: Maximize/Minimize and Close Buttons */}
      <div className="flex items-center space-x-4">
        {isRightMaximized ? (
          <button
            onClick={() => onTogglePanelSizeFromRight(false)}
            className="text-gray-600 hover:text-gray-800 transition"
            title="Minimize"
          >
            <FiMinimize2 size={20} />
          </button>
        ) : (
          <button
            onClick={() => onTogglePanelSizeFromRight(true)}
            className="text-gray-600 hover:text-gray-800 transition"
            title="Maximize"
          >
            <FiMaximize2 size={20} />
          </button>
        )}

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

export default PanelHeader;
