// src/components/DataTable.tsx
import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css"; // استفاده از تم Quartz
import "./DataTable.css";

interface DataTableProps {
  columnDefs: any[]; // ستون‌ها
  rowData: any[]; // داده‌های ردیف‌ها
  onRowDoubleClick: (data: any) => void; // تابع دابل کلیک
  setSelectedRowData: (data: any) => void; // ذخیره ردیف انتخابی
  onRowClick?: (rowData: any) => void; // تابع کلیک ردیف (اختیاری)
}

const DataTable: React.FC<DataTableProps> = ({
  columnDefs,
  rowData,
  onRowDoubleClick,
  setSelectedRowData,
}) => {
  const [searchText, setSearchText] = useState("");
  const [gridApi, setGridApi] = useState<any>(null);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    if (gridApi) {
      gridApi.setQuickFilter(e.target.value);
    }
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  useEffect(() => {
    if (gridApi) {
      gridApi.sizeColumnsToFit();
    }
  }, [gridApi, columnDefs]);

  const onRowClicked = (event: any) => {
    setSelectedRowData(event.data);
  };

  const handleRowDoubleClicked = (event: any) => {
    onRowDoubleClick(event.data);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* نوار جستجو */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="جستجو..."
          value={searchText}
          onChange={onSearchChange}
          className="search-input"
        />
      </div>
      {/* جدول ag-Grid با تم Quartz */}
      <div className="ag-theme-quartz flex-grow">
        <AgGridReact
          onGridReady={onGridReady}
          columnDefs={columnDefs}
          rowData={rowData}
          pagination={false}
          paginationPageSize={10}
          animateRows={true}
          onRowClicked={onRowClicked}
          onRowDoubleClicked={handleRowDoubleClicked}
          domLayout="autoHeight"
          suppressHorizontalScroll={false} // اجازه اسکرول افقی
        />
      </div>
    </div>
  );
};

export default DataTable;
