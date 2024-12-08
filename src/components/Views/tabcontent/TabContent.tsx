// src/components/views/tabcontent/TabContent.tsx

import React, { Suspense } from "react";
import DataTable from "../../TableDynamic/DataTable";
import { Splitter, SplitterPanel } from "primereact/splitter";

interface TabContentProps {
  component: React.LazyExoticComponent<React.FC<any>> | null;
  columnDefs: any[];
  rowData: any[];
  onRowDoubleClick: (data: any) => void; // تابع برای مدیریت دو بار کلیک ردیف
  selectedRow: any; // داده ردیف انتخاب شده
}

const TabContent: React.FC<TabContentProps> = ({
  component: Component,
  columnDefs,
  rowData,
  onRowDoubleClick,
  selectedRow,
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
        {/* پنل جدول داده‌ها */}
        <SplitterPanel className="flex flex-col" size={50} minSize={20}>
          <div className="h-full p-4">
            <DataTable
              columnDefs={columnDefs}
              rowData={rowData}
              onRowDoubleClick={onRowDoubleClick} // اتصال تابع دو بار کلیک ردیف
              setSelectedRowData={() => {}} // در اینجا نیازی به استفاده نیست
            />
          </div>
        </SplitterPanel>

        {/* پنل محتوای انتخاب شده */}
        <SplitterPanel className="flex flex-col" size={50} minSize={30}>
          <div className="h-full overflow-auto p-4">
            {Component && selectedRow ? (
              <Suspense fallback={<div>در حال بارگذاری...</div>}>
                <Component selectedRow={selectedRow} />{" "}
                {/* ارسال داده ردیف به کامپوننت */}
              </Suspense>
            ) : (
              <div className="text-gray-500"></div>
            )}
          </div>
        </SplitterPanel>
      </Splitter>
    </div>
  );
};

export default TabContent;
