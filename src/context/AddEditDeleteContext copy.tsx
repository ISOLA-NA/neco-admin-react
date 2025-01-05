// src/context/AddEditDeleteContext.tsx

import React, { createContext, useContext, useState } from 'react'
import { useApi, CommandItem, User, ConfigurationItem } from './ApiContext'

// Define CommandData if it's different from CommandItem
interface CommandData {
  id?: string
  Name: string
  Describtion: string
  MainColumnIDName: string
  GroupName: string
  gridCmd: string
  tabCmd: string
  QR: string
  ViewMode: string | null
  DefaultColumns: string | null
  ReportParam: string | null
  ProjectIntensive: boolean
  ColorColumn: string
  InvisibleColumns: string
  ApiColumns: string
  SpParam: string
  CmdType: number
  ApiMode?: string
}

interface ConfigurationData {
  id?: string
  Name: string
  FirstIDProgramTemplate: string
  SelMenuIDForMain: string
  Description?: string
  IsVisible: boolean
  LastModified?: string
  DefaultBtn: string
  LetterBtns: string
  MeetingBtns: string
  EnityTypeIDForLessonLearn: string
  EnityTypeIDForTaskCommnet: string
  EnityTypeIDForProcesure: string
}

// رابط داده‌های یوزر
export interface UserData {
  ID?: number;
  Username: string;
  Password?: string; // Made optional
  ConfirmPassword?: string; // Made optional
  Status: number;
  MaxWrongPass: number;
  Name: string;
  Family: string;
  Email: string;
  Website: string;
  Mobile: string;
  CreateDate?: string | null;
  LastLoginTime?: string | null;
  UserImageId?: string | null;
  TTKK: string;
  userType: number;
  Code: string;
  IsVisible: boolean;
  LastModified?: string;
  ModifiedById?: string;
}

interface AddEditDeleteContextType {
  handleAdd: () => void
  handleEdit: () => void
  handleDelete: (subTabName: string, id: number) => Promise<void>
  handleDuplicate: () => void
  handleSaveConfiguration: (
    data: ConfigurationData
  ) => Promise<ConfigurationItem | null>
  handleSaveCommand: (data: CommandData) => Promise<CommandItem | null>
  handleSaveUser: (data: UserData) => Promise<User | null>
}

const AddEditDeleteContext = createContext<AddEditDeleteContextType>(
  {} as AddEditDeleteContextType
)

