import React, { createContext, useContext, useState } from "react";
import { useApi, ConfigurationItem } from "./ApiContext";

interface ConfigurationData {
  // در اینجا همان فیلدهایی را قرار می‌دهید که در کامپوننت Configuration داشتید.
  // یا می‌توانید همین ConfigurationItem را استفاده کنید.
  id?: string;
  Name: string;
  Description: string;
  DefaultBtn: string;
  LetterBtns: string;
  MeetingBtns: string;
  FirstIDProgramTemplate: string;
  SelMenuIDForMain: string;
  IsVisible: boolean;
  LastModified?: string;
  EnityTypeIDForLessonLearn: string;
  EnityTypeIDForTaskCommnet: string;
  EnityTypeIDForProcesure: string;
}

interface AddEditDeleteContextType {
  handleAdd: () => void;
  handleEdit: () => void;
  handleDelete: (subTabName: string, id: number) => Promise<void>;
  handleDuplicate: () => void;

  // متدی که عملیات ذخیره را انجام می‌دهد (Add یا Edit) بسته به اینکه ID وجود دارد یا نه
  handleSaveConfiguration: (
    data: ConfigurationData
  ) => Promise<ConfigurationItem | null>;
}

const AddEditDeleteContext = createContext<AddEditDeleteContextType>(
  {} as AddEditDeleteContextType
);

export const AddEditDeleteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);

  // افزودن کانفیگ جدید
  const handleAdd = () => {
    // اینجا فقط یک مثال است. شما می‌توانید صرفاً panel را باز کنید یا state خاصی ست کنید.
    console.log("Add clicked from context");
  };

  // ویرایش کانفیگ موجود
  const handleEdit = () => {
    // اینجا هم یک مثال:
    console.log("Edit action triggered from context");
  };

  // حذف رکورد (مثلاً Configuration)
  const handleDelete = async (subTabName: string, id: number) => {
    console.log("Delete action triggered from context for subTab:", subTabName);
    try {
      if (subTabName === "Configurations") {
        await api.deleteConfiguration(id);
        console.log("Configuration deleted successfully!");
      }
      // اگر ساب‌تب دیگری وجود داشت، اینجا شرط بگذارید
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Duplicate
  const handleDuplicate = () => {
    console.log("Duplicate action triggered from context");
  };

  /**
   * عمل ذخیرهConfiguration
   * - اگر ID وجود داشته باشد، Update
   * - اگر نداشته باشد، Insert
   */
  const handleSaveConfiguration = async (
    data: ConfigurationData
  ): Promise<ConfigurationItem | null> => {
    try {
      setIsLoading(true);

      const newConfig: ConfigurationItem = {
        ...(data.id && { ID: parseInt(data.id) }),
        Name: data.Name,
        Description: data.Description,
        DefaultBtn: data.DefaultBtn,
        LetterBtns: data.LetterBtns,
        MeetingBtns: data.MeetingBtns,
        FirstIDProgramTemplate: Number(data.FirstIDProgramTemplate) || 0,
        SelMenuIDForMain: Number(data.SelMenuIDForMain) || 0,
        IsVisible: data.IsVisible,
        LastModified: new Date().toISOString(),
        EnityTypeIDForLessonLearn: Number(data.EnityTypeIDForLessonLearn) || 0,
        EnityTypeIDForTaskCommnet: Number(data.EnityTypeIDForTaskCommnet) || 0,
        EnityTypeIDForProcesure: Number(data.EnityTypeIDForProcesure) || 0,
      };

      let updatedConfig: ConfigurationItem;
      if (newConfig.ID) {
        // اگر ID وجود دارد، رکورد موجود را به‌روزرسانی کن
        updatedConfig = await api.updateConfiguration(newConfig);
      } else {
        // در غیر این صورت، یک رکورد جدید ایجاد کن
        updatedConfig = await api.insertConfiguration(newConfig);
      }

      return updatedConfig;
    } catch (error) {
      console.error("Error saving configuration:", error);
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
      }}
    >
      {children}
    </AddEditDeleteContext.Provider>
  );
};

export const useAddEditDelete = () => {
  return useContext(AddEditDeleteContext);
};
