// src/components/Projects/UpdateAddress/UpdateAddressRight.tsx
import React, { useState } from "react";
import { FiSave } from "react-icons/fi";
import { useUpdateAddress } from "./UpdateAddressContext";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicConfirm from "../../utilities/DynamicConfirm";

const UpdateAddressRight: React.FC = () => {
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
      {/* Hint text */}
      <div className="mb-2 text-xs text-gray-500">
        {selectedNode
          ? `Selected: ${selectedNode.Name}`
          : "Please select an item from the tree on the left."}
      </div>

      {/* Address input */}
      <DynamicInput
        name="Address"
        type="text"
        value={address}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setAddress(e.target.value)
        }
        placeholder="Enter address here..."
      />

      {/* Green button centered */}
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
          title="Edit Address"
        >
          <FiSave />
          <span>{saving ? "Saving..." : "Edit Address"}</span>
        </button>
      </div>

      {/* English confirmation dialog */}
      <DynamicConfirm
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        variant="notice"
        title="Confirmation"
        message="Are you sure you want to update the address?"
      />
    </div>
  );
};

export default UpdateAddressRight;
