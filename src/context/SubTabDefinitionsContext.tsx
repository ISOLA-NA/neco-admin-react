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

interface SubTabDefinition {
  endpoint?: (params?: any) => Promise<any[]>;
  columnDefs: any[];
  iconVisibility: {
    showAdd: boolean;
    showEdit: boolean;
    showDelete: boolean;
    showDuplicate: boolean;
  };
}

interface SubTabDefinitionsContextType {
  subTabDefinitions: Record<string, SubTabDefinition>;
  fetchDataForSubTab: (subTabName: string, params?: any) => Promise<any[]>;
}

const SubTabDefinitionsContext = createContext<SubTabDefinitionsContextType>(
  {} as SubTabDefinitionsContextType
);

export const SubTabDefinitionsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const api = useApi();

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
    // Only fetch protected data if token exists
    if (!token) return;

    // const fetchInitialData = async () => {
    //   try {
    //     const [templates, ribbons, menusData , usersData , projectsData , companiesData ] = await Promise.all([
    //       api.getAllProgramTemplates(),
    //       api.getAllDefaultRibbons(),
    //       api.getAllMenu(),
    //       api.getAllUsers(),
    //       api.getAllProject(),
    //       api.getAllCompanies(),

    //     ]);
    //     setProgramTemplates(templates);
    //     setDefaultRibbons(ribbons);
    //     setMenus(menusData);
    //     setAllUsers(usersData);
    //     setAllProjects(projectsData);
    //     setAllCompanies(companiesData);
    //   } catch (error) {
    //     console.error("Error in SubTabDefinitionsProvider:", error);
    //   }
    // };
    const fetchInitialData = async () => {
      try {
        const [
          templates,
          ribbons,
          menusData,
          usersData,
          projectsData,
          companiesData,
          rolesData, // ✅ اضافه شده
        ] = await Promise.all([
          api.getAllProgramTemplates(),
          api.getAllDefaultRibbons(),
          api.getAllMenu(),
          api.getAllUsers(),
          api.getAllProject(),
          api.getAllCompanies(),
          api.getAllRoles(), // ✅ نقش‌ها
        ]);

        setProgramTemplates(templates);
        setDefaultRibbons(ribbons);
        setMenus(menusData);
        setAllUsers(usersData);
        setAllProjects(projectsData);
        setAllCompanies(companiesData);
        setAllRoles(rolesData); // ✅ ذخیره نقش‌ها
      } catch (error) {
        console.error("Error in SubTabDefinitionsProvider:", error);
      }
    };
    fetchInitialData();
  }, [api]);

  const subTabDefinitions = useMemo(() => {
    return {
      Configurations: {
        endpoint: api.getAllConfigurations,
        columnDefs: [
          {
            headerName: "Name",
            field: "Name",
          },
          {
            headerName: "Prg.Template",
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
            headerName: "Default Ribbon",
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
          { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
          {
            headerName: "Description",
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
      Ribbons: {
        endpoint: api.getAllMenu,
        columnDefs: [
          {
            headerName: "Name",
            field: "Name",
            filter: "agTextColumnFilter",
          },
        ],
        iconVisibility: {
          showAdd: true, // Adjust based on needs
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },
      Users: {
        endpoint: api.getAllUsers,
        columnDefs: [
          {
            headerName: "Username",
            field: "Username",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Name",
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Last Name",
            field: "Family",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "User Type",
            field: "userType",
            filter: "agNumberColumnFilter",
          },
          {
            headerName: "Website",
            field: "Website",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Mobile",
            field: "Mobile",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Email",
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
            headerName: "Name",
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Description",
            field: "Description",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Post Code",
            field: "PostCode",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Grade",
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
            headerName: "Name",
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Description",
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
            headerName: "Name",
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
          { headerName: "Role", field: "Name", filter: "agTextColumnFilter" },

          {
            headerName: "Project Name",
            // می‌تونیم field رو بذاریم nProjectID ولی ارزش نمایش valueGetter مهمه
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
            headerName: "User",
            field: "OwnerID",
            filter: "agTextColumnFilter",
            valueGetter: (params: any) => {
              const user = allUsers.find((u) => u.ID === params.data.OwnerID);
              return user ? user.Username : "";
            },
          },
          {
            headerName: "Enterprise",
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
            headerName: "Superior",
            field: "ParrentId",
            filter: "agTextColumnFilter",
            /** مقدار متن را از allRoles می‌گیرد */
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
            headerName: "Name",
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
            headerName: "Name",
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
            headerName: "Project Name",
            field: "ProjectName",
            filter: "agTextColumnFilter",
            minWidth: 140,
          },
          {
            headerName: "Status",
            field: "State",
            filter: "agTextColumnFilter",
            minWidth: 100,
          },
          {
            headerName: "Act Start",
            field: "AcualStartTime",
            filter: "agDateColumnFilter",
            minWidth: 110,
          },
          {
            headerName: "Duration",
            field: "TotalDuration",
            filter: "agNumberColumnFilter",
            minWidth: 100,
          },
          {
            headerName: "Budget Act",
            field: "PCostAct",
            filter: "agNumberColumnFilter",
            minWidth: 110,
          },
          {
            headerName: "Budget Appr",
            field: "PCostAprov",
            filter: "agNumberColumnFilter",
            minWidth: 110,
          },
          {
            headerName: "Phase",
            field: "IsIdea",
            valueGetter: (params: any) =>
              params.data.IsIdea ? "IsIdea" : "Project",
            filter: "agTextColumnFilter",
            minWidth: 100,
          },
          {
            headerName: "Calendar",
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
            headerName: "Project Name",
            field: "ProjectName",
            filter: "agTextColumnFilter",
            minWidth: 140,
          },
          {
            headerName: "Status",
            field: "State",
            filter: "agTextColumnFilter",
            minWidth: 100,
          },
          {
            headerName: "Act Start",
            field: "AcualStartTime",
            filter: "agDateColumnFilter",
            minWidth: 110,
          },
          {
            headerName: "Duration",
            field: "TotalDuration",
            filter: "agNumberColumnFilter",
            minWidth: 100,
          },
          {
            headerName: "Budget Act",
            field: "PCostAct",
            filter: "agNumberColumnFilter",
            minWidth: 110,
          },
          {
            headerName: "Budget Appr",
            field: "PCostAprov",
            filter: "agNumberColumnFilter",
            minWidth: 110,
          },
          {
            headerName: "Phase",
            field: "IsIdea",
            valueGetter: (params: any) =>
              params.data.IsIdea ? "IsIdea" : "Project",
            filter: "agTextColumnFilter",
            minWidth: 100,
          },
          {
            headerName: "Calendar",
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
      Odp: {
        endpoint: api.getAllOdpWithExtra,
        columnDefs: [
          {
            headerName: "Name",
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Address",
            field: "Address",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "WFTemplateName",
            field: "WFTemplateName",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "EntityTypeName",
            field: "EntityTypeName",
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
      Procedures: {
        endpoint: api.getAllEntityCollection,
        columnDefs: [
          {
            headerName: "Name",
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Description",
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
            headerName: "Name",
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
      ApprovalFlows: {
        endpoint: api.getAllWfTemplate,
        columnDefs: [
          {
            headerName: "AF Name",
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
      Forms: {
        endpoint: api.getTableTransmittal,
        columnDefs: [
          {
            headerName: "Name",
            field: "Name",
            filter: "agTextColumnFilter",
            sortable: true,
          },
          {
            headerName: "Transmittal",
            field: "IsDoc", // Using Name field for Transmittal
            filter: "agTextColumnFilter",
            sortable: true,
          },
          {
            headerName: "CatA",
            field: "EntityCateAName",
            filter: "agTextColumnFilter",
            sortable: true,
          },
          {
            headerName: "CatB",
            field: "EntityCateBName",
            filter: "agTextColumnFilter",
            sortable: true,
          },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: true, // Enabled since we have duplicateEntityType API
        },
      },
      Categories: {
        endpoint: (params?: { categoryType: "cata" | "catb" }) =>
          params?.categoryType === "cata" ? api.getAllCatA() : api.getAllCatB(),
        columnDefs: [
          {
            headerName: "Name",
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
          { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
          {
            headerName: "Description",
            field: "Description",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Order",
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
          { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
          {
            headerName: "Description",
            field: "Description",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Order",
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
          { headerName: "Name", field: "Name", filter: "agTextColumnFilter" },
          {
            headerName: "Command",
            field: "Command",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Description",
            field: "Description",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Order",
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
  ]);

  const fetchDataForSubTab = async (subTabName: string, params?: any) => {
    // If no token or endpoint not defined, return empty
    const token = Cookies.get("token");
    if (!token) return [];

    const definition = subTabDefinitions[subTabName];
    if (!definition || !definition.endpoint) return [];
    return await definition.endpoint(params);
  };

  return (
    <SubTabDefinitionsContext.Provider
      value={{ subTabDefinitions, fetchDataForSubTab }}
    >
      {children}
    </SubTabDefinitionsContext.Provider>
  );
};

export const useSubTabDefinitions = () => {
  return useContext(SubTabDefinitionsContext);
};
