// src/components/AdvanceLookupAdvanceTableView.tsx
import React, { useState } from "react";
import DataTable from "../../TableDynamic/DataTable";

interface AdvanceLookupAdvanceTableViewProps {
  initialRows?: any[];
  data?: { DisplayName?: string };
  /** از FormGeneratorView پاس می‌شود؛ فقط همین کنترل را RTL می‌کند */
  rtl?: boolean;
}

const AdvanceLookupAdvanceTableView: React.FC<
  AdvanceLookupAdvanceTableViewProps
> = ({ initialRows = [], data, rtl = false }) => {
  const [rowData, setRowData] = useState<any[]>(initialRows);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // فقط یک ستون (نمایشی)
  const columnDefs = [
    {
      headerName: "",
      field: "Name",
      sortable: true,
      filter: true,
    },
  ];

  // افزودن
  const handleAdd = () => {
    const newRow = { ID: crypto.randomUUID(), Name: "" };
    setRowData((prev) => [...prev, newRow]);
  };

  // ویرایش
  const handleEdit = () => {
    if (!selectedRow) return;
    const updatedRows = rowData.map((row) =>
      row.ID === selectedRow.ID ? { ...row, Name: row.Name + " (Edited)" } : row
    );
    setRowData(updatedRows);
  };

  // حذف
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
      {/* عنوان کوچک */}
      {data?.DisplayName && (
        <div
          className="text-sm font-medium text-gray-800 mb-2"
          style={{ textAlign: rtl ? "right" : "left" }}
        >
          {data.DisplayName}
        </div>
      )}

      {/* جدول */}
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
          domLayout="autoHeight"
          showSearch={false}
          showAddNew={false}
          isLoading={false}
          /* اگر DataTable شما prop جهت را پشتیبانی می‌کند (طبق استفاده‌تان در FormsCommand1) */
          direction={rtl ? "rtl" : "ltr"}
          /* در صورت نیاز: gridOptions دیگر را هم اینجا ست کنید */
        />
      </div>

      {/* فقط برای همین کنترل؛ راست‌چین شدن سلول‌ها و هدرها در حالت RTL */}
      <style>
        {`
          .ag-rtl .ag-header-cell-label {
            justify-content: flex-end;
            text-align: right;
          }
          .ag-rtl .ag-cell {
            text-align: right;
          }
          /* اگر داخل سلول input دارید: */
          .ag-rtl .ag-cell input {
            text-align: right;
          }
        `}
      </style>
    </div>
  );
};

export default AdvanceLookupAdvanceTableView;
