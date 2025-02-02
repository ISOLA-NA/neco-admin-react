// AddSubApprovalFlowModal.tsx

import React, { useState, useRef } from "react";
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
  editData?: BoxTemplate | null; // باکس در حال ویرایش
  boxTemplates?: BoxTemplate[]; // همه‌ی باکس‌ها
  // نکته: این id همان selectedRow.ID در ApprovalFlow.tsx است
  // تا بدانیم nWFTemplateID باید چه مقداری باشد
  workflowTemplateId?: number;
}

const AddSubApprovalFlowModal: React.FC<AddSubApprovalFlowModalProps> = ({
  isOpen,
  onClose,
  editData,
  boxTemplates = [],
  workflowTemplateId = 16, // پیش‌فرض
}) => {
  const [activeTab, setActiveTab] = useState<"approval" | "alert">("approval");
  const api = useApi();

  // رف به کامپوننت ApprovalFlowsTab
  const approvalFlowsTabRef = useRef<ApprovalFlowsTabRef>(null);

  const handleSaveOrUpdate = async () => {
    try {
      // گرفتن داده‌ها از داخل ApprovalFlowsTab
      const formData: ApprovalFlowsTabData | undefined =
        approvalFlowsTabRef.current?.getFormData();

      if (!formData) {
        console.error("No data from ApprovalFlowsTab!");
        return;
      }

      // اگر سطرهای جدول Approval Context خالی بود:
      if (formData.tableData.length === 0) {
        alert("No row in Approval Context table!");
        return;
      }

      // فعلاً فقط اولین سطر جدول را می‌گیریم (در صورت نیاز می‌توان حلقه یا روش دیگر استفاده کرد)
      const firstRow = formData.tableData[0];

      if (!firstRow.postID) {
        alert("No postID found in the first row!");
        return;
      }

      // ساخت آبجکت جهت ارسال به سرور
      // مقدار Name از nameValue
      // actDuration از actDurationValue
      // nWFTemplateID از props.workflowTemplateId
      // ... مقادیر پیش‌فرض طبق مثالی که خودتان دادید

      const payload = {
        WFApproval: {
          Code: firstRow.code || null, // از فیلد code در جدول
          ID: 0,
          IsRequired: firstRow.required, // از فیلد required
          IsVeto: firstRow.veto, // از فیلد veto
          nPostID: firstRow.postID, // از فیلد postID
          nPostTypeID: null,
          nWFBoxTemplateID: 0, // فعلاً 0 - تا زمانی که سرور مقدار نهایی بدهد
          PCost: firstRow.cost1 || 0, // مثلاً cost1 را به WFApproval.PCost اختصاص دادیم
          Weight: firstRow.weight1 || 0, // مثلاً weight1 را به WFApproval.Weight اختصاص دادیم
        },
        WFBT: {
          ActDuration: parseInt(formData.actDurationValue, 10) || 0,
          ActionMode: 1,
          BFID: 0,
          DeemAction: 0,
          DeemCondition: 0,
          DeemDay: 0,
          DeemedEnabled: false,
          ID: 0,
          IsStage: false,
          IsVisible: true,
          Left: 0,
          MaxDuration: parseInt(formData.actDurationValue, 10) || 0,
          MinNumberForReject: parseInt(formData.minRejectValue, 10) || 0,
          Name: formData.nameValue || "",
          nWFTemplateID: workflowTemplateId, // همانی که از بیرون گرفتیم
          PredecessorStr: null, // اگر خواستید از formData.selectedPredecessors تبدیل به "1|2|"... کنید
          PreviousStateId: null,
          Top: 0,
        },
      };

      // ویرایش؟
      if (editData) {
        // آپدیت BoxTemplate
        // برای مثال می‌توانید منطق متفاوتی داشته باشید
        const updatedData = {
          ...payload, // می‌توانید ساختار متفاوتی در آپدیت داشته باشید
        };
        const result = await api.updateBoxTemplate(updatedData as any);
        console.log("BoxTemplate updated:", result);
      } else {
        // درج BoxTemplate
        const result = await api.insertBoxTemplate(payload as any);
        console.log("BoxTemplate inserted:", result);
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
            ref={approvalFlowsTabRef}
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

export default AddSubApprovalFlowModal;
