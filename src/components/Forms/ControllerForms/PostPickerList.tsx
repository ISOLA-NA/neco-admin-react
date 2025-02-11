// src/components/General/Configuration/PostPickerList.tsx

import React, { useState, useEffect } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import DynamicModal from "../../utilities/DynamicModal";
import TableSelector from "../../General/Configuration/TableSelector";
import { useApi } from "../../../context/ApiContext";

interface PostPickerListProps {
  // آرایه‌ای از ProjectName‌هایی که انتخاب شده‌اند و باید نمایش داده شوند
  defaultValues: string[];
  // تابعی برای اضافه کردن یک Project ID به والد
  onAddID: (value: string) => void;
  // تابعی برای حذف یک مقدار از لیست والد
  onRemoveIndex: (index: number) => void;
  // اگر نیاز به استایل سفارشی دارید
  fullWidth?: boolean;
}

const PostPickerList: React.FC<PostPickerListProps> = ({
  defaultValues,
  onAddID,
  onRemoveIndex,
  fullWidth = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  // از APIContext متد getAllProject را می‌گیریم
  const { getAllProject } = useApi();

  // لیست پروژه‌ها برای نمایش در جدول مودال
  const [projectList, setProjectList] = useState<any[]>([]);

  // زمانی که مودال باز می‌شود => فراخوانی getAllProject
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getAllProject();
        setProjectList(data || []);
      } catch (error) {
        console.error("Error fetching project list:", error);
      }
    };

    if (isModalOpen) {
      fetchProjects();
    }
  }, [isModalOpen, getAllProject]);

  // افزودن پروژهٔ انتخاب‌شده به لیست والد (با استفاده از ID)
  const handleSelect = () => {
    if (selectedRow && selectedRow.ID) {
      onAddID(selectedRow.ID);
    }
    setSelectedRow(null);
    setIsModalOpen(false);
  };

  return (
    <div
      className="p-4 bg-white rounded-lg border border-gray-300 relative"
      style={{ minHeight: "120px", width: fullWidth ? "100%" : "auto" }}
    >
      {/* ردیف عنوان و دکمه ADD */}
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

      {/* بخش نمایش مقادیر انتخاب شده */}
      <div className="overflow-y-auto max-h-32 border border-gray-200 p-2 rounded">
        <div className="flex flex-wrap gap-2">
          {defaultValues.map((val, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-100 px-3 py-1 rounded-md"
            >
              <span>{val}</span>
              <button
                type="button"
                onClick={() => onRemoveIndex(index)}
                className="text-red-500 ml-2 hover:text-red-700"
              >
                <FaTimes size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* مودال انتخاب از جدول پروژه‌ها */}
      <DynamicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TableSelector
          columnDefs={[
            { headerName: "Project Name", field: "ProjectName" },
            // اگر ستون دیگری نیاز دارید، اینجا اضافه کنید
          ]}
          rowData={projectList}
          // اگر روی ردیفی دابل کلیک شد، Project ID به والد ارسال شود
          onRowDoubleClick={(row) => {
            if (row?.ID) {
              onAddID(row.ID);
            }
            setIsModalOpen(false);
          }}
          // وقتی سطری را انتخاب می‌کنید
          onRowClick={(row) => setSelectedRow(row)}
          // وقتی دکمه Select را می‌زنید
          onSelectButtonClick={handleSelect}
          isSelectDisabled={!selectedRow}
        />
      </DynamicModal>
    </div>
  );
};

export default PostPickerList;
