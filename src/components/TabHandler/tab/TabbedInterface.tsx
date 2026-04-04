// src/components/Views/tab/TabbedInterface.tsx

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Header from "../tab/Header";
import MainTabs from "./MainTabs";
import SubTabs from "./SubTabs";
import TabContent from "../tabcontent/TabContent";
import SidebarDrawer from "./SideBar/SidebarDrawer";

import { subTabComponents } from "./SubTabsImports";
import { showAlert } from "../../utilities/Alert/DynamicAlert";

import { useSubTabDefinitions } from "../../../context/SubTabDefinitionsContext";
import { useAddEditDelete } from "../../../context/AddEditDeleteContext";

import projectServiceFile from "../../../services/api.servicesFile";
import FileUploadHandler from "../../../services/FileUploadHandler";
import { logout } from "../../../services/auth.services";

interface IconVisibility {
  showAdd: boolean;
  showEdit: boolean;
  showDelete: boolean;
  showDuplicate: boolean;
}

interface TabbedInterfaceProps {
  onLogout: () => void;
}

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

// ─────────────────────────────────────────────────────────
// ساختار تب‌ها و ساب‌تب‌ها
// label های گروه از فایل ترجمه خوانده می‌شوند (SubMenu.<label>)
// label خالی "" = بدون عنوان گروه
// ─────────────────────────────────────────────────────────
const mainTabsData: Record<MainTabKey, MainTabDefinition> = {
  File: { groups: [] },

  General: {
    groups: [
      {
        label: "GeneralSetup",          // EN: "Settings"   | FA: "تنظیمات"
        subtabs: ["Configurations", "Commands", "Ribbons"],
      },
      {
        label: "UserRoles",             // EN: "Users Roles" | FA: "نقش های کاربران"
        subtabs: ["Users", "Roles", "Staffing", "RoleGroups", "Enterprises"],
      },
    ],
  },

  Forms: {
    groups: [
      {
        label: "FormsGroup",            // EN: "Forms"       | FA: "فرم ها"
        subtabs: ["Forms", "Categories"],
      },
    ],
  },

  ApprovalFlows: {
    groups: [
      {
        label: "",                      // بدون عنوان گروه
        subtabs: ["ApprovalFlows"],
      },
    ],
  },

  Programs: {
    groups: [
      {
        label: "ProgramsGroup",         // EN: "Programs"    | FA: "برنامه ها"
        subtabs: ["ProgramTemplate", "ProgramTypes"],
      },
    ],
  },

  Projects: {
    groups: [
      {
        label: "",                      // بدون عنوان گروه
        subtabs: [
          "Projects",
          "ProjectsAccess",
          "Odp",
          "Procedures",
          "Calendars",
          "UpdateAddress",
        ],
      },
    ],
  },
};

const TabbedInterface: React.FC<TabbedInterfaceProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { subTabDefinitions, fetchDataForSubTab } = useSubTabDefinitions();
  const { handleAdd, handleEdit, handleDelete, handleDuplicate } =
    useAddEditDelete();

  const [activeMainTab, setActiveMainTab] = useState<MainTabKey>("General");
  const [activeSubTab, setActiveSubTab] = useState<string>("");

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  const [currentColumnDefs, setCurrentColumnDefs] = useState<any[]>([]);
  const [currentRowData, setCurrentRowData] = useState<any[]>([]);
  const [currentIconVisibility, setCurrentIconVisibility] =
    useState<IconVisibility>({
      showAdd: true,
      showEdit: true,
      showDelete: true,
      showDuplicate: false,
    });
  const [isSubTabLoading, setIsSubTabLoading] = useState<boolean>(false);

  const [selectedRow, setSelectedRow] = useState<any>(null);

  const mainTabsRef = useRef<HTMLDivElement>(null);
  const subTabsRef = useRef<HTMLDivElement>(null);

  const [userInfo, setUserInfo] = useState<UserToken | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await projectServiceFile.getIdByUserToken();
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (data) setUserInfo(data);
      } catch (error) {
        console.error("Error fetching user token ID:", error);
      }
    })();
  }, []);

  const fetchSubTabData = async (subTabName: string) => {
    setIsSubTabLoading(true);
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
      const data = await fetchDataForSubTab(subTabName);
      setCurrentRowData(data);
      setCurrentColumnDefs(def.columnDefs);
      setCurrentIconVisibility(def.iconVisibility);
    } catch (error) {
      console.error("Error loading subTab:", subTabName, error);
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

  const handleMainTabChange = (tabKey: MainTabKey) => {
    setIsDrawerOpen(false);
    setIsSidePanelOpen(false);

    if (tabKey === "File") {
      setIsDrawerOpen(true);
      return;
    }
    setActiveMainTab(tabKey);
    setActiveSubTab("");
    setSelectedRow(null);
    mainTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    subTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const handleSubTabChange = (subKey: string) => {
    setIsDrawerOpen(false);
    setIsSidePanelOpen(false);

    setActiveSubTab(subKey);
    setSelectedRow(null);
    subTabsRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    if (subKey === "UpdateAddress") {
      setIsSidePanelOpen(true);
    }
  };

  const handleAddClick = () => {
    handleAdd();
    setSelectedRow(null);
  };
  const handleEditClick = () => handleEdit();
  const handleDeleteClick = async () => {
    if (!selectedRow?.ID) {
      showAlert("error", "", t("alert.genericError"));
      return;
    }
    try {
      await handleDelete(activeSubTab, selectedRow.ID);
      setSelectedRow(null);
      showAlert("success", "", t("alert.successTitle"));
      await fetchSubTabData(activeSubTab);
    } catch {
      showAlert("error", "", t("alert.genericError"));
    }
  };
  const handleDuplicateClick = () => handleDuplicate();

  const handleRowClick = (data: any) => {
    setSelectedRow(data);
    setIsSidePanelOpen(false);
  };
  const handleRowDoubleClick = (data: any) => {
    setSelectedRow(data);
    setIsSidePanelOpen(true);
  };

  const handleLogoutClick = () => {
    logout();
  };

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "auto";
  }, [isDrawerOpen]);

  const mainTabs = Object.keys(mainTabsData) as MainTabKey[];
  const headerUsername = userInfo?.Username ?? "";

  return (
    <>
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLogout={handleLogoutClick}
      />

      <div
        className={`w-full h-screen flex flex-col bg-gray-100 overflow-hidden ${
          isDrawerOpen ? "filter blur-sm" : ""
        }`}
      >
        <Header
          username={headerUsername}
          avatarUrl={avatarUrl || undefined}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />

        {userInfo?.UserImageId && (
          <div className="hidden">
            <FileUploadHandler
              selectedFileId={userInfo.UserImageId}
              resetCounter={0}
              onReset={() => {}}
              onPreviewUrlChange={setAvatarUrl}
              hideUploader
            />
          </div>
        )}

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
            renderLabel={(key: string) => t(`MainMenu.${key}`)}
          />

          <SubTabs
            groups={mainTabsData[activeMainTab].groups.map((grp) => ({
              label: grp.label,
              subtabs: grp.subtabs,
            }))}
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
              isPanelOpen={isSidePanelOpen}
              setIsPanelOpen={setIsSidePanelOpen}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-lg" />
          )}
        </div>
      </div>
    </>
  );
};

export default TabbedInterface;