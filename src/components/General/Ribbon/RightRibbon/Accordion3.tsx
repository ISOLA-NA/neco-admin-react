// Accordion3.tsx

import React, { useState, useMemo, useEffect } from "react";
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

interface Accordion3Props {
  selectedRow: {
    ID: number;
    SubName: string;
    SubDescription: string;
    Order: number;
  } | null;
  onRowDoubleClick: () => void;
  isOpen: boolean;
  toggleAccordion: () => void;
}

interface RowData3 {
  ID: number;
  DetailName: string;
  DetailDescription: string;
  Order: number;
}

const Accordion3: React.FC<Accordion3Props> = ({
  selectedRow,
  onRowDoubleClick,
  isOpen,
  toggleAccordion,
}) => {
  const [selectedRow3, setSelectedRow3] = useState<RowData3 | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [rowData, setRowData] = useState<RowData3[]>([]);

  useEffect(() => {
    if (selectedRow) {
      setRowData([
        {
          ID: 1,
          DetailName: `Detail-1 of ${selectedRow.SubName}`,
          DetailDescription: "Extra Info 1",
          Order: 1,
        },
        {
          ID: 2,
          DetailName: `Detail-2 of ${selectedRow.SubName}`,
          DetailDescription: "Extra Info 2",
          Order: 2,
        },
      ]);
      setSelectedRow3(null);
    } else {
      setRowData([]);
      setSelectedRow3(null);
    }
  }, [selectedRow]);

  const columnDefs: ColDef<RowData3>[] = [
    {
      headerName: "Detail-Name",
      field: "DetailName",
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Detail-Description",
      field: "DetailDescription",
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
    const row = event.data as RowData3;
    setSelectedRow3(row);
  };

  const handleRowDoubleClickEvent = (event: any) => {
    onRowDoubleClick();
    // اکاردئون بعدی وجود ندارد، بنابراین این فراخوانی کاری انجام نمی‌دهد
  };

  // Actions
  const onDuplicate = () => {
    if (selectedRow3) {
      const newId =
        rowData.length > 0 ? Math.max(...rowData.map((r) => r.ID)) + 1 : 1;
      const duplicatedRow = { ...selectedRow3, ID: newId };
      setRowData((prev) => [...prev, duplicatedRow]);
      setSelectedRow3(duplicatedRow);
    }
  };

  const onEdit = () => {
    console.log("Edit clicked for Row:", selectedRow3);
  };

  const onDelete = () => {
    if (selectedRow3) {
      setRowData((prev) => prev.filter((row) => row.ID !== selectedRow3.ID));
      setSelectedRow3(null);
    }
  };

  const onAdd = () => {
    if (selectedRow) {
      const newId =
        rowData.length > 0 ? Math.max(...rowData.map((r) => r.ID)) + 1 : 1;
      const newRow: RowData3 = {
        ID: newId,
        DetailName: "",
        DetailDescription: "",
        Order: 0,
      };
      setRowData((prev) => [...prev, newRow]);
      setSelectedRow3(newRow);
    }
  };

  const handleInputChange = (name: string, value: string | number) => {
    setSelectedRow3((prev) => {
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
        onClick={toggleAccordion} // با یک کلیک باز/بسته شود
      >
        <span>Accordion 3 - Details Table</span>
        {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </div>
      <div className="collapse-content">
        {isOpen && selectedRow ? (
          <>
            {/* نوار جستجو و دکمه‌های عملیات */}
            <div className="flex items-center justify-between mb-4">
              <div className="relative max-w-sm">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search all table data..."
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
              <AgGridReact<RowData3>
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
                name="DetailName"
                type="text"
                value={selectedRow3?.DetailName || ""}
                placeholder=""
                onChange={(e) =>
                  handleInputChange("DetailName", e.target.value)
                }
                className="mt-10"
              />
              <DynamicInput
                name="DetailDescription"
                type="text"
                value={selectedRow3?.DetailDescription || ""}
                placeholder=""
                onChange={(e) =>
                  handleInputChange("DetailDescription", e.target.value)
                }
                className="mt-10"
              />
              <DynamicInput
                name="Order"
                type="number"
                value={selectedRow3?.Order || 0}
                placeholder=""
                onChange={(e) =>
                  handleInputChange("Order", parseInt(e.target.value, 10) || 0)
                }
                className="mt-10"
              />
            </div>
          </>
        ) : (
          isOpen && (
            <p className="text-gray-500">
              Select a row in Accordion 2 to see more details.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default Accordion3;
