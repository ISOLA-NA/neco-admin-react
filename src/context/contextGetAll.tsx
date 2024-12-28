// src/context/contextGetAll.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useApi } from "./ApiContext"; // از ApiContext برای دسترسی به متدهای API استفاده می‌کنیم

// اینترفیس آیکون‌های CRUD
interface IconVisibility {
  showAdd: boolean;
  showEdit: boolean;
  showDelete: boolean;
  showDuplicate: boolean;
}

// اینترفیس مربوط به هر ساب‌تب
interface SubTabDefinition {
  endpoint?: () => Promise<any[]>;
  columnDefs: any[];
  iconVisibility: IconVisibility;
}

// نوعی برای نگهداری ساب‌تب‌ها به‌صورت دیکشنری
type SubTabDefinitionsRecord = Record<string, SubTabDefinition>;

// اینترفیس context
interface ContextGetAllType {
  programTemplates: any[];
  defaultRibbons: any[];
  entityTypes: any[];
  wfTemplates: any[];
  afButtons: any[];
  subTabDefinitions: SubTabDefinitionsRecord;
}

// کانتکست
const ContextGetAll = createContext<ContextGetAllType | undefined>(undefined);

// کامپوننت Provider
export const ContextGetAllProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const api = useApi();

  // استیت‌ها
  const [programTemplates, setProgramTemplates] = useState<any[]>([]);
  const [defaultRibbons, setDefaultRibbons] = useState<any[]>([]);
  const [entityTypes, setEntityTypes] = useState<any[]>([]);
  const [wfTemplates, setWfTemplates] = useState<any[]>([]);
  const [afButtons, setAfButtons] = useState<any[]>([]);

  // واکشی داده‌های اصلی
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [templates, ribbons, entities, wfTemplatesData, afButtonsData] =
          await Promise.all([
            api.getAllProgramTemplates(),
            api.getAllDefaultRibbons(),
            api.getTableTransmittal(),
            api.getAllWfTemplate(),
            api.getAllAfbtn(),
          ]);
        setProgramTemplates(templates);
        setDefaultRibbons(ribbons);
        setEntityTypes(entities);
        setWfTemplates(wfTemplatesData);
        setAfButtons(afButtonsData);
      } catch (error) {
        console.error("Error fetching data in contextGetAll:", error);
      }
    };
    fetchInitialData();
  }, [api]);

  // ساخت ساب‌تب‌های نمونه (Config, Commands و ...)
  const subTabDefinitions: SubTabDefinitionsRecord = useMemo(() => {
    return {
      Configurations: {
        endpoint: api.getAllConfigurations, // برای واکشی داده‌های جدول
        columnDefs: [
          {
            headerName: "Name",
            field: "Name",
            filter: "agTextColumnFilter",
          },
          {
            headerName: "Prg.Template",
            field: "FirstIDProgramTemplate",
            filter: "agTextColumnFilter",
            valueGetter: (params: any) => {
              const template = programTemplates.find(
                (pt: any) => pt.ID === params.data.FirstIDProgramTemplate
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
                (dr: any) => dr.ID === params.data.SelMenuIDForMain
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

      // می‌توانید بقیه ساب‌تب‌ها را نیز به همین شکل اضافه کنید
      // Commands: {...}
      // Ribbons: {...}
      // ...
    };
  }, [api, programTemplates, defaultRibbons]);

  return (
    <ContextGetAll.Provider
      value={{
        programTemplates,
        defaultRibbons,
        entityTypes,
        wfTemplates,
        afButtons,
        subTabDefinitions,
      }}
    >
      {children}
    </ContextGetAll.Provider>
  );
};

export const useGetAll = (): ContextGetAllType => {
  const context = useContext(ContextGetAll);
  if (!context) {
    throw new Error("useGetAll باید درون ContextGetAllProvider استفاده شود.");
  }
  return context;
};
