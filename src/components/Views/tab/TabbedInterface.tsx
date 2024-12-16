// src/components/Views/tab/TabbedInterface.tsx

import React, { useState, useRef, useEffect } from "react";
import MainTabs from "./MainTabs";
import SubTabs from "./SubTabs";
import TabContent from "../tabcontent/TabContent";
import { tabsData, subTabDataMapping } from "./tabData";
import { subTabComponents } from "./SubTabsImports";
import {
  subtabIconVisibility,
  IconVisibility,
} from "../../TableDynamic/TabIconVisibility"; // وارد کردن پیکربندی
import { showAlert } from "../../utilities/Alert/DynamicAlert"; // برای نمایش توست
import { useNavigate } from "react-router-dom";
import DrawerComponent from "../tab/Header"; // وارد کردن کامپوننت هدر
import SidebarDrawer from "../tab/SidebarDrawer"; // وارد کردن کامپوننت دراور

interface TabbedInterfaceProps {
  onLogout: () => void;
}

const TabbedInterface: React.FC<TabbedInterfaceProps> = ({ onLogout }) => {
  const [activeMainTab, setActiveMainTab] = useState<string>("General");
  const [activeSubTab, setActiveSubTab] = useState<string>("Configurations");
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false); // وضعیت دراور

  const mainTabsRef = useRef<HTMLDivElement>(null);
  const subTabsRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

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
    if (tabName === "File") {
      // باز کردن دراور
      setIsDrawerOpen(true);
      return; // جلوگیری از تغییر تب فعال
    }
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
    showAlert("info", null, "افزودن", "عملیات افزودن انجام شد.");
  };

  const handleEdit = () => {
    console.log("Edit action triggered");
    showAlert("info", null, "ویرایش", "عملیات ویرایش انجام شد.");
  };

  const handleDelete = () => {
    console.log("Delete action triggered");
    showAlert("info", null, "حذف", "عملیات حذف انجام شد.");
  };

  const handleDuplicate = () => {
    console.log("Duplicate action triggered");
    showAlert("info", null, "تکثیر", "عملیات تکثیر انجام شد.");
  };

  const handleRowClick = (data: any) => {
    setSelectedRow(data);
  };

  const handleLogoutClick = () => {
    onLogout();
    showAlert("success", null, "خروج", "شما با موفقیت خارج شدید.");
    navigate("/login");
    setIsDrawerOpen(false); // بستن دراور پس از خروج
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // جلوگیری از اسکرول صفحه زمانی که دراور باز است
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isDrawerOpen]);

  return (
    <>
      {/* کامپوننت دراور جدا شده */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onLogout={handleLogoutClick}
      />

      {/* محتوای اصلی با افکت بلور زمانی که دراور باز است */}
      <div
        className={`w-full h-screen flex flex-col bg-gray-100 overflow-x-hidden transition-filter duration-300 ${
          isDrawerOpen ? "filter blur-sm" : ""
        }`}
      >
        {/* کامپوننت هدر جدا شده */}
        <DrawerComponent username="Hasanzade" />

        {/* Main Tabs */}
        <MainTabs
          tabs={Object.keys(tabsData)}
          activeTab={activeMainTab}
          onTabChange={handleMainTabChange}
          scrollLeft={() => scrollMainTabs("left")}
          scrollRight={() => scrollMainTabs("right")}
          tabsRef={mainTabsRef}
        />

        {/* Sub Tabs */}
        <SubTabs
          groups={tabsData[activeMainTab].groups}
          subtabs={tabsData[activeMainTab].subtabs}
          activeSubTab={activeSubTab}
          onSubTabChange={handleSubTabChange}
          scrollLeft={() => scrollSubTabs("left")}
          scrollRight={() => scrollSubTabs("right")}
          subTabsRef={subTabsRef}
        />

        {/* Tab Content */}
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
    </>
  );
};

export default TabbedInterface;
