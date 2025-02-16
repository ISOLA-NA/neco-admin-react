// src/components/ControllerForms/AdvanceTable.tsx
import React, { useEffect, useState } from "react";
import DynamicSelector from "../../utilities/DynamicSelector"; // مسیر را مطابق ساختار پروژه اصلاح کنید
import { useApi } from "../../../context/ApiContext"; // مسیر را مطابق ساختار پروژه اصلاح کنید

interface AdvanceTableProps {
  onMetaChange?: (data: any) => void;
  data?: any; // اطلاعات موجود در حالت ویرایش
}

const AdvanceTable: React.FC<AdvanceTableProps> = ({ onMetaChange, data }) => {
  const { getAllEntityType } = useApi();
  const [formOptions, setFormOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [isGalleryMode, setIsGalleryMode] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  // دریافت گزینه‌های فرم از API
  useEffect(() => {
    const fetchEntityTypes = async () => {
      try {
        const entityTypes = await getAllEntityType();
        // فرض می‌کنیم هر آیتم دارای فیلدهای ID و Name است
        const options = entityTypes.map((entity: any) => ({
          value: String(entity.ID),
          label: entity.Name || `Entity ${entity.ID}`,
        }));
        setFormOptions(options);
      } catch (error) {
        console.error("Error fetching entity types:", error);
      }
    };

    fetchEntityTypes();
  }, [getAllEntityType]);

  // تنظیم stateهای اولیه در حالت ویرایش تنها یک بار
  useEffect(() => {
    if (!initialized && data) {
      setSelectedForm(data.metaType1 || "");
      setIsGalleryMode(String(data.metaType2) === "1");
      setInitialized(true);
    }
  }, [data, initialized]);

  // ارسال تغییرات به کامپوننت پدر (مثلاً AddColumnForm)
  useEffect(() => {
    if (onMetaChange) {
      onMetaChange({
        metaType1: selectedForm,
        metaType2: isGalleryMode ? "1" : "0", // ارسال به صورت رشته
      });
    }
  }, [selectedForm, isGalleryMode, onMetaChange]);

  return (
    <div className="p-6 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg flex items-center justify-center">
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
    </div>
  );
};

export default AdvanceTable;
