import React, { createContext, useContext } from "react";
import AppServices, {
  WebLoginRequest,
  WebLoginResponse,
  SendOtpRequest,
  SendOtpResponse,
  LoginWithOtpRequest,
  LoginWithOtpResponse,
  TokenSetupResponse,
  ConfigurationItem,
  ProgramTemplateItem,
  DefaultRibbonItem,
  EntityTypeItem,
  AFBtnItem,
  CommandItem,
  Menu,
  MenuTab,
  MenuGroup,
  MenuItem,
  UserToken,
  User,
  Role,
  Company,
  PostCat,
  Project,
  PostAdmin,
  ProgramType,
  ProjectWithCalendar,
  OdpWithExtra,
  EntityCollection,
  Calendar,
  PostSmall,
  AccessProject,
  EntityType,
  EntityTypeComplete,
  CategoryItem,
  WfTemplateItem,
  BoxTemplate,
  WFAproval,
  EntityField,
  PostType,
  GetEnumResponse,
} from "../services/api.services";

// اینترفیس اکشن‌ها
// در src/context/ApiContext.tsx
interface ApiContextType {
  // متدهای OTP/Login
  webLogin: (data: WebLoginRequest) => Promise<WebLoginResponse>;
  sendOtp: (data: SendOtpRequest) => Promise<SendOtpResponse>;
  loginWithOtp: (data: LoginWithOtpRequest) => Promise<LoginWithOtpResponse>;
  tokenSetup: () => Promise<TokenSetupResponse>;

  // متدهای Configuration
  getAllConfigurations: () => Promise<ConfigurationItem[]>;
  insertConfiguration: (data: ConfigurationItem) => Promise<ConfigurationItem>;
  updateConfiguration: (data: ConfigurationItem) => Promise<ConfigurationItem>;
  deleteConfiguration: (id: number) => Promise<void>;

  // سایر سرویس‌ها
  getAllDefaultRibbons: () => Promise<DefaultRibbonItem[]>;
  getAllWfTemplate: () => Promise<WfTemplateItem[]>;
  getAllAfbtn: () => Promise<AFBtnItem[]>;
  getIdByUserToken: () => Promise<UserToken[]>;

  // متدهای AFBtn
  insertAFBtn: (data: AFBtnItem) => Promise<AFBtnItem>;
  updateAFBtn: (data: AFBtnItem) => Promise<AFBtnItem>;
  deleteAFBtn: (id: number) => Promise<void>;

  // متدهای Command
  getAllCommands: () => Promise<CommandItem[]>;
  insertCommand: (data: CommandItem) => Promise<CommandItem>;
  updateCommand: (data: CommandItem) => Promise<CommandItem>;
  deleteCommand: (id: number) => Promise<void>;

  // متدهای Menu APIs
  getAllMenu: () => Promise<Menu[]>;
  insertMenu: (data: Menu) => Promise<Menu>;
  updateMenu: (data: Menu) => Promise<Menu>;
  deleteMenu: (id: number) => Promise<void>;

  getAllMenuTab: (menuId: number) => Promise<MenuTab[]>;
  getAllMenuGroup: (menuTabId: number) => Promise<MenuGroup[]>;
  getAllMenuItem: (menuGroupId: number) => Promise<MenuItem[]>;

  getAllUsers: () => Promise<User[]>;
  insertUser: (data: User) => Promise<User>;
  updateUser: (data: User) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;

  getAllRoles: () => Promise<Role[]>;
  insertRole: (data: Role) => Promise<Role>;
  updateRole: (data: Role) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
  getAllPostTypes: () => Promise<PostType[]>;

  getAllCompanies: () => Promise<Company[]>;
  insertCompany: (data: Company) => Promise<Company>;
  updateCompany: (data: Company) => Promise<Company>;
  deleteCompany: (id: number) => Promise<void>;

  getAllPostCat: () => Promise<PostCat[]>;
  insertPostCat: (data: PostCat) => Promise<PostCat>;
  updatePostCat: (data: PostCat) => Promise<PostCat>;
  deletePostCat: (id: number) => Promise<void>;

  getAllProject: () => Promise<Project[]>;
  getAllProjectsWithCalendar: () => Promise<ProjectWithCalendar[]>;
  deleteProject: (id: string) => Promise<void>;
  getAllForPostAdmin: () => Promise<PostAdmin[]>;

