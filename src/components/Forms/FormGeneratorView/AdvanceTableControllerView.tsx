// src/components/AdvanceTableControllerView.tsx
import React, { useState } from "react";
import DataTable from "../../TableDynamic/DataTable";

interface AdvanceTableControllerViewProps {
  initialRows?: any[];
  data?: { DisplayName?: string };
  /** از FormGeneratorView پاس می‌شود؛ فقط همین کنترل RTL/LTR شود */
  rtl?: boolean;
}

const AdvanceTableControllerView: React.FC<AdvanceTableControllerViewProps> = ({
  initialRows = [],
  data,
  rtl = false,
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
    const newRow = { ID: crypto.randomUUID(), Name: "" };
    setRowData((prev) => [...prev, newRow]);
  };

  const handleEdit = () => {
    if (!selectedRow) return;
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
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="flex flex-col gap-4 p-4"
      style={{ unicodeBidi: "plaintext" }}
    >
      {/* نمایش DisplayName با فونت کوچک */}
      {data?.DisplayName && (
        <div
          className="text-sm font-medium text-gray-800 mb-2"
          style={{ textAlign: rtl ? "right" : "left" }}
        >
          {data.DisplayName}
        </div>
      )}

      {/* جدول با دکمه‌های داخلی خود DataTable */}
      <div className={`ag-theme-quartz ${rtl ? "ag-rtl" : ""} h-60`}>
        <DataTable
          columnDefs={columnDefs}
          rowData={rowData}
          onRowDoubleClick={() => {}}
          setSelectedRowData={setSelectedRow}
          showAddIcon={true}
          showEditIcon={true}
          showDeleteIcon={true}
          showDuplicateIcon={false}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={() => {}}
          domLayout="autoHeight"
          showSearch={false}
          showAddNew={false}
          isLoading={false}
          /* اگر DataTable شما از prop جهت پشتیبانی می‌کند */
          direction={rtl ? "rtl" : "ltr"}
        />
      </div>

      {/* فقط برای همین کنترل: راست‌چین کردن هدر و سلول‌ها در حالت RTL */}
      <style>
        {`
          .ag-rtl .ag-header-cell-label {
            justify-content: flex-end;
            text-align: right;
          }
          .ag-rtl .ag-cell {
            text-align: right;
          }
          .ag-rtl .ag-cell input {
            text-align: right;
          }
        `}
      </style>
    </div>
  );
};

export default AdvanceTableControllerView;
