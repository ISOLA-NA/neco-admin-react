// TabContent.tsx
import React, { useState, useEffect } from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import DataTable from "../../TableDynamic/DataTable";
import MyPanel from "./PanelHeader";
import "./TabContent.css";

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

  const leftSize = isExpanded ? 100 : 50;
  const rightSize = isExpanded ? 0 : 50;

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
    setIsAdding(false); // Ensure we're not in add mode
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

  return (
    <div className="flex-grow bg-white overflow-hidden mt-4 border border-gray-300 rounded-lg mx-4 mb-6 transition-all duration-500 h-full">
      <Splitter
        className="h-full"
        layout="horizontal"
        style={{ height: "100%" }}
      >
        <SplitterPanel className="flex flex-col" size={leftSize} minSize={20}>
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

          <div className="h-full p-4 overflow-hidden">
            <DataTable
              columnDefs={columnDefs}
              rowData={rowData}
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
          size={rightSize}
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

            {/* با اضافه کردن key مقادیر فرم ریست می‌شوند */}
            {Component && isPanelOpen ? (
              <div className="mt-5">
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Component
                    key={isAdding ? "add-mode" : "edit-mode"}
                    selectedRow={isAdding ? null : selectedRow}
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
