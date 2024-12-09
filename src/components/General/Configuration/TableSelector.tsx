// src/components/DynamicDialog/TableWithSelectButton.tsx
import React from "react";
import DataTable from "../../TableDynamic/DataTable";

interface TableWithSelectButtonProps {
  columnDefs: { headerName: string; field: string }[];
  rowData: any[];
  selectedRow: any; // اطمینان از دریافت پراپ selectedRow
  onRowDoubleClick: (data: any) => void;
  onRowClick: (data: any) => void;
  onSelectButtonClick: () => void;
  isSelectDisabled: boolean;
}

const TableWithSelectButton: React.FC<TableWithSelectButtonProps> = ({
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
      />

      {/* Select Button */}
      <div className="modal-action justify-center space-x-4">
        <button
          className={`btn w-48 ${
            isSelectDisabled
              ? "bg-blue-300 text-gray-500 cursor-not-allowed"
              : "btn-primary"
          }`}
          onClick={onSelectButtonClick}
          disabled={isSelectDisabled}
        >
          انتخاب
        </button>
      </div>
    </div>
  );
};

export default TableWithSelectButton;
