// src/components/views/tabcontent/TabContent.tsx

import React, { Suspense } from "react";
import DataTable from "../../TableDynamic/DataTable";
import { Splitter, SplitterPanel } from "primereact/splitter";

interface TabContentProps {
  component: React.LazyExoticComponent<React.FC> | null;
  columnDefs: any[];
  rowData: any[];
}

const TabContent: React.FC<TabContentProps> = ({
  component: Component,
  columnDefs,
  rowData,
}) => {
  return (
    <div
      className="flex-grow bg-white overflow-hidden mt-4 border border-gray-300 rounded-lg mx-4 mb-6"
      style={{ height: "100%", minHeight: "400px" }}
    >
      <Splitter
        className="h-full"
        layout="horizontal"
        style={{ height: "100%" }}
      >
        {/* Data Table Panel */}
        <SplitterPanel className="flex flex-col" size={30} minSize={20}>
          <div className="h-full p-4">
            <DataTable
              columnDefs={columnDefs}
              rowData={rowData}
              onRowDoubleClick={(data) => {
                // Implement your double-click handler here
              }}
              setSelectedRowData={(data) => {
                // Implement your row selection handler here
              }}
            />
          </div>
        </SplitterPanel>

        {/* Content Panel */}
        <SplitterPanel className="flex flex-col" size={70} minSize={30}>
          <div className="h-full overflow-auto p-4">
            {Component ? (
              <Suspense fallback={<div>در حال بارگذاری...</div>}>
                <Component />
              </Suspense>
            ) : (
              <div>محتوای پیش‌فرض.</div>
            )}
          </div>
        </SplitterPanel>
      </Splitter>
    </div>
  );
};

export default TabContent;
