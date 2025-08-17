/* ----------------------------------------------------------
   src/components/Projects/ProjectAccess/PAHeader.tsx
   ---------------------------------------------------------- */
import React, { useState } from "react";
import { FaSave, FaEdit } from "react-icons/fa";
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
      <div className="flex items-center gap-2 bg-white border-b px-3 py-2 shadow-sm">
        {/* Save / Update */}
        {isEditMode ? (
          <button
            onClick={openConfirmForUpdate}
            className="flex items-center gap-1 px-4 py-1 text-xs rounded bg-amber-500 hover:bg-amber-600 text-white"
          >
            <FaEdit />
            {t("Global.Edit", { defaultValue: "Edit" })}
          </button>
        ) : (
          <button
            onClick={openConfirmForSave}
            className="flex items-center gap-1 px-4 py-1 text-xs rounded bg-green-500 hover:bg-green-600 text-white"
          >
            <FaSave />
            {t("Global.Add", { defaultValue: "Add" })}
          </button>
        )}

        {/* Cancel */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            {t("Global.Cancel", { defaultValue: "Cancel" })}
          </button>
        )}
      </div>

      {/* Confirm */}
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
