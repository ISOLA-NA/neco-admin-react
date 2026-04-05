import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useApi } from "./ApiContext";
import Cookies from "js-cookie";
import AppServices, {
  ProgramTemplateItem,
  DefaultRibbonItem,
  Menu,
  User,
  Project,
  Company,
  MenuTab,
  MenuGroup,
  MenuItem,
  EntityType,
} from "../../src/services/api.services";
import { useTranslation } from "react-i18next";
import type { ColDef } from "ag-grid-community";

const detectIdKey = (item: any): string => {
  if (!item || typeof item !== "object") return "ID";
  if (item.id !== undefined) return "id";
  if (item.ID !== undefined) return "ID";
  return "ID";
};

const withCopySuffix = (name: string): string => {
  const baseName = (name ?? "").trim();
  const suffix = "-COPY";
  if (baseName.endsWith(suffix)) {
    const regex = new RegExp(`${suffix}(\\s*\\((\\d+)\\))?$`);
    const match = baseName.match(regex);
    if (match && match[2]) {
      const num = parseInt(match[2], 10);
      return `${baseName.substring(0, match.index)}${suffix} (${num + 1})`;
    }
    return `${baseName}${suffix} (2)`;
  }
  return `${baseName}${suffix}`;
};

// ✅ نرمال‌سازی خروجی‌های API (گاهی response خودش دیتا است)
const normalizeApiResult = (x: any) => {
  if (!x) return x;
  if (typeof x !== "object") return x;
  return x.data ?? x.Data ?? x.value ?? x.Value ?? x;
};

// ✅ اگر مقدار null/undefined/"" بود یعنی "خالی"
const isEmptyVal = (v: any) => v === null || v === undefined || v === "";

// ✅ پایه = newItem (id جدید)، هرچی خالی بود از row پر کن (تا nullها overwrite نکنند)
const fillEmptyFrom = (base: any, fallback: any) => {
  const b = base && typeof base === "object" ? { ...base } : {};
  const f = fallback && typeof fallback === "object" ? fallback : {};

  for (const k of Object.keys(f)) {
    if (isEmptyVal(b[k])) b[k] = f[k];
  }
  return b;
};

interface SubTabDefinition {
  endpoint?: (params?: any) => Promise<any[]>;
  columnDefs: ColDef[];
  iconVisibility: {
    showAdd: boolean;
    showEdit: boolean;
    showDelete: boolean;
    showDuplicate: boolean;
  };
  duplicateAction?: (row: any) => Promise<any>;
  nameField?: string;
  updater?: (payload: any) => Promise<any>;
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
  const { t, i18n } = useTranslation();

  // ✅ کمک: اگر کلید ترجمه نبود، defaultValue نمایش بده تا key خام دیده نشه
  const TT = (key: string, fallback: string) =>
    t(key, { defaultValue: fallback });

