// src/components/Views/tab/TabbedInterface.tsx

import React, { useState, useRef, Suspense } from "react";
import MainTabs from "./MainTabs";
import SubTabs from "./SubTabs";
import TabContent from "../tabcontent/TabContent";
import { tabsData, subTabDataMapping } from "./tabData"; // استفاده از 'tabsData' به جای 'TabsData'
import { subTabComponents } from "./SubTabsImports";

const TabbedInterface: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<string>("General");
  const [activeSubTab, setActiveSubTab] = useState<string>("Configurations");
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const mainTabsRef = useRef<HTMLDivElement>(null);
  const subTabsRef = useRef<HTMLDivElement>(null);

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
    setSelectedRow(null);
    mainTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    subTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const handleSubTabChange = (subtab: string) => {
    setActiveSubTab(subtab);
    setSelectedRow(null);
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
    console.log("Row double-clicked in TabbedInterface:", rowData);
    setSelectedRow(rowData);
  };

  const handleRowClick = (rowData: any) => {
    console.log("Row clicked in TabbedInterface:", rowData);
    setSelectedRow(rowData);
  };

  // CRUD Handlers
  const handleAdd = () => {
    console.log("Add clicked");
    // اضافه کردن منطق مورد نیاز
  };

  const handleEdit = () => {
    if (selectedRow) {
      console.log("Edit clicked for row:", selectedRow);
      // اضافه کردن منطق ویرایش
    } else {
      alert("Please select a row to edit.");
    }
  };

  const handleDelete = () => {
    if (selectedRow) {
      console.log("Delete clicked for row:", selectedRow);
      // اضافه کردن منطق حذف
    } else {
      alert("Please select a row to delete.");
    }
  };

  const handleDuplicate = () => {
    if (selectedRow) {
      console.log("Duplicate clicked for row:", selectedRow);
      // اضافه کردن منطق تکرار
    } else {
      alert("Please select a row to duplicate.");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 overflow-x-hidden">
      <MainTabs
        tabs={Object.keys(tabsData)}
        activeTab={activeMainTab}
        onTabChange={handleMainTabChange}
        scrollLeft={() => scrollMainTabs("left")}
        scrollRight={() => scrollMainTabs("right")}
        tabsRef={mainTabsRef}
      />

      <SubTabs
        groups={tabsData[activeMainTab].groups}
        subtabs={tabsData[activeMainTab].subtabs}
        activeSubTab={activeSubTab}
        onSubTabChange={handleSubTabChange}
        scrollLeft={() => scrollSubTabs("left")}
        scrollRight={() => scrollSubTabs("right")}
        subTabsRef={subTabsRef}
      />

      {/* رندر کردن TabContent با آیکون‌های CRUD */}
      <TabContent
        component={ActiveSubTabComponent}
        columnDefs={currentSubTabData.columnDefs}
        rowData={currentSubTabData.rowData}
        onRowDoubleClick={handleRowDoubleClick}
        selectedRow={selectedRow}
        activeSubTab={activeSubTab}
        showAddIcon={true}
        showDeleteIcon={true}
        showEditIcon={true}
        showDuplicateIcon={true}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onRowClick={handleRowClick} // ارسال تابع
      />
    </div>
  );
};

export default TabbedInterface;
