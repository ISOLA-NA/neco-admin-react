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
import { useSubTabDefinitions } from "../../../../context/SubTabDefinitionsContext";

interface Accordion3Props {
  selectedMenuGroupId: number | null;
  onRowDoubleClick: () => void;
  isOpen: boolean;
  toggleAccordion: () => void;
}

interface RowData3 {
  ID: number;
  Name: string;
  Command: string;
  Description: string;
  Order: number;
}

const Accordion3: React.FC<Accordion3Props> = ({
  selectedMenuGroupId,
  onRowDoubleClick,
  isOpen,
  toggleAccordion,
}) => {
  const { subTabDefinitions, fetchDataForSubTab } = useSubTabDefinitions();
  const [selectedRow, setSelectedRow] = useState<RowData3 | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [rowData, setRowData] = useState<RowData3[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const columnDefs: ColDef<RowData3>[] =
    subTabDefinitions["MenuItem"].columnDefs;

  useEffect(() => {
    if (isOpen && selectedMenuGroupId !== null) {
      setIsLoading(true);
      fetchDataForSubTab("MenuItem", { ID: selectedMenuGroupId }) // ارسال id
        .then((data: RowData3[]) => {
          setRowData(data);
        })
        .catch((error: any) => {
          console.error("Error fetching MenuItems:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setRowData([]);
      setSelectedRow(null);
    }
  }, [isOpen, selectedMenuGroupId, fetchDataForSubTab, subTabDefinitions]);

  const filteredRowData = useMemo(() => {
    if (!searchText) return rowData;
    return rowData.filter(
      (row) =>
        row.Name.toLowerCase().includes(searchText.toLowerCase()) ||
        row.Command.toLowerCase().includes(searchText.toLowerCase()) ||
        row.Description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, rowData]);

  const handleRowClick = (event: any) => {
    const row = event.data as RowData3;
    setSelectedRow(row);
  };

  const handleRowDoubleClickEvent = () => {
    onRowDoubleClick();
  };

  // عملیات
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
    console.log("Edit clicked for Row:", selectedRow);
    // پیاده‌سازی منطق ویرایش در صورت نیاز
  };

  const onDelete = () => {
    if (selectedRow) {
      setRowData((prev) => prev.filter((row) => row.ID !== selectedRow.ID));
      setSelectedRow(null);
    }
  };

  const onAdd = () => {
    if (selectedMenuGroupId !== null) {
      const newId =
        rowData.length > 0 ? Math.max(...rowData.map((r) => r.ID)) + 1 : 1;
      const newRow: RowData3 = {
        ID: newId,
        Name: "",
        Command: "",
        Description: "",
        Order: 0,
      };
      setRowData((prev) => [...prev, newRow]);
      setSelectedRow(newRow);
    }
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
        onClick={toggleAccordion}
      >
        <span>Menu Items</span>
        {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </div>
      <div className="collapse-content">
        {isOpen && selectedMenuGroupId !== null ? (
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
                  disabled={!selectedRow}
                >
                  <FiCopy size={25} />
                </button>
                <button
                  className="text-blue-600 hover:text-blue-800 transition"
                  title="Edit"
                  onClick={onEdit}
                  disabled={!selectedRow}
                >
                  <FiEdit size={25} />
                </button>
                <button
                  className="text-red-600 hover:text-red-800 transition"
                  title="Delete"
                  onClick={onDelete}
                  disabled={!selectedRow}
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
                overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading...</span>'
                loadingOverlayComponentParams={{ loadingMessage: "Loading..." }}
              />
            </div>

            {/* فیلدهای ورودی */}
            {selectedRow && (
              <div className="mt-4">
                <DynamicInput
                  name="Name"
                  type="text"
                  value={selectedRow?.Name || ""}
                  placeholder="Name"
                  onChange={(e) => handleInputChange("Name", e.target.value)}
                  className="mt-2"
                />
                <DynamicInput
                  name="Command"
                  type="text"
                  value={selectedRow?.Command || ""}
                  placeholder="Command"
                  onChange={(e) => handleInputChange("Command", e.target.value)}
                  className="mt-2"
                />
                <DynamicInput
                  name="Description"
                  type="text"
                  value={selectedRow?.Description || ""}
                  placeholder="Description"
                  onChange={(e) =>
                    handleInputChange("Description", e.target.value)
                  }
                  className="mt-2"
                />
                <DynamicInput
                  name="Order"
                  type="number"
                  value={selectedRow?.Order || 0}
                  placeholder="Order"
                  onChange={(e) =>
                    handleInputChange(
                      "Order",
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                  className="mt-2"
                />
              </div>
            )}
          </>
        ) : (
          isOpen && (
            <p className="text-gray-500">
              Select a Menu Group in Accordion 2 to see Menu Items.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default Accordion3;
