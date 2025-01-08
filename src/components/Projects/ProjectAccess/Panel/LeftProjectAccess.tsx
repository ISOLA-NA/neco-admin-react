import React, { useState, useEffect, useMemo, ChangeEvent } from "react";
import DataTable from "../../../TableDynamic/DataTable";
import DynamicSelector from "../../../utilities/DynamicSelector";
import { useApi } from "../../../../context/ApiContext";
import { AccessProject, Role } from "../../../../services/api.services";

// تعریف اینترفیس‌ها برای بهبود ایمنی نوع
interface LeftProjectAccessProps {
  selectedRow: {
    ID: string;
    // سایر فیلدهای مرتبط
  };
  onDoubleClickSubItem: (data: AccessProject) => void;
}

interface ValueGetterParams {
  data: AccessProject;
  // سایر فیلدهای مرتبط در صورت نیاز
}

const LeftProjectAccess: React.FC<LeftProjectAccessProps> = ({
  selectedRow,
  onDoubleClickSubItem,
}) => {
  const api = useApi();

  const [leftRowData, setLeftRowData] = useState<AccessProject[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedSubItemRow, setSelectedSubItemRow] =
    useState<AccessProject | null>(null);

  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(false);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);
  const [errorRoles, setErrorRoles] = useState<string | null>(null);

  // ایجاد یک Map برای نقش‌ها برای جستجوی سریع‌تر
  const rolesMap = useMemo(() => {
    const map: Record<string, string> = {};
    roles.forEach((role) => {
      if (role.ID) {
        map[role.ID.trim().toLowerCase()] = role.Name;
      }
    });
    return map;
  }, [roles]);

  // فیلتر کردن داده‌ها برای حذف ردیف‌های "No Match"
  const filteredRowData = useMemo(() => {
    return leftRowData.filter((item) => {
      const key = item.nPostID?.trim().toLowerCase();
      return key && rolesMap[key];
    });
  }, [leftRowData, rolesMap]);

  // تعریف ستون‌ها با استفاده از useMemo برای بهینه‌سازی
  const leftColumnDefs = useMemo(
    () => [
      {
        headerName: "Name",
        valueGetter: (params: ValueGetterParams) => {
          const record: AccessProject = params.data;
          if (!record.nPostID) {
            return "(No Match)";
          }

          const key = record.nPostID.trim().toLowerCase();
          const roleName = rolesMap[key];

          return roleName || "(No Match)";
        },
        filter: "agTextColumnFilter",
      },
      {
        headerName: "AccessMode",
        field: "AccessMode",
        filter: "agNumberColumnFilter",
      },
      // افزودن ستون‌های دیگر در صورت نیاز
    ],
    [rolesMap]
  );

  // دریافت پست‌های مرتبط با پروژه انتخاب شده
  useEffect(() => {
    const fetchPostsInProject = async () => {
      setIsLoadingPosts(true);
      setErrorPosts(null);
      try {
        if (selectedRow && selectedRow.ID) {
          const data = await api.getPostsinProject(selectedRow.ID);
          setLeftRowData(data);
          console.log("Fetched Posts:", data);
        } else {
          setLeftRowData([]);
        }
      } catch (error) {
        console.error("Error fetching posts in project:", error);
        setErrorPosts("Failed to load posts.");
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPostsInProject();
  }, [selectedRow, api]);

  // دریافت تمامی نقش‌ها
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoadingRoles(true);
      setErrorRoles(null);
      try {
        const roleData = await api.getAllRoles();
        setRoles(roleData);
        console.log("Fetched Roles:", roleData);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setErrorRoles("Failed to load roles.");
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [api]);

  // مدیریت کلیک روی سطر
  const handleSubItemClick = (data: AccessProject) => {
    setSelectedSubItemRow(data);
  };

  // مدیریت دوبار کلیک روی سطر
  const handleSubItemDoubleClick = (data: AccessProject) => {
    setSelectedSubItemRow(data);
    onDoubleClickSubItem(data);
  };

  // مدیریت تغییر انتخاب در DynamicSelector
  const handleSelectorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const selected = leftRowData.find((item) => item.ID === value) || null;
    setSelectedSubItemRow(selected);
  };

  // ترکیب وضعیت بارگذاری
  const isLoading = isLoadingPosts || isLoadingRoles;

  return (
    <div className="h-full p-4">
      {/* نمایش پیام‌های خطا در صورت وجود */}
      {errorPosts && <div className="error mb-4">{errorPosts}</div>}
      {errorRoles && <div className="error mb-4">{errorRoles}</div>}

      {/* DynamicSelector با مدیریت تغییر صحیح */}
      <DynamicSelector
        label="جستجو"
        options={filteredRowData.map((item) => ({
          value: item.ID,
          label: item.PostName || "NoName",
        }))}
        selectedValue={selectedSubItemRow ? selectedSubItemRow.ID : ""}
        onChange={handleSelectorChange}
        className="w-full mb-8"
        error={false}
      />

      {/* نمایش نشانگر بارگذاری */}
      {isLoading && <div className="loading-indicator">در حال بارگذاری...</div>}

      {/* جدول اصلی */}
      <DataTable
        columnDefs={leftColumnDefs}
        rowData={filteredRowData}
        onRowDoubleClick={handleSubItemDoubleClick}
        setSelectedRowData={handleSubItemClick}
        // خالی گذاشتن هندلرهای CRUD
        onAdd={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onDuplicate={() => {}}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LeftProjectAccess;
