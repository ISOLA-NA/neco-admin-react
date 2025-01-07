import React, { createContext, useContext, useState } from 'react'
import {
  useApi,
  CommandItem,
  User,
  ConfigurationItem,
  Role,
  Company,
  PostCat
} from './ApiContext'

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

export interface UserData {
  ID?: string // Changed from number to string to match User interface
  Username: string
  Password?: string
  ConfirmPassword?: string
  Status: number
  MaxWrongPass: number
  Name: string
  Family: string
  Email: string
  Website: string
  Mobile: string
  TTKK: string
  userType: number
  Code: string
  IsVisible: boolean
  LastModified: string
  ModifiedById?: string
  CreateDate?: string | null
  LastLoginTime?: string | null
  UserImageId?: string | null
}

interface RoleData {
  ID?: string;
  Name: string;
  IsVisible: boolean;
  ModifiedById?: string;
  Description?: string | null;
  Type?: string | null;
  Grade?: string | null;
  Competencies?: string | null;
  Authorization?: string | null;
  Responsibility?: string | null;
  PostCode?: string | null;
  // اضافه کردن فیلدهای جدید
  OwnerID?: string | null;
  ParrentId?: string | null;
  isAccessCreateProject: boolean;
  isHaveAddressbar: boolean;
  isStaticPost: boolean;
  nCompanyID?: string | null;
  nMenuID?: string | null;
  nPostTypeID?: string | null;
  nProjectID?: string | null;
  status?: number;
}

interface CompanyData {
  ID?: number
  Name: string
  Description?: string
  Type?: string | null
  Information?: string | null
  IsVisible: boolean
  LastModified?: string
  ModifiedById?: string | null
}

interface RoleGroupData {
  ID?: number
  Name: string
  Description: string
  IsGlobal: boolean
  IsVisible: boolean
  LastModified?: string
  ModifiedById?: string | null
  PostsStr?: string
  ProjectsStr?: string
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
  handleSaveRole: (data: RoleData) => Promise<Role | null>
  handleSaveCompany: (data: CompanyData) => Promise<Company | null>
  handleSaveRoleGroup: (data: RoleGroupData) => Promise<PostCat | null>
}

const AddEditDeleteContext = createContext<AddEditDeleteContextType>(
  {} as AddEditDeleteContextType
)

