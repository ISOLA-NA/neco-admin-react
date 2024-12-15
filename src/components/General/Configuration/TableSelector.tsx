// src/components/Configuration/TableSelector.tsx

import React from "react";
import DataTable from "../../TableDynamic/DataTable";
import ReusableButton from "../../utilities/DynamicButtons";

interface ColumnDef {
  headerName: string;
  field: string;
}

interface TableSelectorProps {
  columnDefs: ColumnDef[];
  rowData: any[];
  selectedRow?: any;
  onRowDoubleClick: (data: any) => void;
  onRowClick: (data: any) => void;
  onSelectButtonClick: () => void;
  isSelectDisabled: boolean;
}

const TableSelector: React.FC<TableSelectorProps> = ({
  columnDefs,
  rowData,
  onRowDoubleClick,
  onRowClick,
  onSelectButtonClick,
  isSelectDisabled,
}) => {
  return (
    <div className="bg-white rounded-lg p-4 flex flex-col h-full">
      {/* Table Section */}
      <div className="mb-4">
        <DataTable
          columnDefs={columnDefs}
          rowData={rowData}
          onRowDoubleClick={onRowDoubleClick}
          setSelectedRowData={onRowClick}
          showDuplicateIcon={false}
          onAdd={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onDuplicate={() => {}}
          domLayout="autoHeight"
          isRowSelected={false}
        />
      </div>

      {/* Select Button */}
      <div className="mt-4 flex justify-center">
        <ReusableButton
          text="Select"
          onClick={onSelectButtonClick}
          isDisabled={isSelectDisabled}
          className="w-48"
        />
      </div>
    </div>
  );
};

export default TableSelector;
