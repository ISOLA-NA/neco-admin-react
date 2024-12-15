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

  // تابع برای ذخیره‌سازی داده‌ها
  const handleSave = () => {
    // در اینجا می‌توانید منطق ذخیره‌سازی داده‌ها را اضافه کنید
    // به عنوان مثال، ارسال داده‌ها به سرور یا بروزرسانی state‌های والد

    // سپس مودال را ببندید
    onClose();
  };

  // تابع برای لغو و بستن مودال
  const handleCancel = () => {
    // اگر نیاز به بازنشانی فرم قبل از بستن مودال دارید، اینجا انجام دهید
    // به عنوان مثال: resetForm();

    // مودال را ببندید بدون ذخیره‌سازی
    onClose();
  };

  return (
    <DynamicModal isOpen={isOpen} onClose={onClose}>
      {/* تب‌ها */}
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

      {/* دکمه‌های Save و Cancel */}
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
