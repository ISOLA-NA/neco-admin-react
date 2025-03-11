import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import DynamicModal from "../../../utilities/DynamicModal";
import RolePickerTabs from "./RolePickerTabs"; 
import TableSelector from "../../../General/Configuration/TableSelector";
import { useApi } from "../../../../context/ApiContext";

/**
 * ساختار آیتم انتخاب‌شده در لیست
 */
export interface SelectedItem {
  id: string;
  name: string;
}

/**
 * پراپ‌های کامپوننت PostPickerList
 */
interface PostPickerListProps {
  /**
   * تعیین می‌کند که منبع داده جهت انتخاب، نقش‌ها (roles) باشد یا پروژه‌ها (projects).
   * اگر ست نشود، پیش‌فرض روی "roles" در نظر گرفته می‌شود.
   */
  sourceType?: "roles" | "projects";

  /**
   * رشتهٔ اولیه‌ی آیتم‌های انتخاب‌شده، مثلاً "4|5|6".
   * اگر خالی باشد، سعی می‌کنیم از data?.[metaFieldKey] بخوانیم.
   */
  initialMetaType?: string;

  /**
   * اگر در حالت ادیت هستید و یک آبجکت data دارید که داخل آن metaFieldKey مثلاً "metaType1" یا "metaType5" موجود است،
   * می‌توانید اینجا پاس بدهید تا در ابتدا آن را بخوانیم.
   */
  data?: {
    [key: string]: string | undefined;
  };

  /**
   * تعیین کلید متایی که قرار است موقع فراخوانی onMetaChange در آن قرار دهیم.
   * مثلاً "metaType1" یا "metaType5".
   * پیش‌فرض: "metaType1"
   */
  metaFieldKey?: string;

  /**
   * آیا کامپوننت به صورت تمام‌عرض (fullWidth) رندر شود یا نه؟
   */
  fullWidth?: boolean;

  /**
   * تابعی که هر بار انتخاب‌های ما تغییر می‌کند، فراخوانی می‌شود.
   * خروجی آن یک شیء حاوی کلید [metaFieldKey] = مقدار جداشده با "|"
   */
  onMetaChange?: (metaUpdated: { [key: string]: string }) => void;

  /**
   * برچسبی که بالای لیست انتخاب‌شده نشان داده می‌شود.
   * اگر دوست دارید این متن را سفارشی کنید.
   */
  label?: string;

  /**
   * متنی که اگر لیست خالی باشد، نمایش می‌دهیم (optional).
   */
  emptyText?: string;
}

/**
 * کامپوننتی واحد برای انتخاب نقش‌ها یا پروژه‌ها (با توجه به sourceType).
 */
