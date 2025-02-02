// AddSubApprovalFlowModal.tsx

import React, { useState } from "react";
import DynamicModal from "../../utilities/DynamicModal";
import ApprovalFlowsTab from "./ApprovalFlowsTab";
import AlertTab from "./AlertTab";
import { BoxTemplate } from "../../../services/api.services";

interface AddSubApprovalFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: BoxTemplate | null; // باکس در حال ویرایش
  boxTemplates?: BoxTemplate[]; // همه‌ی باکس‌ها
}

const AddSubApprovalFlowModal: React.FC<AddSubApprovalFlowModalProps> = ({
  isOpen,
  onClose,
  editData,
  boxTemplates = [],
}) => {
  const [activeTab, setActiveTab] = useState<"approval" | "alert">("approval");

  const handleSave = () => {
    // منطق درج یا آپدیت BoxTemplate
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <DynamicModal isOpen={isOpen} onClose={onClose}>
      <div
        role="tablist"
        className="tabs tabs-boxed bg-gradient-to-r from-[#EA479B] via-[#A256F6] to-[#E8489E] text-white"
      >
        <button
          role="tab"
          className={`tab ${activeTab === "approval" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("approval")}
        >
          Approval Flows
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === "alert" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("alert")}
        >
          Alerts
        </button>
      </div>

      <div className="mt-4">
        {activeTab === "approval" && (
          <ApprovalFlowsTab editData={editData} boxTemplates={boxTemplates} />
        )}
        {activeTab === "alert" && <AlertTab />}
      </div>

      <div className="flex justify-center mt-6 space-x-3">
        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </DynamicModal>
  );
};

export default AddSubApprovalFlowModal;
