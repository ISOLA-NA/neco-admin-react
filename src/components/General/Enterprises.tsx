// src/components/General/EnterpriseDetails.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";

interface EnterpriseDetailsProps {
  selectedRow: any;
  categoryType: "cata" | "catb";
  setCategoryType: (value: "cata" | "catb") => void;
}

const EnterpriseDetails: React.FC<EnterpriseDetailsProps> = ({
  selectedRow,
  categoryType,
  setCategoryType,
}) => {
  const [enterpriseData, setEnterpriseData] = useState<{
    ID: string | number;
    EnterpriseName: string;
    Description: string;
    Title: string;
    GroupName: string;
  }>({
    ID: "",
    EnterpriseName: "",
    Description: "",
    Title: "",
    GroupName: "",
  });

  useEffect(() => {
    if (selectedRow) {
      setEnterpriseData({
        ID: selectedRow.ID || "",
        EnterpriseName: selectedRow.EnterpriseName || "",
        Description: selectedRow.Description || "",
        Title: selectedRow.Title || "",
        GroupName: selectedRow.GroupName || "",
      });
    } else {
      setEnterpriseData({
        ID: "",
        EnterpriseName: "",
        Description: "",
        Title: "",
        GroupName: "",
      });
    }
  }, [selectedRow]);

  // هنگام تغییر categoryType، مقدار GroupName نیز به روز شود
  useEffect(() => {
    setEnterpriseData((prev) => ({
      ...prev,
      GroupName: categoryType,
    }));
  }, [categoryType]);

  const handleChange = (field: keyof typeof enterpriseData, value: string) => {
    setEnterpriseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // تعریف گزینه‌های Select بر اساس هماهنگی دو select
  const groupOptions = ["cata", "catb"].map((type) => ({
    value: type,
    label: type.toUpperCase(), // نمایش با حروف بزرگ‌تر برای زیبایی
  }));

  return (
    <TwoColumnLayout>
      {/* Group Name Select */}
      <div className="mb-4">
        <label
          htmlFor="groupName"
          className="block mb-1 text-gray-700 font-medium"
        >
          Group Name:
        </label>
        <select
          id="groupName"
          value={enterpriseData.GroupName}
          onChange={(e) => {
            handleChange("GroupName", e.target.value);
            setCategoryType(e.target.value as "cata" | "catb"); // هماهنگ‌سازی با categoryType
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Select Group</option>
          {groupOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <CustomTextarea
        id="Description"
        name="Description"
        value={enterpriseData.Description}
        placeholder=""
        onChange={(e) => handleChange("Description", e.target.value)}
      />

      <DynamicInput
        name="Title"
        type="text"
        value={enterpriseData.Title}
        placeholder=""
        onChange={(e) => handleChange("Title", e.target.value)}
      />
    </TwoColumnLayout>
  );
};

export default EnterpriseDetails;
