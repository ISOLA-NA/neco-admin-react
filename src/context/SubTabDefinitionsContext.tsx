// src/context/SubTabDefinitionsContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useApi } from "./ApiContext";
import Cookies from "js-cookie";
import {
  ProgramTemplateItem,
  DefaultRibbonItem,
  Menu,
  User,
  Project,
  Company,
  MenuTab,
  MenuGroup,
  MenuItem,
} from "./ApiContext";
import { useTranslation } from "react-i18next"; // ← طبق سبک خواسته‌شده
import type { ColDef } from "ag-grid-community"; // ← تایپ دقیق ستون‌ها

const COPY_SUFFIX = "-COPY";

const withCopySuffix = (name?: string) => {
  const base = (name ?? "").trim() || "Item";
  return base.endsWith(COPY_SUFFIX) ? base : `${base}${COPY_SUFFIX}`;
};

const detectIdKey = (obj: any) => {
  if (!obj || typeof obj !== "object") return "ID";
  const candidates = [
    "ID",
    "Id",
    "MenuID",
    "WfTemplateID",
    "EntityTypeID",
    "OdpID",
  ];
  return candidates.find((k) => k in obj) || "ID";
};

const findNewItem = (before: any[], after: any[]) => {
  const beforeIds = new Set(before.map((x) => x?.ID ?? x?.Id));
  return after.find((x) => !beforeIds.has(x?.ID ?? x?.Id));
};

interface SubTabDefinition {
  endpoint?: (params?: any) => Promise<any[]>;
  columnDefs: ColDef[]; // ← به جای any[]
  iconVisibility: {
    showAdd: boolean;
    showEdit: boolean;
    showDelete: boolean;
    showDuplicate: boolean;
  };
  duplicateAction?: (row: any) => Promise<any | void>; // API دوپلیکیت همان تب
  updater?: (item: any) => Promise<any>; // متد آپدیت همان تب
  nameField?: string;
}

interface SubTabDefinitionsContextType {
  subTabDefinitions: Record<string, SubTabDefinition>;
  fetchDataForSubTab: (subTabName: string, params?: any) => Promise<any[]>;
  duplicateForSubTab: (
    subTabName: string,
    row: any,
    params?: any
  ) => Promise<any[]>;
}

const SubTabDefinitionsContext = createContext<SubTabDefinitionsContextType>(
  {} as SubTabDefinitionsContextType
);