  const [programTemplates, setProgramTemplates] = useState<ProgramTemplateItem[]>(
    []
  );
  const [defaultRibbons, setDefaultRibbons] = useState<DefaultRibbonItem[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [allRoles, setAllRoles] = useState<any[]>([]);

  useEffect(() => {
    const token = Cookies.get("admin_token");
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

  const withPersianName = (
    defs: ColDef[],
    header: string = TT("DataTable.Headers.PersianName", "نام فارسی")
  ): ColDef[] => {
    const arr = Array.isArray(defs) ? [...defs] : [];
    const hasFa = arr.some((c) => (c.field ?? "").toString() === "PersianName");
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

  const checkboxCol = (header: string, field: string): ColDef => ({
    headerName: header,
    field,
    filter: false,
    sortable: true,
    resizable: true,
    minWidth: 120,
    flex: 1,
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    headerStyle: { textAlign: "center" },
    cellRendererFramework: (p: any) => (
      <input type="checkbox" checked={!!p.value} readOnly style={{ margin: 0 }} />
    ),
  });

  // ✅ Deep Duplicate برای Ribbon (Menu + Accordion1/2/3)
  const duplicateRibbonDeep = async (menuRow: Menu) => {
    const oldMenuId = Number((menuRow as any)?.ID ?? (menuRow as any)?.id);
    if (!oldMenuId || Number.isNaN(oldMenuId)) {
      throw new Error("Invalid Menu ID for duplication");
    }

    const baseName = ((menuRow as any)?.Name ?? "").toString();
    const newName = withCopySuffix(baseName);

    // 1) create new Menu
    const createdMenuRaw = await api.insertMenu({
      Name: newName,
      PersianName: (menuRow as any)?.PersianName ?? null,
      Description: (menuRow as any)?.Description ?? "",
      IsVisible: (menuRow as any)?.IsVisible ?? true,
    } as any);

    const createdMenu = normalizeApiResult(createdMenuRaw);
    const newMenuId = Number((createdMenu as any)?.ID ?? (createdMenu as any)?.id);

    if (!newMenuId || Number.isNaN(newMenuId)) {
      throw new Error("Ribbon duplication failed: new Menu ID not returned");
    }

    // 2) duplicate tabs
    const oldTabs = await api.getAllMenuTab(oldMenuId);

    for (const tab of oldTabs || []) {
      const oldTabId = Number((tab as any)?.ID ?? (tab as any)?.id);

      const insertPayload: MenuTab = {
        ...(tab as any),
        ID: 0 as any,
        nMenuId: newMenuId,
        ModifiedById: null,
        LastModified: null,
      };

      const insertedTabRaw = await AppServices.insertMenuTab(insertPayload);
      const insertedTab = normalizeApiResult(insertedTabRaw);

      const newTabId = Number((insertedTab as any)?.ID ?? (insertedTab as any)?.id);

      if (!newTabId || Number.isNaN(newTabId)) {
        throw new Error("Ribbon duplication failed: new Tab ID not returned");
      }

      // 3) duplicate groups for this tab
      const oldGroups = await api.getAllMenuGroup(oldTabId);

      for (const group of oldGroups || []) {
        const oldGroupId = Number((group as any)?.ID ?? (group as any)?.id);

        const groupPayload: MenuGroup = {
          ...(group as any),
          ID: 0 as any,
          nMenuTabId: newTabId,
          ModifiedById: null,
          LastModified: null,
        };

        const insertedGroupRaw = await AppServices.insertMenuGroup(groupPayload);
        const insertedGroup = normalizeApiResult(insertedGroupRaw);

        const newGroupId = Number(
          (insertedGroup as any)?.ID ?? (insertedGroup as any)?.id
        );

        if (!newGroupId || Number.isNaN(newGroupId)) {
          throw new Error("Ribbon duplication failed: new Group ID not returned");
        }

        // 4) duplicate items for this group
        const oldItems = await api.getAllMenuItem(oldGroupId);

        for (const item of oldItems || []) {
          const itemPayload: MenuItem = {
            ...(item as any),
            ID: 0 as any,
            nMenuGroupId: newGroupId,
            ModifiedById: null,
            LastModified: null,
          };

          const insertedItemRaw = await AppServices.insertMenuItem(itemPayload);
          const insertedItem = normalizeApiResult(insertedItemRaw);

          const newItemId = Number(
            (insertedItem as any)?.ID ?? (insertedItem as any)?.id
          );

          if (!newItemId || Number.isNaN(newItemId)) {
            console.warn("Ribbon duplication: item inserted but no new ID returned", {
              insertedItem,
            });
          }
        }
      }
    }

    return createdMenu;
  };

  const subTabDefinitions = useMemo(() => {
    return {
      // ─── فقط بخش Configurations داخل subTabDefinitions را جایگزین کن ───

      Configurations: {
        endpoint: api.getAllConfigurations,

        columnDefs: [
          {
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Description", "شرح"),
            field: "Description",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: i18n.language === "fa" ? "قالب برنامه" : "Prg.Template",
            field: "FirstIDProgramTemplate",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
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
            headerName: TT("DataTable.Headers.DefaultRibbon", "منوی پیش فرض"),
            field: "SelMenuIDForMain",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
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
      headerName: TT("DataTable.Headers.Name", "نام"),
      field: "Name",
      filter: "agTextColumnFilter",
      sortable: true,
      resizable: true,
    },
    {
      headerName: TT("DataTable.Headers.Description", "شرح"),
      field: "Describtion",
      filter: "agTextColumnFilter",
      sortable: true,
      resizable: true,
    },
    {
  headerName: TT("CommandPage.MainColumnIDName", "شناسه ستون اصلی"),
  field: "MainColumnIDName",
  filter: "agTextColumnFilter",
  sortable: true,
  resizable: true,
  valueGetter: (params: any) => {
    const val = params.data.MainColumnIDName;
    return val && val.trim() !== "" ? val : "";
  },
},
    {
      headerName: TT("CommandPage.ColorColumn", "ستون رنگ"),
      field: "ColorColumn",
      filter: "agTextColumnFilter",
      sortable: true,
      resizable: true,
    },
    {
      headerName: TT("CommandPage.GroupName", "نام گروه"),
      field: "GroupName",
      filter: "agTextColumnFilter",
      sortable: true,
      resizable: true,
    },
    {
      headerName: TT("CommandPage.ProjectIntensive", "مبتنی بر پروژه"),
      field: "ProjectIntensive",
      filter: false,
      sortable: true,
      resizable: true,
      minWidth: 130,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRendererFramework: (p: any) => (
        <input
          type="checkbox"
          checked={!!p.value}
          readOnly
          style={{ margin: 0 }}
        />
      ),
    },
  ],
  iconVisibility: {
    showAdd: true,
    showEdit: true,
    showDelete: true,
    showDuplicate: false,
  },
},

      // ✅ Ribbons: Duplicate فعال + Deep Copy
      Ribbons: {
        endpoint: api.getAllMenu,
        columnDefs: [
          {
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
        ],
        iconVisibility: {
          showAdd: false,
          showEdit: false,
          showDelete: false,
          showDuplicate: false,
        },
        duplicateAction: async (row: Menu) => {
          return await duplicateRibbonDeep(row);
        },
        nameField: "Name",
      },

      Users: {
        endpoint: api.getAllUsers,
        columnDefs: [
          {
            headerName: TT("DataTable.Headers.Username", "نام کاربری"),
            field: "Username",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.FirstName", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.LastName", "نام خانوادگی"),
            field: "Family",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.UserType", "نوع کاربر"),
            field: "userType",
            filter: "agNumberColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Website", "وب‌سایت"),
            field: "Website",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Mobile", "موبایل"),
            field: "Mobile",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Email", "ایمیل"),
            field: "Email",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
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
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Description", "شرح"),
            field: "Description",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.PostCode", "کد پست"),
            field: "PostCode",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Grade", "گِرِید"),
            field: "Grade",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
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
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Description", "شرح"),
            field: "Description",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
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
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
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
            headerName: TT("DataTable.Headers.Role", "نقش"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.ProjectName", "نام پروژه"),
            field: "nProjectID",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
            valueGetter: (params: any) => {
              const proj = allProjects.find((p) => p.ID === params.data.nProjectID);
              return proj ? proj.ProjectName : "";
            },
          },
          {
            headerName: TT("DataTable.Headers.User", "کاربر"),
            field: "OwnerID",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
            valueGetter: (params: any) => {
              const user = allUsers.find((u) => u.ID === params.data.OwnerID);
              return user ? user.Username : "";
            },
          },
          {
            headerName: TT("DataTable.Headers.Enterprise", "شرکت"),
            field: "nCompanyID",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
            valueGetter: (params: any) => {
              const comp = allCompanies.find((c) => c.ID === params.data.nCompanyID);
              return comp ? comp.Name : "";
            },
          },
          {
            headerName: TT("DataTable.Headers.Superior", "بالادست"),
            field: "ParrentId",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
            valueGetter: (params: any) => {
              const sup = allRoles.find((r: any) => r.ID === params.data.ParrentId);
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
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
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
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
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
            headerName: TT("DataTable.Headers.ProjectName", "نام پروژه"),
            field: "ProjectName",
            filter: "agTextColumnFilter",
            minWidth: 140,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Status", "وضعیت"),
            field: "State",
            filter: "agTextColumnFilter",
            minWidth: 100,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.ActStart", "شروع واقعی"),
            field: "AcualStartTime",
            filter: "agDateColumnFilter",
            minWidth: 110,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Duration", "مدت"),
            field: "TotalDuration",
            filter: "agNumberColumnFilter",
            minWidth: 100,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.BudgetAct", "بودجه واقعی"),
            field: "PCostAct",
            filter: "agNumberColumnFilter",
            minWidth: 110,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.BudgetAppr", "بودجه مصوب"),
            field: "PCostAprov",
            filter: "agNumberColumnFilter",
            minWidth: 110,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Phase", "فاز"),
            field: "IsIdea",
            valueGetter: (params: any) =>
              params.data.IsIdea
                ? TT("DataTable.Headers.IsIdea", "ایده")
                : TT("DataTable.Headers.Project", "پروژه"),
            filter: "agTextColumnFilter",
            minWidth: 100,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Calendar", "تقویم"),
            field: "calendarName",
            filter: "agTextColumnFilter",
            minWidth: 120,
            sortable: true,
            resizable: true,
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
            headerName: TT("DataTable.Headers.ProjectName", "نام پروژه"),
            field: "ProjectName",
            filter: "agTextColumnFilter",
            minWidth: 140,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Status", "وضعیت"),
            field: "State",
            filter: "agTextColumnFilter",
            minWidth: 100,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.ActStart", "شروع واقعی"),
            field: "AcualStartTime",
            filter: "agDateColumnFilter",
            minWidth: 110,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Duration", "مدت"),
            field: "TotalDuration",
            filter: "agNumberColumnFilter",
            minWidth: 100,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.BudgetAct", "بودجه واقعی"),
            field: "PCostAct",
            filter: "agNumberColumnFilter",
            minWidth: 110,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.BudgetAppr", "بودجه مصوب"),
            field: "PCostAprov",
            filter: "agNumberColumnFilter",
            minWidth: 110,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Phase", "فاز"),
            field: "IsIdea",
            valueGetter: (params: any) =>
              params.data.IsIdea
                ? TT("DataTable.Headers.IsIdea", "ایده")
                : TT("DataTable.Headers.Project", "پروژه"),
            filter: "agTextColumnFilter",
            minWidth: 100,
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Calendar", "تقویم"),
            field: "calendarName",
            filter: "agTextColumnFilter",
            minWidth: 120,
            sortable: true,
            resizable: true,
          },
        ],
        iconVisibility: {
          showAdd: false,
          showEdit: false,
          showDelete: true,
          showDuplicate: false,
        },
      },

      Odp: {
        endpoint: async () => {
          const data = await api.getAllOdpWithExtra();
          console.log("ODP list sample:", data[0]);
          return data.map((r: any) => ({
            ...r,
            PersianName: r.PersianName ?? "",
          }));
        },
        columnDefs: withPersianName([
          {
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Address", "آدرس"),
            field: "Address",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.WFTemplateName", "نام گردش‌کار"),
            field: "WFTemplateName",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.EntityTypeName", "نام فرم"),
            field: "EntityTypeName",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
        ]),
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
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Description", "شرح"),
            field: "Description",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
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
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },

      // ✅ ApprovalFlows: Duplicate فعال شد
      ApprovalFlows: {
        endpoint: async () => {
          const data = await api.getAllWfTemplate();
          return data.map((r: any) => ({
            ...r,
            PersianName: r.PersianName ?? "",
          }));
        },
        columnDefs: withPersianName([
          {
            headerName: TT("DataTable.Headers.AFName", "نام گردش تایید"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
        ]),
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: true,
        },
        duplicateAction: async (row: any) => {
          const baseName = ((row as any)?.Name ?? "").toString().trim();
          const targetName = withCopySuffix(baseName);

          const payloadToInsert = {
            ...row,
            ID: 0,
            Name: targetName,
            ModifiedById: null,
            LastModified: null,
          };

          const createdRaw = await api.addApprovalFlow(payloadToInsert as any);
          const created = normalizeApiResult(createdRaw);

          // ✅ حواسمون به nullها هست: پایه created، خالی‌ها از row پر شوند
          return fillEmptyFrom(created, row);
        },
        nameField: "Name",
        updater: async (payload: any) => {
          return await api.editApprovalFlow(payload as any);
        },
      },

      // ✅ Forms
      Forms: {
        endpoint: async () => {
          const data = await api.getTableTransmittal();
          return data.map((item: any) => ({
            ...item,
            nEntityCateAID: item.nEntityCateAID ?? null,
            nEntityCateBID: item.nEntityCateBID ?? null,
            IsDoc: item.IsDoc ?? false,
            IsMegaForm: item.IsMegaForm ?? false,
            Code: item.Code ?? "",
            PersianName: item.PersianName ?? "",
            TemplateDocID: item.TemplateDocID ?? null,
            TemplateExcelID: item.TemplateExcelID ?? null,
            ProjectsStr: item.ProjectsStr ?? "",
          }));
        },

        columnDefs: [
          {
            headerName: TT("Forms.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
            flex: 1.6,
            minWidth: 160,
          },
          {
            headerName: TT("Forms.PersianName", "نام فارسی"),
            field: "PersianName",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
            flex: 1.6,
            minWidth: 160,
          },
          checkboxCol(TT("Forms.Transmittal", "ارسال"), "IsDoc"),
          {
            headerName: TT("Forms.CategoryA", "دسته A"),
            field: "EntityCateAName",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
            flex: 1.2,
            minWidth: 140,
          },
          {
            headerName: TT("Forms.CategoryB", "دسته B"),
            field: "EntityCateBName",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
            flex: 1.2,
            minWidth: 140,
          },
          checkboxCol(TT("Forms.IsMegaForm", "فرم بزرگ"), "IsMegaForm"),
        ],

        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: true,
        },

        duplicateAction: async (row: EntityType) => {
          const idToDuplicate = Number((row as any).ID);
          const responseRaw = await api.duplicateEntityType(idToDuplicate);
          const created = normalizeApiResult(responseRaw);

          // ✅ پایه created (ID جدید) + پر کردن خالی‌ها از row
          // این باعث میشه اگر API null برگردوند، اطلاعات از ردیف اصلی بیاد
          return fillEmptyFrom(created, row);
        },

        nameField: "Name",
        updater: async (payload: EntityType) => {
          const payloadToSend = {
            ...payload,
            ID: payload.ID ? payload.ID.toString() : "",
          };
          return await api.updateEntityType(payloadToSend);
        },
      },

      Categories: {
        endpoint: (params?: { categoryType: "cata" | "catb" }) =>
          params?.categoryType === "cata" ? api.getAllCatA() : api.getAllCatB(),
        columnDefs: [
          {
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },

      MenuTab: {
        endpoint: (params: { ID: number }) => api.getAllMenuTab(params.ID),
        columnDefs: [
          {
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Description", "شرح"),
            field: "Description",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Order", "ترتیب"),
            field: "Order",
            filter: "agNumberColumnFilter",
            sortable: true,
            resizable: true,
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
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Description", "شرح"),
            field: "Description",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Order", "ترتیب"),
            field: "Order",
            filter: "agNumberColumnFilter",
            sortable: true,
            resizable: true,
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
            headerName: TT("DataTable.Headers.Name", "نام"),
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Command", "دستور"),
            field: "Command",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Description", "شرح"),
            field: "Description",
            filter: "agTextColumnFilter",
            sortable: true,
            resizable: true,
          },
          {
            headerName: TT("DataTable.Headers.Order", "ترتیب"),
            field: "Order",
            filter: "agNumberColumnFilter",
            sortable: true,
            resizable: true,
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },

      UpdateAddress: {
        endpoint: async () => [],
        columnDefs: [],
        iconVisibility: {
          showAdd: false,
          showEdit: false,
          showDelete: false,
          showDuplicate: false,
        },
      },
    } as Record<string, SubTabDefinition>;
  }, [
    api,
    programTemplates,
    defaultRibbons,
    menus,
    allUsers,
    allProjects,
    allCompanies,
    allRoles,
    i18n.language,
    t,
  ]);

  const fetchDataForSubTab = async (subTabName: string, params?: any) => {
    const token = Cookies.get("admin_token");
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

    console.log("[DUP] request", { subTabName, row, params, defExists: !!def });

    if (!def) {
      console.warn(`Definition not found for subTabName: ${subTabName}`);
      return await fetchDataForSubTab(subTabName, params);
    }
    if (!def.duplicateAction) {
      console.warn(`Duplicate action not defined for subTabName: ${subTabName}`);
      return await fetchDataForSubTab(subTabName, params);
    }

    try {
      const before = await fetchDataForSubTab(subTabName, params);
      console.log("[DUP] before list", { subTabName, count: before?.length });

      const newItemRaw: any = await def.duplicateAction(row);
      let newItem =
        newItemRaw && typeof newItemRaw === "object"
          ? newItemRaw.data ??
          newItemRaw.Data ??
          newItemRaw.value ??
          newItemRaw.Value ??
          newItemRaw
          : undefined;

      console.log("[DUP] duplicateAction result normalized", { subTabName, newItem });

      if (!newItem || typeof newItem !== "object") {
        const after = await fetchDataForSubTab(subTabName, params);
        newItem = findNewItem(before, after);
        console.log("[DUP] fallback findNewItem", { subTabName, newItem });
      }

      if (!newItem) {
        console.error("Could not find the new duplicated item.");
        throw new Error(
          TT("Alerts.Errors.DuplicationFailedNoNewItem", "کپی ناموفق بود")
        );
      }

      // ✅ Forms و ApprovalFlows: بعد از Duplicate هم "rename" و هم "کامل کردن دیتا" انجام شود
      if (
        (subTabName === "Forms" || subTabName === "ApprovalFlows") &&
        def.updater
      ) {
        const nameKey = def.nameField ?? "Name";
        const idKey = detectIdKey(newItem);

        const baseName = (row?.[nameKey] ?? "").toString().trim();
        const targetName = withCopySuffix(baseName);

        // ✅ مهم: پایه newItem (id جدید) + پر کردن خالی‌ها از row
        const merged = fillEmptyFrom(newItem, row);

        const payloadToUpdate = {
          ...merged,
          [idKey]: newItem[idKey],
          [nameKey]: targetName,
        };

        await def.updater(payloadToUpdate);

        console.log("[DUP] post-rename+fill success", {
          subTabName,
          targetName,
        });
      }
    } catch (err) {
      console.error(`Duplicate failed for ${subTabName}:`, err);
      throw err;
    }

    const finalList = await fetchDataForSubTab(subTabName, params);
    console.log("[DUP] final list", { subTabName, count: finalList?.length });
    return finalList;
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

const findNewItem = (
  oldList: any[],
  newList: any[],
  idKey: string = "ID"
): any | undefined => {
  const oldIds = new Set(oldList.map((item) => item[idKey]));
  return newList.find((item) => !oldIds.has(item[idKey]));
};
