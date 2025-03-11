// RolePickerTabs.tsx
import React, { useState } from "react";
import MembersTable, { SelectedItem } from "./MembersTable"; // مسیر را تنظیم کنید
import RoleGroupPostPicker from "./RoleGroupPostPicker"; // مسیر را تنظیم کنید

interface RolePickerTabsProps {
  onSelect: (selected: SelectedItem[]) => void;
  onClose: () => void;
}

const RolePickerTabs: React.FC<RolePickerTabsProps> = ({
  onSelect,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"roles" | "roleGroups">("roles");

  return (
    <div>
      {/* سربرگ تب‌ها */}
      <div className="flex border-b mb-4">
        <button
          type="button"
          className={`px-4 py-2 ${
            activeTab === "roles" ? "border-b-2 border-blue-500 font-bold" : ""
          }`}
          onClick={() => setActiveTab("roles")}
        >
          Roles
        </button>
        <button
        type="button"
          className={`px-4 py-2 ${
            activeTab === "roleGroups"
              ? "border-b-2 border-blue-500 font-bold"
              : ""
          }`}
          onClick={() => setActiveTab("roleGroups")}
        >
          Role Groups
        </button>
      </div>
      {/* محتوای تب فعال */}
      <div>
        {activeTab === "roles" && (
          <MembersTable onSelect={onSelect} onClose={onClose} />
        )}
        {activeTab === "roleGroups" && (
          <RoleGroupPostPicker onSelect={onSelect} onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default RolePickerTabs;
