import React, { useState, useEffect } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import DynamicModal from "../../../utilities/DynamicModal";
import RolePickerTabs from "./RolePickerTabs"; // برای حالت roles
import { useApi } from "../../../../context/ApiContext";
import TableSelector from "../../../General/Configuration/TableSelector"; // برای حالت projects

export interface SelectedItem {
  id: string;
  name: string;
}

interface PostPickerListProps {
  defaultValues?: string[]; // لیست نام‌های پیش‌فرض
  onAddID?: (id: string) => void;
  onRemoveIndex?: (index: number) => void;
  fullWidth?: boolean;
  sourceType?: "roles" | "projects";
}

const PostPickerList: React.FC<PostPickerListProps> = ({
  defaultValues = [],
  onAddID,
  onRemoveIndex,
  fullWidth = false,
  sourceType = "roles",
}) => {
  const api = useApi();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(false);

  // در حالت "projects" داده‌های پروژه را ذخیره می‌کنیم
  const [projectsData, setProjectsData] = useState<any[]>([]);

  // بارگذاری اولیه – اگر defaultValues وجود داشته باشد
  useEffect(() => {
    // اگر حالت roles است، فرض می‌کنیم defaultValues شامل نام‌های انتخاب شده است.
    const initial = defaultValues.map((name, index) => ({
      id: String(index),
      name,
    }));
    setSelectedItems(initial);
  }, [defaultValues]);

  // اگر sourceType برابر "projects" باشد، داده‌های پروژه را لود می‌کنیم
  useEffect(() => {
    if (sourceType === "projects") {
      (async () => {
        try {
          const projects = await api.getAllProject();
          setProjectsData(projects);
        } catch (error) {
          console.error("Error loading projects:", error);
        }
      })();
    }
  }, [api, sourceType]);

  // در حالت roles از تب‌های انتخاب استفاده می‌شود
  const handleSelectRole = (selected: SelectedItem[]) => {
    setSelectedItems((prev) => {
      const newItems = selected.filter(
        (item) => !prev.some((p) => p.id === item.id)
      );
      return [...prev, ...newItems];
    });
    setIsModalOpen(false);
    // ارسال آیدی به والد در صورت وجود
    selected.forEach((item) => onAddID && onAddID(item.id));
  };

  // در حالت projects: وقتی یک پروژه انتخاب شد
  const handleSelectProject = (rowData: any) => {
    if (rowData && rowData.ID && rowData.ProjectName) {
      const newItem: SelectedItem = {
        id: String(rowData.ID),
        name: rowData.ProjectName,
      };
      setSelectedItems([newItem]);
      setIsModalOpen(false);
      onAddID && onAddID(newItem.id);
    }
  };

  const handleRemoveItem = (id: string, index: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
    onRemoveIndex && onRemoveIndex(index);
  };

  // تعیین محتوای مودال بر اساس sourceType
  let modalContent = null;
  if (sourceType === "roles") {
    modalContent = (
      <div className="p-4 min-h-[400px] min-w-[600px]">
        <RolePickerTabs
          onSelect={handleSelectRole}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    );
  } else if (sourceType === "projects") {
    modalContent = (
      <div className="p-4 min-h-[400px] min-w-[600px]">
        <TableSelector
          columnDefs={[{ headerName: "Project Name", field: "ProjectName" }]}
          rowData={projectsData}
          onRowDoubleClick={handleSelectProject}
          onRowClick={() => {}}
          onSelectButtonClick={handleSelectProject}
          isSelectDisabled={false}
        />
      </div>
    );
  }

  return (
    <div
      className="p-4 bg-white rounded-lg border border-gray-300 relative"
      style={{ minHeight: "120px", width: fullWidth ? "100%" : "auto" }}
    >
      {/* عنوان و دکمه Add */}
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

      {/* بخش نمایش آیتم‌های انتخاب‌شده */}
      <div className="overflow-y-auto max-h-32 border border-gray-200 p-2 rounded">
        {isLoadingInitial ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-gray-500">Loading...</span>
          </div>
        ) : selectedItems.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center bg-gray-100 px-3 py-1 rounded-md"
              >
                <span>{item.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id, index)}
                  className="text-red-500 ml-2 hover:text-red-700"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No default values selected</p>
        )}
      </div>

      {/* مودال انتخاب */}
      <DynamicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        {modalContent}
      </DynamicModal>
    </div>
  );
};

export default PostPickerList;
