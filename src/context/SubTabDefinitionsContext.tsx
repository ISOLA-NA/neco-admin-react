import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useApi } from "./ApiContext";
import { ProgramTemplateItem, DefaultRibbonItem } from "./ApiContext";

// برای مدیریت آیکون‌های CRUD
interface IconVisibility {
  showAdd: boolean;
  showEdit: boolean;
  showDelete: boolean;
  showDuplicate: boolean;
}

// برای ذخیره‌سازی ستون‌ها و endpoint هر ساب‌تب
interface SubTabDefinition {
  endpoint?: () => Promise<any[]>;
  columnDefs: any[];
  iconVisibility: IconVisibility;
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

  // شما می‌توانید در صورت نیاز داده‌های دیگر (مثل entityTypes و ...) را نیز در اینجا واکشی کنید

  useEffect(() => {
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

  // این بخش ساختار ساب‌تب‌ها را مشخص می‌کند
  const subTabDefinitions = useMemo(() => {
    return {
      Configurations: {
        endpoint: api.getAllConfigurations,
        columnDefs: [
          {
            headerName: "Name",
            field: "Name",
            filter: "FirstIDProgramTemplate",
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

      // ... در صورت نیاز، ساب‌تب‌های دیگر را نیز اضافه کنید
    } as Record<string, SubTabDefinition>;
  }, [api, programTemplates, defaultRibbons]);

  // متد کمکی برای واکشی داده مربوط به هر ساب‌تب
  const fetchDataForSubTab = async (subTabName: string) => {
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
