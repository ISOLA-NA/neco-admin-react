// src/context/AddEditDeleteContext.tsx
import React, { createContext, useContext, useState } from "react";
import { useApi, CommandItem } from "./ApiContext";
import { ConfigurationItem } from "./ApiContext";

// Define CommandData if it's different from CommandItem
interface CommandData {
  id?: string;
  Name: string;
  Describtion: string;
  MainColumnIDName: string;
  GroupName: string;
  gridCmd: string;
  tabCmd: string;
  QR: string;
  ViewMode: string | null;
  DefaultColumns: string | null;
  ReportParam: string | null;
  ProjectIntensive: boolean;
  ColorColumn: string;
  InvisibleColumns: string;
  ApiColumns: string;
  SpParam: string;
  CmdType: number;
  ApiMode?: string;
}

interface ConfigurationData {
  id?: string;
  Name: string;
  FirstIDProgramTemplate: string;
  SelMenuIDForMain: string;
  Description?: string;
  IsVisible: boolean;
  LastModified?: string;
  DefaultBtn: string;
  LetterBtns: string;
  MeetingBtns: string;
  EnityTypeIDForLessonLearn: string;
  EnityTypeIDForTaskCommnet: string;
  EnityTypeIDForProcesure: string;
  // ... سایر فیلدها در صورت نیاز
}

interface AddEditDeleteContextType {
  handleAdd: () => void;
  handleEdit: () => void;
  handleDelete: (subTabName: string, id: number) => Promise<void>;
  handleDuplicate: () => void;
  handleSaveConfiguration: (
    data: ConfigurationData
  ) => Promise<ConfigurationItem | null>;
  handleSaveCommand: (data: CommandData) => Promise<CommandItem | null>;
}

const AddEditDeleteContext = createContext<AddEditDeleteContextType>(
  {} as AddEditDeleteContextType
);

export const AddEditDeleteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const api = useApi();
  const [, setIsLoading] = useState(false);

  const handleAdd = () => {
    console.log("Add clicked from context");
    // Logic to open add form
  };

  const handleEdit = () => {
    console.log("Edit action triggered from context");
    // Logic to open edit form
  };

  const handleDelete = async (subTabName: string, id: number) => {
    setIsLoading(true);
    try {
      if (subTabName === "Configurations") {
        await api.deleteConfiguration(id);
        console.log("Configuration deleted successfully!");
      } else if (subTabName === "Commands") {
        await api.deleteCommand(id);
        console.log("Command deleted successfully!");
      }
      // Add more conditions if there are other sub-tabs
    } catch (error) {
      console.error("Error deleting record:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = () => {
    console.log("Duplicate action triggered from context");
    // Logic to duplicate a record
  };

  const handleSaveConfiguration = async (
    data: ConfigurationData
  ): Promise<ConfigurationItem | null> => {
    setIsLoading(true);
    try {
      const newConfig: ConfigurationItem = {
        ...(data.id && { ID: parseInt(data.id) }),
        Name: data.Name,
        FirstIDProgramTemplate: parseInt(data.FirstIDProgramTemplate) || 0,
        SelMenuIDForMain: parseInt(data.SelMenuIDForMain) || 0,
        Description: data.Description || "",
        IsVisible: data.IsVisible,
        LastModified: data.LastModified || new Date().toISOString(),
        DefaultBtn: data.DefaultBtn || "",
        LetterBtns: data.LetterBtns || "",
        MeetingBtns: data.MeetingBtns || "",
        EnityTypeIDForLessonLearn: parseInt(data.EnityTypeIDForLessonLearn) || 0,
        EnityTypeIDForTaskCommnet: parseInt(data.EnityTypeIDForTaskCommnet) || 0,
        EnityTypeIDForProcesure: parseInt(data.EnityTypeIDForProcesure) || 0,
        // Add other fields as necessary
      };

      let result: ConfigurationItem;
      if (newConfig.ID) {
        result = await api.updateConfiguration(newConfig);
        console.log("Configuration updated:", result);
      } else {
        result = await api.insertConfiguration(newConfig);
        console.log("Configuration inserted:", result);
      }
      return result;
    } catch (error) {
      console.error("Error saving configuration:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCommand = async (
    data: CommandData
  ): Promise<CommandItem | null> => {
    setIsLoading(true);
    try {
      const newCmd: Partial<CommandItem> = {
        ...(data.id && { ID: parseInt(data.id) }),
        Name: data.Name,
        Describtion: data.Describtion || "",
        MainColumnIDName: data.MainColumnIDName || "",
        GroupName: data.GroupName || "",
        gridCmd: data.gridCmd || "",
        tabCmd: data.tabCmd || "",
        QR: data.QR || "",
        ViewMode: data.ViewMode || -1,
        DefaultColumns: data.DefaultColumns || null,
        ReportParam: data.ReportParam || null,
        ProjectIntensive:
          data.ProjectIntensive !== undefined ? data.ProjectIntensive : true,
        ColorColumn: data.ColorColumn || "",
        InvisibleColumns: data.InvisibleColumns || "",
        ApiColumns: data.ApiColumns || "",
        SpParam: data.SpParam || "",
        CmdType: data.CmdType || 0,
        ApiMode: data.ApiMode || "",
      };

      let updatedCmd: CommandItem;
      if (newCmd.ID) {
        updatedCmd = await api.updateCommand(newCmd as CommandItem);
        console.log("Command updated:", updatedCmd);
      } else {
        updatedCmd = await api.insertCommand(newCmd as CommandItem);
        console.log("Command inserted:", updatedCmd);
      }

      return updatedCmd;
    } catch (error) {
      console.error("Error saving command:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AddEditDeleteContext.Provider
      value={{
        handleAdd,
        handleEdit,
        handleDelete,
        handleDuplicate,
        handleSaveConfiguration,
        handleSaveCommand,
      }}
    >
      {children}
    </AddEditDeleteContext.Provider>
  );
};

export const useAddEditDelete = () => {
  return useContext(AddEditDeleteContext);
};
