// PostPickerList.tsx
import React, { useState, useEffect } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import DynamicModal from "../../../utilities/DynamicModal";
import RolePickerTabs from "./RolePickerTabs"; // مسیر را مطابق پروژه تنظیم کنید
import { useApi } from "../../../../context/ApiContext";
import { SelectedItem } from "./MembersTable";

interface PostPickerListProps {
  initialMetaType?: string; // به عنوان مثال "4|5|6"
  data?: { metaType1?: string };
  fullWidth?: boolean;
  onMetaChange?: (meta: { metaType1: string }) => void;
}

const PostPickerList: React.FC<PostPickerListProps> = ({
  initialMetaType = "",
  data,
  fullWidth = false,
  onMetaChange,
}) => {
  const api = useApi();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(false);

  // تعیین مقدار اولیه از initialMetaType یا data.metaType1 (در حالت ویرایش)
  const initMeta = initialMetaType || data?.metaType1 || "";

  // بارگذاری آیتم‌های اولیه در حالت ویرایش
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

  // دریافت آیتم‌های انتخاب شده از تب‌های RolePickerTabs
  const handleSelectRole = (selected: SelectedItem[]) => {
    setSelectedItems((prev) => {
      const newItems = selected.filter(
        (item) => !prev.some((p) => p.id === item.id)
      );
      return [...prev, ...newItems];
    });
    setIsModalOpen(false);
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ساخت metaType به صورت رشته‌ای از آیدی‌ها با جداکننده "|"
  const metaType = selectedItems.map((item) => item.id).join("|");

  // ارسال metaType به والد (مثلاً کنترلر Lookup) از طریق onMetaChange
  useEffect(() => {
    if (onMetaChange) {
      onMetaChange({ metaType1: metaType });
    }
  }, [metaType, onMetaChange]);

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
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center bg-gray-100 px-3 py-1 rounded-md"
              >
                <span>{item.name}</span>
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
          <p className="text-gray-500">No default values selected</p>
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

export default PostPickerList;
