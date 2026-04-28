import React, { useState } from "react";
import { FiSave, FiX, FiRefreshCw } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import DynamicConfirm from "../../utilities/DynamicConfirm";

interface Props {
  onSave?: () => void;
  onUpdate?: () => void;
  onClose?: () => void;
  isEditMode: boolean;
}

const PAHeader: React.FC<Props> = ({
  onSave,
  onUpdate,
  onClose,
  isEditMode,
}) => {
  const { t } = useTranslation();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"save" | "update" | null>(
    null
  );

  const openConfirmForSave = () => {
    setConfirmType("save");
    setConfirmOpen(true);
  };

  const openConfirmForUpdate = () => {
    setConfirmType("update");
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (confirmType === "save") onSave?.();
    if (confirmType === "update") onUpdate?.();
    setConfirmType(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setConfirmType(null);
  };

  const confirmVariant = confirmType === "update" ? "edit" : "add";
  const confirmTitle =
    confirmType === "update"
      ? t("DynamicConfirm.Confirmations.Update.Title", {
          defaultValue: "Update Confirmation",
        })
      : t("DynamicConfirm.Confirmations.Save.Title", {
          defaultValue: "Save Confirmation",
        });
  const confirmMessage =
    confirmType === "update"
      ? t("DynamicConfirm.Confirmations.Update.Message", {
          defaultValue: "Are you sure you want to update?",
        })
      : t("DynamicConfirm.Confirmations.Save.Message", {
          defaultValue: "Are you sure you want to save?",
        });

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white shadow-md rounded-t-md">

        {/* سمت چپ: دکمه Save یا Update */}
        <div className="flex items-center gap-4">
          {isEditMode ? (
            <button
              onClick={openConfirmForUpdate}
              className="flex items-center gap-2 text-yellow-600 hover:text-yellow-800 transition"
              title={t("DynamicConfirm.Buttons.Edit")}
            >
              <FiRefreshCw size={20} />
              <span className="font-medium">
                {t("DynamicConfirm.Buttons.Edit", { defaultValue: "Edit" })}
              </span>
            </button>
          ) : (
            <button
              onClick={openConfirmForSave}
              className="flex items-center gap-2 text-green-600 hover:text-green-800 transition"
              title={t("DynamicConfirm.Buttons.Add")}
            >
              <FiSave size={20} />
              <span className="font-medium">
                {t("DynamicConfirm.Buttons.Add", { defaultValue: "Add" })}
              </span>
            </button>
          )}
        </div>

        {/* سمت راست: دکمه Close */}
        <div className="flex items-center gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="text-red-600 hover:text-red-800 transition"
              title={t("DynamicConfirm.Buttons.Close", { defaultValue: "Close" })}
              aria-label={t("DynamicConfirm.Buttons.Close", { defaultValue: "Close" })}
            >
              <FiX size={20} />
            </button>
          )}
        </div>
      </div>

      <DynamicConfirm
        isOpen={confirmOpen}
        variant={confirmVariant as any}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={handleConfirm}
        onClose={handleCancel}
      />
    </>
  );
};

export default PAHeader;