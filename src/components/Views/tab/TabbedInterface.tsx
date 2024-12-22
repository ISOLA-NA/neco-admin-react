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
} from "../../TableDynamic/TabIconVisibility";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import { useNavigate } from "react-router-dom";
import DrawerComponent from "../tab/Header";
import SidebarDrawer from "../tab/SidebarDrawer";

interface TabbedInterfaceProps {
  onLogout: () => void;
}

const TabbedInterface: React.FC<TabbedInterfaceProps> = ({ onLogout }) => {
  const [activeMainTab, setActiveMainTab] = useState<string>("General");
  const [activeSubTab, setActiveSubTab] = useState<string>("Configurations");
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // داده‌هایی که در حال حاضر برای ساب‌تب فعال از سرور یا از فایل tabData گرفته می‌شوند:
  const [currentRowData, setCurrentRowData] = useState<any[]>([]);

  const mainTabsRef = useRef<HTMLDivElement>(null);
  const subTabsRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // کامپوننت Lazy مربوط به ساب‌تب فعال
  const ActiveSubTabComponent = subTabComponents[activeSubTab] || null;
  // اطلاعات مربوط به ستون‌ها
  const currentSubTabData = subTabDataMapping[activeSubTab] || {
    columnDefs: [],
    rowData: [],
  };

  // استخراج تنظیمات نمایش آیکون‌ها برای ساب‌تب فعال
  const currentIconVisibility: IconVisibility =
    subtabIconVisibility[activeSubTab] || {
      showAdd: true,
      showEdit: true,
      showDelete: true,
      showDuplicate: false,
    };

  // هنگامی که زیرتب فعال تغییر می‌کند، داده را از سرور (یا از آبجکت) می‌خوانیم
  useEffect(() => {
    const fetchDataForSubTab = async () => {
      setSelectedRow(null); // هر بار تغییر ساب‌تب، انتخاب را خالی می‌کنیم
      if (subTabDataMapping[activeSubTab]?.fetchData) {
        // اگر برای ساب‌تب فانکشن fetchData تعریف شده:
        try {
          const data = await subTabDataMapping[activeSubTab].fetchData!();
          setCurrentRowData(data);
        } catch (error) {
          console.error("Error fetching data for sub-tab:", error);
          setCurrentRowData([]);
        }
      } else {
        // اگر فانکشن fetchData تعریف نشده، از داده‌های استاتیک استفاده می‌کنیم
        setCurrentRowData(subTabDataMapping[activeSubTab]?.rowData || []);
      }
    };

    fetchDataForSubTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab]);

  const handleMainTabChange = (tabName: string) => {
    if (tabName === "File") {
      setIsDrawerOpen(true);
      return;
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
    setSelectedRow(null);
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

  const handleLogoutClick = () => {
    onLogout();
    showAlert("success", null, "خروج", "شما با موفقیت خارج شدید.");
    navigate("/login");
    setIsDrawerOpen(false);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isDrawerOpen]);

  return (
    <>
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onLogout={handleLogoutClick}
      />

      <div
        className={`w-full h-screen flex flex-col bg-gray-100 overflow-x-hidden transition-filter duration-300 ${
          isDrawerOpen ? "filter blur-sm" : ""
        }`}
      >
        <DrawerComponent username="Hasanzade" />

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
          // ستونی که از subTabDataMapping می‌خوانیم
          columnDefs={currentSubTabData.columnDefs}
          // داده‌های fetched شده یا استاتیک
          rowData={currentRowData}
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
