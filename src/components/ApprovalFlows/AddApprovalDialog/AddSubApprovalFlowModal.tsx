import React, { useState, useRef, useEffect } from "react";
import DynamicModal from "../../utilities/DynamicModal";
import ApprovalFlowsTab, {
  ApprovalFlowsTabRef,
  ApprovalFlowsTabData,
} from "./ApprovalFlowsTab";
import AlertTab from "./AlertTab";
import { BoxTemplate } from "../../../services/api.services";
import { useApi } from "../../../context/ApiContext";
import { showAlert } from "../../utilities/Alert/DynamicAlert";

// اگر از react-toastify استفاده می‌کنید و می‌خواهید فقط در همین مدال نمایش بدهید:
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  // برای ریست شدن کامل فرم در هر بار باز شدن مودال
  const [modalKey, setModalKey] = useState<number>(Date.now());
  useEffect(() => {
    if (isOpen) {
      setModalKey(Date.now());
    }
  }, [isOpen]);

  const approvalFlowsTabRef = useRef<ApprovalFlowsTabRef | null>(null);
  const handleApprovalFlowsTabRef = (instance: ApprovalFlowsTabRef | null) => {
    approvalFlowsTabRef.current = instance;
  };

  // این تابع وقتی روی Save یا Edit کلیک می‌شود
  const handleSaveOrUpdate = async () => {
    try {
      if (!approvalFlowsTabRef.current) {
        console.error("ApprovalFlowsTab ref is not attached!");
        showAlert("error", null, "Error", "Failed to add item");
        return;
      }
      // بررسی حداقل مقادیر لازم
      if (!approvalFlowsTabRef.current.validateMinFields()) {
        return;
      }
      const formData: ApprovalFlowsTabData =
        approvalFlowsTabRef.current.getFormData();

      if (!formData) {
        console.error("No data from ApprovalFlowsTab!");
        showAlert("error", null, "Error", "No data from form");
        return;
      }

      // اگر Stage نبود و جدول خالی بود، هشدار
      if (formData.tableData.length === 0 && !formData.isStage) {
        showAlert("warning", null, "Warning", "No row in Approval Context table!");
        return;
      }

      // ساختن ساختار داده برای ارسال به سرور
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

      const predecessorStr =
        formData.selectedPredecessors.length > 0
          ? formData.selectedPredecessors.join("|") + "|"
          : "";
      const btnIDsStr =
        formData.selectedDefaultBtnIds.length > 0
          ? formData.selectedDefaultBtnIds.join("|") + "|"
          : "";

      let payload: any = {
        WFBT: {
          Name: formData.nameValue || "",
          IsStage: formData.isStage,
          ActionMode: parseInt(formData.minAcceptValue, 10) || 0,
          PredecessorStr: predecessorStr,
          Left: 0.0,
          Top: 0.0,
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
          BtnIDs: btnIDsStr,
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

      // اینجا مدال را نمی‌بندیم، صرفاً درخواست را می‌فرستیم
      if (editData) {
        // حالت ویرایش
        const result = await api.updateBoxTemplate(payload);
        console.log("BoxTemplate updated:", result);
        showAlert("success", null, "Success", "Edited Successfully");
      } else {
        // حالت درج
        const result = await api.insertBoxTemplate(payload);
        console.log("BoxTemplate inserted:", result);
        showAlert("success", null, "Success", "Added Successfully");
      }

      if (onBoxTemplateInserted) {
        onBoxTemplateInserted();
      }
    } catch (error) {
      console.error("Error in save/update BoxTemplate:", error);
      showAlert("error", null, "Error", "An error occurred while adding item");
    }
  };

  return (
    <DynamicModal isOpen={isOpen} onClose={onClose}>
      {/* والد با position relative تا بتوانیم ToastContainer را اینجا با absolute پین کنیم */}
      <div className="relative">
        {/* فقط یک ToastContainer در این سطح قرار می‌دهیم */}
        <div
          className="absolute top-0 right-0 mt-2 mr-2"
          style={{ zIndex: 9999 }}
        >
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>

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

        <div className="mt-4 p-4 overflow-auto" style={{ maxHeight: "70vh" }}>
          {activeTab === "approval" && (
            <ApprovalFlowsTab
              key={modalKey}
              ref={handleApprovalFlowsTabRef}
              editData={editData}
              boxTemplates={boxTemplates}
            />
          )}
          {activeTab === "alert" && <AlertTab />}
        </div>

        <div className="flex justify-center mt-6 space-x-3 mb-4">
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
      </div>
    </DynamicModal>
  );
};

AddSubApprovalFlowModal.displayName = "AddSubApprovalFlowModal";
export default AddSubApprovalFlowModal;
