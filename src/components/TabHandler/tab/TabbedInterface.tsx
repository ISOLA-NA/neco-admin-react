// src/components/TabbedInterface.tsx

import React, { useState, useRef, useEffect } from "react";
import Header from "../tab/Header"; // ← مسیر هدر
import MainTabs from "./MainTabs";
import SubTabs from "./SubTabs";
import TabContent from "../tabcontent/TabContent";
import { subTabComponents } from "./SubTabsImports";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import { useNavigate } from "react-router-dom";
import SidebarDrawer from "./SideBar/SidebarDrawer";

// کانتکست‌ها
import { useSubTabDefinitions } from "../../../context/SubTabDefinitionsContext";
import { useAddEditDelete } from "../../../context/AddEditDeleteContext";

// سرویس گرفتن اطلاعات کاربر
import projectServiceFile from "../../../services/api.servicesFile";
// برای گرفتن آدرس عکس
import FileUploadHandler from "../../../services/FileUploadHandler";

// برای مدیریت آیکون‌های CRUD
interface IconVisibility {
  showAdd: boolean;
  showEdit: boolean;
  showDelete: boolean;
  showDuplicate: boolean;
}

// Props برای TabbedInterface
interface TabbedInterfaceProps {
  onLogout: () => void;
}

// گروه‌ها و تعاریف تب‌ها
interface TabGroup {
  label: string;
  subtabs: string[];
}
interface MainTabDefinition {
  groups: TabGroup[];
}
type MainTabKey =
  | "General"
  | "Forms"
  | "ApprovalFlows"
  | "Programs"
  | "Projects"
  | "File";

// اینترفیس Token کاربر
interface UserToken {
  ID: string;
  Username: string;
  Name: string;
  Family: string;
  Email: string;
  Mobile: string;
  Website: string;
  UserImageId: string;
  Code?: string;
}

