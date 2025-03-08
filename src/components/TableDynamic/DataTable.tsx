// src/TableDynamic/DataTable.tsx
import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { FaSearch } from "react-icons/fa";
import { FiPlus, FiTrash2, FiEdit, FiCopy, FiEye } from "react-icons/fi";
import { TailSpin } from "react-loader-spinner";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./DataTable.css"; // فایل CSS اختصاصی

interface DataTableProps {
  columnDefs: any[];
  rowData: any[];
  onRowDoubleClick: (data: any) => void;
  setSelectedRowData: (data: any) => void;
  showDuplicateIcon?: boolean;
  showEditIcon?: boolean;
  showAddIcon?: boolean;
  showDeleteIcon?: boolean;
  // prop های جدید برای آیکون view
  showViewIcon?: boolean;
  onView?: () => void;
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
  showViewIcon = false,
  onView = () => {},
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

  // تابع جستجو
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

  // وقتی گرید آماده شد
  const onGridReady = (params: any) => {
    gridApiRef.current = params.api;
    // ستون‌ها را مطابق عرض جدول اندازه بزن
    params.api.sizeColumnsToFit();

    if (isLoading) {
      params.api.showLoadingOverlay();
    }
  };

  // وقتی اندازه‌ی گرید تغییر کرد، دوباره ستون‌ها را فیت کن
  const onGridSizeChanged = (params: any) => {
    params.api.sizeColumnsToFit();
  };

  // هر بار که ستون‌ها یا داده‌ها تغییر کرد، دوباره سایز را رفرش کن
  useEffect(() => {
    if (gridApiRef.current) {
      gridApiRef.current.sizeColumnsToFit();
    }
  }, [columnDefs, filteredRowData]);

  // نمایش یا مخفی کردن اسپینر لودینگ
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

  // کلاس‌های دلخواه برای گرید
  const gridClasses = "ag-theme-quartz w-full h-full overflow-y-auto";

  // برای ردیف انتخاب‌شده (مثلاً هایلایت)
  const getRowClass = (params: any) => {
    return params.node.selected ? "ag-row-selected" : "";
  };

  // آپشن‌های سفارشی گرید
  const gridOptions = {
    getRowClass: getRowClass,
  };

  // استایل پایه دکمه‌های آیکون
  // از کلاس‌های tailwind استفاده می‌کنیم: رنگ پس‌زمینه ملایم، بوردر گرد،
  // افکت هاور، و غیرفعال‌سازی وقتی ردیفی انتخاب نشده
  const baseIconButton =
    "rounded-full p-2 transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none";

  return (
    <div className="data-table-container w-full h-full flex flex-col relative rounded-md shadow-md p-2">
      {/* نوار بالای جستجو و آیکون‌ها */}
      <div className="flex items-center justify-between mb-4 bg-red-100 p-2 rounded-md shadow-sm">
        {showSearch && (
          <div className="relative max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchText}
              onChange={onSearchChange}
              className="search-input w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm"
              style={{ fontFamily: "inherit" }}
            />
          </div>
        )}

        <div className="flex items-center space-x-4">
          {showDuplicateIcon && (
            <button
              className={`
                ${baseIconButton} 
                bg-yellow-50 hover:bg-yellow-100 text-yellow-600 
                ${!isRowSelected ? "opacity-50 cursor-not-allowed" : ""}
              `}
              title="Duplicate"
              onClick={onDuplicate}
              disabled={!isRowSelected}
            >
              <FiCopy size={20} />
            </button>
          )}

          {showEditIcon && (
            <button
              className={`
                ${baseIconButton} 
                bg-blue-50 hover:bg-blue-100 text-blue-600 
                ${!isRowSelected ? "opacity-50 cursor-not-allowed" : ""}
              `}
              title="Edit"
              onClick={onEdit}
              disabled={!isRowSelected}
            >
              <FiEdit size={20} />
            </button>
          )}

          {showDeleteIcon && (
            <button
              className={`
                ${baseIconButton}
                bg-red-50 hover:bg-red-100 text-red-600
                ${!isRowSelected ? "opacity-50 cursor-not-allowed" : ""}
              `}
              title="Delete"
              onClick={onDelete}
              disabled={!isRowSelected}
            >
              <FiTrash2 size={20} />
            </button>
          )}

          {showAddIcon && (
            <button
              type="button"
              className={`
                ${baseIconButton} 
                bg-green-50 hover:bg-green-100 text-green-600
              `}
              title="Add"
              onClick={onAdd}
            >
              <FiPlus size={20} />
            </button>
          )}

          {showViewIcon && (
            <button
              className={`
                ${baseIconButton}
                bg-gray-50 hover:bg-gray-100 text-gray-600
              `}
              title="View"
              onClick={onView}
            >
              <FiEye size={20} />
            </button>
          )}
        </div>
      </div>

      {/* بخش جدول که تمام فضای باقیمانده را می‌گیرد */}
      <div className="flex-grow" style={{ minHeight: 0 }}>
        <div className={gridClasses}>
          <AgGridReact
            onGridReady={onGridReady}
            onGridSizeChanged={onGridSizeChanged}
            columnDefs={columnDefs}
            rowData={filteredRowData}
            pagination={false}
            paginationPageSize={10}
            animateRows={true}
            onRowClicked={handleRowClick}
            onRowDoubleClicked={handleRowDoubleClickInternal}
            domLayout={domLayout} // normal یا autoHeight
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