export const AddEditDeleteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const api = useApi()
  const [, setIsLoading] = useState(false)

  const handleAdd = () => {
    console.log('Add clicked from context')
    // Logic to open add form
  }

  const handleEdit = () => {
    console.log('Edit action triggered from context')
    // Logic to open edit form
  }

  const handleDelete = async (subTabName: string, id: number) => {
    setIsLoading(true)
    try {
      if (subTabName === 'Configurations') {
        await api.deleteConfiguration(id)
        console.log('Configuration deleted successfully!')
      } else if (subTabName === 'Commands') {
        await api.deleteCommand(id)
        console.log('Command deleted successfully!')
      } else if (subTabName === 'Users') {
        // حذف یوزر
        await api.deleteUser(String(id))
        console.log('User deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting record:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDuplicate = () => {
    console.log('Duplicate action triggered from context')
    // Logic to duplicate a record
  }

  const handleSaveConfiguration = async (
    data: ConfigurationData
  ): Promise<ConfigurationItem | null> => {
    setIsLoading(true)
    try {
      const newConfig: ConfigurationItem = {
        ...(data.id && { ID: parseInt(data.id) }),
        Name: data.Name,
        FirstIDProgramTemplate: parseInt(data.FirstIDProgramTemplate) || 0,
        SelMenuIDForMain: parseInt(data.SelMenuIDForMain) || 0,
        Description: data.Description || '',
        IsVisible: data.IsVisible,
        LastModified: data.LastModified || new Date().toISOString(),
        DefaultBtn: data.DefaultBtn || '',
        LetterBtns: data.LetterBtns || '',
        MeetingBtns: data.MeetingBtns || '',
        EnityTypeIDForLessonLearn: parseInt(data.EnityTypeIDForLessonLearn) || 0,
        EnityTypeIDForTaskCommnet: parseInt(data.EnityTypeIDForTaskCommnet) || 0,
        EnityTypeIDForProcesure: parseInt(data.EnityTypeIDForProcesure) || 0,
      }

      let result: ConfigurationItem
      if (newConfig.ID) {
        result = await api.updateConfiguration(newConfig)
        console.log('Configuration updated:', result)
      } else {
        result = await api.insertConfiguration(newConfig)
        console.log('Configuration inserted:', result)
      }
      return result
    } catch (error) {
      console.error('Error saving configuration:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCommand = async (
    data: CommandData
  ): Promise<CommandItem | null> => {
    setIsLoading(true)
    try {
      const newCmd: Partial<CommandItem> = {
        ...(data.id && { ID: parseInt(data.id) }),
        Name: data.Name,
        Describtion: data.Describtion || '',
        MainColumnIDName: data.MainColumnIDName || '',
        GroupName: data.GroupName || '',
        gridCmd: data.gridCmd || '',
        tabCmd: data.tabCmd || '',
        QR: data.QR || '',
        ViewMode: data.ViewMode || -1,
        DefaultColumns: data.DefaultColumns || null,
        ReportParam: data.ReportParam || null,
        ProjectIntensive:
          data.ProjectIntensive !== undefined ? data.ProjectIntensive : true,
        ColorColumn: data.ColorColumn || '',
        InvisibleColumns: data.InvisibleColumns || '',
        ApiColumns: data.ApiColumns || '',
        SpParam: data.SpParam || '',
        CmdType: data.CmdType || 0,
        ApiMode: data.ApiMode || '',
      }

      let updatedCmd: CommandItem
      if (newCmd.ID) {
        updatedCmd = await api.updateCommand(newCmd as CommandItem)
        console.log('Command updated:', updatedCmd)
      } else {
        updatedCmd = await api.insertCommand(newCmd as CommandItem)
        console.log('Command inserted:', updatedCmd)
      }

      return updatedCmd
    } catch (error) {
      console.error('Error saving command:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveUser = async (data: UserData): Promise<User | null> => {
    setIsLoading(true)
    try {
      const userRequest: User = {
        ID: data.ID,
        Username: data.Username,
        Status: data.Status,
        MaxWrongPass: data.MaxWrongPass,
        Name: data.Name,
        Family: data.Family,
        Email: data.Email,
        Website: data.Website,
        Mobile: data.Mobile,
        TTKK: data.TTKK,
        userType: data.userType,
        Code: data.Code,
        IsVisible: data.IsVisible,
        LastModified: new Date().toISOString(),
        ModifiedById: data.ModifiedById,
        CreateDate: data.CreateDate ?? null,
        LastLoginTime: data.LastLoginTime ?? null,
        UserImageId: data.UserImageId ?? null,
        Password: data.Password,  // از Password استفاده می‌شود
        ConfirmPassword: data.ConfirmPassword, // ConfirmPassword ضروری است
      }

      let result: User
      if (userRequest.ID !== undefined) {
        // Updating existing user
        result = await api.updateUser(userRequest)
        console.log('User updated:', result)
      } else {
        // Creating new user
        result = await api.insertUser(userRequest)
        console.log('User inserted:', result)
      }

      return result
    } catch (error) {
      console.error('Error saving user:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AddEditDeleteContext.Provider
      value={{
        handleAdd,
        handleEdit,
        handleDelete,
        handleDuplicate,
        handleSaveConfiguration,
        handleSaveCommand,
        handleSaveUser,
      }}
    >
      {children}
    </AddEditDeleteContext.Provider>
  )
}

export const useAddEditDelete = () => {
  return useContext(AddEditDeleteContext)
}