  getAllProgramTemplates: () => Promise<ProgramTemplateItem[]>;
  insertProgramTemplate: (
    data: ProgramTemplateItem
  ) => Promise<ProgramTemplateItem>;
  updateProgramTemplate: (
    data: ProgramTemplateItem
  ) => Promise<ProgramTemplateItem>;
  deleteProgramTemplate: (id: number) => Promise<void>;

  getAllProgramType: () => Promise<ProgramType[]>;
  insertProgramType: (data: ProgramType) => Promise<ProgramType>;
  updateProgramType: (data: ProgramType) => Promise<ProgramType>;
  deleteProgramType: (id: number) => Promise<void>;

  getAllOdpWithExtra: () => Promise<OdpWithExtra[]>;
  insertOdp: (data: OdpWithExtra) => Promise<OdpWithExtra>;
  updateOdp: (data: OdpWithExtra) => Promise<OdpWithExtra>;
  deleteOdp: (id: number) => Promise<void>;

  getAllEntityCollection: () => Promise<EntityCollection[]>;
  insertEntityCollection: (data: EntityCollection) => Promise<EntityCollection>;
  updateEntityCollection: (data: EntityCollection) => Promise<EntityCollection>;
  deleteEntityCollection: (id: number) => Promise<void>;

  getAllCalendar: () => Promise<Calendar[]>;
  insertCalendar: (data: Calendar) => Promise<Calendar>;
  updateCalendar: (data: Calendar) => Promise<Calendar>;
  deleteCalendar: (id: number) => Promise<void>;

  getPostSmall: () => Promise<PostSmall[]>;
  getPostsinProject: (projectId: string) => Promise<AccessProject[]>;
  insertAccessProject: (data: AccessProject) => Promise<AccessProject>;
  updateAccessProject: (data: AccessProject) => Promise<AccessProject>;
  deleteAccessProject: (id: string) => Promise<void>;

  addApprovalFlow: (data: WfTemplateItem) => Promise<WfTemplateItem>;
  deleteApprovalFlow: (id: number) => Promise<void>;
  editApprovalFlow: (data: WfTemplateItem) => Promise<WfTemplateItem>;

  getAllEntityType: () => Promise<EntityType[]>;
  getEntityFieldByEntityTypeId: (
    entityTypeId: number
  ) => Promise<EntityField[]>;
  insertEntityField: (data: EntityField) => Promise<EntityField>;
  updateEntityField: (data: EntityField) => Promise<EntityField>;
  deleteEntityField: (id: number) => Promise<void>;

  getTableTransmittal: () => Promise<EntityTypeComplete[]>;
  insertEntityType: (data: EntityType) => Promise<EntityType>;
  updateEntityType: (data: EntityType) => Promise<EntityType>;
  deleteEntityType: (id: number) => Promise<void>;
  duplicateEntityType: (id: number) => Promise<EntityType>;

  getAllCatA: () => Promise<CategoryItem[]>;
  insertCatA: (data: CategoryItem) => Promise<CategoryItem>;
  updateCatA: (data: CategoryItem) => Promise<CategoryItem>;
  deleteCatA: (id: number) => Promise<void>;

  // Category B methods
  getAllCatB: () => Promise<CategoryItem[]>;
  insertCatB: (data: CategoryItem) => Promise<CategoryItem>;
  updateCatB: (data: CategoryItem) => Promise<CategoryItem>;
  deleteCatB: (id: number) => Promise<void>;

  getAllBoxTemplatesByWfTemplateId: (id: number) => Promise<BoxTemplate[]>;
  insertBoxTemplate: (data: BoxTemplate) => Promise<BoxTemplate>;
  updateBoxTemplate: (data: BoxTemplate) => Promise<BoxTemplate>;
  deleteBoxTemplate: (id: number) => Promise<void>;

  getApprovalContextData: (id: number) => Promise<WFAproval[]>;

