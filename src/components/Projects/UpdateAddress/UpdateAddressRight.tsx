import React, { useState } from "react";
import { FiSave } from "react-icons/fi";
import { useUpdateAddress } from "./UpdateAddressContext";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicConfirm from "../../utilities/DynamicConfirm";
import { useTranslation } from "react-i18next";

const UpdateAddressRight: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { selectedNode, address, setAddress, saveAddress } = useUpdateAddress();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const isRtl = i18n.dir() === "rtl" || i18n.language === "fa";

  const toPersianDigits = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "";

    return value.toString().replace(/\d/g, (digit) => {
      return "۰۱۲۳۴۵۶۷۸۹"[Number(digit)];
    });
  };

  const toEnglishDigits = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "";

    return value
      .toString()
      .replace(/[۰-۹]/g, (digit) => {
        return String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit));
      })
      .replace(/[٠-٩]/g, (digit) => {
        return String("٠١٢٣٤٥٦٧٨٩".indexOf(digit));
      });
  };

  const localizeText = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "";
    return i18n.language === "fa" ? toPersianDigits(value) : value.toString();
  };

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

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(toEnglishDigits(value));
  };

  return (
    <div className="w-full" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-2 text-xs text-gray-500">
        {selectedNode
          ? `${t("UpdateAddress.Selected", { defaultValue: "Selected" })}: ${
              localizeText(selectedNode.Name)
            }`
          : t("UpdateAddress.SelectItemFromTree", {
              defaultValue: "Please select an item from the tree on the left.",
            })}
      </div>

      <DynamicInput
        name={t("UpdateAddress.Address", { defaultValue: "Address" })}
        type="text"
        value={localizeText(address)}
        onChange={handleAddressChange}
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