// src/components/AdvanceTableControllerView.tsx
import React, { useState } from "react";
import DataTable from "../../TableDynamic/DataTable";

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
    // نمونه: مقدار ردیف انتخاب‌شده را ویرایش می‌کنیم
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

      {/* جدول با دکمه‌های داخلی خود DataTable */}
      <div className="ag-theme-quartz h-60">
        <DataTable
          columnDefs={columnDefs}
          rowData={rowData}
          onRowDoubleClick={() => {}}
          // برای اینکه دکمه‌های داخلی بدانند کدام ردیف انتخاب است
          setSelectedRowData={setSelectedRow}
          // نمایش آیکن‌های داخلی جدول
          showAddIcon={true}
          showEditIcon={true}
          showDeleteIcon={true}
          showDuplicateIcon={false} // در صورت نیاز می‌توانید true کنید و onDuplicate اضافه کنید
          // اتصال هندلرها به دکمه‌های داخلی
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={() => {}}
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

export default AdvanceTableControllerView;
