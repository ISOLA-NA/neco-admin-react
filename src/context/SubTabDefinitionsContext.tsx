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

  useEffect(() => {
    const token = Cookies.get("token");
    // Only fetch protected data if token exists
    if (!token) return;

    const fetchInitialData = async () => {
      try {
        const [templates, ribbons] = await Promise.all([
          api.getAllProgramTemplates(),
          api.getAllDefaultRibbons(),
        ]);
        setProgramTemplates(templates);
        setDefaultRibbons(ribbons);
      } catch (error) {
        console.error("Error in SubTabDefinitionsProvider:", error);
      }
    };

    fetchInitialData();
  }, [api]);

  const subTabDefinitions = useMemo(() => {
    return {
      // -------------------
      // Configurations
      // -------------------
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
              const template = programTemplates.find(
                (pt) => pt.ID === params.data.FirstIDProgramTemplate
              );
              return template ? template.Name : "";
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

      // -------------------
      // Commands
      // -------------------
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

      // -------------------
      // Ribbons
      // -------------------
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

      // -------------------
      // MenuTab
      // -------------------
      MenuTab: {
        // Endpoint: دریافت MenuTab با استفاده از nMenuId
        endpoint: (params: { nMenuId: number }) =>
          api.getAllMenuTab(params.nMenuId),
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

      // -------------------
      // MenuGroup
      // -------------------
      MenuGroup: {
        // Endpoint: دریافت MenuGroup با استفاده از nMenuTabId
        endpoint: (params: { nMenuTabId: number }) =>
          api.getAllMenuGroup(params.nMenuTabId),
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

      // -------------------
      // MenuItem
      // -------------------
      MenuItem: {
        // Endpoint: دریافت MenuItem با استفاده از nMenuGroupId
        endpoint: (params: { nMenuGroupId: number }) =>
          api.getAllMenuItem(params.nMenuGroupId),
        columnDefs: [
          {
            headerName: "Name",
            field: "Name",
            filter: "agTextColumnFilter",
          },
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
  }, [api, programTemplates, defaultRibbons]);

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