export const AddEditDeleteProvider: React.FC<{ children: React.ReactNode }> = ({
  children
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
        await api.deleteUser(String(id))
        console.log('User deleted successfully!')
      } else if (subTabName === 'Roles') {
        await api.deleteRole(String(id))
        console.log('User deleted successfully!')
      } else if (subTabName === 'Enterprises') {
        await api.deleteCompany(id)
        console.log('Company deleted successfully!')
      } else if (subTabName === 'RoleGroups') {
        await api.deletePostCat(id)
        console.log('Role Group deleted successfully!')
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
        EnityTypeIDForLessonLearn:
          parseInt(data.EnityTypeIDForLessonLearn) || 0,
        EnityTypeIDForTaskCommnet:
          parseInt(data.EnityTypeIDForTaskCommnet) || 0,
        EnityTypeIDForProcesure: parseInt(data.EnityTypeIDForProcesure) || 0
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
        ApiMode: data.ApiMode || ''
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
        LastModified: data.LastModified || new Date().toISOString(),
        ModifiedById: data.ModifiedById,
        CreateDate: data.CreateDate ?? null,
        LastLoginTime: data.LastLoginTime ?? null,
        UserImageId: data.UserImageId ?? null,
        // Conditionally include Password fields
        ...(data.Password && { Password: data.Password }),
        // Exclude ConfirmPassword when editing
        ...(!data.ID &&
          data.ConfirmPassword && { ConfirmPassword: data.ConfirmPassword })
      }

      console.log('User Request Data:', userRequest) // For debugging

      let result: User
      if (userRequest.ID !== undefined && userRequest.ID !== null) {
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

  const handleSaveRole = async (data: RoleData): Promise<Role | null> => {
    setIsLoading(true);
    try {
      if (data.ID) {
        
        // آبجکت برای update
        const updateRoleRequest: Role = {
          Name: data.Name,
          IsVisible: data.IsVisible,
          Authorization: data.Authorization,
          Competencies: data.Competencies,
          Description: data.Description,
          Grade: data.Grade,
          PostCode: data.PostCode,
          Responsibility: data.Responsibility,
          Type: data.Type,
          OwnerID: data.OwnerID || null,
          ParrentId: data.ParrentId || null,
          isAccessCreateProject: data.isAccessCreateProject || false,
          isHaveAddressbar: data.isHaveAddressbar || false,
          isStaticPost: data.isStaticPost,
          nCompanyID: data.nCompanyID || null,
          nMenuID: data.nMenuID || null,
          nPostTypeID: data.nPostTypeID || null,
          nProjectID: data.nProjectID || null,
          status: data.status || 1
        };

        const result = await api.updateRole(updateRoleRequest);
        console.log('Role updated:', result);
        return result;
      } else {
        // آبجکت برای insert
        const insertRoleRequest: Role = {
          Name: data.Name,
          IsVisible: true,
          LastModified: new Date().toISOString(),
          Authorization: data.Authorization,
          Competencies: data.Competencies,
          Description: data.Description,
          Grade: data.Grade,
          PostCode: data.PostCode,
          Responsibility: data.Responsibility,
          Type: data.Type,
          isStaticPost: data.isStaticPost
        };
        
        const result = await api.insertRole(insertRoleRequest);
        console.log('Role inserted:', result);
        return result;
      }
    } catch (error) {
      console.error('Error saving role:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCompany = async (
    data: CompanyData
  ): Promise<Company | null> => {
    setIsLoading(true)
    try {
      const companyRequest: Partial<Company> = {
        Name: data.Name,
        Description: data.Description,
        Type: data.Type,
        Information: data.Information,
        IsVisible: data.IsVisible,
        LastModified: data.LastModified || new Date().toISOString(),
        ModifiedById: data.ModifiedById
      }

      // Add ID if it exists (for updates)
      if (data.ID) {
        companyRequest.ID = data.ID
      }

      let result: Company

      if (companyRequest.ID) {
        // Update existing company
        result = await api.updateCompany(companyRequest as Company)
        console.log('Company updated:', result)
      } else {
        // Add new company
        result = await api.insertCompany(companyRequest as Company)
        console.log('Company inserted:', result)
      }

      return result
    } catch (error) {
      console.error('Error saving company:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveRoleGroup = async (
    data: RoleGroupData
  ): Promise<PostCat | null> => {
    setIsLoading(true)
    try {
      const roleGroupRequest: PostCat = {
        Name: data.Name,
        Description: data.Description,
        IsGlobal: data.IsGlobal,
        IsVisible: data.IsVisible,
        PostsStr: data.PostsStr || '',
        ProjectsStr: data.ProjectsStr || ''
      }

      // اگر ID وجود داشت، آن را به درخواست اضافه کن
      if (data.ID) {
        roleGroupRequest.ID = data.ID
      }

      let result: PostCat
      if (data.ID) {
        // اگر ID وجود دارد از متد update استفاده کن
        result = await api.updatePostCat(roleGroupRequest)
        console.log('Role Group updated:', result)
      } else {
        // اگر ID وجود ندارد از متد insert استفاده کن
        result = await api.insertPostCat(roleGroupRequest)
        console.log('Role Group inserted:', result)
      }

      return result
    } catch (error) {
      console.error('Error saving role group:', error)
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
        handleSaveRole,
        handleSaveCompany,
        handleSaveRoleGroup
      }}
    >
      {children}
    </AddEditDeleteContext.Provider>
  )
}

export const useAddEditDelete = () => {
  return useContext(AddEditDeleteContext)
}
