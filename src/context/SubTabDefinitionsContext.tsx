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
import { ProgramTemplateItem, DefaultRibbonItem } from "./ApiContext";

interface SubTabDefinition {
  endpoint?: () => Promise<any[]>;
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
  fetchDataForSubTab: (subTabName: string) => Promise<any[]>;
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
    // فقط اگر توکن داریم، داده‌های محافظت‌شده را بگیریم
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
          { headerName: "Name", field: "Name" , filter: "agTextColumnFilter",},
          { headerName: "Describtion", field: "Describtion",    filter: "agTextColumnFilter", },
        ],
        iconVisibility: {
          showAdd: true,
          showEdit: true,
          showDelete: true,
          showDuplicate: false,
        },
      },

      // اگر ساب‌تب‌های دیگری دارید، اینجا تعریف کنید ...
    } as Record<string, SubTabDefinition>;
  }, [api, programTemplates, defaultRibbons]);

  const fetchDataForSubTab = async (subTabName: string) => {
    // اگر توکن نداریم یا اندپوینت تعریف نشده، خالی برگردان
    const token = Cookies.get("token");
    if (!token) return [];

    const definition = subTabDefinitions[subTabName];
    if (!definition || !definition.endpoint) return [];
    return await definition.endpoint();
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
