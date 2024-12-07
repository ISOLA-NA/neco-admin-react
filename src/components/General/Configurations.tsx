// src/components/General/Configurations.tsx

import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import CustomTextarea from "../utilities/DynamicTextArea"; // اطمینان از مسیر صحیح
import DynamicInput from "../utilities/DynamicInput";
import DynamicSelector from "../utilities/DynamicSelector";

interface ConfigurationProps {
  selectedRow: {
    id: number;
    name: string;
    value: string;
    description: string;
    type: string; // اضافه کردن فیلد type
    // در صورت نیاز می‌توانید فیلدهای دیگر را نیز اضافه کنید
  };
}

const Configuration: React.FC<ConfigurationProps> = ({ selectedRow }) => {
  // وضعیت مدیریت شده برای فیلدهای ورودی
  const [configData, setConfigData] = useState({
    id: selectedRow.id.toString(),
    name: selectedRow.name,
    value: selectedRow.value,
    description: selectedRow.description,
    type: selectedRow.type, // مقداردهی اولیه از selectedRow.type
  });

  const [descriptionError, setDescriptionError] = useState(false);

  // به‌روزرسانی وضعیت وقتی selectedRow تغییر می‌کند
  useEffect(() => {
    setConfigData({
      id: selectedRow.id.toString(),
      name: selectedRow.name,
      value: selectedRow.value,
      description: selectedRow.description,
      type: selectedRow.type, // به‌روزرسانی از selectedRow.type
    });
  }, [selectedRow]);

  const handleChange = (field: keyof typeof configData, value: string) => {
    setConfigData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // اعتبارسنجی برای فیلد Description
    if (field === "description") {
      if (value.length < 10) {
        setDescriptionError(true);
      } else {
        setDescriptionError(false);
      }
    }
  };

  // تعریف گزینه‌ها با هماهنگی در حروف بزرگ و کوچک
  const selectorOptions = [
    { value: "Default", label: "Default" },
    { value: "Advanced", label: "Advanced" },
    { value: "Custom", label: "Custom" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Configurations
      </h2>
      <TwoColumnLayout>
        {/* Configuration ID */}
        <div className="flex flex-col">
          <DynamicInput
            name="ID"
            type="number"
            value={configData.id}
            onChange={(e) => handleChange("id", e.target.value)}
            required
          />
        </div>

        {/* Configuration Name */}
        <div className="flex flex-col">
          <DynamicInput
            name="Name"
            type="string"
            value={configData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>

        {/* Configuration Value */}
        <div className="flex flex-col">
          <DynamicInput
            name="Value"
            type="string"
            value={configData.value}
            onChange={(e) => handleChange("value", e.target.value)}
          />
        </div>

        {/* Configuration Description */}
        <div className="flex flex-col">
          <CustomTextarea
            id="description"
            name="Description"
            value={configData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="توضیحات را وارد کنید..."
            rows={5}
            className={`${
              descriptionError ? "border-red-500" : "border-gray-300"
            }`}
          />
          {descriptionError && (
            <span className="text-red-500 text-sm">
              توضیحات باید حداقل 10 کاراکتر باشد.
            </span>
          )}
        </div>

        {/* Configuration Type (DynamicSelector) */}
        <div className="flex flex-col">
          <DynamicSelector
            options={selectorOptions}
            selectedValue={configData.type}
            onChange={(e) => handleChange("type", e.target.value)}
            label="Type" // حروف بزرگ برای سازگاری
            showButton={false}
          />
        </div>

        {/* می‌توانید فیلدهای اضافی دیگری اضافه کنید */}
      </TwoColumnLayout>
    </div>
  );
};

export default Configuration;
