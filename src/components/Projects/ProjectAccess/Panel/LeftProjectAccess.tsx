import React, { useState, useEffect, useMemo, ChangeEvent } from "react";
import DataTable from "../../../TableDynamic/DataTable";
import DynamicSelector from "../../../utilities/DynamicSelector";
import { useApi } from "../../../../context/ApiContext";
import { AccessProject, Role } from "../../../../services/api.services";

interface LeftProjectAccessProps {
  selectedRow: {
    ID: string;
    // ...
  };
  onDoubleClickSubItem: (data: AccessProject) => void;
}

interface ValueGetterParams {
  data: AccessProject;
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

  /**
   * ساخت map از نقش‌ها
   */
  const rolesMap = useMemo(() => {
    const map: Record<string, string> = {};
    roles.forEach((role) => {
      if (role.ID) {
        map[role.ID.trim().toLowerCase()] = role.Name;
      }
    });
    return map;
  }, [roles]);

  /**
   * فقط ردیف‌هایی که نقش معتبر دارند را نشان می‌دهیم
   */
  const filteredRowData = useMemo(() => {
    return leftRowData.filter((item) => {
      const key = item.nPostID?.trim().toLowerCase();
      return key && rolesMap[key];
    });
  }, [leftRowData, rolesMap]);

  /**
   * ستون‌های جدول
   */
  const leftColumnDefs = useMemo(
    () => [
      {
        headerName: "Name",
        valueGetter: (params: ValueGetterParams) => {
          const record = params.data;
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
      // سایر ستون‌ها در صورت نیاز...
    ],
    [rolesMap]
  );

  /**
   * واکشی پست‌های یک پروژه
   */
  useEffect(() => {
    const fetchPostsInProject = async () => {
      setIsLoadingPosts(true);
      setErrorPosts(null);
      try {
        if (selectedRow && selectedRow.ID) {
          const data = await api.getPostsinProject(selectedRow.ID);
          setLeftRowData(data);
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

  /**
   * واکشی نقش‌ها
   */
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoadingRoles(true);
      setErrorRoles(null);
      try {
        const roleData = await api.getAllRoles();
        setRoles(roleData);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setErrorRoles("Failed to load roles.");
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [api]);

  /**
   * کلیک روی سطر
   */
  const handleSubItemClick = (data: AccessProject) => {
    setSelectedSubItemRow(data);
  };

  /**
   * دوبار کلیک روی سطر (ارسال به سمت راست)
   */
  const handleSubItemDoubleClick = (data: AccessProject) => {
    setSelectedSubItemRow(data);
    onDoubleClickSubItem(data);
  };

  /**
   * تغییر در DynamicSelector
   */
  const handleSelectorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const selected = leftRowData.find((item) => item.ID === value) || null;
    setSelectedSubItemRow(selected);
  };

  /**
   * دکمه‌ی +
   * فقط یک آبجکت جدید (فیلدهای بولین = false) می‌سازیم و به سمت راست ارسال می‌کنیم
   * بدون تغییر در داده‌های جدول (leftRowData)
   */
  const handleAdd = () => {
    // -- اگر می‌خواهید صرفاً کلیدهای بولین را false کنید:
    //   1. از اولین ردیف جدول برای تشخیص کلیدهای بولین استفاده می‌کنیم
    //      (در صورت وجود نداشتن ردیف، با یک شیء خالی کار می‌کنیم)
    const sampleRow = leftRowData[0] || {};
    const newRow: Record<string, any> = {};

    //   2. برای هر فیلد بولین، مقدار false می‌گذاریم
    //      برای فیلدهای غیر بولین می‌توانید خالی بگذارید یا هر مقدار دیگری
    for (const [key, value] of Object.entries(sampleRow)) {
      if (typeof value === "boolean") {
        newRow[key] = false;
      } else {
        // اگر می‌خواهید مقدار قبلی حفظ شود، می‌توانید همان را کپی کنید
        // یا به صورت دلخواه خالی یا مقدار دیگری بگذارید
        newRow[key] = value;
      }
    }

    // یک شناسه‌ی موقت برای آبجکت می‌گذاریم (فقط جهت نمایش در سمت راست)
    newRow.ID = "TEMP_" + Date.now();

    // مثلا فیلدی مثل nPostID را خالی می‌گذاریم تا در جدول دیده نشود (No Match)
    // اما در هر صورت ما قصد نداریم این newRow را به جدول اضافه کنیم
    newRow.nPostID = "";

    // -- حالا این ردیف جدید را تنها به سمت راست (RightProjectAccess) ارسال می‌کنیم:
    onDoubleClickSubItem(newRow as AccessProject);
  };

  const isLoading = isLoadingPosts || isLoadingRoles;

  return (
    <div className="h-full p-4">
      {/* خطاها */}
      {errorPosts && <div className="error mb-4">{errorPosts}</div>}
      {errorRoles && <div className="error mb-4">{errorRoles}</div>}

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

      {isLoading && <div className="loading-indicator">در حال بارگذاری...</div>}

      <DataTable
        columnDefs={leftColumnDefs}
        rowData={filteredRowData}
        onRowDoubleClick={handleSubItemDoubleClick}
        setSelectedRowData={handleSubItemClick}
        onAdd={handleAdd} // <-- کلیک روی + این تابع را صدا می‌زند
        onEdit={() => {}}
        onDelete={() => {}}
        onDuplicate={() => {}}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LeftProjectAccess;
