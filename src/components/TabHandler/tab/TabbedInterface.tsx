import React, { useState, useRef, useEffect, useMemo } from "react";
import MainTabs from "./MainTabs";
import SubTabs from "./SubTabs";
import TabContent from "../tabcontent/TabContent";
import { subTabComponents } from "./SubTabsImports";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import { useNavigate } from "react-router-dom";
import DrawerComponent from "../tab/Header";
import SidebarDrawer from "./SideBar/SidebarDrawer";

// کانتکست‌های جدید
import { useSubTabDefinitions } from "../../../context/SubTabDefinitionsContext";
import { useAddEditDelete } from "../../../context/AddEditDeleteContext";

// برای مدیریت آیکون‌های CRUD
interface IconVisibility {
  showAdd: boolean;
  showEdit: boolean;
  showDelete: boolean;
  showDuplicate: boolean;
}

// تعریف اینترفیس Props برای TabbedInterface
interface TabbedInterfaceProps {
  onLogout: () => void;
}

// تعریف اینترفیس برای گروه‌های هر تب
interface TabGroup {
  label: string;
  subtabs: string[];
}

// تعریف اینترفیس برای هر تب اصلی
interface MainTabDefinition {
  groups: TabGroup[];
}

// تعریف MainTabKey به عنوان یک Union از رشته‌ها
type MainTabKey =
  | "General"
  | "Forms"
  | "ApprovalFlows"
  | "Programs"
  | "Projects"
  | "File";

// تعریف mainTabsData با استفاده از MainTabKey
const mainTabsData: Record<MainTabKey, MainTabDefinition> = {
  File: {
    groups: [],
  },
  General: {
    groups: [
      {
        label: "Setup",
        subtabs: ["Configurations", "Commands", "Ribbons", "Enterprises"],
      },
      {
        label: "User",
        subtabs: ["Users", "Roles", "Staffing", "RoleGroups"],
      },
    ],
  },
  Forms: {
    groups: [
      {
        label: "Manage",
        subtabs: ["Forms", "Categories"],
      },
    ],
  },
  ApprovalFlows: {
    groups: [
      {
        label: "Flows",
        subtabs: ["ApprovalFlows", "ApprovalChecklist"],
      },
    ],
  },
  Programs: {
    groups: [
      {
        label: "Setup",
        subtabs: ["ProgramTemplate", "ProgramTypes"],
      },
    ],
  },
  Projects: {
    groups: [
      {
        label: "Project",
        subtabs: [
          "Projects",
          "ProjectsAccess",
          "Odp",
          "Procedures",
          "Calendars",
        ],
      },
    ],
  },
};

