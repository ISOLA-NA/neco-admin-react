// src/components/ControllerForms/TabController.tsx
import React, { useState } from "react";
import CustomTextarea from "../../utilities/DynamicTextArea";

interface TabControllerProps {
  onMetaChange: (meta: {
    metaType1: string;
    metaTypeJson: string | null;
  }) => void;
  data?: {
    metaType1?: string;
    metaTypeJson?: string | null;
  };
}

const TabController: React.FC<TabControllerProps> = ({
  onMetaChange,
  data,
}) => {
  // در حالت ادیت، ابتدا metaType1 را چک می‌کنیم تا مقدار multiline (با newlineها) نمایش داده شود
  const [tabs, setTabs] = useState(() => {
    if (data) {
      if (data.metaType1 && data.metaType1.trim() !== "") {
        return data.metaType1;
      } else if (data.metaTypeJson && data.metaTypeJson.trim() !== "") {
        return data.metaTypeJson.replace(/\/n/g, "\n");
      }
    }
    return "";
  });

  const handleTabsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTabs(newValue);
    // metaType1: همان مقدار چند خطی (برای نمایش)
    // metaTypeJson: مقدار پیوسته (بدون newline) ذخیره می‌شود.
    onMetaChange({
      metaType1: newValue,
      metaTypeJson: newValue.trim() === "" ? null : newValue.replace(/\n/g, ""),
    });
  };

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <CustomTextarea
          name="tabs"
          value={tabs}
          onChange={handleTabsChange}
          rows={4}
          placeholder="Type each tab on a separate line"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default TabController;
