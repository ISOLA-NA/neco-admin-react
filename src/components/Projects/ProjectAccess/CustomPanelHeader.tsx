/* ----------------------------------------------------------
   src/components/Projects/ProjectAccess/PAHeader.tsx
   ---------------------------------------------------------- */
import React from "react";
import { FaSave, FaEdit } from "react-icons/fa";
import { useTranslation } from "react-i18next";

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

  return (
    <div className="flex items-center gap-2 bg-white border-b px-3 py-2 shadow-sm">
      {/* Save / Update */}
      {isEditMode ? (
        <button
          onClick={onUpdate}
          className="flex items-center gap-1 px-4 py-1 text-xs rounded bg-amber-500 hover:bg-amber-600 text-white"
        >
          <FaEdit />
          {t("Global.Edit", { defaultValue: "Edit" })}
        </button>
      ) : (
        <button
          onClick={onSave}
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
  );
};

export default PAHeader;
