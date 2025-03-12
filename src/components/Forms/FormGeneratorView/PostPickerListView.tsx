import React, { useState, useEffect } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import DynamicModal from "../../utilities/DynamicModal";
import RolePickerTabs from "../ControllerForms/PostPickerList/RolePickerTabs"; // مسیر را مطابق پروژه تنظیم کنید
import { useApi } from "../../../context/ApiContext";
import { SelectedItem } from "../ControllerForms/PostPickerList/MembersTable";

interface PostPickerListViewProps {
  data?: {
    metaType1?: string;
    DisplayName?: string;
  };
  fullWidth?: boolean;
  onMetaChange?: (meta: { metaType1: string }) => void;
}

const PostPickerListView: React.FC<PostPickerListViewProps> = ({
  data,
  fullWidth = false,
  onMetaChange,
}) => {
  const api = useApi();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(false);

  // مقدار اولیه metaType از data.metaType1
  const initMeta = data?.metaType1 || "";

  // لاگ گرفتن از data?.DisplayName
  useEffect(() => {
    console.log("DisplayName prop in PostPickerListView:", data?.DisplayName);
  }, [data?.DisplayName]);

  // بارگذاری آیتم‌های اولیه (در حالت ویرایش) بر اساس initMeta
  useEffect(() => {
    if (initMeta) {
      const ids = initMeta.split("|").filter(Boolean);
      const loadInitial = async () => {
        setIsLoadingInitial(true);
        try {
          const rolesData = await api.getAllRoles();
          const initialItems: SelectedItem[] = rolesData
            .filter((role: any) => ids.includes(String(role.ID)))
            .map((role: any) => ({
              id: String(role.ID),
              name: role.Name,
            }));
          setSelectedItems(initialItems);
        } catch (error) {
          console.error("Error loading initial metaType:", error);
        } finally {
          setIsLoadingInitial(false);
        }
      };
      loadInitial();
    }
  }, [initMeta, api]);

  // به‌روزرسانی metaType (رشته pipe-separated) به والد
  useEffect(() => {
    const metaType = selectedItems.map((item) => item.id).join("|");
    if (onMetaChange) {
      onMetaChange({ metaType1: metaType });
    }
  }, [selectedItems, onMetaChange]);

  // هندلر دریافت آیتم‌های انتخاب‌شده از RolePickerTabs
  const handleSelectRole = (selected: SelectedItem[]) => {
    setSelectedItems((prev) => {
      const newItems = selected.filter(
        (item) => !prev.some((p) => p.id === item.id)
      );
      return [...prev, ...newItems];
    });
    setIsModalOpen(false);
  };

  // حذف یک آیتم از لیست انتخاب‌شده
  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div
      className="p-4 bg-white rounded-lg border border-gray-300 relative"
      style={{ minHeight: "120px", width: fullWidth ? "100%" : "auto" }}
    >
      {/* بخش بالایی: عنوان (DisplayName از data) و دکمه Add */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-gray-700 text-sm font-semibold">
          {data?.DisplayName ? data.DisplayName : "Default Value(s)"}
        </label>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-500 text-white px-2 py-1 rounded-md hover:bg-indigo-600 flex items-center"
          title="Add"
        >
          <FaPlus className="mr-1" />
          Add
        </button>
      </div>

      {/* نمایش آیتم‌های انتخاب‌شده */}
      <div className="overflow-y-auto max-h-32 border border-gray-200 p-2 rounded">
        {isLoadingInitial ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-gray-500">Loading...</span>
          </div>
        ) : selectedItems.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center bg-gray-100 px-3 py-1 rounded-md"
              >
                <span className="text-sm">{item.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 ml-2 hover:text-red-700"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No default values selected</p>
        )}
      </div>

      {/* مودال نمایش RolePickerTabs */}
      <DynamicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4 min-h-[400px] min-w-[600px]">
          <RolePickerTabs
            onSelect={handleSelectRole}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      </DynamicModal>
    </div>
  );
};

export default PostPickerListView;
