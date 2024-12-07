// src/components/views/tab/TabbedInterface.tsx

import React, { useState, useRef, Suspense } from "react";
import MainTabs from "./MainTabs";
import SubTabs from "./SubTabs";
import TabContent from "../tabcontent/TabContent";
import { tabsData, subTabDataMapping } from "./tabData";
import { subTabComponents } from "./SubTabsImports"; // Import the mapping of subtab to components

const TabbedInterface: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<string>("General");
  const [activeSubTab, setActiveSubTab] = useState<string>("Configurations");
  const [selectedRow, setSelectedRow] = useState<any>(null); // وضعیت برای ردیف انتخاب شده

  const mainTabsRef = useRef<HTMLDivElement>(null);
  const subTabsRef = useRef<HTMLDivElement>(null);

  // دریافت کامپوننت مربوط به زیرتب فعال
  const ActiveSubTabComponent = subTabComponents[activeSubTab] || null;

  const currentSubTabData = subTabDataMapping[activeSubTab] || {
    columnDefs: [],
    rowData: [],
  };

  const handleMainTabChange = (tabName: string) => {
    setActiveMainTab(tabName);
    const firstGroup = tabsData[tabName].groups
      ? tabsData[tabName].groups![0].subtabs[0]
      : tabsData[tabName].subtabs![0];
    setActiveSubTab(firstGroup);
    setSelectedRow(null); // ریست کردن وضعیت انتخاب ردیف با تغییر تب اصلی
    // اسکرول به ابتدا
    mainTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    subTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const handleSubTabChange = (subtab: string) => {
    setActiveSubTab(subtab);
    setSelectedRow(null); // ریست کردن وضعیت انتخاب ردیف با تغییر زیرتب
    // اسکرول به ابتدا
    subTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const scrollMainTabs = (direction: "left" | "right") => {
    if (mainTabsRef.current) {
      const scrollAmount = 150;
      mainTabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollSubTabs = (direction: "left" | "right") => {
    if (subTabsRef.current) {
      const scrollAmount = 150;
      subTabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleRowDoubleClick = (rowData: any) => {
    setSelectedRow(rowData);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 overflow-x-hidden">
      {/* تب‌های اصلی */}
      <MainTabs
        tabs={Object.keys(tabsData)}
        activeTab={activeMainTab}
        onTabChange={handleMainTabChange}
        scrollLeft={() => scrollMainTabs("left")}
        scrollRight={() => scrollMainTabs("right")}
        tabsRef={mainTabsRef}
      />

      {/* زیرتب‌ها */}
      <SubTabs
        groups={tabsData[activeMainTab].groups}
        subtabs={tabsData[activeMainTab].subtabs}
        activeSubTab={activeSubTab}
        onSubTabChange={handleSubTabChange}
        scrollLeft={() => scrollSubTabs("left")}
        scrollRight={() => scrollSubTabs("right")}
        subTabsRef={subTabsRef}
      />

      {/* محتوای تب‌ها */}
      <TabContent
        component={ActiveSubTabComponent}
        columnDefs={currentSubTabData.columnDefs}
        rowData={currentSubTabData.rowData}
        onRowDoubleClick={handleRowDoubleClick} // ارسال تابع برای مدیریت دو بار کلیک ردیف
        selectedRow={selectedRow} // ارسال داده ردیف انتخاب شده
      />
    </div>
  );
};

export default TabbedInterface;
