// src/context/AddEditDeleteContext.tsx
import React, { createContext, useContext, useState } from "react";
import { useApi } from "./ApiContext";
import { ConfigurationItem, CommandItem } from "./ApiContext";

// ساختار داده فرم Configuration
interface ConfigurationData {
  id?: string;
  Name: string;
  Description?: string;
  // ... سایر فیلدها
}

// ساختار داده فرم Command
interface CommandData {
  id?: string;
  Name: string;
  Describtion?: string;
  // ... سایر فیلدهای مورد نیاز
}

interface AddEditDeleteContextType {
  // عملیات عمومی
  handleAdd: () => void;
  handleEdit: () => void;
  handleDelete: (subTabName: string, id: number) => Promise<void>;
  handleDuplicate: () => void;

  // ذخیره (Add یا Edit) Configuration
  handleSaveConfiguration: (
    data: ConfigurationData
  ) => Promise<ConfigurationItem | null>;

  // ذخیره (Add یا Edit) Command
  handleSaveCommand: (data: CommandData) => Promise<CommandItem | null>;
}

const AddEditDeleteContext = createContext<AddEditDeleteContextType>(
  {} as AddEditDeleteContextType
);

export const AddEditDeleteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * عملیات Add
   * (برای بازکردن فرم در حالت افزودن)
   */
  const handleAdd = () => {
    console.log("Add clicked from context");
    // اگر لاجیک خاصی برای بازکردن پنل یا... دارید، اینجا بنویسید
  };

  /**
   * عملیات Edit
   * (برای بازکردن فرم در حالت ویرایش)
   */
  const handleEdit = () => {
    console.log("Edit action triggered from context");
  };

  /**
   * حذف رکورد. با توجه به ساب‌تب، متد Delete مناسب را فرامی‌خواند
   */
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
      // اگر تب‌های دیگری هم دارید، اینجا اضافه کنید
    } catch (error) {
      console.error("Error deleting record:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Duplicate (در صورت نیاز)
   */
  const handleDuplicate = () => {
    console.log("Duplicate action triggered from context");
    // کپی رکورد
  };

  /**
   * ذخیره (Add یا Edit) برای Configuration
   */
  const handleSaveConfiguration = async (
    data: ConfigurationData
  ): Promise<ConfigurationItem | null> => {
    setIsLoading(true);
    try {
      const newConfig: ConfigurationItem = {
        ...(data.id && { ID: parseInt(data.id) }),
        Name: data.Name,
        Description: data.Description || "",
        // بقیه فیلدها
        LastModified: new Date().toISOString(),
        IsVisible: true,
        FirstIDProgramTemplate: 0,
        SelMenuIDForMain: 0,
        EnityTypeIDForLessonLearn: 0,
        EnityTypeIDForTaskCommnet: 0,
        EnityTypeIDForProcesure: 0,
      };

      let result: ConfigurationItem;
      if (newConfig.ID) {
        // Update
        result = await api.updateConfiguration(newConfig);
        console.log("Configuration updated:", result);
      } else {
        // Insert
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

  /**
   * ذخیره (Add یا Edit) برای Command
   */
  const handleSaveCommand = async (
    data: CommandData
  ): Promise<CommandItem | null> => {
    setIsLoading(true);
    try {
      const newCmd: CommandItem = {
        ...(data.id && { ID: parseInt(data.id) }),
        Name: data.Name,
        Describtion: data.Describtion,
        // بقیه فیلدها
      };

      let updatedCmd: CommandItem;
      if (newCmd.ID) {
        updatedCmd = await api.updateCommand(newCmd);
        console.log("Command updated:", updatedCmd);
      } else {
        updatedCmd = await api.insertCommand(newCmd);
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
