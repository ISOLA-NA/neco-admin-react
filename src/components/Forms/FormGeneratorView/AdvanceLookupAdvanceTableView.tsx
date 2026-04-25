// src/components/AdvanceLookupAdvanceTableView.tsx
import React, { useState } from "react";
import DataTable from "../../TableDynamic/DataTable";

type AdvanceLookupAdvanceTableViewProps = {
  initialRows?: any[];
  data?: {
    DisplayName?: string;
    PersianName?: string;
  };
  isFaMode?: boolean;
};

const AdvanceLookupAdvanceTableView = ({
  initialRows = [],
  data,
  isFaMode = false,
}: AdvanceLookupAdvanceTableViewProps) => {
  const [rowData, setRowData] = useState<any[]>(initialRows);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || ""
    : data?.DisplayName || data?.PersianName || "";

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
    setRowData((prev) => prev.filter((row) => row.ID !== selectedRow.ID));
    setSelectedRow(null);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <p className="text-xs font-semibold text-gray-800">{label}</p>
      )}
      <div className="ag-theme-quartz h-60">
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
        />
      </div>
    </div>
  );
};

export default AdvanceLookupAdvanceTableView;