const TabbedInterface: React.FC<TabbedInterfaceProps> = ({ onLogout }) => {
  // کانتکست‌هایی که ساخته‌ایم
  const { subTabDefinitions, fetchDataForSubTab } = useSubTabDefinitions();
  const { handleAdd, handleEdit, handleDelete, handleDuplicate } =
    useAddEditDelete();

  // حالت‌ها
  const [activeMainTab, setActiveMainTab] = useState<MainTabKey>("General");
  const [activeSubTab, setActiveSubTab] = useState<string>("Configurations");
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // داده‌های مربوط به جدول جاری
  const [currentColumnDefs, setCurrentColumnDefs] = useState<any[]>([]);
  const [currentRowData, setCurrentRowData] = useState<any[]>([]);
  const [currentIconVisibility, setCurrentIconVisibility] =
    useState<IconVisibility>({
      showAdd: true,
      showEdit: true,
      showDelete: true,
      showDuplicate: false,
    });

  const mainTabsRef = useRef<HTMLDivElement>(null);
  const subTabsRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // تعیین کامپوننت ساب‌تب از فایل SubTabsImports
  const ActiveSubTabComponent = subTabComponents[activeSubTab] || null;

  // وقتی ساب‌تب عوض شود، داده‌ها را از کانتکست می‌خوانیم
  const fetchSubTabData = async (subTabName: string) => {
    try {
      const def = subTabDefinitions[subTabName];
      if (!def) {
        setCurrentRowData([]);
        setCurrentColumnDefs([]);
        setCurrentIconVisibility({
          showAdd: false,
          showEdit: false,
          showDelete: false,
          showDuplicate: false,
        });
        return;
      }
      // فراخوانی متد مخصوص واکشی داده در کانتکست
      const data = await fetchDataForSubTab(subTabName);

      setCurrentRowData(data);
      setCurrentColumnDefs(def.columnDefs);
      setCurrentIconVisibility(def.iconVisibility);
    } catch (error) {
      console.error("Error fetching data for subTab:", subTabName, error);
    }
  };

  useEffect(() => {
    // بار اول یا تغییر ساب‌تب
    fetchSubTabData(activeSubTab);
  }, [activeSubTab, subTabDefinitions]);

  // هندل انتخاب تب اصلی
  const handleMainTabChange = (tabName: string) => {
    if (tabName === "File") {
      // باز کردن دراور
      setIsDrawerOpen(true);
      return;
    }

    // اطمینان از اینکه tabName یکی از کلیدهای mainTabsData است
    if (tabName in mainTabsData) {
      setActiveMainTab(tabName as MainTabKey);

      const mainTabConfig = mainTabsData[tabName as MainTabKey];
      if (mainTabConfig && mainTabConfig.groups) {
        const firstGroup = mainTabConfig.groups[0];
        if (firstGroup && firstGroup.subtabs.length > 0) {
          setActiveSubTab(firstGroup.subtabs[0]);
        }
      }
      setSelectedRow(null);

      mainTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
      subTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      console.warn(`Unknown tabName: ${tabName}`);
    }
  };

  // هندل انتخاب ساب‌تب
  const handleSubTabChange = (subtab: string) => {
    setActiveSubTab(subtab);
    setSelectedRow(null);
    subTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  // اسکرول تب‌های اصلی
  const scrollMainTabs = (direction: "left" | "right") => {
    if (mainTabsRef.current) {
      const scrollAmount = 150;
      mainTabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // اسکرول ساب‌تب‌ها
  const scrollSubTabs = (direction: "left" | "right") => {
    if (subTabsRef.current) {
      const scrollAmount = 150;
      subTabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // وقتی روی سطر دوبار کلیک شود
  const handleRowDoubleClick = (rowData: any) => {
    console.log("Row double-clicked:", rowData);
    setSelectedRow(rowData);
  };

  // عملیات CRUD -- حالا از کانتکست گرفته می‌شود
  const handleAddClick = () => {
    handleAdd(); // از کانتکست
    console.log("Add clicked");
    setSelectedRow(null);
  };

  const handleEditClick = () => {
    handleEdit(); // از کانتکست
    console.log("Edit action triggered");
  };

  const handleDeleteClick = async () => {
    if (!selectedRow || !selectedRow.ID) {
      alert("No row is selected for deletion");
      return;
    }
    try {
      await handleDelete(activeSubTab, selectedRow.ID); // از کانتکست
      showAlert("success", null, "Deleted", "Record deleted successfully.");
      await fetchSubTabData(activeSubTab); // جدول را رفرش می‌کنیم
    } catch (err) {
      console.error(err);
      showAlert("error", null, "Error", "Failed to delete record.");
    }
  };

  const handleDuplicateClick = () => {
    handleDuplicate(); // از کانتکست
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

  // جلوگیری از اسکرول صفحه زمانی که دراور باز است
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isDrawerOpen]);

  // لیست نام تب‌های اصلی جهت پاس دادن به <MainTabs />
  const mainTabs: string[] = [...Object.keys(mainTabsData)];

  return (
    <>
      {/* دراور منو (File) */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onLogout={handleLogoutClick}
      />

      {/* محتوای اصلی */}
      <div
        className={`w-full h-screen flex flex-col bg-gray-100 overflow-x-hidden transition-filter duration-300 ${
          isDrawerOpen ? "filter blur-sm" : ""
        }`}
      >
        <DrawerComponent username="Hasanzade" />

        {/* تب‌های اصلی */}
        <MainTabs
          tabs={mainTabs}
          activeTab={activeMainTab}
          onTabChange={handleMainTabChange}
          scrollLeft={() => scrollMainTabs("left")}
          scrollRight={() => scrollMainTabs("right")}
          tabsRef={mainTabsRef}
        />

        {/* ساب‌تب‌ها */}
        <SubTabs
          groups={mainTabsData[activeMainTab]?.groups}
          activeSubTab={activeSubTab}
          onSubTabChange={handleSubTabChange}
          scrollLeft={() => scrollSubTabs("left")}
          scrollRight={() => scrollSubTabs("right")}
          subTabsRef={subTabsRef}
        />

        {/* محتوا */}
        <TabContent
          component={ActiveSubTabComponent}
          columnDefs={currentColumnDefs}
          rowData={currentRowData}
          onRowDoubleClick={handleRowDoubleClick}
          selectedRow={selectedRow}
          activeSubTab={activeSubTab}
          showDuplicateIcon={currentIconVisibility.showDuplicate}
          showAddIcon={currentIconVisibility.showAdd}
          showEditIcon={currentIconVisibility.showEdit}
          showDeleteIcon={currentIconVisibility.showDelete}
          onAdd={handleAddClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onDuplicate={handleDuplicateClick}
          onRowClick={handleRowClick}
        />
      </div>
    </>
  );
};

export default TabbedInterface;
