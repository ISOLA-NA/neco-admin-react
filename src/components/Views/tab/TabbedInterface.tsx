// src/components/Views/tab/TabbedInterface.tsx

import React, { useState, useRef, useEffect, useMemo } from "react";
import MainTabs from "./MainTabs";
import SubTabs from "./SubTabs";
import TabContent from "../tabcontent/TabContent";
import { subTabComponents } from "./SubTabsImports";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import { useNavigate } from "react-router-dom";
import DrawerComponent from "../tab/Header";
import SidebarDrawer from "../tab/SidebarDrawer";

// سرویس‌ها
import AppServices, {
  ProgramTemplateItem,
  MenuItem,
  EntityTypeItem,
  WfTemplateItem,
} from "../../../services/api.services";

// برای مدیریت آیکون‌های CRUD
interface IconVisibility {
  showAdd: boolean;
  showEdit: boolean;
  showDelete: boolean;
  showDuplicate: boolean;
}

// برای ذخیره‌سازی ستون‌ها و endpoint هر ساب‌تب
interface SubTabDefinition {
  endpoint?: () => Promise<any[]>; // تابعی که داده را از API برمی‌گرداند
  columnDefs: any[]; // ستون‌های جدول
  iconVisibility: IconVisibility;
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
  | "File"; // اضافه کردن "File" اگر نیاز است

// تعریف mainTabsData با استفاده از MainTabKey
const mainTabsData: Record<MainTabKey, MainTabDefinition> = {
  General: {
    groups: [
      {
        label: "Setup",
        subtabs: ["Configurations", "Commands", "Ribbons"],
      },
      {
        label: "User",
        subtabs: ["Users", "Roles", "Staffing", "RoleGroups"],
      },
      {
        label: "Org",
        subtabs: ["Enterprises"],
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
  File: {
    groups: [], // تعریف مناسب یا مدیریت جداگانه
  },
};

// تعریف subTabDefinitions به داخل کامپوننت تا از state ها استفاده کنیم
const TabbedInterface: React.FC<TabbedInterfaceProps> = ({ onLogout }) => {
  // تعریف نوع state به عنوان MainTabKey
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

  // حالت برای نگهداری داده‌های API
  const [programTemplates, setProgramTemplates] = useState<
    ProgramTemplateItem[]
  >([]);
  const [defaultRibbons, setDefaultRibbons] = useState<MenuItem[]>([]);
  const [entityTypes, setEntityTypes] = useState<EntityTypeItem[]>([]);
  const [wfTemplates, setWfTemplates] = useState<WfTemplateItem[]>([]);

  const mainTabsRef = useRef<HTMLDivElement>(null);
  const subTabsRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // تعیین کامپوننت ساب‌تب از فایل SubTabsImports
  const ActiveSubTabComponent = subTabComponents[activeSubTab] || null;

  // دریافت داده‌ها از API‌ها هنگام بارگذاری کامپوننت
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [templates, ribbons, entities, wfTemplatesData] =
          await Promise.all([
            AppServices.getAllProgramTemplates(),
            AppServices.getAllDefaultRibbons(),
            AppServices.getTableTransmittal(),
            AppServices.getAllWfTemplate(),
          ]);
        setProgramTemplates(templates);
        setDefaultRibbons(ribbons);
        setEntityTypes(entities);
        setWfTemplates(wfTemplatesData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  // تعریف subTabDefinitions به داخل کامپوننت با استفاده از useMemo
  const subTabDefinitions: Record<string, SubTabDefinition> = useMemo(
    () => ({
      Configurations: {
        endpoint: () => AppServices.getAllConfigurations(), // فرض بر این است که getAllConfiguration موجود است
        columnDefs: [
          { headerName: "Name", field: "Name" },
          {
            headerName: "Prg.Template",
            field: "FirstIDProgramTemplate",
            filter: "agTextColumnFilter",
            valueGetter: (params: any) => {
              const template = programTemplates.find(
                (pt) => pt.ID === params.data.FirstIDProgramTemplate
              );
              return template ? template.Name : "N/A";
            },
          },
          {
            headerName: "Default Ribbon",
            field: "SelMenuIDForMain",
            filter: "agTextColumnFilter",
            valueGetter: (params: any) => {
              const ribbon = defaultRibbons.find(
                (dr) => dr.ID === params.data.SelMenuIDForMain
              );
              return ribbon ? ribbon.Name : "N/A";
            },
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },

      // ... سایر ساب‌تب‌ها
    }),
    [programTemplates, defaultRibbons]
  );

  // وقتی ساب‌تب عوض شود، داده‌ها را از API می‌خوانیم
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
      // فراخوانی API
      let data: any[] = [];
      if (def.endpoint) {
        data = await def.endpoint();
      }

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

  // اسکرول تب‌ها
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

  // وقتی روی سطر دوبار کلیک شود
  const handleRowDoubleClick = (rowData: any) => {
    console.log("Row double-clicked:", rowData);
    setSelectedRow(rowData);
  };

  // عملیات CRUD
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

  // جلوگیری از اسکرول صفحه زمانی که دراور باز است
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isDrawerOpen]);

  // لیست نام تب‌های اصلی جهت پاس دادن به <MainTabs />
  const mainTabs: string[] = [...Object.keys(mainTabsData), "File"];
  // چون "File" در اینجا به صورت جداگانه هم مدیریت شده

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
          subtabs={undefined}
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
