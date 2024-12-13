// TabbedInterface.tsx

import React, { useState, useRef } from "react";
import MainTabs from "./MainTabs";
import SubTabs from "./SubTabs";
import TabContent from "../tabcontent/TabContent";
import { tabsData, subTabDataMapping } from "./tabData";
import { subTabComponents } from "./SubTabsImports";
import {
  subtabIconVisibility,
  IconVisibility,
} from "../../TableDynamic/TabIconVisibility"; // وارد کردن پیکربندی

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

  // استخراج تنظیمات نمایش آیکون‌ها برای ساب‌تب فعال
  const currentIconVisibility: IconVisibility = subtabIconVisibility[
    activeSubTab
  ] || {
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showDuplicate: false,
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

  // CRUD Handlers
  const handleAdd = () => {
    console.log("Add clicked");
    setSelectedRow(null); // خالی کردن انتخاب
  };

  const handleEdit = () => {
    console.log("Edit action triggered");
  };

  const handleDelete = () => {
    console.log("Delete action triggered");
  };

  const handleDuplicate = () => {
    console.log("Duplicate action triggered");
  };

  const handleRowClick = (data: any) => {
    setSelectedRow(data);
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

      <TabContent
        component={ActiveSubTabComponent}
        columnDefs={currentSubTabData.columnDefs}
        rowData={currentSubTabData.rowData}
        onRowDoubleClick={handleRowDoubleClick}
        selectedRow={selectedRow}
        activeSubTab={activeSubTab}
        showDuplicateIcon={currentIconVisibility.showDuplicate || false}
        showAddIcon={currentIconVisibility.showAdd || false}
        showEditIcon={currentIconVisibility.showEdit || false}
        showDeleteIcon={currentIconVisibility.showDelete || false}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default TabbedInterface;