const PostPickerList: React.FC<PostPickerListProps> = ({
  sourceType = "roles",
  initialMetaType = "",
  data,
  metaFieldKey = "metaType1",
  fullWidth = false,
  onMetaChange,
  label = "Default Value(s)",
  emptyText = "No default values selected",
}) => {
  const api = useApi();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(false);

  // دیتای پروژه‌ها یا نقش‌ها
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [rolesData, setRolesData] = useState<any[]>([]);

  /**
   * در ابتدا، بر اساس اولویت زیر سعی می‌کنیم مقدار اولیه را بخوانیم:
   * 1) اگر initialMetaType ست شده بود، همان.
   * 2) اگر در data، فیلد metaFieldKey (مثلاً metaType5) چیزی داشت، آن را می‌گیریم.
   */
  const metaInit: string = initialMetaType.trim()
    ? initialMetaType
    : (data?.[metaFieldKey] || "").trim();

  /**
   * در این useEffect، لیست اولیه را بارگذاری می‌کنیم و
   * سپس آیتم‌های انتخاب‌شده را هم می‌چینیم.
   */
  useEffect(() => {
    setIsLoadingInitial(true);

    // تابعی که آرایه‌ای از IDها را به SelectedItem[] تبدیل می‌کند
    // بستگی به sourceType دارد.
    const loadInitialItems = async (ids: string[]) => {
      try {
        if (sourceType === "projects") {
          // فراخوانی پروژه‌ها:
          const projects = await api.getAllProject();
          setProjectsData(projects);

          // فیلتر پروژه‌هایی که آیدی‌شان در ids باشد
          const initialSelected: SelectedItem[] = projects
            .filter((prj: any) => ids.includes(String(prj.ID)))
            .map((prj: any) => ({
              id: String(prj.ID),
              name: prj.ProjectName,
            }));

          setSelectedItems(initialSelected);
        } else {
          // حالا فرض بر این است که sourceType="roles"
          const roles = await api.getAllRoles();
          setRolesData(roles);

          const initialSelected: SelectedItem[] = roles
            .filter((r: any) => ids.includes(String(r.ID)))
            .map((r: any) => ({
              id: String(r.ID),
              name: r.Name, // یا فیلد مناسب برای نقش
            }));

          setSelectedItems(initialSelected);
        }
      } catch (error) {
        console.error("Error loading initial items:", error);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    // اگر metaInit خالی نبود
    if (metaInit) {
      const idsArr = metaInit.split("|").filter(Boolean);
      loadInitialItems(idsArr);
    } else {
      // حتی اگر metaInit خالی باشد، باز هم لیست منبع را بارگیری می‌کنیم
      (async () => {
        try {
          if (sourceType === "projects") {
            const projects = await api.getAllProject();
            setProjectsData(projects);
          } else {
            const roles = await api.getAllRoles();
            setRolesData(roles);
          }
        } catch (err) {
          console.error("Error loading source data:", err);
        } finally {
          setIsLoadingInitial(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceType]);

  /**
   * هر بار که آرایه‌ی selectedItems تغییر کند، اگر onMetaChange باشد، آن را فراخوانی می‌کنیم.
   * استرینگ را با "|" می‌سازیم.
   */
  useEffect(() => {
    if (onMetaChange) {
      const joined = selectedItems.map((item) => item.id).join("|");
      onMetaChange({ [metaFieldKey]: joined });
    }
  }, [selectedItems, onMetaChange, metaFieldKey]);

  /**
   * کلیک روی دکمهٔ بازکردن مودال
   */
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  /**
   * وقتی کاربر در مودال چیزی انتخاب می‌کند:
   * - اگر sourceType="projects"، از TableSelector استفاده کرده‌ایم.
   * - اگر sourceType="roles"، از RolePickerTabs استفاده کرده‌ایم.
   * تابع زیر را صدا می‌زنیم تا لیست به‌روز شود.
   */
  const handleAddSelectedItems = useCallback(
    (newlySelected: SelectedItem[]) => {
      setSelectedItems((prev) => {
        // جلوی تکراری‌ها را بگیریم
        const unique = newlySelected.filter(
          (item) => !prev.some((p) => p.id === item.id)
        );
        return [...prev, ...unique];
      });
      setIsModalOpen(false);
    },
    []
  );

  /**
   * حذف یک آیتم از لیست انتخاب‌شده
   */
  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  /**
   * محتوای مودال را بر اساس sourceType تعیین می‌کنیم
   */
  const renderModalContent = () => {
    if (sourceType === "projects") {
      // نمایش TableSelector پروژه‌ها
      return (
        <div className="p-4 min-h-[400px] min-w-[600px]">
          <TableSelector
            columnDefs={[{ headerName: "Project Name", field: "ProjectName" }]}
            rowData={projectsData}
            onRowClick={() => {}}
            onRowDoubleClick={(row: any) => {
              if (row && row.ID) {
                const newItem: SelectedItem = {
                  id: String(row.ID),
                  name: row.ProjectName,
                };
                handleAddSelectedItems([newItem]);
              }
            }}
            onSelectButtonClick={(row: any) => {
              if (row && row.ID) {
                const newItem: SelectedItem = {
                  id: String(row.ID),
                  name: row.ProjectName,
                };
                handleAddSelectedItems([newItem]);
              }
            }}
            isSelectDisabled={false}
          />
        </div>
      );
    } else {
      // نمایش RolePickerTabs
      return (
        <div className="p-4 min-h-[400px] min-w-[600px]">
          <RolePickerTabs
            onSelect={(selected: SelectedItem[]) => handleAddSelectedItems(selected)}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      );
    }
  };

  return (
    <div
      className="p-4 bg-white rounded-lg border border-gray-300 relative"
      style={{ minHeight: "120px", width: fullWidth ? "100%" : "auto" }}
    >
      <div className="flex items-center justify-between mb-2">
        <label className="text-gray-700 text-sm font-semibold">
          {label}
        </label>
        <button
          type="button"
          onClick={handleOpenModal}
          className="bg-indigo-500 text-white px-2 py-1 rounded-md hover:bg-indigo-600 flex items-center"
        >
          <FaPlus className="mr-1" />
          Add
        </button>
      </div>

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
          <p className="text-gray-500">{emptyText}</p>
        )}
      </div>

      <DynamicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {renderModalContent()}
      </DynamicModal>
    </div>
  );
};

export default PostPickerList;
