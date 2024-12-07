// src/components/DataTable.tsx
import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface DataTableProps {
  columnDefs: any[];
  rowData: any[];
  defaultColDef?: any;
  onRowDoubleClick: (data: any) => void;
  setSelectedRowData: (data: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columnDefs,
  rowData,
  defaultColDef,
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
    <div style={{ width: "100%", height: "100%" }}>
      {/* نوار جستجو */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="جستجو..."
          value={searchText}
          onChange={onSearchChange}
          style={{
            padding: "8px",
            width: "300px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            direction: "rtl",
          }}
        />
      </div>
      {/* جدول ag-Grid */}
      <div
        className="ag-theme-alpine"
        style={{ height: "calc(100% - 50px)", width: "100%" }}
      >
        <AgGridReact
          onGridReady={onGridReady}
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            ...defaultColDef,
          }}
          pagination={false}
          paginationPageSize={10}
          animateRows={true}
          onRowClicked={onRowClicked}
          onRowDoubleClicked={handleRowDoubleClicked}
        />
      </div>
    </div>
  );
};

export default DataTable;
