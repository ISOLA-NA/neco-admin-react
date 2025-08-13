// src/components/AdvanceLookupAdvanceTableView.tsx
import React, { useState } from "react";
import DataTable from "../../TableDynamic/DataTable";

interface AdvanceLookupAdvanceTableViewProps {
  initialRows?: any[];
  data?: { DisplayName?: string };
}

const AdvanceLookupAdvanceTableView: React.FC<
  AdvanceLookupAdvanceTableViewProps
> = ({ initialRows = [], data }) => {
  const [rowData, setRowData] = useState<any[]>(initialRows);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // تعریف تنها یک ستون (بدون header name نمایشی)
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
    <div className="flex flex-col gap-4 p-4">
      {/* نمایش DisplayName با فونت کوچک */}
      {data?.DisplayName && (
        <div className="text-sm font-medium text-gray-800 mb-2">
          {data.DisplayName}
        </div>
      )}

      {/* جدول با دکمه‌های داخلی خود DataTable */}
      <div className="ag-theme-quartz h-60">
        <DataTable
          columnDefs={columnDefs}
          rowData={rowData}
          // روی دابل کلیک اگر نیاز ندارید، خالی بگذارید
          onRowDoubleClick={() => {}}
          // برای اینکه دکمه‌های داخلی دیتاتیبل بدانند کدام ردیف انتخاب است
          setSelectedRowData={setSelectedRow}
          // آیکن‌های داخلی DataTable را فعال می‌کنیم
          showAddIcon={true}
          showEditIcon={true}
          showDeleteIcon={true}
          // اگر نمی‌خواهید Duplicate داشته باشید، false بگذارید
          showDuplicateIcon={false}
          // رویدادهای مربوط به آیکن‌های داخلی
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          // سایر تنظیمات
          domLayout="autoHeight"
          showSearch={false}
          showAddNew={false}
          isLoading={false}
        />
      </div>
    </div>
  );
};

export default AdvanceLookupAdvanceTableView;
