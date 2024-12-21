import React, { useState } from "react";
import DynamicSelector from "../../utilities/DynamicSelector"; // مسیر فایل DynamicSelector را اصلاح کنید

const AdvanceTable: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState("");
  const [isGalleryMode, setIsGalleryMode] = useState(false);

  const formOptions = [
    { value: "form1", label: "Form 1" },
    { value: "form2", label: "Form 2" },
    { value: "form3", label: "Form 3" },
  ];

  return (
    <div className="flex flex-col gap-4 w-64">
      {/* منوی انتخاب فرم */}
      <DynamicSelector
        name="Show Form"
        options={formOptions}
        selectedValue={selectedForm}
        onChange={(e) => setSelectedForm(e.target.value)}
        label="Show Form"
      />

      {/* چک‌باکس حالت گالری */}
      <div className="flex items-center space-x-2">
        <input
          id="galleryMode"
          type="checkbox"
          checked={isGalleryMode}
          onChange={(e) => setIsGalleryMode(e.target.checked)}
          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
        <label htmlFor="galleryMode" className="text-gray-700">
          Gallery mode
        </label>
      </div>
    </div>
  );
};

export default AdvanceTable;
