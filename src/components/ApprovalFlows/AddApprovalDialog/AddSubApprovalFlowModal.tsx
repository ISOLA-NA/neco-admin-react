import React, { useState, useRef, useEffect } from "react";
import DynamicModal from "../../utilities/DynamicModal";
import ApprovalFlowsTab, {
  ApprovalFlowsTabRef,
  ApprovalFlowsTabData,
} from "./ApprovalFlowsTab";
import AlertTab from "./AlertTab";
import { BoxTemplate } from "../../../services/api.services";
import { useApi } from "../../../context/ApiContext";

interface AddSubApprovalFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: BoxTemplate | null;
  boxTemplates?: BoxTemplate[];
  workflowTemplateId?: number;
  onBoxTemplateInserted?: () => void;
}

const AddSubApprovalFlowModal: React.FC<AddSubApprovalFlowModalProps> = ({
  isOpen,
  onClose,
  editData,
  boxTemplates = [],
  workflowTemplateId = 0,
  onBoxTemplateInserted,
}) => {
  const [activeTab, setActiveTab] = useState<"approval" | "alert">("approval");
  const api = useApi();

  const approvalFlowsTabRef = useRef<ApprovalFlowsTabRef | null>(null);
  const handleApprovalFlowsTabRef = (instance: ApprovalFlowsTabRef | null) => {
    approvalFlowsTabRef.current = instance;
  };

  useEffect(() => {
    if (!isOpen) {
      // در صورت نیاز ریست‌های لازم
    }
  }, [isOpen]);

  const handleSaveOrUpdate = async () => {
    try {
      if (!approvalFlowsTabRef.current) {
        console.error("ApprovalFlowsTab ref is not attached!");
        return;
      }
      // اعتبارسنجی فیلدهای Min قبل از ارسال
      if (!approvalFlowsTabRef.current.validateMinFields()) {
        return;
      }
      const formData: ApprovalFlowsTabData =
        approvalFlowsTabRef.current.getFormData();

      if (!formData) {
        console.error("No data from ApprovalFlowsTab!");
        return;
      }

      if (formData.tableData.length === 0) {
        alert("No row in Approval Context table!");
        return;
      }

      // ایجاد آرایه wfApprovals برای هر ردیف موجود در جدول
      const wfApprovals = formData.tableData.map((row) => ({
        nPostTypeID: null,
        nPostID: row.postID,
        // در حالت ویرایش از ID موجود در editData استفاده می‌شود، در حالت افزودن 0
        nWFBoxTemplateID: editData ? editData.ID : 0,
        PCost: row.cost1 || 0,
        Weight: row.weight1 || 0,
        IsVeto: row.veto,
        IsRequired: row.required,
        Code: row.code || null,
        // اگر ردیف قبلاً وجود داشته باشد از مقدار موجود استفاده می‌شود
        ID: editData ? row.ID : 0,
        IsVisible: true,
        LastModified: new Date().toISOString(),
      }));

      const predecessorStr =
        formData.selectedPredecessors.length > 0
          ? formData.selectedPredecessors.join("|") + "|"
          : "";
      const btnIDsStr =
        formData.selectedDefaultBtnIds.length > 0
          ? formData.selectedDefaultBtnIds.join("|") + "|"
          : "";

      // payload نهایی که طبق نمونه JSON تنظیم شده است
      let payload: any = {
        WFBT: {
          Name: formData.nameValue || "",
          IsStage: false,
          ActionMode: parseInt(formData.minAcceptValue, 10) || 0,
          PredecessorStr: predecessorStr,
          Left: 0.0,
          Top: 0.0,
          ActDuration: parseInt(formData.actDurationValue, 10) || 0.0,
          MaxDuration: parseInt(formData.actDurationValue, 10) || 0.0,
          nWFTemplateID: workflowTemplateId,
          DeemedEnabled: false,
          DeemDay: 0.0,
          DeemCondition: 0,
          DeemAction: 0,
          PreviewsStateId: null,
          BtnIDs: btnIDsStr,
          ActionBtnID: null,
          MinNumberForReject: parseInt(formData.minRejectValue, 10) || 0,
          Order: formData.orderValue ? parseInt(formData.orderValue, 10) : null,
          GoToPreviousStateID: null,
          ID: editData ? editData.ID : 0,
          IsVisible: true,
          LastModified: new Date().toISOString(),
        },
        WFAproval: wfApprovals,
      };

      if (editData) {
        // ویرایش
        const result = await api.updateBoxTemplate(payload);
        console.log("BoxTemplate updated:", result);
      } else {
        // درج
        const result = await api.insertBoxTemplate(payload);
        console.log("BoxTemplate inserted:", result);
      }

      if (onBoxTemplateInserted) {
        onBoxTemplateInserted();
      }
      onClose();
    } catch (error) {
      console.error("Error in save/update BoxTemplate:", error);
    }
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
          <ApprovalFlowsTab
            ref={handleApprovalFlowsTabRef}
            editData={editData}
            boxTemplates={boxTemplates}
          />
        )}
        {activeTab === "alert" && <AlertTab />}
      </div>

      <div className="flex justify-center mt-6 space-x-3">
        <button
          onClick={handleSaveOrUpdate}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          {editData ? "Edit" : "Save"}
        </button>
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </DynamicModal>
  );
};

AddSubApprovalFlowModal.displayName = "AddSubApprovalFlowModal";
export default AddSubApprovalFlowModal;
