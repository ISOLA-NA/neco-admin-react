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
      style={{ height: "100%" }}
    >
      <Splitter style={{ height: "100%" }}>
        {/* پنل محتوا */}
        <SplitterPanel
          className="flex align-items-center justify-content-center"
          size={30}
        >
          <div style={{ margin: "10px", height: "100%", width: "100%" }}>
            <DataTable
              columnDefs={columnDefs}
              rowData={rowData}
              onRowDoubleClick={function (data: any): void {
                // Implement your double-click handler here
              }}
              setSelectedRowData={function (data: any): void {
                // Implement your row selection handler here
              }}
            />
          </div>
        </SplitterPanel>
        {/* پنل جدول */}
        <SplitterPanel
          className="flex align-items-center justify-content-center"
          size={70}
        >
          <div style={{ margin: "10px", padding: "10px", direction: "rtl" }}>
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
