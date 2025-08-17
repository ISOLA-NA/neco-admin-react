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
import { useTranslation } from "react-i18next";

interface PanelHeaderProps {
  isExpanded: boolean;
  toggleExpand: () => void;
  onSave?: () => void;
  onClose: () => void;
  onUpdate?: () => void;
  onTogglePanelSizeFromRight: (maximize: boolean) => void;
  isRightMaximized: boolean;
  onCheckCanSave?: () => boolean;
  onCheckCanUpdate?: () => boolean;
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

  // طبق درخواست شما: بدون namespace
  const { t } = useTranslation();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"save" | "update" | null>(null);

  const handleSaveClick = () => {
    if (onCheckCanSave && !onCheckCanSave()) {
      onShowEmptyNameWarning?.();
      return;
    }
    setConfirmType("save");
    setConfirmOpen(true);
  };

  const handleUpdateClick = () => {
    if (onCheckCanUpdate && !onCheckCanUpdate()) {
      onShowEmptyNameWarning?.();
      return;
    }
    setConfirmType("update");
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (confirmType === "update") {
      onUpdate?.();
    } else if (confirmType === "save") {
      onSave?.();
    }
    setConfirmType(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setConfirmType(null);
  };

  let confirmVariant: "delete" | "edit" | "add" = "add";
  let confirmTitle = t("DynamicConfirm.Confirmations.Save.Title");
  let confirmMessage = t("DynamicConfirm.Confirmations.Save.Message");

  if (confirmType === "update") {
    confirmVariant = "edit";
    confirmTitle = t("DynamicConfirm.Confirmations.Update.Title");
    confirmMessage = t("DynamicConfirm.Confirmations.Update.Message");
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white shadow-md rounded-t-md">
        {/* سمت چپ: دکمه‌های Save و Update */}
        <div className="flex items-center gap-4">
          {onSave && (
            <button
              onClick={handleSaveClick}
              className="flex items-center gap-2 text-green-600 hover:text-green-800 transition"
              title={t("DynamicConfirm.Buttons.Add")}
            >
              <FiSave size={20} />
              <span className="font-medium">{t("DynamicConfirm.Buttons.Add")}</span>
            </button>
          )}

          {onUpdate && (
            <button
              onClick={handleUpdateClick}
              className="flex items-center gap-2 text-yellow-600 hover:text-yellow-800 transition"
              title={t("DynamicConfirm.Buttons.Edit")}
            >
              <FiRefreshCw size={20} />
              <span className="font-medium">{t("DynamicConfirm.Buttons.Edit")}</span>
            </button>
          )}
        </div>

        {/* سمت راست: دکمه‌های Maximize/Minimize و Close */}
        <div className="flex items-center gap-4">
          {isRightMaximized ? (
            <button
              onClick={() => onTogglePanelSizeFromRight(false)}
              className="text-gray-600 hover:text-gray-800 transition"
              title={t("DynamicConfirm.Buttons.Minimize")}
              aria-label={t("DynamicConfirm.Buttons.Minimize")}
            >
              <FiMinimize2 size={20} />
            </button>
          ) : (
            <button
              onClick={() => onTogglePanelSizeFromRight(true)}
              className="text-gray-600 hover:text-gray-800 transition"
              title={t("DynamicConfirm.Buttons.Maximize")}
              aria-label={t("DynamicConfirm.Buttons.Maximize")}
            >
              <FiMaximize2 size={20} />
            </button>
          )}

          <button
            onClick={onClose}
            className="text-red-600 hover:text-red-800 transition"
            title={t("DynamicConfirm.Buttons.Close")}
            aria-label={t("DynamicConfirm.Buttons.Close")}
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
