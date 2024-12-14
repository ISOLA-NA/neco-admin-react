// src/components/AddApprovalDialog/AddSubApprovalFlowModal.tsx
import React, { useState } from "react";
import DynamicModal from "../../utilities/DynamicModal";
import ApprovalFlowsTab from "./ApprovalFlowsTab";
import AlertTab from "./AlertTab";

interface AddSubApprovalFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSubApprovalFlowModal: React.FC<AddSubApprovalFlowModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"approval" | "alert">("approval");

  return (
    <DynamicModal isOpen={isOpen} onClose={onClose}>
      {/* تب ها */}
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

      {/* محتوای تب‌ها */}
      <div className="mt-4">
        {activeTab === "approval" && <ApprovalFlowsTab />}
        {activeTab === "alert" && <AlertTab />}
      </div>
    </DynamicModal>
  );
};

export default AddSubApprovalFlowModal;
