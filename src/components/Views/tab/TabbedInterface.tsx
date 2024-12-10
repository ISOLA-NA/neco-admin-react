import React, { useState, useRef } from "react";
import MainTabs from "./MainTabs";
import SubTabs from "./SubTabs";
import TabContent from "../tabcontent/TabContent";
import { tabsData, subTabDataMapping } from "./tabData";
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

  const duplicateEnabledSubTabs = ["Configurations", "Settings"];

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
  };

  const handleEdit = () => {
    // در اینجا کنترل اصلی در TabContent انجام می‌شود (alert در صورت عدم انتخاب ردیف)
    console.log("Edit action triggered");
  };

  const handleDelete = () => {
    // alert در صورت عدم انتخاب ردیف در TabContent هندل می‌شود
    console.log("Delete action triggered");
  };

  const handleDuplicate = () => {
    // alert در صورت عدم انتخاب ردیف در TabContent هندل می‌شود
    console.log("Duplicate action triggered");
  };

  const handleRowClick = (data: any) => {
    // انتخاب ردیف با یک کلیک
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
        showDuplicateIcon={duplicateEnabledSubTabs.includes(activeSubTab)}
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
