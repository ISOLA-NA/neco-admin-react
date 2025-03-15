// src/components/PanelHeader/PanelHeader.tsx

import React, { useState } from "react";
import {
  FiSave,
  FiX,
  FiMaximize2,
  FiMinimize2,
  FiRefreshCw,
} from "react-icons/fi";
import DynamicConfirm from "../../utilities/DynamicConfirm";

interface PanelHeaderProps {
  isExpanded: boolean;
  toggleExpand: () => void;
  onSave?: () => void;
  onClose: () => void;
  onUpdate?: () => void;
  onTogglePanelSizeFromRight: (maximize: boolean) => void;
  isRightMaximized: boolean;
  /**
   * تابعی که مشخص می‌کند آیا داده‌ها برای Save معتبر هستند یا خیر.
   * اگر false برگرداند، یعنی نباید Confirm را نشان دهیم.
   */
  onCheckCanSave?: () => boolean;
  /**
   * تابعی که مشخص می‌کند آیا داده‌ها برای Update معتبر هستند یا خیر.
   */
  onCheckCanUpdate?: () => boolean;
  /**
   * تابعی برای نمایش پیغام خطا اگر معتبر نیست (مثلاً Name خالی است).
   */
  onShowEmptyNameWarning?: () => void;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({
  onSave,
  onClose,
  onUpdate,
  onTogglePanelSizeFromRight,
  isRightMaximized,
  onCheckCanSave,
  onCheckCanUpdate,
  onShowEmptyNameWarning,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"save" | "update" | null>(null);

  // اگر کاربر دکمه Save را زد:
  const handleSaveClick = () => {
    // ابتدا مطمئن شویم روی نام مشکلی نیست
    if (onCheckCanSave && !onCheckCanSave()) {
      // اگر داده معتبر نبود (مثلاً Name خالی است)،
      // دیگر Confirm باز نمی‌کنیم و فقط هشدار را نشان می‌دهیم
      if (onShowEmptyNameWarning) {
        onShowEmptyNameWarning();
      }
      return;
    }
    // در غیر این صورت، تأیید ذخیره را نشان بده
    setConfirmType("save");
    setConfirmOpen(true);
  };

  // اگر کاربر دکمه Update را زد:
  const handleUpdateClick = () => {
    // ابتدا مطمئن شویم مشکلی نیست
    if (onCheckCanUpdate && !onCheckCanUpdate()) {
      if (onShowEmptyNameWarning) {
        onShowEmptyNameWarning();
      }
      return;
    }
    setConfirmType("update");
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (confirmType === "update" && onUpdate) {
      onUpdate();
    } else if (confirmType === "save" && onSave) {
      onSave();
    }
    setConfirmType(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setConfirmType(null);
  };

  // تنظیم مشخصات تاییدیه بر اساس نوع تایید (save یا update)
  let confirmVariant: "delete" | "edit" | "add" = "add";
  let confirmTitle = "Save Confirmation";
  let confirmMessage = "Are you sure you want to save?";

  if (confirmType === "update") {
    confirmVariant = "edit";
    confirmTitle = "Update Confirmation";
    confirmMessage = "Are you sure you want to update?";
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white shadow-md rounded-t-md">
        {/* سمت چپ: دکمه‌های Save و Update */}
        <div className="flex items-center space-x-4">
          {onSave && (
            <button
              onClick={handleSaveClick}
              className="flex items-center text-green-600 hover:text-green-800 transition"
            >
              <FiSave size={20} className="mr-2" />
              <span className="font-medium">Save</span>
            </button>
          )}

          {onUpdate && (
            <button
              onClick={handleUpdateClick}
              className="flex items-center text-yellow-600 hover:text-yellow-800 transition"
            >
              <FiRefreshCw size={20} className="mr-2" />
              <span className="font-medium">Update</span>
            </button>
          )}
        </div>

        {/* سمت راست: دکمه‌های Maximize/Minimize و Close */}
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

      {/* پنجره تأیید اصلی برای Save/Update */}
      <DynamicConfirm
        isOpen={confirmOpen}
        variant={confirmVariant}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={handleConfirm}
        onClose={handleCancel}
      />
    </>
  );
};

export default PanelHeader;
