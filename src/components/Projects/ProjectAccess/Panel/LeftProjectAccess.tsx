// src/components/ProjectsAccess/Panel/LeftProjectAccess.tsx

import React, { useState, useEffect, useMemo, ChangeEvent } from "react";
import DataTable from "../../../TableDynamic/DataTable";
import DynamicSelector from "../../../utilities/DynamicSelector";
import { useApi } from "../../../../context/ApiContext";
import { AccessProject, Role } from "../../../../services/api.services";
import { showAlert } from "../../../utilities/Alert/DynamicAlert";

interface LeftProjectAccessProps {
  selectedRow: {
    ID: string;
    // سایر فیلدها...
  };
  onDoubleClickSubItem: (data: AccessProject) => void;
  onAddFromLeft?: () => void;
  onEditFromLeft?: () => void;
}

interface ValueGetterParams {
  data: AccessProject;
}

const LeftProjectAccess: React.FC<LeftProjectAccessProps> = ({
  selectedRow,
  onDoubleClickSubItem,
  onAddFromLeft,
  onEditFromLeft,
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

  // ساخت map از نقش‌ها
  const rolesMap = useMemo(() => {
    const map: Record<string, string> = {};
    roles.forEach((role) => {
      if (role.ID) {
        map[role.ID.trim().toLowerCase()] = role.Name;
      }
    });
    return map;
  }, [roles]);

  // فیلتر کردن داده‌ها فقط برای نقش‌های معتبر
  const filteredRowData = useMemo(() => {
    return leftRowData.filter((item) => {
      const key = item.nPostID?.trim().toLowerCase();
      return key && rolesMap[key];
    });
  }, [leftRowData, rolesMap]);

  // ستون‌های جدول
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
      // سایر ستون‌ها...
    ],
    [rolesMap]
  );

  // واکشی پست‌های پروژه
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

  // واکشی نقش‌ها
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

  // کلیک روی سطر
  const handleSubItemClick = (data: AccessProject) => {
    setSelectedSubItemRow(data);
  };

  // دوبار کلیک روی سطر
  const handleSubItemDoubleClick = (data: AccessProject) => {
    setSelectedSubItemRow(data);
    onDoubleClickSubItem(data);
    // فراخوانی متد ویرایش (در والد)
    if (onEditFromLeft) {
      onEditFromLeft();
    }
  };

  // دکمه‌ی + (Add)
  const handleAdd = () => {
    // ساخت یک رکورد جدید با ID موقت
    const newRow: AccessProject = {
      ID: "TEMP_" + Date.now(), // ID موقت
      nPostID: "",
      nProjectID: selectedRow ? selectedRow.ID : "",
      AccessMode: 0,
      AllowToDownloadGroup: false,
      AlowToAllTask: false,
      AlowToEditRequest: false,
      AlowToWordPrint: false,
      CreateAlert: false,
      CreateIssue: false,
      CreateKnowledge: false,
      CreateLetter: false,
      CreateMeeting: false,
      IsVisible: false,
      LastModified: "",
      PostName: null,
      Show_Approval: false,
      Show_Assignment: false,
      Show_CheckList: false,
      Show_Comment: false,
      Show_Lessons: false,
      Show_Logs: false,
      Show_Procedure: false,
      Show_Related: false,
    };

    onDoubleClickSubItem(newRow);

    // اگر والد هم نیاز دارد بداند Add شده است
    if (onAddFromLeft) {
      onAddFromLeft();
    }
  };

  // دکمه‌ی Edit
  const handleEdit = () => {
    if (selectedSubItemRow) {
      onDoubleClickSubItem(selectedSubItemRow);

      if (onEditFromLeft) {
        onEditFromLeft();
      }
    } else {
      showAlert("warning", null, "Warning", "Please select a row to edit.");
    }
  };

  // تغییر در selector
  const handleSelectorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const selected = leftRowData.find((item) => item.ID === value) || null;
    setSelectedSubItemRow(selected);
  };

  const isLoading = isLoadingPosts || isLoadingRoles;

  return (
    <div className="h-full p-4">
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
        showDuplicateIcon={false}
        showEditIcon={true}
        showAddIcon={true}
        showDeleteIcon={false}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={() => {}}
        onDuplicate={() => {}}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LeftProjectAccess;
