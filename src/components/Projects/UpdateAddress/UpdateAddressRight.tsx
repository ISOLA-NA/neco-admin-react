import React, { useState } from "react";
import { FiSave } from "react-icons/fi";
import { useUpdateAddress } from "./UpdateAddressContext";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicConfirm from "../../utilities/DynamicConfirm";
import { useTranslation } from "react-i18next";

const UpdateAddressRight: React.FC = () => {
  const { t } = useTranslation();
  const { selectedNode, address, setAddress, saveAddress } = useUpdateAddress();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const disabled = !selectedNode || !address?.trim();

  const openConfirm = () => {
    if (disabled || saving) return;
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      setSaving(true);
      await saveAddress();
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-2 text-xs text-gray-500">
        {selectedNode
          ? `${t("UpdateAddress.Selected", { defaultValue: "Selected" })}: ${
              selectedNode.Name
            }`
          : t("UpdateAddress.SelectItemFromTree", {
              defaultValue: "Please select an item from the tree on the left.",
            })}
      </div>

      <DynamicInput
        name={t("UpdateAddress.Address", { defaultValue: "Address" })}
        type="text"
        value={address}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setAddress(e.target.value)
        }
        placeholder={t("UpdateAddress.EnterAddressHere", {
          defaultValue: "Enter address here...",
        })}
      />

      <div className="mt-4 flex justify-center">
        <button
          onClick={openConfirm}
          disabled={disabled || saving}
          className={[
            "inline-flex items-center gap-2 px-4 py-2 rounded-md",
            "bg-green-600 hover:bg-green-700 text-white font-semibold",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            saving ? "opacity-75 cursor-wait" : "",
          ].join(" ")}
          title={t("UpdateAddress.EditAddress", {
            defaultValue: "Edit Address",
          })}
        >
          <FiSave />
          <span>
            {saving
              ? t("UpdateAddress.Saving", { defaultValue: "Saving..." })
              : t("UpdateAddress.EditAddress", {
                  defaultValue: "Edit Address",
                })}
          </span>
        </button>
      </div>

      <DynamicConfirm
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        variant="notice"
        title={t("UpdateAddress.ConfirmationTitle", {
          defaultValue: "Confirmation",
        })}
        message={t("UpdateAddress.ConfirmationMessage", {
          defaultValue: "Are you sure you want to update the address?",
        })}
      />
    </div>
  );
};

export default UpdateAddressRight;
