// AddSubApprovalFlowModal.tsx
import React, { useState, useRef, useEffect } from "react";
import DynamicModal from "../MainApproval/ModalApprovalFlow";
import ApprovalFlowsTab, {
  ApprovalFlowsTabRef,
  ApprovalFlowsTabData,
} from "./ApprovalFlowsTab";
import AlertTab from "./AlertTab";
import { BoxTemplate } from "../../../services/api.services";
import { useApi } from "../../../context/ApiContext";
import { showAlert } from "../../utilities/Alert/DynamicAlert";

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
  /** تب فعلی – در حالت افزودن Approval فعال است، در حالت ویرایش همان رفتار قبلی را دارد */
  const [activeTab, setActiveTab] = useState<"approval" | "alert">("approval");

  const api = useApi();

  // ریست کامل فرم هر بار بازشدن
  const [modalKey, setModalKey] = useState<number>(Date.now());
  useEffect(() => {
    if (isOpen) setModalKey(Date.now());
  }, [isOpen]);

  const approvalFlowsTabRef = useRef<ApprovalFlowsTabRef | null>(null);

  /** ذخیره هنگام ویرایش یا افزودن */
  const handleSaveOrUpdate = async () => {
    try {
      if (!approvalFlowsTabRef.current) return;
      if (!approvalFlowsTabRef.current.validateMinFields()) return;

      const formData: ApprovalFlowsTabData =
        approvalFlowsTabRef.current.getFormData();

      const wfApprovals = formData.tableData.map((row) => ({
        nPostTypeID: null,
        nPostID: row.nPostID,
        nWFBoxTemplateID: editData ? editData.ID : 0,
        PCost: row.cost1 || 0,
        Weight: row.weight1 || 0,
        IsVeto: row.veto,
        IsRequired: row.required,
        Code: row.code.toString(),
        ID: parseInt(row.id, 10) || 0,
        IsVisible: true,
        LastModified: new Date().toISOString(),
      }));

      const payload: any = {
        WFBT: {
          Name: formData.nameValue,
          IsStage: formData.isStage,
          ActionMode: parseInt(formData.minAcceptValue, 10) || 0,
          PredecessorStr:
            formData.selectedPredecessors.length > 0
              ? formData.selectedPredecessors.join("|") + "|"
              : "",
          Left: 0,
          Top: 0,
          ActDuration: parseInt(formData.actDurationValue, 10) || 0,
          MaxDuration: parseInt(formData.actDurationValue, 10) || 0,
          nWFTemplateID: workflowTemplateId,
          DeemedEnabled: formData.deemedEnabled,
          DeemDay: parseInt(formData.deemDayValue, 10) || 0,
          DeemCondition: parseInt(formData.deemConditionValue, 10) || 0,
          DeemAction: parseInt(formData.deemActionValue, 10) || 0,
          PreviewsStateId: formData.previewsStateIdValue
            ? parseInt(formData.previewsStateIdValue, 10)
            : null,
          BtnIDs:
            formData.selectedDefaultBtnIds.length > 0
              ? formData.selectedDefaultBtnIds.join("|") + "|"
              : "",
          ActionBtnID: formData.actionBtnID,
          MinNumberForReject: parseInt(formData.minRejectValue, 10) || 0,
          Order: formData.orderValue ? parseInt(formData.orderValue, 10) : null,
          GoToPreviousStateID: formData.goToPreviousStateIDValue
            ? parseInt(formData.goToPreviousStateIDValue, 10)
            : null,
          ID: editData ? editData.ID : 0,
          IsVisible: true,
          LastModified: new Date().toISOString(),
        },
        WFAproval: wfApprovals,
      };

      if (editData) await api.updateBoxTemplate(payload);
      else await api.insertBoxTemplate(payload);

      onBoxTemplateInserted?.();
    } catch (err) {
      console.error(err);
      showAlert("error", null, "Error", "Failed to save");
    }
  };

  // --- رندر ---
  return (
    <DynamicModal isOpen={isOpen} onClose={onClose} size="large">
      <div className="relative">
        {/* تب‌ها */}
        <div
          role="tablist"
          className="tabs tabs-boxed bg-gradient-to-r from-[#EA479B] via-[#A256F6] to-[#E8489E] text-white"
        >
          {/* Approval Flows */}
          <button
            role="tab"
            className={`tab ${activeTab === "approval" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("approval")}
          >
            Approval Flows
          </button>

          {/* Alerts – در حالت افزودن غیرفعال */}
          <button
            role="tab"
            title={!editData ? "Alerts is active in edit mode" : undefined}
            disabled={!editData}
            className={`tab ${
              activeTab === "alert" ? "tab-active" : ""
            } ${!editData ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={() => editData && setActiveTab("alert")}
          >
            Alerts
          </button>
        </div>

        <div className="mt-4 p-4 overflow-auto">
          {activeTab === "approval" && (
            <ApprovalFlowsTab
              key={modalKey}
              ref={(inst) => (approvalFlowsTabRef.current = inst)}
              editData={editData}
              boxTemplates={boxTemplates}
            />
          )}

          {activeTab === "alert" && editData && (
            <AlertTab nWFBoxTemplateId={editData.ID} />
          )}
        </div>
      </div>
    </DynamicModal>
  );
};

AddSubApprovalFlowModal.displayName = "AddSubApprovalFlowModal";
export default AddSubApprovalFlowModal;
