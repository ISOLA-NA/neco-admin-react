// src/components/TableDynamic/DataTable.tsx
import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { FaSearch } from "react-icons/fa";
import { FiPlus, FiTrash2, FiEdit, FiCopy } from "react-icons/fi";
import { TailSpin } from "react-loader-spinner";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./DataTable.css";

interface DataTableProps {
  columnDefs: any[];
  rowData: any[];
  onRowDoubleClick: (data: any) => void;
  setSelectedRowData: (data: any) => void;
  showDuplicateIcon?: boolean;
  showEditIcon?: boolean;
  showAddIcon?: boolean;
  showDeleteIcon?: boolean;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCellValueChanged?: (event: any) => void;
  domLayout?: "autoHeight" | "normal";
  showSearch?: boolean;
  showAddNew?: boolean;
  isLoading?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columnDefs,
  rowData,
  onRowDoubleClick,
  setSelectedRowData,
  showDuplicateIcon = false,
  showEditIcon = true,
  showAddIcon = true,
  showDeleteIcon = true,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onCellValueChanged,
  domLayout = "normal",
  showSearch = true,
  showAddNew = false,
  isLoading = false,
}) => {
  const [searchText, setSearchText] = useState("");
  const gridApiRef = useRef<any>(null);
  const [originalRowData, setOriginalRowData] = useState<any[]>([]);
  const [filteredRowData, setFilteredRowData] = useState<any[]>([]);
  const [isRowSelected, setIsRowSelected] = useState<boolean>(false);

  useEffect(() => {
    setOriginalRowData(rowData);
    setFilteredRowData(rowData);
  }, [rowData]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    if (value.trim() === "") {
      setFilteredRowData(originalRowData);
    } else {
      const lowerValue = value.toLowerCase();
      const filtered = originalRowData.filter((item) => {
        return Object.values(item).some((val) => {
          if (val === null || val === undefined) return false;
          let strVal = "";
          if (typeof val === "object") {
            strVal = JSON.stringify(val);
          } else {
            strVal = val.toString();
          }
          return strVal.toLowerCase().includes(lowerValue);
        });
      });
      setFilteredRowData(filtered);
    }
  };

  const onGridReady = (params: any) => {
    gridApiRef.current = params.api;
    params.api.sizeColumnsToFit();

    if (isLoading) {
      params.api.showLoadingOverlay();
    }
  };

  useEffect(() => {
    if (gridApiRef.current) {
      gridApiRef.current.sizeColumnsToFit();
    }
  }, [columnDefs, filteredRowData]);

  useEffect(() => {
    if (gridApiRef.current) {
      if (isLoading) {
        gridApiRef.current.showLoadingOverlay();
      } else {
        gridApiRef.current.hideOverlay();
      }
    }
  }, [isLoading]);

  const handleRowClick = (event: any) => {
    setSelectedRowData(event.data);
    setIsRowSelected(true);
  };

  const handleRowDoubleClickInternal = (event: any) => {
    onRowDoubleClick(event.data);
  };

  // استایل کلاس ag-theme-quartz را نگه می‌داریم اما ارتفاع ثابت را حذف می‌کنیم
  const gridClasses = "ag-theme-quartz";

  const getRowClass = (params: any) => {
    return params.node.selected ? "ag-row-selected" : "";
  };

  const gridOptions = {
    getRowClass: getRowClass,
    overlayLoadingTemplate:
      '<div class="custom-loading-overlay"><TailSpin color="#7e3af2" height={80} width={80} /></div>',
  };

  return (
    <div className="w-full flex flex-col relative">
      <div className="flex items-center justify-between mb-4 bg-red-100 p-2 ">
        {showSearch && (
          <div className="relative max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchText}
              onChange={onSearchChange}
              className="search-input w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              style={{ fontFamily: "inherit" }}
            />
          </div>
        )}

        <div className="flex items-center space-x-4">
          {showDuplicateIcon && (
            <button
              className={`text-yellow-600 hover:text-yellow-800 transition ${
                !isRowSelected ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Duplicate"
              onClick={onDuplicate}
              disabled={!isRowSelected}
            >
              <FiCopy size={25} />
            </button>
          )}

          {showEditIcon && (
            <button
              className={`text-blue-600 hover:text-blue-800 transition ${
                !isRowSelected ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Edit"
              onClick={onEdit}
              disabled={!isRowSelected}
            >
              <FiEdit size={25} />
            </button>
          )}

          {showDeleteIcon && (
            <button
              className={`text-red-600 hover:text-red-800 transition ${
                !isRowSelected ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Delete"
              onClick={onDelete}
              disabled={!isRowSelected}
            >
              <FiTrash2 size={25} />
            </button>
          )}

          {showAddIcon && (
            <button
              type="button"
              className="text-green-600 hover:text-green-800 transition"
              title="Add"
              onClick={onAdd}
            >
              <FiPlus size={25} />
            </button>
          )}
        </div>
      </div>

      <div className={gridClasses} style={{ width: "100%" }}>
        <AgGridReact
          onGridReady={onGridReady}
          columnDefs={columnDefs}
          rowData={filteredRowData}
          onRowClicked={handleRowClick}
          onRowDoubleClicked={handleRowDoubleClickInternal}
          domLayout={domLayout}
          suppressHorizontalScroll={false}
          rowSelection="single"
          gridOptions={gridOptions}
          singleClickEdit={true}
          stopEditingWhenCellsLoseFocus={true}
          onCellValueChanged={onCellValueChanged}
          overlayLoadingTemplate={
            '<div class="custom-loading-overlay"><TailSpin color="#7e3af2" height={80} width={80} /></div>'
          }
        />
      </div>

      {showAddNew && (
        <button
          type="button"
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          onClick={onAdd}
        >
          Add New
        </button>
      )}

      {/* Overlay Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
          <TailSpin color="#7e3af2" height={80} width={80} />
        </div>
      )}
    </div>
  );
};

export default DataTable;