export const SubTabDefinitionsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const api = useApi();
  const { t, i18n } = useTranslation(); // ← t و i18n از hook

  const [programTemplates, setProgramTemplates] = useState<
    ProgramTemplateItem[]
  >([]);
  const [defaultRibbons, setDefaultRibbons] = useState<DefaultRibbonItem[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [allRoles, setAllRoles] = useState<any[]>([]);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    const fetchInitialData = async () => {
      try {
        const [
          templates,
          ribbons,
          menusData,
          usersData,
          projectsData,
          companiesData,
          rolesData,
        ] = await Promise.all([
          api.getAllProgramTemplates(),
          api.getAllDefaultRibbons(),
          api.getAllMenu(),
          api.getAllUsers(),
          api.getAllProject(),
          api.getAllCompanies(),
          api.getAllRoles(),
        ]);

        setProgramTemplates(templates);
        setDefaultRibbons(ribbons);
        setMenus(menusData);
        setAllUsers(usersData);
        setAllProjects(projectsData);
        setAllCompanies(companiesData);
        setAllRoles(rolesData);
      } catch (error) {
        console.error("Error in SubTabDefinitionsProvider:", error);
      }
    };
    fetchInitialData();
  }, [api]);


  // یک هلسپر DRY برای جاگذاری PersianName بعد از Name
  const withPersianName = (defs: ColDef[], header: string = "PersianName"): ColDef[] => {
    const arr = Array.isArray(defs) ? [...defs] : [];
    const hasFa = arr.some(c => (c.field ?? "").toString() === "PersianName");
    if (hasFa) return arr;

    const faCol: ColDef = {
      headerName: header,
      field: "PersianName",
      filter: "agTextColumnFilter",
      sortable: true,
      resizable: true,
    };

    const nameIdx = arr.findIndex(
      (c) => (c.field ?? "").toString().toLowerCase() === "name"
    );
    if (nameIdx === -1) return [...arr, faCol];

    const before = arr.slice(0, nameIdx + 1);
    const after = arr.slice(nameIdx + 1);
    return [...before, faCol, ...after];
  };


  const subTabDefinitions = useMemo(() => {
    return {
      Configurations: {
        endpoint: api.getAllConfigurations,
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
          },
          {
            headerName: t("DataTable.Headers.ProgramTemplateShort"),
            field: "FirstIDProgramTemplate",
            filter: "agTextColumnFilter",
            valueGetter: (params: any) => {
              const templateId = (params.data.FirstIDProgramTemplate || "")
                .toString()
                .replace(/\|+$/, "");
              const template = programTemplates.find(
                (pt) => pt && pt.ID && pt.ID.toString() === templateId
              );

              return template ? template.Name : "";
            },
          },
          {
            headerName: t("DataTable.Headers.DefaultRibbon"),
            field: "SelMenuIDForMain",
            filter: "agTextColumnFilter",
            valueGetter: (params: any) => {
              const ribbonId = (params.data.SelMenuIDForMain || "")
                .toString()
                .replace(/\|+$/, "");
              const ribbon = defaultRibbons.find(
                (dr) => dr.ID.toString() === ribbonId
              );
              return ribbon ? ribbon.Name : "";
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
      Commands: {
        endpoint: api.getAllCommands,
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Description"),
            field: "Description",
            filter: "agTextColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },
      // Ribbons: {
      //   endpoint: api.getAllMenu,
      //   columnDefs: [
      //     {
      //       headerName: t("DataTable.Headers.Name"),
      //       field: "Name",
      //       filter: "agTextColumnFilter",
      //     },
      //   ],
      //   duplicateAction: (row) => api.duplicateMenu(row.ID),
      //   iconVisibility: {
      //     showAdd: true,
      //     showEdit: true,
      //     showDelete: true,
      //     showDuplicate: true,
      //   },
      // },
      // Ribbons
      Ribbons: {
        endpoint: api.getAllMenu,
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: true, // ← فعال
        },
        duplicateAction: (row) => api.duplicateMenu(row.ID),
        updater: (item) => api.updateMenu(item), // ← بعد از duplicate نام را با -copy آپدیت می‌کنیم
        nameField: "Name",
      },

      Users: {
        endpoint: api.getAllUsers,
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Username"),
            field: "Username",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.FirstName"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.LastName"),
            field: "Family",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.UserType"),
            field: "userType",
            filter: "agNumberColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Website"),
            field: "Website",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Mobile"),
            field: "Mobile",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Email"),
            field: "Email",
            filter: "agTextColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },
      Roles: {
        endpoint: api.getAllRoles,
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Description"),
            field: "Description",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.PostCode"),
            field: "PostCode",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Grade"),
            field: "Grade",
            filter: "agTextColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },
      Enterprises: {
        endpoint: api.getAllCompanies,
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Description"),
            field: "Description",
            filter: "agTextColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },
      RoleGroups: {
        endpoint: api.getAllPostCat,
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },
      Staffing: {
        endpoint: async () => {
          const allRoles = await api.getAllRoles();
          const filtered = allRoles.filter(
            (r: any) =>
              r.OwnerID &&
              typeof r.OwnerID === "string" &&
              r.OwnerID.trim() !== ""
          );
          return filtered;
        },

        columnDefs: [
          {
            headerName: t("DataTable.Headers.Role"),
            field: "Name",
            filter: "agTextColumnFilter",
          },

          {
            headerName: t("DataTable.Headers.ProjectName"),
            field: "nProjectID",
            filter: "agTextColumnFilter",
            valueGetter: (params: any) => {
              const proj = allProjects.find(
                (p) => p.ID === params.data.nProjectID
              );
              return proj ? proj.ProjectName : "";
            },
          },
          {
            headerName: t("DataTable.Headers.User"),
            field: "OwnerID",
            filter: "agTextColumnFilter",
            valueGetter: (params: any) => {
              const user = allUsers.find((u) => u.ID === params.data.OwnerID);
              return user ? user.Username : "";
            },
          },
          {
            headerName: t("DataTable.Headers.Enterprise"),
            field: "nCompanyID",
            filter: "agTextColumnFilter",
            valueGetter: (params: any) => {
              const comp = allCompanies.find(
                (c) => c.ID === params.data.nCompanyID
              );
              return comp ? comp.Name : "";
            },
          },

          {
            headerName: t("DataTable.Headers.Superior"),
            field: "ParrentId",
            filter: "agTextColumnFilter",
            valueGetter: (params: any) => {
              const sup = allRoles.find(
                (r: any) => r.ID === params.data.ParrentId
              );
              return sup ? sup.Name : "";
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

      ProgramTemplate: {
        endpoint: api.getAllProgramTemplates,
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },
      ProgramTypes: {
        endpoint: api.getAllProgramType,
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },
      Projects: {
        endpoint: api.getAllProjectsWithCalendar,
        columnDefs: [
          {
            headerName: t("DataTable.Headers.ProjectName"),
            field: "ProjectName",
            filter: "agTextColumnFilter",
            minWidth: 140,
          },
          {
            headerName: t("DataTable.Headers.Status"),
            field: "State",
            filter: "agTextColumnFilter",
            minWidth: 100,
          },
          {
            headerName: t("DataTable.Headers.ActStart"),
            field: "AcualStartTime",
            filter: "agDateColumnFilter",
            minWidth: 110,
          },
          {
            headerName: t("DataTable.Headers.Duration"),
            field: "TotalDuration",
            filter: "agNumberColumnFilter",
            minWidth: 100,
          },
          {
            headerName: t("DataTable.Headers.BudgetAct"),
            field: "PCostAct",
            filter: "agNumberColumnFilter",
            minWidth: 110,
          },
          {
            headerName: t("DataTable.Headers.BudgetAppr"),
            field: "PCostAprov",
            filter: "agNumberColumnFilter",
            minWidth: 110,
          },
          {
            headerName: t("DataTable.Headers.Phase"),
            field: "IsIdea",
            valueGetter: (params: any) =>
              params.data.IsIdea
                ? t("DataTable.Headers.IsIdea")
                : t("DataTable.Headers.Project"),
            filter: "agTextColumnFilter",
            minWidth: 100,
          },
          {
            headerName: t("DataTable.Headers.Calendar"),
            field: "calendarName",
            filter: "agTextColumnFilter",
            minWidth: 120,
          },
        ],
        iconVisibility: {
          showAdd: false,
          showEdit: false,
          showDelete: false,
          showDuplicate: false,
        },
      },
      ProjectsAccess: {
        endpoint: api.getAllProjectsWithCalendar,
        columnDefs: [
          {
            headerName: t("DataTable.Headers.ProjectName"),
            field: "ProjectName",
            filter: "agTextColumnFilter",
            minWidth: 140,
          },
          {
            headerName: t("DataTable.Headers.Status"),
            field: "State",
            filter: "agTextColumnFilter",
            minWidth: 100,
          },
          {
            headerName: t("DataTable.Headers.ActStart"),
            field: "AcualStartTime",
            filter: "agDateColumnFilter",
            minWidth: 110,
          },
          {
            headerName: t("DataTable.Headers.Duration"),
            field: "TotalDuration",
            filter: "agNumberColumnFilter",
            minWidth: 100,
          },
          {
            headerName: t("DataTable.Headers.BudgetAct"),
            field: "PCostAct",
            filter: "agNumberColumnFilter",
            minWidth: 110,
          },
          {
            headerName: t("DataTable.Headers.BudgetAppr"),
            field: "PCostAprov",
            filter: "agNumberColumnFilter",
            minWidth: 110,
          },
          {
            headerName: t("DataTable.Headers.Phase"),
            field: "IsIdea",
            valueGetter: (params: any) =>
              params.data.IsIdea
                ? t("DataTable.Headers.IsIdea")
                : t("DataTable.Headers.Project"),
            filter: "agTextColumnFilter",
            minWidth: 100,
          },
          {
            headerName: t("DataTable.Headers.Calendar"),
            field: "calendarName",
            filter: "agTextColumnFilter",
            minWidth: 120,
          },
        ],
        iconVisibility: {
          showAdd: false,
          showEdit: false,
          showDelete: true,
          showDuplicate: false,
        },
      },
      // Odp: {
      //   endpoint: api.getAllOdpWithExtra,
      //   columnDefs: [
      //     {
      //       headerName: t("DataTable.Headers.Name"),
      //       field: "Name",
      //       filter: "agTextColumnFilter",
      //     },
      //     {
      //       headerName: t("DataTable.Headers.Address"),
      //       field: "Address",
      //       filter: "agTextColumnFilter",
      //     },
      //     {
      //       headerName: t("DataTable.Headers.WFTemplateName"),
      //       field: "WFTemplateName",
      //       filter: "agTextColumnFilter",
      //     },
      //     {
      //       headerName: t("DataTable.Headers.EntityTypeName"),
      //       field: "EntityTypeName",
      //       filter: "agTextColumnFilter",
      //     },
      //   ],
      //   duplicateAction: (row) => api.duplicateOdp(row.ID),
      //   iconVisibility: {
      //     showAdd: true,
      //     showEdit: true,
      //     showDelete: true,
      //     showDuplicate: true,
      //   },
      // },
      // Odp
      Odp: {
  endpoint: async () => {
    const data = await api.getAllOdpWithExtra();
    console.log("ODP list sample:", data[0]);
    // اطمینان از وجود PersianName به‌صورت رشتهٔ خالی (نه null/undefined)
    return data.map((r: any) => ({ ...r, PersianName: r.PersianName ?? "" }));
  },
  columnDefs: withPersianName(
    [
      {
        headerName: t("DataTable.Headers.Name"),
        field: "Name",
        filter: "agTextColumnFilter",
      },
      // PersianName اینجا خودکار و دقیقاً بعد از Name درج می‌شود (ستون دوم)
      {
        headerName: t("DataTable.Headers.Address"),
        field: "Address",
        filter: "agTextColumnFilter",
      },
      {
        headerName: t("DataTable.Headers.WFTemplateName"),
        field: "WFTemplateName",
        filter: "agTextColumnFilter",
      },
      {
        headerName: t("DataTable.Headers.EntityTypeName"),
        field: "EntityTypeName",
        filter: "agTextColumnFilter",
      },
    ],
    t("DataTable.Headers.PersianName")
  ),
  iconVisibility: {
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showDuplicate: false,
  },
},

      Procedures: {
        endpoint: api.getAllEntityCollection,
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Description"),
            field: "Description",
            filter: "agTextColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },
      Calendars: {
        endpoint: api.getAllCalendar,
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },
      // ApprovalFlows: {
      //   endpoint: api.getAllWfTemplate,
      //   columnDefs: [
      //     {
      //       headerName: t("DataTable.Headers.AFName"),
      //       field: "Name",
      //       filter: "agTextColumnFilter",
      //     },
      //   ],
      //   duplicateAction: (row) => api.duplicateWfTemplate(row.ID),
      //   iconVisibility: {
      //     showAdd: true,
      //     showEdit: true,
      //     showDelete: true,
      //     showDuplicate: false,
      //   },
      // },
      // ApprovalFlows
      ApprovalFlows: {
        endpoint: async () => {
          const data = await api.getAllWfTemplate();
          return data.map((r: any) => ({ ...r, PersianName: r.PersianName ?? "" }));
        },
        columnDefs: withPersianName([
          {
            headerName: t("DataTable.Headers.AFName"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
          // ← اینجا چیزی اضافه نکن؛ هلسپر خودش PersianName را بلافاصله بعد از Name درج می‌کند
        ], t("DataTable.Headers.PersianName")),
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: true, // ← از false به true
        },
        duplicateAction: (row) => api.duplicateWfTemplate(row.ID),
        updater: (item) => api.editApprovalFlow(item), // ← آپدیت تمپلیت جدید با نام "-copy"
        nameField: "Name",
      },

      // Forms: {
      //   endpoint: api.getTableTransmittal,
      //   columnDefs: [
      //     {
      //       headerName: t("DataTable.Headers.Name"),
      //       field: "Name",
      //       filter: "agTextColumnFilter",
      //       sortable: true,
      //     },
      //     {
      //       headerName: t("DataTable.Headers.Transmittal"),
      //       field: "IsDoc", // Using Name field for Transmittal
      //       filter: "agTextColumnFilter",
      //       sortable: true,
      //     },
      //     {
      //       headerName: t("DataTable.Headers.CatA"),
      //       field: "EntityCateAName",
      //       filter: "agTextColumnFilter",
      //       sortable: true,
      //     },
      //     {
      //       headerName: t("DataTable.Headers.CatB"),
      //       field: "EntityCateBName",
      //       filter: "agTextColumnFilter",
      //       sortable: true,
      //     },
      //   ],
      //   iconVisibility: {
      //     showAdd: true,
      //     showEdit: true,
      //     showDelete: true,
      //     showDuplicate: true,
      //   },
      //   duplicateAction: (row) => api.duplicateEntityType(row.ID),
      // },
      // Forms
      Forms: {
        endpoint: async () => {
          const data = await api.getTableTransmittal();
          return data.map((r: any) => ({ ...r, PersianName: r.PersianName ?? "" }));
        },
        columnDefs: withPersianName([
          { headerName: t("DataTable.Headers.Name"), field: "Name", filter: "agTextColumnFilter", sortable: true },
          { headerName: t("DataTable.Headers.Transmittal"), field: "IsDoc", filter: "agTextColumnFilter", sortable: true },
          { headerName: t("DataTable.Headers.CatA"), field: "EntityCateAName", filter: "agTextColumnFilter", sortable: true },
          { headerName: t("DataTable.Headers.CatB"), field: "EntityCateBName", filter: "agTextColumnFilter", sortable: true },
        ], t("DataTable.Headers.PersianName")),
        iconVisibility: { showAdd: true, showEdit: true, showDelete: true, showDuplicate: true },
      }
      ,

      Categories: {
        endpoint: (params?: { categoryType: "cata" | "catb" }) =>
          params?.categoryType === "cata" ? api.getAllCatA() : api.getAllCatB(),
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },
      // -------------------
      // MenuTab
      // -------------------
      MenuTab: {
        endpoint: (params: { ID: number }) => api.getAllMenuTab(params.ID),
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Description"),
            field: "Description",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Order"),
            field: "Order",
            filter: "agNumberColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },

      MenuGroup: {
        endpoint: (params: { ID: number }) => api.getAllMenuGroup(params.ID),
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Description"),
            field: "Description",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Order"),
            field: "Order",
            filter: "agNumberColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },

      MenuItem: {
        endpoint: (params: { ID: number }) => api.getAllMenuItem(params.ID),
        columnDefs: [
          {
            headerName: t("DataTable.Headers.Name"),
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Command"),
            field: "Command",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Description"),
            field: "Description",
            filter: "agTextColumnFilter",
          },
          {
            headerName: t("DataTable.Headers.Order"),
            field: "Order",
            filter: "agNumberColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },

      // Add other sub-tabs here
    } as Record<string, SubTabDefinition>;
  }, [
    api,
    programTemplates,
    defaultRibbons,
    menus,
    allUsers,
    allProjects,
    allCompanies,
    allRoles, // برای valueGetter سرپرست
    i18n.language, // با تغییر زبان، عنوان ستون‌ها رفرش شود
    t, // اطمینان از وابستگی به تابع ترجمه
  ]);

  const fetchDataForSubTab = async (subTabName: string, params?: any) => {
    const token = Cookies.get("token");
    if (!token) return [];

    const definition = subTabDefinitions[subTabName];
    if (!definition || !definition.endpoint) return [];
    return await definition.endpoint(params);
  };

  const duplicateForSubTab = async (
    subTabName: string,
    row: any,
    params?: any
  ) => {
    const def = subTabDefinitions[subTabName];
    if (!def) return await fetchDataForSubTab(subTabName, params);

    if (!def.duplicateAction) {
      return await fetchDataForSubTab(subTabName, params);
    }

    try {
      // قبل از کپی
      const before = await fetchDataForSubTab(subTabName, params);

      // کپی
      const newItemRaw: any = await def.duplicateAction(row);

      // بعد از کپی
      const after = await fetchDataForSubTab(subTabName, params);

      // آیتم جدید را به‌دست بیاور (یا از خروجی API، یا با اختلاف قبل/بعد)
      let newItem =
        newItemRaw && typeof newItemRaw === "object"
          ? newItemRaw.data ??
            newItemRaw.Data ??
            newItemRaw.value ??
            newItemRaw.Value ??
            newItemRaw
          : undefined;

      if (!newItem || typeof newItem !== "object") {
        newItem = findNewItem(before, after);
      }
      if (!newItem) return after;

      // فقط برای تب Forms: Name فعلی + "-COPY"
      if (subTabName === "Forms" && def.updater) {
        const nameKey = def.nameField ?? "Name";
        const idKey = detectIdKey(newItem);

        const baseName = (row?.[nameKey] ?? newItem?.[nameKey] ?? "").trim();
        const targetName = withCopySuffix(baseName);

        // پِی‌لود: اطلاعات اصلی + آیتم جدید (برای داشتن ID جدید) + نام جدید
        const payload = {
          ...(row || {}),
          ...(newItem || {}),
          [idKey]: newItem[idKey],
          [nameKey]: targetName,
        };

        await def.updater(payload);
      }
    } catch (err) {
      console.error(`Duplicate failed for ${subTabName}:`, err);
    }

    return await fetchDataForSubTab(subTabName, params);
  };

  return (
    <SubTabDefinitionsContext.Provider
      value={{ subTabDefinitions, fetchDataForSubTab, duplicateForSubTab }}
    >
      {children}
    </SubTabDefinitionsContext.Provider>
  );
};

export const useSubTabDefinitions = () => {
  return useContext(SubTabDefinitionsContext);
};
