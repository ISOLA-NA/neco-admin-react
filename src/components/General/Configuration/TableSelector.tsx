import React, { useState } from "react";
import DataTable from "../../TableDynamic/DataTable";
import ReusableButton from "../../utilities/DynamicButtons";

interface ColumnDef {
  headerName: string;
  field: string;
}

interface TableSelectorProps {
  columnDefs: ColumnDef[];
  rowData: any[];
  // این دو تابع برای کلیک و دابل کلیک روی ردیف
  onRowDoubleClick: (data: any) => void;
  onRowClick: (data: any) => void;
  // این تابع هنگام کلیک روی دکمه Select فراخوانی می‌شود
  onSelectButtonClick: (data: any) => void;
  // کنترل فعال یا غیرفعال بودن دکمه Select
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
  const [localSelectedRow, setLocalSelectedRow] = useState<any>(null);

  // وقتی روی ردیفی کلیک می‌کنیم، state محلی بروز شود
  const handleRowClick = (data: any) => {
    setLocalSelectedRow(data);
    onRowClick(data);
  };

  // وقتی دکمه Select زده شد، اگر ردیفی انتخاب شده باشد به والد بده
  const handleSelectClick = () => {
    if (localSelectedRow) {
      onSelectButtonClick(localSelectedRow);
    }
  };

  // وقتی دابل کلیک شد، بدون نیاز به دکمه Select، مستقیم به والد بده
  const handleRowDoubleClickInternal = (data: any) => {
    onRowDoubleClick(data);
  };

  return (
    <div className="bg-white rounded-lg p-4 flex flex-col" style={{ height: "600px" }}>
      {/* ظرف جدول با ارتفاع ثابت و اسکرول */}
      <div className="flex-grow overflow-y-auto mb-4" style={{ height: "100%" }}>
        <DataTable
          columnDefs={columnDefs}
          rowData={rowData}
          onRowDoubleClick={handleRowDoubleClickInternal}
          setSelectedRowData={handleRowClick}
          showDuplicateIcon={false}
          onAdd={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onDuplicate={() => {}}
          // استفاده از domLayout "normal" برای پرکردن ارتفاع والد
          domLayout="normal"
        />
      </div>

      <div className="mt-4 flex justify-center">
        <ReusableButton
          text="Select"
          onClick={handleSelectClick}
          isDisabled={isSelectDisabled || !localSelectedRow}
          className="w-48"
        />
      </div>
    </div>
  );
};

export default TableSelector;
