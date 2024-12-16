// Accordion1.tsx

import React, { useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import DynamicInput from "../../../utilities/DynamicInput";
import { FaSearch } from "react-icons/fa";
import {
  FiCopy,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

interface Accordion1Props {
  onRowClick: (row: any) => void;
  onRowDoubleClick: () => void;
  isOpen: boolean;
  toggleAccordion: () => void;
}

interface RowData1 {
  ID: number;
  Name: string;
  Description: string;
  Order: number;
}

const Accordion1: React.FC<Accordion1Props> = ({
  onRowClick,
  onRowDoubleClick,
  isOpen,
  toggleAccordion,
}) => {
  const [selectedRow, setSelectedRow] = useState<RowData1 | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [rowData, setRowData] = useState<RowData1[]>([
    { ID: 1, Name: "Row 1", Description: "Description 1", Order: 1 },
    { ID: 2, Name: "Row 2", Description: "Description 2", Order: 2 },
  ]);

  const columnDefs: ColDef<RowData1>[] = [
    { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
    {
      headerName: "Description",
      field: "Description",
      filter: "agTextColumnFilter",
    },
    { headerName: "Order", field: "Order", filter: "agNumberColumnFilter" },
  ];

  const filteredRowData = useMemo(() => {
    if (!searchText) return rowData;
    return rowData.filter((row) =>
      Object.values(row).some((value) =>
        value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, rowData]);

  const handleRowClick = (event: any) => {
    const row = event.data as RowData1;
    setSelectedRow(row);
    onRowClick(row);
  };

  const handleRowDoubleClickEvent = () => {
    // دابل کلیک روی ردیف جدول
    onRowDoubleClick();
  };

  // Actions
  const onDuplicate = () => {
    if (selectedRow) {
      const newId =
        rowData.length > 0 ? Math.max(...rowData.map((r) => r.ID)) + 1 : 1;
      const duplicatedRow = { ...selectedRow, ID: newId };
      setRowData((prev) => [...prev, duplicatedRow]);
      setSelectedRow(duplicatedRow);
    }
  };

  const onEdit = () => {
    // اینپوت‌ها همیشه قابل ویرایش هستند، فقط لاگ می‌گیریم
    console.log("Edit clicked for Row:", selectedRow);
  };

  const onDelete = () => {
    if (selectedRow) {
      setRowData((prev) => prev.filter((row) => row.ID !== selectedRow.ID));
      setSelectedRow(null);
      onRowClick(null);
    }
  };

  const onAdd = () => {
    const newId =
      rowData.length > 0 ? Math.max(...rowData.map((r) => r.ID)) + 1 : 1;
    const newRow: RowData1 = { ID: newId, Name: "", Description: "", Order: 0 };
    setRowData((prev) => [...prev, newRow]);
    setSelectedRow(newRow);
    onRowClick(null);
  };

  const handleInputChange = (name: string, value: string | number) => {
    setSelectedRow((prev) => {
      if (prev) {
        const updatedRow = { ...prev, [name]: value };
        setRowData((prevData) =>
          prevData.map((row) => (row.ID === updatedRow.ID ? updatedRow : row))
        );
        return updatedRow;
      }
      return prev;
    });
  };

  return (
    <div
      className={`collapse bg-base-200 mb-4 ${isOpen ? "collapse-open" : ""}`}
    >
      <div
        className="collapse-title text-xl font-medium cursor-pointer flex justify-between items-center"
        onClick={toggleAccordion} // با یک کلیک اکاردئون باز و بسته می‌شود
      >
        <span>Accordion 1 - Main Table</span>
        {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </div>
      <div className="collapse-content">
        {isOpen && (
          <>
            {/* نوار جستجو و دکمه‌های عملیات */}
            <div className="flex items-center justify-between mb-4">
              <div className="relative max-w-sm">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search...."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="search-input w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  style={{ fontFamily: "inherit" }}
                />
              </div>

              <div className="flex items-center space-x-4">
                <button
                  className="text-yellow-600 hover:text-yellow-800 transition"
                  title="Duplicate"
                  onClick={onDuplicate}
                >
                  <FiCopy size={25} />
                </button>
                <button
                  className="text-blue-600 hover:text-blue-800 transition"
                  title="Edit"
                  onClick={onEdit}
                >
                  <FiEdit size={25} />
                </button>
                <button
                  className="text-red-600 hover:text-red-800 transition"
                  title="Delete"
                  onClick={onDelete}
                >
                  <FiTrash2 size={25} />
                </button>
                <button
                  className="text-green-600 hover:text-green-800 transition"
                  title="Add"
                  onClick={onAdd}
                >
                  <FiPlus size={25} />
                </button>
              </div>
            </div>

            {/* جدول داده‌ها */}
            <div
              className="ag-theme-quartz"
              style={{ height: "300px", width: "100%" }}
            >
              <AgGridReact<RowData1>
                columnDefs={columnDefs}
                rowData={filteredRowData}
                pagination={true}
                paginationPageSize={5}
                onRowClicked={handleRowClick}
                onRowDoubleClicked={handleRowDoubleClickEvent}
                rowSelection="single"
                animateRows={true}
              />
            </div>

            {/* فیلدهای ورودی */}
            <div className="mt-4">
              <DynamicInput
                name="Name"
                type="text"
                value={selectedRow?.Name || ""}
                placeholder=""
                onChange={(e) => handleInputChange("Name", e.target.value)}
                className="mt-10"
              />
              <DynamicInput
                name="Description"
                type="text"
                value={selectedRow?.Description || ""}
                placeholder=""
                onChange={(e) =>
                  handleInputChange("Description", e.target.value)
                }
                className="mt-10"
              />
              <DynamicInput
                name="Order"
                type="number"
                value={selectedRow?.Order || 0}
                placeholder=""
                onChange={(e) =>
                  handleInputChange("Order", parseInt(e.target.value, 10) || 0)
                }
                className="mt-10"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Accordion1;
