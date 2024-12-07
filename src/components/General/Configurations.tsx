// src/components/General/Configurations.tsx

import React, { useState } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import CustomTextarea from "../utilities/DynamicTextArea"; // وارد کردن کامپوننت جدید

const Configurations: React.FC = () => {
  // وضعیت مدیریت شده برای فیلد Description
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState(false);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
    // مثال ساده‌ای از اعتبارسنجی: اگر توضیحات کمتر از 10 کاراکتر باشند، خطا نمایش داده شود
    if (e.target.value.length < 10) {
      setDescriptionError(true);
    } else {
      setDescriptionError(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Configurations
      </h2>
      <TwoColumnLayout>
        {/* Configuration ID */}
        <div className="flex flex-col">
          <label
            htmlFor="configId"
            className="mb-3 text-sm font-medium text-gray-700"
          >
            Configuration ID
          </label>
          <input
            type="number"
            id="configId"
            name="configId"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter configuration ID"
          />
        </div>

        {/* Configuration Name */}
        <div className="flex flex-col">
          <label
            htmlFor="configName"
            className="mb-3 text-sm font-medium text-gray-700"
          >
            Configuration Name
          </label>
          <input
            type="text"
            id="configName"
            name="configName"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter configuration name"
          />
        </div>

        {/* Configuration Value */}
        <div className="flex flex-col">
          <label
            htmlFor="configValue"
            className="mb-3 text-sm font-medium text-gray-700"
          >
            Configuration Value
          </label>
          <input
            type="text"
            id="configValue"
            name="configValue"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter configuration value"
          />
        </div>

        {/* Configuration Type */}
        <div className="flex flex-col">
          <label
            htmlFor="configType"
            className="mb-3 text-sm font-medium text-gray-700"
          >
            Configuration Type
          </label>
          <select
            id="configType"
            name="configType"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select type</option>
            <option value="typeA">Type A</option>
            <option value="typeB">Type B</option>
            <option value="typeC">Type C</option>
          </select>
        </div>

        {/* Description */}
        <div className="flex flex-col md:col-span-2">
          <label
            htmlFor="configDescription"
            className="mb-3 text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <CustomTextarea
            id="configDescription"
            name="configDescription"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter description"
            rows={5}
            className="resize"
          />
          {descriptionError && (
            <span className="text-red-500 text-sm mt-1">
              Description must be at least 10 characters.
            </span>
          )}
        </div>

        {/* Additional Input Groups as Needed */}
      </TwoColumnLayout>
    </div>
  );
};

export default Configurations;
