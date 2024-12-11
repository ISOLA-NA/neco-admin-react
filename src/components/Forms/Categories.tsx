// src/components/General/EnterpriseDetails.tsx

import React, { useState, useEffect, ChangeEvent } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput"; // اطمینان از مسیر صحیح
import CustomTextarea from "../utilities/DynamicTextArea"; // اصلاح مسیر واردات
import DynamicSelector from "../utilities/DynamicSelector"; // اطمینان از مسیر صحیح

interface EnterpriseDetailsProps {
  selectedRow: any;
  categoryType: "cata" | "catb";
}

interface Option {
  value: string;
  label: string;
}

const EnterpriseDetails: React.FC<EnterpriseDetailsProps> = ({
  selectedRow,
  categoryType,
}) => {
  const [enterpriseData, setEnterpriseData] = useState<{
    ID: string | number;
    EnterpriseName: string;
    Description: string;
    Title: string;
    GroupName: string; // اضافه کردن فیلد GroupName
  }>({
    ID: "",
    EnterpriseName: "",
    Description: "",
    Title: "",
    GroupName: "", // مقدار اولیه
  });

  const [errors, setErrors] = useState<{
    GroupName?: string;
    // سایر خطاها در صورت نیاز
  }>({});

  useEffect(() => {
    if (selectedRow) {
      setEnterpriseData({
        ID: selectedRow.ID || "",
        EnterpriseName: selectedRow.EnterpriseName || "",
        Description: selectedRow.Description || "",
        Title: selectedRow.Title || "",
        GroupName: selectedRow.GroupName || "", // مقدار GroupName
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

  const handleChange = (field: keyof typeof enterpriseData, value: string) => {
    setEnterpriseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // تعریف گزینه‌های Select بر اساس categoryType
  const groupOptions: Option[] =
    categoryType === "cata"
      ? [
          { value: "cata1", label: "Cata Option 1" },
          { value: "cata2", label: "Cata Option 2" },
          // سایر گزینه‌های Cata
        ]
      : [
          { value: "catb1", label: "Cat B Option 1" },
          { value: "catb2", label: "Cat B Option 2" },
          // سایر گزینه‌های Cat B
        ];

  const handleGroupNameChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    handleChange("GroupName", value);
    // مثال ساده برای اعتبارسنجی
    if (!value) {
      setErrors((prev) => ({ ...prev, GroupName: "Group Name is required." }));
    } else {
      setErrors((prev) => ({ ...prev, GroupName: undefined }));
    }
  };

  return (
    <TwoColumnLayout>
      {/* کامپوننت DynamicInput برای Title */}
      <DynamicInput
        name="Title"
        type="text"
        value={enterpriseData.Title}
        placeholder=""
        onChange={(e) => handleChange("Title", e.target.value)}
      />

      {/* استفاده از DynamicSelector برای GroupName */}
      <div className="mb-4">
        <DynamicSelector
          label="Group Name"
          options={groupOptions}
          selectedValue={enterpriseData.GroupName}
          onChange={handleGroupNameChange}
          error={!!errors.GroupName}
          errorMessage={errors.GroupName}
          className="w-full"
        />
      </div>

      {/* کامپوننت CustomTextarea برای Description */}
      <CustomTextarea
        id="Description"
        name="Description"
        value={enterpriseData.Description}
        placeholder=""
        onChange={(e) => handleChange("Description", e.target.value)}
        label="Description"
        rows={4}
        required
        // می‌توانید ویژگی‌های اضافی مانند leftElement یا rightElement را اضافه کنید
      />
    </TwoColumnLayout>
  );
};

export default EnterpriseDetails;