const mainTabsData: Record<MainTabKey, MainTabDefinition> = {
  File: { groups: [] },
  General: {
    groups: [
      {
        label: "Setup",
        subtabs: ["Configurations", "Commands", "Ribbons", "Enterprises"],
      },
      { label: "User", subtabs: ["Users", "Roles", "Staffing", "RoleGroups"] },
    ],
  },
  Forms: {
    groups: [{ label: "Manage", subtabs: ["Forms", "Categories"] }],
  },
  ApprovalFlows: {
    groups: [{ label: "Flows", subtabs: ["ApprovalFlows"] }],
  },
  Programs: {
    groups: [{ label: "Setup", subtabs: ["ProgramTemplate", "ProgramTypes"] }],
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
  // کانتکست‌ها
  const { subTabDefinitions, fetchDataForSubTab } = useSubTabDefinitions();
  const { handleAdd, handleEdit, handleDelete, handleDuplicate } =
    useAddEditDelete();

  // stateها
  const [activeMainTab, setActiveMainTab] = useState<MainTabKey>("General");
  const [activeSubTab, setActiveSubTab] = useState<string>("");

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // collapse header
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  // جدول
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
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSubTabLoading, setIsSubTabLoading] = useState(false);

  const navigate = useNavigate();

  // ---------- state و logic مربوط به کاربر ----------
  const [userInfo, setUserInfo] = useState<UserToken | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTokenId = async () => {
      try {
        const res = await projectServiceFile.getIdByUserToken();
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (data) {
          setUserInfo(data);
        }
      } catch (error) {
        console.error("Error fetching user token ID:", error);
      }
    };
    fetchUserTokenId();
  }, []);
  // ---------- پایان کاربر ----------

  // بارگذاری دیتا برای ساب‌تب
  const fetchSubTabData = async (subTabName: string) => {
    try {
      setIsSubTabLoading(true);
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
        setIsSubTabLoading(false);
        return;
      }
      const data = await fetchDataForSubTab(subTabName);
      setCurrentRowData(data);
      setCurrentColumnDefs(def.columnDefs);
      setCurrentIconVisibility(def.iconVisibility);
    } catch (error) {
      console.error("Error fetching data for subTab:", subTabName, error);
    } finally {
      setIsSubTabLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab) {
      fetchSubTabData(activeSubTab);
    } else {
      setCurrentRowData([]);
      setCurrentColumnDefs([]);
      setCurrentIconVisibility({
        showAdd: false,
        showEdit: false,
        showDelete: false,
        showDuplicate: false,
      });
    }
  }, [activeSubTab, subTabDefinitions]);

  // هندل تب‌ها
  const handleMainTabChange = (tabName: string) => {
    if (tabName === "File") {
      setIsDrawerOpen(true);
      setIsPanelOpen(false);
      return;
    }
    if (tabName in mainTabsData) {
      setActiveMainTab(tabName as MainTabKey);
      setActiveSubTab("");
      setSelectedRow(null);
      mainTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
      subTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      console.warn(`Unknown tabName: ${tabName}`);
    }
  };

  const handleSubTabChange = (subtab: string) => {
    setActiveSubTab(subtab);
    setSelectedRow(null);
    setIsPanelOpen(false);
    subTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  // عملیات CRUD
  const handleAddClick = () => {
    handleAdd();
    setSelectedRow(null);
  };
  const handleEditClick = () => {
    handleEdit();
  };
  const handleDeleteClick = async () => {
    if (!selectedRow?.ID) {
      alert("No row is selected for deletion");
      return;
    }
    try {
      await handleDelete(activeSubTab, selectedRow.ID);
      setIsPanelOpen(false);
      setSelectedRow(null);

      showAlert("success", null, "Deleted", "Record deleted successfully.");
      await fetchSubTabData(activeSubTab);
    } catch {
      showAlert("error", null, "Error", "Failed to delete record.");
    }
  };
  const handleDuplicateClick = () => {
    handleDuplicate();
  };
  const handleRowClick = (data: any) => setSelectedRow(data);
  const handleRowDoubleClick = (rowData: any) => setSelectedRow(rowData);

  const handleLogoutClick = () => {
    onLogout();
    showAlert("success", null, "خروج", "شما با موفقیت خارج شدید.");
    navigate("/login");
    setIsDrawerOpen(false);
  };

  const handleCloseDrawer = () => setIsDrawerOpen(false);

  // جلوگیری از اسکرول وقتی دراور باز است
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "auto";
  }, [isDrawerOpen]);

  const mainTabs = Object.keys(mainTabsData) as MainTabKey[];

  // مقادیر هدر
  const headerUsername = userInfo?.Username ?? "";

  return (
    <>
      {/* دراور File */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onLogout={handleLogoutClick}
      />

      <div
        className={`w-full h-screen flex flex-col bg-gray-100 overflow-hidden transition-filter duration-300 ${
          isDrawerOpen ? "filter blur-sm" : ""
        }`}
      >
        {/* هدر */}
        <Header
          username={headerUsername}
          avatarUrl={avatarUrl || undefined}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />

        {/* این کامپوننت فقط برای گرفتن URL تصویر است (هیچ UI‌ای نشان نمی‌دهد) */}
        {userInfo?.UserImageId && (
          <div className="hidden">
            <FileUploadHandler
              selectedFileId={userInfo.UserImageId}
              resetCounter={0}
              onReset={() => {}}
              onPreviewUrlChange={setAvatarUrl}
              hideUploader={true}
            />
          </div>
        )}

        {/* MainTabs و SubTabs */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            collapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
          }`}
        >
          <MainTabs
            tabs={mainTabs}
            activeTab={activeMainTab}
            onTabChange={handleMainTabChange}
            scrollLeft={() =>
              mainTabsRef.current?.scrollBy({ left: -150, behavior: "smooth" })
            }
            scrollRight={() =>
              mainTabsRef.current?.scrollBy({ left: 150, behavior: "smooth" })
            }
            tabsRef={mainTabsRef}
          />

          <SubTabs
            groups={mainTabsData[activeMainTab].groups}
            activeSubTab={activeSubTab}
            onSubTabChange={handleSubTabChange}
            scrollLeft={() =>
              subTabsRef.current?.scrollBy({ left: -150, behavior: "smooth" })
            }
            scrollRight={() =>
              subTabsRef.current?.scrollBy({ left: 150, behavior: "smooth" })
            }
            subTabsRef={subTabsRef}
            isLoading={isSubTabLoading}
          />
        </div>

        {/* محتوای تب فعلی */}
        <div className="flex-1 overflow-hidden">
          {activeSubTab ? (
            <TabContent
              component={subTabComponents[activeSubTab] || null}
              columnDefs={currentColumnDefs}
              rowData={currentRowData}
              selectedRow={selectedRow}
              activeSubTab={activeSubTab}
              showAddIcon={currentIconVisibility.showAdd}
              showEditIcon={currentIconVisibility.showEdit}
              showDeleteIcon={currentIconVisibility.showDelete}
              showDuplicateIcon={currentIconVisibility.showDuplicate}
              onAdd={handleAddClick}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onDuplicate={handleDuplicateClick}
              onRowClick={handleRowClick}
              onRowDoubleClick={handleRowDoubleClick}
              isPanelOpen={isPanelOpen}
              setIsPanelOpen={setIsPanelOpen}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-lg"></div>
          )}
        </div>
      </div>
    </>
  );
};

export default TabbedInterface;
