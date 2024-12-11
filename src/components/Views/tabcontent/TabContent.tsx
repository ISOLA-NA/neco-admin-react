// src/components/Views/tab/TabContent.tsx

import React, { useState, useEffect } from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import DataTable from "../../TableDynamic/DataTable";
import MyPanel from "./PanelHeader";
import "./TabContent.css";
import { categoriesCata, categoriesCatb } from "../tab/tabData"; // اطمینان از مسیر صحیح
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";

interface TabContentProps {
  component: React.LazyExoticComponent<React.FC<any>> | null;
  columnDefs: any[];
  rowData: any[];
  onRowDoubleClick: (data: any) => void;
  selectedRow: any;
  activeSubTab: string;
  showDuplicateIcon: boolean;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRowClick: (data: any) => void;
}

const TabContent: React.FC<TabContentProps> = ({
  component: Component,
  columnDefs,
  rowData,
  onRowDoubleClick,
  selectedRow,
  activeSubTab,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onRowClick,
  showDuplicateIcon,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [categoryType, setCategoryType] = useState<"cata" | "catb">("cata"); // وضعیت انتخاب دسته

  const [currentColumnDefs, setCurrentColumnDefs] = useState<any[]>(columnDefs);
  const [currentRowData, setCurrentRowData] = useState<any[]>(rowData);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleSave = (): void => {
    console.log("Save clicked");
    setIsAdding(false);
    setIsPanelOpen(false);
  };

  const handleUpdate = (): void => {
    if (selectedRow) {
      console.log("Update clicked for row:", selectedRow);
      setIsPanelOpen(false);
    } else {
      alert("Please select a row to update.");
    }
  };

  const handleClose = (): void => {
    setIsPanelOpen(false);
    setIsAdding(false);
  };

  const handleDoubleClick = (data: any) => {
    onRowDoubleClick(data);
    setIsAdding(false); // اطمینان از عدم حالت افزودن
    setIsPanelOpen(true);
  };

  const handleRowClickLocal = (data: any) => {
    if (!isPanelOpen || isAdding) {
      onRowClick(data);
    }
  };

  const handleEditClick = () => {
    if (selectedRow) {
      setIsAdding(false);
      setIsPanelOpen(true);
      onEdit();
    } else {
      alert("Please select a row to edit.");
    }
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setIsPanelOpen(true);
    onAdd();
  };

  const handleDeleteClick = () => {
    if (selectedRow) {
      onDelete();
    } else {
      alert("Please select a row to delete.");
    }
  };

  const handleDuplicateClick = () => {
    if (selectedRow) {
      onDuplicate();
    } else {
      alert("Please select a row to duplicate.");
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "cata" | "catb";
    setCategoryType(value);
  };

  useEffect(() => {
    if (activeSubTab === "Categories") {
      if (categoryType === "cata") {
        setCurrentColumnDefs(categoriesCata.columnDefs);
        setCurrentRowData(categoriesCata.rowData);
      } else if (categoryType === "catb") {
        setCurrentColumnDefs(categoriesCatb.columnDefs);
        setCurrentRowData(categoriesCatb.rowData);
      }
    } else {
      setCurrentColumnDefs(columnDefs);
      setCurrentRowData(rowData);
    }
  }, [activeSubTab, categoryType, columnDefs, rowData]);

  return (
    <div className="flex-grow bg-white overflow-hidden mt-4 border border-gray-300 rounded-lg mx-4 mb-6 transition-all duration-500 h-full">
      <Splitter
        className="h-full"
        layout="horizontal"
        style={{ height: "100%" }}
      >
        <SplitterPanel
          className="flex flex-col"
          size={isExpanded ? 100 : 50}
          minSize={20}
        >
          <div className="flex items-center justify-between p-2 border-b border-gray-300 bg-gray-100">
            <div className="font-bold text-gray-700 text-sm">
              {activeSubTab}
            </div>
            <button
              onClick={toggleExpand}
              className="text-gray-700 hover:text-gray-900 transition"
            >
              {isExpanded ? (
                <FiMinimize2 size={18} />
              ) : (
                <FiMaximize2 size={18} />
              )}
            </button>
          </div>

          {/* Select بالا */}
          {activeSubTab === "Categories" && (
            <div className="px-4 py-2">
              <select
                id="categoryType"
                value={categoryType}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="cata">Cata</option>
                <option value="catb">Cat B</option>
              </select>
            </div>
          )}

          <div className="h-full p-4 overflow-hidden">
            <DataTable
              columnDefs={currentColumnDefs}
              rowData={currentRowData}
              onRowDoubleClick={handleDoubleClick}
              setSelectedRowData={handleRowClickLocal}
              showDuplicateIcon={showDuplicateIcon}
              onAdd={handleAddClick}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onDuplicate={handleDuplicateClick}
              isRowSelected={!!selectedRow}
            />
          </div>
        </SplitterPanel>

        <SplitterPanel
          className="flex flex-col"
          size={isExpanded ? 0 : 50}
          minSize={30}
          style={{
            overflow: "hidden",
          }}
        >
          <div className="h-full overflow-auto p-4">
            {!isPanelOpen ? (
              <div className="text-gray-500 flex justify-center items-center h-full">
                Select a row to view details.
              </div>
            ) : (
              <MyPanel
                isExpanded={isExpanded}
                toggleExpand={toggleExpand}
                onSave={isAdding ? handleSave : undefined}
                onClose={handleClose}
                onUpdate={!isAdding ? handleUpdate : undefined}
              />
            )}

            {/* نمایش کامپوننت‌های اضافی در صورت باز بودن پنل */}
            {Component && isPanelOpen ? (
              <div className="mt-5">
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Component
                    key={isAdding ? "add-mode" : "edit-mode"}
                    selectedRow={isAdding ? null : selectedRow}
                    categoryType={categoryType} // انتقال categoryType
                    setCategoryType={setCategoryType} // انتقال setCategoryType
                  />
                </React.Suspense>
              </div>
            ) : null}
          </div>
        </SplitterPanel>
      </Splitter>
    </div>
  );
};

export default TabContent;
