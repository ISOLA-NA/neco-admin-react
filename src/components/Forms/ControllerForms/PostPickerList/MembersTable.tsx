// MembersTable.tsx
import React, { useEffect, useState } from "react";
import DataTable from "../../../TableDynamic/DataTable"; // مسیر را مطابق پروژه خود تنظیم کنید
import { useApi } from "../../../../context/ApiContext";
import ReusableButton from "../../../utilities/DynamicButtons";

interface MembersTableProps {
  onSelect: (roleName: string) => void;
  onClose: () => void;
}

interface ProcessedRole {
  ID: string;
  Name: string;
  UserNameFromAllUser: string;
  UserFamily: string;
  Enterprise: string;
  SuperIndent: string;
}

const MembersTable: React.FC<MembersTableProps> = ({ onSelect, onClose }) => {
  const api = useApi();
  const [membersList, setMembersList] = useState<ProcessedRole[]>([]);
  const [selectedRow, setSelectedRow] = useState<ProcessedRole | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const columnDefs = [
    { field: "Name", headerName: "Role" },
    { field: "UserNameFromAllUser", headerName: "Name" },
    { field: "UserFamily", headerName: "Family" },
    { field: "Enterprise", headerName: "Enterprise" },
    { field: "SuperIndent", headerName: "SuperIndent" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const roles = await api.getAllRoles();
        const users = await api.getAllUsers();
        const companies = await api.getAllCompanies();

        const processed = roles.map((role: any) => {
          const user = users.find((u: any) => u.ID === role.OwnerID);
          const company = companies.find(
            (c: any) => String(c.ID) === String(role.nCompanyID)
          );
          const superIndent =
            roles.find((r: any) => r.ID === role.ParrentId)?.Name || "";
          return {
            ID: role.ID,
            Name: role.Name,
            UserNameFromAllUser: user?.Name || "",
            UserFamily: user?.Family || "",
            Enterprise: company?.Name || "",
            SuperIndent: superIndent,
          };
        });
        setMembersList(processed);
      } catch (error) {
        console.error("Error fetching roles data:", error);
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
    if (data && data.Name) {
      onSelect(data.Name);
    }
  };

  const handleSelectClick = () => {
    if (selectedRow && selectedRow.Name) {
      onSelect(selectedRow.Name);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg flex flex-col h-full">
      <div className="flex-grow mb-4">
        <DataTable
          columnDefs={columnDefs}
          rowData={membersList}
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

export default MembersTable;
