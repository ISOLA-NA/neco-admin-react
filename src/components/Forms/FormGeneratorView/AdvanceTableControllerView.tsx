// src/components/AdvanceTableControllerView.tsx
import React, { useState } from "react";
import DataTable from "../../TableDynamic/DataTable";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

interface AdvanceTableControllerViewProps {
  initialRows?: any[];
  data?: { DisplayName?: string };
}

const AdvanceTableControllerView: React.FC<AdvanceTableControllerViewProps> = ({
  initialRows = [],
  data,
}) => {
  const [rowData, setRowData] = useState<any[]>(initialRows);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // تعریف تنها یک ستون بدون header name
  const columnDefs = [
    {
      headerName: "",
      field: "Name",
      sortable: true,
      filter: true,
    },
  ];

  const handleAdd = () => {
    // اضافه کردن یک ردیف جدید با مقدار خالی
    const newRow = { ID: crypto.randomUUID(), Name: "" };
    setRowData((prev) => [...prev, newRow]);
  };

  const handleEdit = () => {
    if (!selectedRow) return;
    // به عنوان نمونه، مقدار ردیف انتخاب‌شده را ویرایش می‌کنیم
    const updatedRows = rowData.map((row) =>
      row.ID === selectedRow.ID ? { ...row, Name: row.Name + " (Edited)" } : row
    );
    setRowData(updatedRows);
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    const updatedRows = rowData.filter((row) => row.ID !== selectedRow.ID);
    setRowData(updatedRows);
    setSelectedRow(null);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* نمایش DisplayName با فونت کوچک */}
      {data?.DisplayName && (
        <div className="text-sm font-medium text-gray-800 mb-2">
          {data.DisplayName}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleAdd}
          className="text-green-600 hover:text-green-800"
          title="Add"
        >
          <FiPlus size={20} />
        </button>
        <button
          onClick={handleEdit}
          className={`text-blue-600 hover:text-blue-800 ${
            !selectedRow ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Edit"
          disabled={!selectedRow}
        >
          <FiEdit size={20} />
        </button>
        <button
          onClick={handleDelete}
          className={`text-red-600 hover:text-red-800 ${
            !selectedRow ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Delete"
          disabled={!selectedRow}
        >
          <FiTrash2 size={20} />
        </button>
      </div>

      {/* جدول با ارتفاع کوچک */}
      <div className="ag-theme-quartz h-40">
        <DataTable
          columnDefs={columnDefs}
          rowData={rowData}
          onRowDoubleClick={() => {}}
          setSelectedRowData={setSelectedRow}
          showDuplicateIcon={false}
          showEditIcon={false}
          showAddIcon={false}
          showDeleteIcon={false}
          onAdd={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onDuplicate={() => {}}
          domLayout="autoHeight"
          showSearch={false}
          showAddNew={false}
          isLoading={false}
        />
      </div>
    </div>
  );
};

export default AdvanceTableControllerView;
