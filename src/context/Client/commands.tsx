// ProjectContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  FormEvent,
} from "react";

import { useProject } from "./projects";

import AppServices from "../../services/api.services";

import { unGZip } from "../../utils/ungzip";
interface CommandContextType {
  command: string;
  handleSetCommand: (command: string) => void;
  handleCommandDecorations: (e: FormEvent<HTMLFormElement>) => void;
  tableData: any[];
  colsDef: any[];
}

interface GCMDModel {
  QParam: string;
  ProjectName: string;
  TableName: string | null;
  Cmd: string;
  PaginDTO: {
    Search?: string | null;
    SortData?: string | null;
    isAsending: boolean;
    Filters?: any[] | null;
    Groups?: any[] | null;
    Page: number;
    CountPerPage: number;
  };
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

interface CommandProviderProps {
  children: ReactNode;
}

export const CommandProvider: React.FC<CommandProviderProps> = ({
  children,
}) => {
  const [command, setCommand] = useState<string>("NecoPm:\\ncmd\\mytasks");
  const [tableData, setTableData] = useState<any[]>([]);
  const [colsDef, setColsDef] = useState<any[]>([]);
  const { selectedProjects } = useProject();
  const handleSetCommand = (command: string) => {
    setCommand(command);

    console.log(command);
  };

  const handleCommandDecorations = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    if (command.trim() === "") return;
    let cmd = command.toLowerCase().replace("necopm:\\", "");
    if (cmd.startsWith("ncmd")) {
      cmd = cmd.replace("ncmd\\", "");
      if (!selectedProjects || selectedProjects.length === 0) {
        console.error("No selected projects available.");
        return;
      }
      const model: GCMDModel = {
        Cmd: cmd,
        ProjectName: selectedProjects[0].ProjectName,
        QParam: "",
        TableName: null,
        PaginDTO: {
          Filters: [],
          Groups: null,
          Page: 1,
          Search: null,
          SortData: null,
          isAsending: false,
          CountPerPage: 100,
        },
      };
      console.log("NCMD", cmd);
      console.log("Model", model);
      try {
        const response = await AppServices.GCMDZip(model);
        const ugzipResponse = unGZip(response.data);
        if (ugzipResponse.DataTable.length > 0) {
          setTableData(ugzipResponse.DataTable);

          const cols = [];
          for (const k in ugzipResponse.DataTable[0]) {
            const colData = {
              field: k,
              title: k,
            };
            cols.push(colData);
            setColsDef(cols);
          }
        }
        console.log("ugzipResponse", ugzipResponse.DataTable);
      } catch (err) {
        console.error(err);
      }
    } else {
      console.log("CMD", cmd);
    }
  };

  // useEffect(() => {
  //   if (selectedProjects && selectedProjects.length > 0) {
  //     handleCommandDecorations();
  //   }
  // }, []);
  return (
    <CommandContext.Provider
      value={{
        command,
        handleSetCommand,
        handleCommandDecorations,
        tableData,
        colsDef,
      }}
    >
      {children}
    </CommandContext.Provider>
  );
};

export const useCommand = (): CommandContextType => {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error("useCommand must be used within a CommandProvider");
  }
  return context;
};
