import React, { useState, useEffect, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { FaSearch } from "react-icons/fa";
import { FiPlus, FiTrash2, FiEdit, FiCopy, FiEye } from "react-icons/fi";
import { TailSpin } from "react-loader-spinner";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./DataTable.css";
import type { GridOptions } from "ag-grid-community";
import { useTranslation } from "react-i18next";

interface DataTableProps {
  columnDefs: any[];
  rowData: any[];
  gridOptions?: GridOptions;

  onRowDoubleClick: (data: any) => void;
  onRowClick?: (data: any) => void;

  setSelectedRowData?: (data: any) => void;

  showDuplicateIcon?: boolean;
  showEditIcon?: boolean;
  showAddIcon?: boolean;
  showDeleteIcon?: boolean;
  showViewIcon?: boolean;

  onView?: () => void;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;

  onCellValueChanged?: (event: any) => void;
  domLayout?: "autoHeight" | "normal";
  showSearch?: boolean;
  showAddNew?: boolean;
  isLoading?: boolean;

  isEditMode?: boolean;
  direction?: "rtl" | "ltr";
  resetSearchKey?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  columnDefs,
  rowData,
  onRowDoubleClick,
  onRowClick,
  setSelectedRowData,
  showDuplicateIcon = false,
  showEditIcon = true,
  showAddIcon = true,
  showDeleteIcon = true,
  showViewIcon = false,
  onView = () => {},
  onAdd = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onDuplicate = () => {},
  onCellValueChanged,
  domLayout = "normal",
  showSearch = true,
  showAddNew = false,
  isLoading = false,
  isEditMode = true,
  direction = "rtl",
  resetSearchKey,
}) => {
  const { t, i18n } = useTranslation();

  const TT = (key: string, fa: string, en: string) =>
    t(key, { defaultValue: i18n.language === "fa" ? fa : en });

  const [searchText, setSearchText] = useState("");
  const gridApiRef = useRef<any>(null);
  const [originalRowData, setOriginalRowData] = useState<any[]>([]);
  const [filteredRowData, setFilteredRowData] = useState<any[]>([]);
  const [isRowSelected, setIsRowSelected] = useState<boolean>(false);

  const isRtl = direction === "rtl";

  const toPersianDigits = (value: any) => {
    if (value === null || value === undefined) return value;

    return value.toString().replace(/\d/g, (digit: string) => {
      return "۰۱۲۳۴۵۶۷۸۹"[Number(digit)];
    });
  };

  const localizeDigitsByLanguage = (value: any) => {
    if (value === null || value === undefined) return "";

    if (i18n.language !== "fa") return value;

    return toPersianDigits(value);
  };

  useEffect(() => {
    const mappedData = rowData.map((item, index) => ({
      ...item,
      clientOrder: item.clientOrder !== undefined ? item.clientOrder : index,
    }));

    setOriginalRowData(mappedData);
    setFilteredRowData(mappedData);
  }, [rowData]);

  useEffect(() => {
    setSearchText("");
  }, [rowData, resetSearchKey]);

  useEffect(() => {
    if (gridApiRef.current && filteredRowData && filteredRowData.length > 0) {
      gridApiRef.current.ensureIndexVisible(0, "top");
    }
  }, [filteredRowData]);

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

          const strVal =
            typeof val === "object" ? JSON.stringify(val) : val.toString();

          return strVal.toLowerCase().includes(lowerValue);
        });
      });

      setFilteredRowData(filtered);
    }
  };

  // عرض هر ستون را دقیقاً متناسب با محتوای واقعی خودش (هدر و سلول‌ها)
  // تنظیم می‌کند، به‌جای پر کردن کل فضای جدول (که کار sizeColumnsToFit بود).
  const autoSizeColumns = (api: any) => {
    if (!api) return;
    const allColumnIds: string[] = [];
    api.getColumns()?.forEach((column: any) => {
      allColumnIds.push(column.getColId());
    });
    if (allColumnIds.length > 0) {
      api.autoSizeColumns(allColumnIds, false);
    }
  };

  const onGridReady = (params: any) => {
    gridApiRef.current = params.api;
    // با یک فریم تاخیر اجرا می‌شود تا هدر و سلول‌ها قبل از اندازه‌گیری
    // کامل paint شده باشند؛ وگرنه ستون‌های کم‌محتوا (چک‌باکس‌ها) خیلی
    // باریک‌تر از عرض واقعی هدرشان بسته می‌شوند.
    requestAnimationFrame(() => autoSizeColumns(params.api));

    if (isLoading) params.api.showLoadingOverlay();
  };

  const onGridSizeChanged = (params: any) => {
    requestAnimationFrame(() => autoSizeColumns(params.api));
  };

  useEffect(() => {
    if (gridApiRef.current) {
      requestAnimationFrame(() => autoSizeColumns(gridApiRef.current));
    }
  }, [columnDefs, filteredRowData]);

  useEffect(() => {
    if (!gridApiRef.current) return;

    if (isLoading) gridApiRef.current.showLoadingOverlay();
    else gridApiRef.current.hideOverlay();
  }, [isLoading]);

  const handleRowClick = (event: any) => {
    if (!event || !event.data) return;

    if (setSelectedRowData) setSelectedRowData(event.data);

    setIsRowSelected(true);

    if (event.api && event.node) {
      event.api.forEachNode((node: any) => {
        node.setSelected(node === event.node);
      });
    }

    if (onRowClick) onRowClick(event.data);
  };

  // دابل‌کلیک روی یک سلولِ قابل‌ویرایش دیگر مودال ویرایش را باز نمی‌کند؛
  // فقط خودِ AG Grid وارد حالت ویرایش درون‌سلولی می‌شود. مودال فقط برای
  // ستون‌های غیرقابل‌ویرایش (مثل ستون Type) با دابل‌کلیک باز می‌شود.
  const handleCellDoubleClickInternal = (event: any) => {
    if (!event || !event.data) return;

    const colDef = event.colDef;
    const isEditable =
      typeof colDef?.editable === "function"
        ? colDef.editable(event)
        : !!colDef?.editable;

    if (isEditable) return;

    onRowDoubleClick(event.data);
  };

  const gridClasses = "ag-theme-quartz w-full h-full overflow-y-auto";

  const getRowClass = (params: any) =>
    params.node.selected ? "ag-row-selected" : "";

  const baseIconButton =
    "rounded-full p-2 transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none";

  const sortedFilteredRowData = useMemo(
    () =>
      [...filteredRowData].sort(
        (a, b) => (a.clientOrder ?? 0) - (b.clientOrder ?? 0)
      ),
    [filteredRowData]
  );

  // توجه: resizable روی true می‌ماند تا کاربر در صورت نیاز بتواند دستی
  // عرض ستون را تغییر دهد، ولی عرض اولیه دیگر با sizeColumnsToFit کشیده نمی‌شود.
  const defaultColDefAligned = useMemo<any>(
    () => ({
      sortable: true,
      resizable: true,
      cellStyle: { textAlign: isRtl ? "right" : "left" },
      headerClass: isRtl ? "rtl-header" : "ltr-header",
    }),
    [isRtl]
  );

  const localizedColumnDefs = useMemo<any[]>(
    () =>
      columnDefs.map((col) => {
        const existingValueFormatter = col.valueFormatter;

        return {
          ...col,
          valueFormatter: (params: any) => {
            const formattedValue = existingValueFormatter
              ? existingValueFormatter(params)
              : params.value;

            return localizeDigitsByLanguage(formattedValue);
          },
        };
      }),
    [columnDefs, i18n.language]
  );

  const handleAddClick = () => {
    if (gridApiRef.current) gridApiRef.current.deselectAll();

    setIsRowSelected(false);

    if (setSelectedRowData) setSelectedRowData({});

    onAdd();
  };

  return (
    <div
      dir={direction}
      className="data-table-container w-full h-full flex flex-col relative rounded-md shadow-md p-2"
    >
      {(showSearch ||
        showAddIcon ||
        showEditIcon ||
        showDeleteIcon ||
        showDuplicateIcon ||
        showViewIcon) && (
        <div className="flex items-center justify-between mb-4 bg-gray-300 p-2 rounded-md shadow-sm">
          {showSearch && (
            <div className="relative max-w-sm">
              <FaSearch
                className={`absolute ${
                  isRtl ? "right-3" : "left-3"
                } top-1/2 transform -translate-y-1/2 text-gray-500`}
              />

              <input
                type="text"
                placeholder={TT(
                  "DataTable.Toolbar.SearchPlaceholder",
                  "جستجو...",
                  "Search..."
                )}
                value={searchText}
                onChange={onSearchChange}
                className={`w-full ${
                  isRtl ? "pr-10 pl-3" : "pl-10 pr-3"
                } py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition`}
                style={{ fontFamily: "inherit" }}
              />
            </div>
          )}

          <div
            className={`flex items-center space-x-4 ${
              isRtl ? "rtl:space-x-reverse" : ""
            }`}
          >
            {showEditIcon && (
              <button
                className={`${baseIconButton} bg-blue-50 hover:bg-blue-100 text-blue-600 ${
                  !isRowSelected ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title={TT("DataTable.Buttons.Edit", "ذخیره", "Save")}
                onClick={onEdit}
                disabled={!isRowSelected || !isEditMode}
              >
                <FiEdit size={20} />
              </button>
            )}

            {showAddIcon && (
              <button
                className={`${baseIconButton} bg-green-50 hover:bg-green-100 text-green-600`}
                title={TT("DataTable.Buttons.Add", "جدید", "New")}
                onClick={handleAddClick}
                disabled={!isEditMode}
              >
                <FiPlus size={20} />
              </button>
            )}

            {showDeleteIcon && (
              <button
                className={`${baseIconButton} bg-red-50 hover:bg-red-100 text-red-600 ${
                  !isRowSelected ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title={TT("DataTable.Buttons.Delete", "حذف", "Delete")}
                onClick={onDelete}
                disabled={!isRowSelected || !isEditMode}
              >
                <FiTrash2 size={20} />
              </button>
            )}

            {showDuplicateIcon && (
              <button
                className={`${baseIconButton} bg-yellow-50 hover:bg-yellow-100 text-yellow-600 ${
                  !isRowSelected ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title={TT(
                  "DataTable.Buttons.Duplicate",
                  "تکثیر",
                  "Duplicate"
                )}
                onClick={onDuplicate}
                disabled={!isRowSelected || !isEditMode}
              >
                <FiCopy size={20} />
              </button>
            )}

            {showViewIcon && (
              <button
                className={`${baseIconButton} bg-gray-50 hover:bg-gray-100 text-gray-600`}
                title={TT("DataTable.Buttons.View", "نمایش", "View")}
                onClick={onView}
                disabled={!isEditMode}
              >
                <FiEye size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-grow" style={{ minHeight: 0 }}>
        <div
          className={`${gridClasses} ${
            direction === "rtl" ? "ag-rtl" : "ag-ltr"
          }`}
        >
          <AgGridReact
            key={direction}
            onGridReady={onGridReady}
            onGridSizeChanged={onGridSizeChanged}
            columnDefs={localizedColumnDefs}
            rowData={sortedFilteredRowData}
            pagination={false}
            paginationPageSize={10}
            animateRows={true}
            onRowClicked={handleRowClick}
            onCellDoubleClicked={handleCellDoubleClickInternal}
            domLayout={domLayout}
            suppressHorizontalScroll={false}
            singleClickEdit={false}
            stopEditingWhenCellsLoseFocus={true}
            onCellValueChanged={onCellValueChanged}
            overlayLoadingTemplate={`<div class="custom-loading-overlay"><div style="margin-top:8px;font-weight:500;">${TT(
              "DataTable.Status.Loading",
              "در حال بارگذاری...",
              "Loading..."
            )}</div></div>`}
            rowSelection="single"
            enableRtl={isRtl}
            defaultColDef={defaultColDefAligned}
            getRowClass={getRowClass}
            suppressRowClickSelection={false}
          />
        </div>
      </div>

      {showAddNew && (
        <button
          type="button"
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          onClick={handleAddClick}
        >
          {TT("DataTable.Toolbar.AddNew", "افزودن مورد جدید", "Add new item")}
        </button>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
          <TailSpin color="#7e3af2" height={80} width={80} />
        </div>
      )}
    </div>
  );
};

export default DataTable;