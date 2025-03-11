// RoleGroupPostPicker.tsx
import React, { useState, useEffect } from "react";
import DataTable from "../../../TableDynamic/DataTable"; // مسیر را مطابق پروژه تنظیم کنید
import { useApi } from "../../../../context/ApiContext";
import ReusableButton from "../../../utilities/DynamicButtons";
import { SelectedItem } from "./MembersTable"; // یا از مسیر مشترک وارد کنید

interface RoleGroupPostPickerProps {
  onSelect: (selected: SelectedItem[]) => void;
  onClose: () => void;
}

interface PostCat {
  ID?: string;
  Name: string;
  Description: string;
  PostsStr?: string;
}

const RoleGroupPostPicker: React.FC<RoleGroupPostPickerProps> = ({
  onSelect,
  onClose,
}) => {
  const api = useApi();
  const [roleGroups, setRoleGroups] = useState<PostCat[]>([]);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<PostCat | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const columnDefs = [
    { field: "Name", headerName: "Name" },
    { field: "Description", headerName: "Description" },
  ];

  // تابع کمکی برای تجزیه آیدی‌ها از رشته (مثلاً "4|5|6")
  const parseIds = (idsStr?: string): string[] => {
    if (!idsStr) return [];
    return idsStr.split("|").filter(Boolean);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // دریافت Role Group ها
        const data = await api.getAllPostCat();
        setRoleGroups(data);
        // دریافت تمام Roles جهت جستجوی نام‌های مرتبط
        const rolesData = await api.getAllRoles();
        setAllRoles(rolesData);
      } catch (error) {
        console.error("Error fetching role groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  const handleRowClick = (data: any) => {
    setSelectedRow(data);
  };

  const handleRowDoubleClick = (data: any) => {
    if (data && data.PostsStr) {
      const ids = parseIds(data.PostsStr);
      const selectedItems: SelectedItem[] = allRoles
        .filter((role: any) => ids.includes(String(role.ID)))
        .map((role: any) => ({
          id: String(role.ID),
          name: role.Name,
        }));
      onSelect(selectedItems);
    }
  };

  const handleSelectClick = () => {
    if (selectedRow && selectedRow.PostsStr) {
      const ids = parseIds(selectedRow.PostsStr);
      const selectedItems: SelectedItem[] = allRoles
        .filter((role: any) => ids.includes(String(role.ID)))
        .map((role: any) => ({
          id: String(role.ID),
          name: role.Name,
        }));
      onSelect(selectedItems);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg flex flex-col h-full">
      <div className="flex-grow mb-4" style={{ height: "400px" }} >
        <DataTable
          columnDefs={columnDefs}
          rowData={roleGroups}
          onRowDoubleClick={handleRowDoubleClick}
          setSelectedRowData={handleRowClick}
          showDuplicateIcon={false}
          showEditIcon={false}
          showAddIcon={false}
          showDeleteIcon={false}
          onAdd={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onDuplicate={() => {}}
          showSearch={true}
          isLoading={loading}
        />
      </div>
      <div className="flex justify-center mt-4">
        <ReusableButton
          text="Select"
          onClick={handleSelectClick}
          isDisabled={!selectedRow}
          className="w-40"
        />
      </div>
    </div>
  );
};

export default RoleGroupPostPicker;
