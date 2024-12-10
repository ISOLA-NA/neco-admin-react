// src/components/Views/tabcontent/TabContent.tsx

import React, { Suspense, useState } from "react";
import DataTable from "../../TableDynamic/DataTable";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import "./TabContent.css"; // برای CSS transitions

interface TabContentProps {
  component: React.LazyExoticComponent<React.FC<any>> | null;
  columnDefs: any[];
  rowData: any[];
  onRowDoubleClick: (data: any) => void;
  selectedRow: any;
  activeSubTab: string;
  showAddIcon: boolean;
  showDeleteIcon: boolean;
  showEditIcon: boolean;
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
  showAddIcon,
  showEditIcon,
  showDeleteIcon,
  showDuplicateIcon,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const leftSize = isExpanded ? 100 : 50;
  const rightSize = isExpanded ? 0 : 50;

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  console.log("Selected Row in TabContent:", selectedRow);

  return (
    <div
      className="flex-grow bg-white overflow-hidden mt-4 border border-gray-300 rounded-lg mx-4 mb-6 transition-all duration-500"
      style={{ height: "100%", minHeight: "400px" }}
    >
      <Splitter className="h-full" layout="horizontal" style={{ height: "100%" }}>
        {/* پنل سمت چپ - جدول داده‌ها */}
        <SplitterPanel
          className={`flex flex-col transition-panel`}
          size={leftSize}
          minSize={20}
        >
          {/* ردیف سرصفحه */}
          <div className="flex items-center justify-between p-2 border-b border-gray-300 bg-gray-100">
            {/* عنوان زیرتب در سمت چپ */}
            <div className="font-bold text-gray-700 text-sm">{activeSubTab}</div>
            {/* آیکون باز/بسته کردن در سمت راست */}
            <button
              onClick={toggleExpand}
              className="text-gray-700 hover:text-gray-900 transition"
            >
              {isExpanded ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
            </button>
          </div>

          {/* جدول داده‌ها */}
          <div className="h-full p-4 overflow-hidden">
            <DataTable
              columnDefs={columnDefs}
              rowData={rowData}
              onRowDoubleClick={onRowDoubleClick}
              setSelectedRowData={onRowClick} // ارسال تابع
              showAddIcon={showAddIcon}
              showEditIcon={showEditIcon}
              showDeleteIcon={showDeleteIcon}
              showDuplicateIcon={showDuplicateIcon}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          </div>
        </SplitterPanel>

        {/* پنل سمت راست - محتوای انتخاب شده */}
        <SplitterPanel
          className={`flex flex-col transition-panel`}
          size={rightSize}
          minSize={30}
          style={{
            overflow: "hidden",
            display: rightSize === 0 ? "none" : "flex",
          }}
        >
          <div className="h-full overflow-auto p-4">
            {Component && selectedRow ? (
              <Suspense fallback={<div>Loading...</div>}>
                <Component selectedRow={selectedRow} />
              </Suspense>
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
