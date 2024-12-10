// src/components/Configuration/TableSelector.tsx

import React from "react";
import DataTable from "../../TableDynamic/DataTable";

interface ColumnDef {
  headerName: string;
  field: string;
}

interface TableSelectorProps {
  columnDefs: ColumnDef[];
  rowData: any[];
  selectedRow: any;
  onRowDoubleClick: (data: any) => void;
  onRowClick: (data: any) => void;
  onSelectButtonClick: () => void;
  isSelectDisabled: boolean;
}

const TableSelector: React.FC<TableSelectorProps> = ({
  columnDefs,
  rowData,
  selectedRow,
  onRowDoubleClick,
  onRowClick,
  onSelectButtonClick,
  isSelectDisabled,
}) => {
  return (
    <div>
      <DataTable
        columnDefs={columnDefs}
        rowData={rowData}
        onRowDoubleClick={onRowDoubleClick}
        setSelectedRowData={onRowClick}
        showAddIcon={false}
        showEditIcon={false}
        showDeleteIcon={false}
        showDuplicateIcon={false}
        // اگر DataTable نیازمند این توابع است، آن‌ها را به عنوان no-op تعریف کنید
        onAdd={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onDuplicate={() => {}}
      />
      <button
        onClick={onSelectButtonClick}
        disabled={isSelectDisabled}
        className={`mt-4 px-4 py-2 rounded ${
          isSelectDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-700 text-white"
        }`}
      >
        Select
      </button>
    </div>
  );
};

export default TableSelector;
