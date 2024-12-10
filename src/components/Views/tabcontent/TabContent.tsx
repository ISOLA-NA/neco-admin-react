import React, { useState } from "react";
import DataTable from "../../TableDynamic/DataTable";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import "./TabContent.css";
import MyPanel from "./PanelHeader";

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

  // اینجا اندازه پنل‌ها به حالت قبل برگردانده شده
  const leftSize = isExpanded ? 100 : 50;
  const rightSize = isExpanded ? 0 : 50;

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  function handleSave(): void {
    console.log("Save clicked");
  }

  function handleClose(): void {
    // در صورت تمایل می‌توانید با بستن پنل، محتوا را خالی کنید
    setIsPanelOpen(false);
  }

  const handleDoubleClick = (data: any) => {
    onRowDoubleClick(data);
    setIsPanelOpen(true);
  };

  const handleEditClick = () => {
    if (selectedRow) {
      setIsPanelOpen(true);
      onEdit();
    } else {
      alert("Please select a row to edit.");
    }
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
              setSelectedRowData={onRowClick}
              showDuplicateIcon={showDuplicateIcon}
              onAdd={onAdd}
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
            // در حالت expand، پنل سمت راست عملا 0 است و نمایش داده نمی‌شود
          }}
        >
          <div className="h-full overflow-auto p-4">
            <MyPanel
              isExpanded={isExpanded}
              toggleExpand={toggleExpand}
              onSave={handleSave}
              onClose={handleClose}
            />
            {Component && selectedRow && isPanelOpen ? (
              <React.Suspense fallback={<div>Loading...</div>}>
                <Component selectedRow={selectedRow} />
              </React.Suspense>
            ) : (
              <div className="text-gray-500">Select a row to view details.</div>
            )}
          </div>
        </SplitterPanel>
      </Splitter>
    </div>
  );
};

export default TabContent;
