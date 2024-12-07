// src/components/views/tab/TabbedInterface.tsx
import React, { useState, useRef } from "react";
import MainTabs from "./MainTabs";
import SubTabs from "./SubTabs";
import TabContent from "../tabcontent/TabContent";
import { tabsData, subTabDataMapping, SubTabData } from "./tabData";

const TabbedInterface: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<string>("General");
  const [activeSubTab, setActiveSubTab] = useState<string>("Configurations");

  const mainTabsRef = useRef<HTMLDivElement>(null);
  const subTabsRef = useRef<HTMLDivElement>(null);

  // دریافت داده‌های زیرتب فعال
  const currentSubTabData: SubTabData = subTabDataMapping[activeSubTab] || {
    content: "Default content.",
    columnDefs: [],
    rowData: [],
  };

  const handleMainTabChange = (tabName: string) => {
    setActiveMainTab(tabName);
    const firstGroup = tabsData[tabName].groups
      ? tabsData[tabName].groups![0].subtabs[0]
      : tabsData[tabName].subtabs![0];
    setActiveSubTab(firstGroup);
    // اسکرول به ابتدای تب‌ها
    mainTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    subTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const handleSubTabChange = (subtab: string) => {
    setActiveSubTab(subtab);
    // اسکرول به ابتدای ساب‌تب‌ها
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

      {/* ساب‌تب‌ها */}
      <SubTabs
        groups={tabsData[activeMainTab].groups}
        subtabs={tabsData[activeMainTab].subtabs}
        activeSubTab={activeSubTab}
        onSubTabChange={handleSubTabChange}
        scrollLeft={() => scrollSubTabs("left")}
        scrollRight={() => scrollSubTabs("right")}
        subTabsRef={subTabsRef}
      />

      {/* محتوای تب */}
      <TabContent
        content={currentSubTabData.content}
        columnDefs={currentSubTabData.columnDefs}
        rowData={currentSubTabData.rowData}
      />
    </div>
  );
};

export default TabbedInterface;