  getEnum: (data: { str: string }) => Promise<GetEnumResponse>;

}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const APIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // در src/context/ApiContext.tsx
  const api: ApiContextType = {
    // متدهای OTP/Login
    webLogin: AppServices.webLogin.bind(AppServices),
    sendOtp: AppServices.sendOtp.bind(AppServices),
    loginWithOtp: AppServices.loginWithOtp.bind(AppServices),
    tokenSetup: AppServices.tokenSetup.bind(AppServices),

    // متدهای Configuration
    getAllConfigurations: AppServices.getAllConfigurations.bind(AppServices),
    insertConfiguration: AppServices.insertConfiguration.bind(AppServices),
    updateConfiguration: AppServices.updateConfiguration.bind(AppServices),
    deleteConfiguration: AppServices.deleteConfiguration.bind(AppServices),

    // سایر سرویس‌ها
    getAllProgramTemplates:
      AppServices.getAllProgramTemplates.bind(AppServices),
    getAllDefaultRibbons: AppServices.getAllDefaultRibbons.bind(AppServices),
    getAllWfTemplate: AppServices.getAllWfTemplate.bind(AppServices),
    getAllAfbtn: AppServices.getAllAfbtn.bind(AppServices),
    getIdByUserToken: AppServices.getIdByUserToken.bind(AppServices),

    // متدهای AFBtn
    insertAFBtn: AppServices.insertAFBtn.bind(AppServices),
    updateAFBtn: AppServices.updateAFBtn.bind(AppServices),
    deleteAFBtn: AppServices.deleteAFBtn.bind(AppServices),

    // متدهای Command
    getAllCommands: AppServices.getAllCommands.bind(AppServices),
    insertCommand: AppServices.insertCommand.bind(AppServices),
    updateCommand: AppServices.updateCommand.bind(AppServices),
    deleteCommand: AppServices.deleteCommand.bind(AppServices),

    // متدهای Menu APIs
    getAllMenu: AppServices.getAllMenu.bind(AppServices),
    insertMenu: AppServices.insertMenu.bind(AppServices),
    updateMenu: AppServices.updateMenu.bind(AppServices),
    deleteMenu: AppServices.deleteMenu.bind(AppServices),

    getAllMenuTab: AppServices.getAllMenuTab.bind(AppServices),
    getAllMenuGroup: AppServices.getAllMenuGroup.bind(AppServices),
    getAllMenuItem: AppServices.getAllMenuItem.bind(AppServices),

    getAllUsers: AppServices.getAllUsers.bind(AppServices),
    insertUser: AppServices.insertUser.bind(AppServices),
    updateUser: AppServices.updateUser.bind(AppServices),
    deleteUser: AppServices.deleteUser.bind(AppServices),

    // Role methods
    getAllRoles: AppServices.getAllRoles.bind(AppServices),
    insertRole: AppServices.insertRole.bind(AppServices),
    updateRole: AppServices.updateRole.bind(AppServices),
    deleteRole: AppServices.deleteRole.bind(AppServices),
    getAllPostTypes: AppServices.getAllPostTypes.bind(AppServices),
    getAllCompanies: AppServices.getAllCompanies.bind(AppServices),
    insertCompany: AppServices.insertCompany.bind(AppServices),
    updateCompany: AppServices.updateCompany.bind(AppServices),
    deleteCompany: AppServices.deleteCompany.bind(AppServices),

    getAllPostCat: AppServices.getAllPostCat.bind(AppServices),
    insertPostCat: AppServices.insertPostCat.bind(AppServices),
    updatePostCat: AppServices.updatePostCat.bind(AppServices),
    deletePostCat: AppServices.deletePostCat.bind(AppServices),

    getAllProject: AppServices.getAllProject.bind(AppServices),
    getAllProjectsWithCalendar:
      AppServices.getAllProjectsWithCalendar.bind(AppServices),
    deleteProject: AppServices.deleteProject.bind(AppServices),
    getAllForPostAdmin: AppServices.getAllForPostAdmin.bind(AppServices),

    insertProgramTemplate: AppServices.insertProgramTemplate.bind(AppServices),
    updateProgramTemplate: AppServices.updateProgramTemplate.bind(AppServices),
    deleteProgramTemplate: AppServices.deleteProgramTemplate.bind(AppServices),

    getAllProgramType: AppServices.getAllProgramType.bind(AppServices),
    insertProgramType: AppServices.insertProgramType.bind(AppServices),
    updateProgramType: AppServices.updateProgramType.bind(AppServices),
    deleteProgramType: AppServices.deleteProgramType.bind(AppServices),

    getAllOdpWithExtra: AppServices.getAllOdpWithExtra.bind(AppServices),
    insertOdp: AppServices.insertOdp.bind(AppServices),
    updateOdp: AppServices.updateOdp.bind(AppServices),
    deleteOdp: AppServices.deleteOdp.bind(AppServices),

    getAllEntityCollection:
      AppServices.getAllEntityCollection.bind(AppServices),
    insertEntityCollection:
      AppServices.insertEntityCollection.bind(AppServices),
    updateEntityCollection:
      AppServices.updateEntityCollection.bind(AppServices),
    deleteEntityCollection:
      AppServices.deleteEntityCollection.bind(AppServices),

    getAllCalendar: AppServices.getAllCalendar.bind(AppServices),
    insertCalendar: AppServices.insertCalendar.bind(AppServices),
    updateCalendar: AppServices.updateCalendar.bind(AppServices),
    deleteCalendar: AppServices.deleteCalendar.bind(AppServices),

    getPostSmall: AppServices.getPostSmall.bind(AppServices),
    getPostsinProject: AppServices.getPostsinProject.bind(AppServices),
    insertAccessProject: AppServices.insertAccessProject.bind(AppServices),
    updateAccessProject: AppServices.updateAccessProject.bind(AppServices),
    deleteAccessProject: AppServices.deleteAccessProject.bind(AppServices),

    addApprovalFlow: AppServices.addApprovalFlow.bind(AppServices),
    deleteApprovalFlow: AppServices.deleteApprovalFlow.bind(AppServices),
    editApprovalFlow: AppServices.editApprovalFlow.bind(AppServices),

    getAllEntityType: AppServices.getAllEntityType.bind(AppServices),
    getEntityFieldByEntityTypeId:
      AppServices.getEntityFieldByEntityTypeId.bind(AppServices),
    insertEntityField: AppServices.insertEntityField.bind(AppServices),
    updateEntityField: AppServices.updateEntityField.bind(AppServices),
    deleteEntityField: AppServices.deleteEntityField.bind(AppServices),

    getTableTransmittal: AppServices.getTableTransmittal.bind(AppServices),
    insertEntityType: AppServices.insertEntityType.bind(AppServices),
    updateEntityType: AppServices.updateEntityType.bind(AppServices),
    deleteEntityType: AppServices.deleteEntityType.bind(AppServices),
    duplicateEntityType: AppServices.duplicateEntityType.bind(AppServices),

    getAllCatA: AppServices.getAllCatA.bind(AppServices),
    insertCatA: AppServices.insertCatA.bind(AppServices),
    updateCatA: AppServices.updateCatA.bind(AppServices),
    deleteCatA: AppServices.deleteCatA.bind(AppServices),

    // Category B methods
    getAllCatB: AppServices.getAllCatB.bind(AppServices),
    insertCatB: AppServices.insertCatB.bind(AppServices),
    updateCatB: AppServices.updateCatB.bind(AppServices),
    deleteCatB: AppServices.deleteCatB.bind(AppServices),
    getAllBoxTemplatesByWfTemplateId:
      AppServices.getAllBoxTemplatesByWfTemplateId.bind(AppServices),
    insertBoxTemplate: AppServices.insertBoxTemplate.bind(AppServices),
    updateBoxTemplate: AppServices.updateBoxTemplate.bind(AppServices),
    deleteBoxTemplate: AppServices.deleteBoxTemplate.bind(AppServices),

    getApprovalContextData:
      AppServices.getApprovalContextData.bind(AppServices),
      getEnum: AppServices.getEnum.bind(AppServices),

  };

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi باید داخل یک APIProvider استفاده شود");
  }
  return context;
};

// صادرات لازم برای تایپ‌ها
export type {
  ConfigurationItem,
  WebLoginResponse,
  SendOtpResponse,
  LoginWithOtpResponse,
  TokenSetupResponse,
  DefaultRibbonItem,
  ProgramTemplateItem,
  EntityTypeItem,
  WfTemplateItem,
  AFBtnItem,
  CommandItem,
  Menu,
  MenuTab,
  MenuGroup,
  MenuItem,
  User,
  Role,
  Company,
  PostCat,
  Project,
  PostAdmin,
  ProgramType,
  ProjectWithCalendar,
  OdpWithExtra,
};
