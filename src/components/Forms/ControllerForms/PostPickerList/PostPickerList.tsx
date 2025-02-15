// PostPickerList.tsx
import React, { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import DynamicModal from "../../../utilities/DynamicModal";
import MembersTable from "./MembersTable"; // مسیر را مطابق پروژه خود تنظیم کنید

interface PostPickerListProps {
  // به عنوان مقدار اولیه می‌توان از این prop استفاده کرد
  initialValues?: string[];
  fullWidth?: boolean;
}

const PostPickerList: React.FC<PostPickerListProps> = ({
  initialValues = [],
  fullWidth = false,
}) => {
  // نگهداری مقادیر انتخاب شده در state داخلی
  const [defaultValues, setDefaultValues] = useState<string[]>(initialValues);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // اضافه کردن نقش انتخاب شده (اگر قبلاً وجود ندارد)
  const handleSelectRole = (roleName: string) => {
    setDefaultValues((prevValues) => {
      if (!prevValues.includes(roleName)) {
        return [...prevValues, roleName];
      }
      return prevValues;
    });
    setIsModalOpen(false);
  };

  // حذف یک مقدار از لیست
  const handleRemoveIndex = (index: number) => {
    setDefaultValues((prevValues) =>
      prevValues.filter((_, i) => i !== index)
    );
  };

  return (
    <div
      className="p-4 bg-white rounded-lg border border-gray-300 relative"
      style={{ minHeight: "120px", width: fullWidth ? "100%" : "auto" }}
    >
      {/* بخش عنوان و دکمه Add */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-gray-700 text-sm font-semibold">
          Default Value(s)
        </label>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-500 text-white px-2 py-1 rounded-md hover:bg-indigo-600 flex items-center"
        >
          <FaPlus className="mr-1" />
          Add
        </button>
      </div>

      {/* نمایش آیتم‌های انتخاب شده */}
      <div className="overflow-y-auto max-h-32 border border-gray-200 p-2 rounded">
        <div className="flex flex-wrap gap-2">
          {defaultValues.length > 0 ? (
            defaultValues.map((val, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-100 px-3 py-1 rounded-md"
              >
                <span>{val}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveIndex(index)}
                  className="text-red-500 ml-2 hover:text-red-700"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No default values selected</p>
          )}
        </div>
      </div>

      {/* مودال نمایش جدول MembersTable */}
      <DynamicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="p-4 min-h-[400px] min-w-[600px]">
          <MembersTable
            onSelect={handleSelectRole}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      </DynamicModal>
    </div>
  );
};

export default PostPickerList;
