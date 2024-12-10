// src/components/TableDynamic/DataTable.tsx

import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { FaSearch } from "react-icons/fa";
import { FiPlus, FiTrash2, FiEdit, FiCopy } from "react-icons/fi";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css"; // استفاده از تم Quartz
import "./DataTable.css";

interface DataTableProps {
  columnDefs: any[];
  rowData: any[];
  onRowDoubleClick: (data: any) => void;
  setSelectedRowData: (data: any) => void;
  showAddIcon: boolean;
  showEditIcon: boolean;
  showDeleteIcon: boolean;
  showDuplicateIcon: boolean;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columnDefs,
  rowData,
  onRowDoubleClick,
  setSelectedRowData,
  showAddIcon,
  showEditIcon,
  showDeleteIcon,
  showDuplicateIcon,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
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

  const handleRowClick = (event: any) => {
    console.log("Row clicked in DataTable:", event.data);
    setSelectedRowData(event.data);
  };

  const handleRowDoubleClick = (event: any) => {
    console.log("Row double-clicked in DataTable:", event.data);
    onRowDoubleClick(event.data);
  };

  console.log("DataTable Props:");
  console.log("columnDefs:", columnDefs);
  console.log("rowData:", rowData);

  return (
    <div className="w-full h-full flex flex-col">
      {/* نوار دکمه‌های CRUD */}
      {(showAddIcon || showEditIcon || showDeleteIcon || showDuplicateIcon) && (
        <div className="flex items-center justify-end space-x-4 mb-4">
          {showDuplicateIcon && (
            <button
              className="text-yellow-600 hover:text-yellow-800 transition"
              title="Duplicate"
              onClick={onDuplicate}
            >
              <FiCopy size={18} />
            </button>
          )}
          {showDeleteIcon && (
            <button
              className="text-red-600 hover:text-red-800 transition"
              title="Delete"
              onClick={onDelete}
            >
              <FiTrash2 size={18} />
            </button>
          )}
          {showEditIcon && (
            <button
              className="text-blue-600 hover:text-blue-800 transition"
              title="Edit"
              onClick={onEdit}
            >
              <FiEdit size={18} />
            </button>
          )}
          {showAddIcon && (
            <button
              className="text-green-600 hover:text-green-800 transition"
              title="Add"
              onClick={onAdd}
            >
              <FiPlus size={18} />
            </button>
          )}
        </div>
      )}

      {/* نوار جستجو */}
      <div className="mb-4 relative max-w-sm">
        <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search all table data..."
          value={searchText}
          onChange={onSearchChange}
          className="search-input w-full pl-9 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          style={{ fontFamily: "inherit" }}
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
          onRowClicked={handleRowClick}
          onRowDoubleClicked={handleRowDoubleClick}
          domLayout="autoHeight"
          suppressHorizontalScroll={false}
          rowSelection="multiple" // برای انتخاب چندگانه
        />
      </div>
    </div>
  );
};

export default DataTable;
