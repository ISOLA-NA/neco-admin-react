// src/services/api.services.ts

import httpClient from "./api.config";
import { apiConst } from "./api.constant";


// ================== اینترفیس‌ها ==================

// نمونه از AppSetting
export interface AppSetting {
  ID: number;
  Name: string;
  LetterBtns: string;
}

// نمونه از کاربر
export interface MyUser {
  ID: string;
  TTKK: string;
  Username: string;
  Name: string;
  Email: string;
  userType?: number;
}

// برای لاگین (OTP و ...)
export interface WebLoginResponse {
  data: { MyUser: any; tokenLife: any };
  AppSetting: AppSetting;
  MyUser: MyUser;
}

export interface Post {
  ID: string;
  Name: string;
  IsStatic: boolean;
  isAccessCreateProject: boolean;
  isHaveAddressbar: boolean;
  Categories: string[];
}

export interface PostUserResponse {
  Posts: Post[];
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
}
export interface LoginWithOtpResponse {
  AppSetting: AppSetting;
  MyUser: MyUser;
}
export interface WebLoginRequest {
  UserName: string;
  Password: string;
  SeqKey: string;
}
export interface SendOtpRequest {
  UserName: string;
  Password: string;
  SeqKey: string;
}
export interface LoginWithOtpRequest {
  UserName: string;
  Password: string;
  SeqKey: string;
}
export interface TokenSetupResponse {
  data: number;
}

// ================== اینترفیس‌های Config ==================
export interface ConfigurationItem {
  ID?: number;
  Name: string;
  Description: string;
  DefaultBtn?: string;
  LetterBtns?: string;
  MeetingBtns?: string;
  FirstIDProgramTemplate: number;
  SelMenuIDForMain: number;
  IsVisible: boolean;
  LastModified: string;
  EnityTypeIDForLessonLearn: number;
  EnityTypeIDForTaskCommnet: number;
  EnityTypeIDForProcesure: number;
}

// ================== اینترفیس‌های Menu/Ribbon ==================
export interface DefaultRibbonItem {
  ID: number;
  Name: string;
}

// ================== اینترفیس‌های ProgramTemplate ==================
export interface ProgramTemplateItem {
  ID?: number;
  ModifiedById?: string | null;
  Name: string;

  MetaColumnName?: string;
  Duration: string;
  nProgramTypeID: number | null;
  PCostAct: number;
  PCostAprov: number;
  IsGlobal: boolean;
  ProjectsStr?: string | null;
  IsVisible: boolean;
  LastModified?: string | null;
}

// ================== EntityType ==================
export interface EntityTypeItem {
  ID: number;
  Name: string;
  Category: string;
}

export interface WfTemplateItem {
  ID?: number;
  Name: string;
  Describtion: string;
  IsGlobal: boolean;
  IsVisible: boolean;
  LastModified?: string;
  MaxDuration: number;
  ModifiedById?: string;
  PCost: number;
  ProjectsStr?: string;
}

export interface AFBtnItem {
  ID?: number; // در Insert ممکن است خالی باشد
  Name: string;
  Tooltip?: string;
  StateText?: string;
  Order?: number;
  WFStateForDeemed?: number;
  WFCommand?: number;
  IconImageId?: string | null;
  IsVisible?: boolean;
  LastModified?: string | null;
  ModifiedById?: number | null;
}

// نمونه‌ی کاربر با توکن
export interface UserToken {
  ID: number;
  Name: string;
}

// export interface editProfileUser {
//   Name: string
//   Family: string
//   Mobile: number
//   Code: number
// }

// ================== CommandItem ==================
export interface CommandItem {
  ID?: number;
  Name: string;
  Describtion?: string;
  MainColumnIDName?: string;
  GroupName?: string;
  gridCmd?: string;
  tabCmd?: string;
  QR?: string;
  ViewMode?: any; // می‌تواند string یا number باشد
  DefaultColumns?: string | null;
  ReportParam?: string | null;
  ProjectIntensive?: boolean;
  ColorColumn?: string;
  InvisibleColumns?: string;
  ApiColumns?: string;
  SpParam?: string;
  CmdType?: number;
  ApiMode?: string;
}

export interface GetEnumRequest {
  str: string;
}

// تعریف اینترفیس برای پاسخ getEnum
export interface GetEnumResponse {
  [key: string]: string;
}

export interface Menu {
  ID?: number; // Optional for creation
  ModifiedById?: string; // Optional, set by backend or current user
  Name: string;
  Description: string;
  IsVisible?: boolean; // Optional, default to true or as per your logic
  LastModified?: string; // Optional, set by backend
}

// Interface for MenuTab
export interface MenuTab {
  ID: number;
  ModifiedById?: string | null;
  Name: string;
  Order: number;
  Description: string;
  nMenuId: number;
  IsVisible: boolean;
  LastModified: string | null;
  IconImageId?: string | null;
}

// Interface for MenuGroup
export interface MenuGroup {
  ID: number;
  ModifiedById: string | null;
  Name: string;
  Order: number;
  Description: string;
  nMenuTabId: number;
  IsVisible: boolean;
  LastModified: string | null;
  IconImageId?: string | null;
}

// Add this interface with the other interfaces in api.services.ts
// src/services/api.services.ts

// Interface for User
// src/context/ApiContext.tsx

export interface User {
  ID?: string | undefined;
  Username: string;
  Password?: string; // این فیلد اجباری است
  ConfirmPassword?: string; // این فیلد نیز اجباری است
  Status: number;
  MaxWrongPass: number;
  Name: string;
  Family: string;
  Email: string;
  Website: string;
  Mobile: string;
  TTKK: string;
  userType: number;
  Code: string;
  IsVisible: boolean;
  LastModified: string;
  ModifiedById?: string;
  CreateDate?: string | null;
  LastLoginTime?: string | null;
  UserImageId?: string | null;
}

// Interface for MenuItem
export interface MenuItem {
  ID: number;
  ModifiedById: string | null;
  Name: string;
  Description: string;
  Order: number;
  IconImageId: string | null;
  Command: string;
  CommandWeb: string;
  CommandMobile: string;
  HelpText: string;
  KeyTip: string;
  Size: number;
  nMenuGroupId: number;
  IsVisible: boolean;
  LastModified: string | null;
}

export interface Role {
  ID?: string;
  Name: string | null;
  IsVisible: boolean;
  isStaticPost: boolean;
  LastModified?: string;
  ModifiedById?: string;

  // فیلدهای مربوط به insert
  Authorization?: string | null;
  Competencies?: string | null;
  Description?: string | null;
  Grade?: string | null;
  PostCode?: string | null;
  Responsibility?: string | null;
  Type?: string | null;

  // فیلدهای مربوط به update
  CreateById?: string | null;
  CreateDate?: string;
  OwnerID?: string | null;
  ParrentId?: string | null;
  isAccessCreateProject?: boolean;
  isHaveAddressbar?: boolean;
  nCompanyID?: string | null;
  nMenuID?: string | null;
  nPostTypeID?: string | null;
  nProjectID?: string | null;
  status?: number;
}

export interface PostType {
  ID?: string;
  Name: string;
  IsVisible: boolean;
  LastModified?: string;
  ModifiedById?: string;
  Description?: string | null;
}

export interface Company {
  ID: number;
  Name: string;
  Describtion?: string; // افزودن Description به صورت اختیاری
  Information?: string | null; // اطلاعات ممکن است خالی باشد
  IsVisible: boolean;
  LastModified: string;
  ModifiedById?: string | null;
  Type?: string | null; // نوع می‌تواند مقدار نال یا یک رشته باشد
}

// In src/services/api.services.ts

export interface PostCat {
  ID?: number; // Already optional
  Name: string;
  Description: string;
  IsGlobal: boolean;
  IsVisible: boolean;
  LastModified?: string; // Make optional
  ModifiedById?: string; // Make optional
  PostsStr?: string;
  ProjectsStr?: string;
}

// اینترفیس درخواست ChangePasswordByAdmin
export interface ChangePasswordByAdminRequest {
  UserId: string; // شناسه کاربری
  Password: string; // رمز عبور جدید
}

export interface Project {
  ID: any;
  ProjectName: string;
  State: number;
}

export interface ProjectWithCalendar {
  AccessGId: string;
  AcualStartTime: string | null;
  CreateDate: string;
  ID: string;
  IsIdea: boolean;
  IsVisible: boolean;
  IssuesNum: number;
  KnowledgeNum: number;
  LastModified: string;
  LettersNum: number;
  MeetingsNum: number;
  PCostAct: number;
  PCostAprov: number;
  ParrentId: string | null;
  Progress1: number;
  Progress2: number;
  Progress3: number;
  ProjectName: string;
  RCostAct: number;
  RCostAprov: number;
  RolesNum: number;
  StarterPostId: string;
  State: string;
  TaskNum: number;
  TotalDuration: number;
  calendarName: string | null;
  nCalendarID: string | null;
}

export interface PostAdmin {
  ID: string;
  Name: string;
  CreateById: string | null;
  CreateDate: string;
  IsVisible: boolean;
  LastModified: string;
  ModifiedById: string;
  OwnerID: string | null;
  OwnerName: string | null;
  ParentName: string | null;
  ParrentId: string | null;
  isAccessCreateProject: boolean;
  isHaveAddressbar: boolean;
  isStaticPost: boolean;
  nCompanyID: string | null;
  nCompanyName: string | null;
  nMenuID: string | null;
  nPostTypeID: string | null;
  nPostTypeName: string | null;
  nProjectID: string | null;
  nProjectName: string | null;
  status: number;
}

export interface ProgramType {
  ID?: number;
  Name: string;
  Describtion: string;
  IsVisible: boolean;
  LastModified?: string;
  ModifiedById?: string | null;
}

export interface OdpWithExtra {
  ID: number;
  Name: string;
  Address: string;
  EntityTypeName: string;
  IsVisible: boolean;
  LastModified: string | null;
  ModifiedById: string | null;
  ProgramTemplateIDName: string | null;
  WFTemplateName: string;
  nEntityTypeID: number | null;
  nProgramTemplateID: number | null;
  nWFTemplateID: number | null;
  ProjectsStr: string;
}

export interface EntityCollection {
  ID?: number;
  Name: string;
  Description?: string | null;
  Configuration?: string | null;
  IsGlobal: boolean;
  IsVisible: boolean;
  LastModified?: string | null;
  ModifiedById?: string | null;
  ProjectsStr?: string | null;
}

export interface Calendar {
  ID?: number;
  Name: string;
  SpecialDay: string;
  dateTimeRoutine: string;
  IsVisible: boolean;
  CreateDate?: string;
  UpdateDate?: string;
  CreatorId?: string;
}

export interface PostSmall {
  ID: string;
  IsStatic: boolean;
  Name: string;
  OwnerUserID: string;
  ParrentId: string | null;
  PostTypeID: string | null;
  ProjectID: string | null;
  isAccessCreateProject: boolean;
  isHaveAddressbar: boolean;
}

export interface AccessProject {
  ID?: string;
  AccessMode: number;
  AllowToDownloadGroup: boolean;
  AlowToAllTask: boolean;
  AlowToEditRequest: boolean;
  AlowToWordPrint: boolean;
  CreateAlert: boolean;
  CreateIssue: boolean;
  CreateKnowledge: boolean;
  CreateLetter: boolean;
  CreateMeeting: boolean;
  IsVisible: boolean;
  LastModified?: string;
  PostName: string | null;
  Show_Approval: boolean;
  Show_Assignment: boolean;
  Show_CheckList: boolean;
  Show_Comment: boolean;
  Show_Lessons: boolean;
  Show_Logs: boolean;
  Show_Procedure: boolean;
  Show_Related: boolean;
  nPostID: string;
  nProjectID: string;
}

export interface EntityType {
  ID: number;
  Name: string;
  Code: string;
  IsDoc: boolean;
  IsGlobal: boolean;
  IsMegaForm: boolean;
  IsVisible: boolean;
  LastModified?: string;
  ModifiedById?: string | null;
  ProjectsStr: string;
  TemplateDocID: string | null;
  TemplateExcelID: string | null;
  nEntityCateAID: number | null;
  nEntityCateBID: number | null;
}

export interface EntityTypeComplete extends EntityType {
  EntityCateADescription: string | null;
  EntityCateAName: string | null;
  EntityCateBDescription: string | null;
  EntityCateBName: string | null;
}

export interface CategoryItem {
  ID?: number;
  Name: string;
  Description: string;
  IsVisible: boolean;
  LastModified?: string;
  ModifiedById?: string;
}

export interface BoxTemplate {
  ID: number;
  Name: string;
  IsStage: boolean;
  ActionMode: number;
  PredecessorStr: string;
  Left: number;
  Top: number;
  ActDuration: number;
  MaxDuration: number;
  nWFTemplateID: number;
  DeemedEnabled: boolean;
  DeemDay: number;
  DeemCondition: number;
  DeemAction: number;
  PreviewsStateId: number | null;
  BtnIDs: string | null;
  ActionBtnID: number | null;
  MinNumberForReject: number;
  Order: number;
  GoToPreviousStateID: number | null;
  IsVisible: boolean;
  LastModified: string;
}

export interface WFAproval {
  nPostTypeID: number | null;
  nPostID: number;
  nWFBoxTemplateID: number;
  PCost: number;
  Weight: number;
  IsVeto: boolean;
  IsRequired: boolean;
  Code: number | null;
  ID: number;
  IsVisible: boolean;
  LastModified: string;
}

// src/services/api.services.ts

export interface EntityField {
  ID: number;
  DisplayName: string;
  IsShowGrid: boolean;
  IsEditableInWF: boolean;
  CountInReject: number | null;
  WFBOXName: string;
  nEntityTypeID: number;
  ColumnType: number;
  Code: string | null;
  Description: string;
  ShowInTab: string;
  metaType1: string | null;
  metaType2: string | null;
  metaType3: string | null;
  metaType4: string | null;
  metaType5: string | null;
  metaTypeJson: string | null;
  IsForceReadOnly: boolean;
  IsUnique: boolean;
  IsRequire: boolean;
  IsMainColumn: boolean;
  PrintCode: string;
  IsRTL: boolean;
  orderValue: number;
  ShowInAlert: boolean;
  CreatedTime: string;
  ModifiedTime: string;
  ModifiedById: string;
  LookupMode: string | null;
  IsRequireInWf: boolean;
  BoolMeta1: boolean;
  IsVisible: boolean;
  LastModified: string;
}

export interface EditProfileUserInterface {
  IsVisible: boolean;
  LastModified: string | null;
  ID: string;
  ModifiedById: null;
  Username: string;
  Password: string;
  Status: number;
  MaxWrongPass: number;
  Name: string;
  Family: string;
  Email: string;
  Website: string;
  Mobile: string;
  CreateDate: null;
  LastLoginTime: null;
  UserImageId: string;
  TTKK: string;
  userType: number;
  Code: string;
}

export interface ApprovalChecklist {
  ID: number;
  Name: string;
  IsRequired: boolean;
  IsVisible: boolean;
  LastModified: string;
  nQuestionSectionID: number | null;
  nQuestionTemplateID: number;
  OrderValue: number;
}

export enum PFIType {
  TPP = 1,
  FPP = 2,
  Form = 3,
  InFPP = 4,
  CPP = 5,
}

export interface ProgramTemplateField {
  // ساختار دقیق بر اساس داده شما:
  ID: number;
  Name?: string | null;
  GPIC?: string | null;
  ParrentIC?: string | null;
  Order: number;
  Code?: string | null;
  Weight1: number;
  Weight2: number;
  Weight3: number;
  WeightWF: number;
  WeightSubProg: number;
  PCostAct: number;
  PCostAprov: number;
  PCostSubAct: number;
  PCostSubAprov: number;
  nProgramTemplateID?: number | null;
  PredecessorForItemStr?: string | null;
  PredecessorForSubStr?: string | null;
  nPostTypeId?: string | null;
  nPostId?: string | null;
  Left: number;
  Top: number;
  DelayTime: number;
  ActDuration: number;
  WFDuration: number;
  nWFTemplateID?: number | null;
  nQuestionTemplateID?: number | null;
  nEntityCollectionID?: number | null;
  PFIType: PFIType;
  WorkData?: string | null;
  subProgramID?: number | null;
  nProgramTypeID?: number | null;
  SubProgramMetaDataColumn?: string | null;
  SubDuration: number;
  nEntityTypeID?: number | null;
  IsInheritMetaColumns?: boolean | null;
  IsInheritMetaValues?: boolean | null;
  IsVisible: boolean;
  LastModified: string | null;
}

export interface ProjectNode {
  ID: number;
  Name: string;
  // این فیلد دقیقاً همان subProgramID است که در JSON payload می‌آید:
  subProgramID: number;
  // هر فیلد دیگری که بخواهید اینجا اضافه کنید...
}

export interface AlertingWfTemplateItem {
  ID?: number;
  Duration: number;            // ← قبلاً string بود، حالا number
  SensitivityWFTemp: number;
  SensitiveItemWFTemp: number;
  WFState: number;
  IsVisible: boolean;
  Comment: string;
  SendType: number;
  nPostTypeID: number | null;
  nPostID: string;
  nWFBoxTemplateId: number;
  LastModified?: string;
  ModifiedById?: string;
}


// ساخت یک کلاس برای متدهای API
class ApiService {
  // ------------------------------------
  // متدهای عمومی (لاگین، OTP و ...)
  // ------------------------------------
  async webLogin(userData: WebLoginRequest): Promise<WebLoginResponse> {
    const response = await httpClient.post<WebLoginResponse>(
      apiConst.webLogin,
      userData
    );
    return response.data;
  }

  async logout(): Promise<void> {
    await httpClient.post(apiConst.webLogOut);
  }
  async postUser(): Promise<PostUserResponse> {
    const response = await httpClient.post<PostUserResponse>(apiConst.postUser);
    return response.data;
  }

  async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
    const response = await httpClient.post<SendOtpResponse>(
      apiConst.sendOtp,
      data
    );
    return response.data;
  }

  async loginWithOtp(data: LoginWithOtpRequest): Promise<LoginWithOtpResponse> {
    const response = await httpClient.post<LoginWithOtpResponse>(
      apiConst.loginWithOtp,
      data
    );
    return response.data;
  }

  async tokenSetup(): Promise<TokenSetupResponse> {
    const response = await httpClient.post<TokenSetupResponse>(
      apiConst.tokenSetup
    );
    return response.data;
  }

  // ------------------------------------
  // Configurations
  // ------------------------------------
  async getAllConfigurations(): Promise<ConfigurationItem[]> {
    const response = await httpClient.post<ConfigurationItem[]>(
      apiConst.getAllConfiguration
    );
    return response.data;
  }

  async insertConfiguration(
    data: ConfigurationItem
  ): Promise<ConfigurationItem> {
    const response = await httpClient.post<ConfigurationItem>(
      apiConst.insertConfiguration,
      data
    );
    return response.data;
  }

  async updateConfiguration(
    data: ConfigurationItem
  ): Promise<ConfigurationItem> {
    const response = await httpClient.post<ConfigurationItem>(
      apiConst.updateConfiguration,
      data
    );
    return response.data;
  }

  async deleteConfiguration(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteConfiguration, { ID: id });
  }

  // ------------------------------------
  // Ribbon/ProgramTemplate/WFTemplate/AFBtn
  // ------------------------------------
  async getAllProgramTemplates(): Promise<ProgramTemplateItem[]> {
    const response = await httpClient.post<ProgramTemplateItem[]>(
      apiConst.getAllProgramTemplate
    );
    return response.data;
  }

  async getAllDefaultRibbons(): Promise<DefaultRibbonItem[]> {
    const response = await httpClient.post<DefaultRibbonItem[]>(
      apiConst.getAllDefaultRibbons
    );
    return response.data;
  }

  async getAllWfTemplate(): Promise<WfTemplateItem[]> {
    const response = await httpClient.post<WfTemplateItem[]>(
      apiConst.getAllWfTemplate
    );
    return response.data;
  }

  // ---- AFBtn ----
  async getAllAfbtn(): Promise<AFBtnItem[]> {
    const response = await httpClient.post<AFBtnItem[]>(apiConst.getAllAfbtn);
    return response.data;
  }

  // سه متد جدید: Insert - Update - Delete
  async insertAFBtn(data: AFBtnItem): Promise<AFBtnItem> {
    const response = await httpClient.post<AFBtnItem>(
      apiConst.insertAFBtn,
      data
    );
    return response.data;
  }

  async updateAFBtn(data: AFBtnItem): Promise<AFBtnItem> {
    const response = await httpClient.post<AFBtnItem>(
      apiConst.updateAFBtn,
      data
    );
    return response.data;
  }

  async deleteAFBtn(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteAFBtn, { ID: id });
  }

  // دریافت ID کاربر
  async getIdByUserToken(): Promise<UserToken[]> {
    const response = await httpClient.post<UserToken[]>(
      apiConst.getIdByUserToken
    );
    return response.data;
  }

  async editProfileUser(
    data: EditProfileUserInterface
  ): Promise<EditProfileUserInterface> {
    const response = await httpClient.post<EditProfileUserInterface>(
      apiConst.editProfileUser,
      data
    );
    return response.data;
  }

  // ------------------------------------
  // Command
  // ------------------------------------
  async getAllCommands(): Promise<CommandItem[]> {
    const response = await httpClient.post<CommandItem[]>(apiConst.getCommand);
    return response.data;
  }

  async insertCommand(data: CommandItem): Promise<CommandItem> {
    const response = await httpClient.post<CommandItem>(
      apiConst.insertCommand,
      data
    );
    return response.data;
  }

  async updateCommand(data: CommandItem): Promise<CommandItem> {
    const response = await httpClient.post<CommandItem>(
      apiConst.updateCommand,
      data
    );
    return response.data;
  }

  async deleteCommand(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteCommand, { ID: id });
  }

  async getEnum(data: GetEnumRequest): Promise<GetEnumResponse> {
    const response = await httpClient.post<GetEnumResponse>(
      apiConst.getEnum,
      data
    );
    return response.data;
  }

  // -------------------
  // Menu APIs
  // -------------------

  /**
   * Fetch all menus.
   */
  async getAllMenu(): Promise<Menu[]> {
    const response = await httpClient.post<Menu[]>(apiConst.getAllMenu);
    return response.data;
  }

  /**
   * Insert a new Menu.
   * @param data - The Menu data to insert.
   */
  async insertMenu(data: Menu): Promise<Menu> {
    const response = await httpClient.post<Menu>(apiConst.insertMenu, data);
    return response.data;
  }

  /**
   * Update an existing Menu.
   * @param data - The Menu data to update.
   */
  async updateMenu(data: Menu): Promise<Menu> {
    const response = await httpClient.post<Menu>(apiConst.updateMenu, data);
    return response.data;
  }

  /**
   * Delete a Menu by ID.
   * @param id - The ID of the Menu to delete.
   */
  async deleteMenu(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteMenu, { ID: id });
  }

  async getAllMenuTab(menuId: number): Promise<MenuTab[]> {
    const response = await httpClient.post<MenuTab[]>(apiConst.getAllMenuTab, {
      ID: menuId, // مطمئن شوید که پارامتر ID در body ارسال می‌شود
    });
    return response.data;
  }

  // دریافت MenuGroups با ID
  async getAllMenuGroup(menuTabId: number): Promise<MenuGroup[]> {
    const response = await httpClient.post<MenuGroup[]>(
      apiConst.getAllMenuGroup,
      {
        ID: menuTabId, // مطمئن شوید که پارامتر ID در body ارسال می‌شود
      }
    );
    return response.data;
  }

  // دریافت MenuItems با ID
  async getAllMenuItem(menuGroupId: number): Promise<MenuItem[]> {
    const response = await httpClient.post<MenuItem[]>(
      apiConst.getAllMenuItem,
      {
        ID: menuGroupId, // مطمئن شوید که پارامتر id در body ارسال می‌شود
      }
    );
    return response.data;
  }
  async insertMenuTab(data: MenuTab): Promise<MenuTab> {
    const response = await httpClient.post<MenuTab>(
      apiConst.insertMenuTab,
      data
    );
    return response.data;
  }

  /**
   * Update an existing MenuTab.
   * @param data - The MenuTab data to update.
   */
  async updateMenuTab(data: MenuTab): Promise<MenuTab> {
    const response = await httpClient.post<MenuTab>(
      apiConst.updateMenuTab,
      data
    );
    return response.data;
  }

  /**
   * Delete a MenuTab by ID.
   * @param id - The ID of the MenuTab to delete.
   */
  async deleteMenuTab(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteMenuTab, { ID: id });
  }

  // -------------------
  // متدهای MenuGroup
  // -------------------

  /**
   * درج یک MenuGroup جدید.
   * @param data - داده‌های MenuGroup برای درج.
   */
  async insertMenuGroup(data: MenuGroup): Promise<MenuGroup> {
    const response = await httpClient.post<MenuGroup>(
      apiConst.insertMenuGroup,
      data
    );
    return response.data;
  }

  /**
   * به‌روزرسانی یک MenuGroup موجود.
   * @param data - داده‌های MenuGroup برای به‌روزرسانی.
   */
  async updateMenuGroup(data: MenuGroup): Promise<MenuGroup> {
    const response = await httpClient.post<MenuGroup>(
      apiConst.updateMenuGroup,
      data
    );
    return response.data;
  }

  /**
   * حذف یک MenuGroup بر اساس ID.
   * @param id - شناسه MenuGroup برای حذف.
   */
  async deleteMenuGroup(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteMenuGroup, { ID: id });
  }

  // -------------------
  // متدهای MenuItem
  // -------------------

  /**
   * درج یک MenuItem جدید.
   * @param data - داده‌های MenuItem برای درج.
   */
  async insertMenuItem(data: MenuItem): Promise<MenuItem> {
    const response = await httpClient.post<MenuItem>(
      apiConst.insertMenuItem,
      data
    );
    return response.data;
  }

  /**
   * به‌روزرسانی یک MenuItem موجود.
   * @param data - داده‌های MenuItem برای به‌روزرسانی.
   */
  async updateMenuItem(data: MenuItem): Promise<MenuItem> {
    const response = await httpClient.post<MenuItem>(
      apiConst.updateMenuItem,
      data
    );
    return response.data;
  }

  /**
   * حذف یک MenuItem بر اساس ID.
   * @param id - شناسه MenuItem برای حذف.
   */
  async deleteMenuItem(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteMenuItem, { ID: id });
  }

  // Add these methods to the ApiService class
  async getAllUsers(): Promise<User[]> {
    const response = await httpClient.post<User[]>(apiConst.getAllUser);
    return response.data;
  }

  async insertUser(data: User): Promise<User> {
    const response = await httpClient.post<User>(apiConst.insertUser, data);
    return response.data;
  }

  async updateUser(data: User): Promise<User> {
    const response = await httpClient.post<User>(apiConst.updateUser, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await httpClient.post(apiConst.deleteUser, { gid: id });
  }

  async changePasswordByAdmin(
    data: ChangePasswordByAdminRequest
  ): Promise<void> {
    await httpClient.post(apiConst.changePassword, data);
  }

  async getAllRoles(): Promise<Role[]> {
    const response = await httpClient.post<Role[]>(apiConst.getAllRoles);
    return response.data;
  }

  async getAllPostTypes(): Promise<PostType[]> {
    const response = await httpClient.post<PostType[]>(
      apiConst.getAllPostTypes
    );
    return response.data;
  }

  async insertRole(data: Role): Promise<Role> {
    const response = await httpClient.post<Role>(apiConst.insertRole, data);
    return response.data;
  }

  async updateRole(data: Role): Promise<Role> {
    const response = await httpClient.post<Role>(apiConst.updateRole, data);
    return response.data;
  }

  async deleteRole(id: string): Promise<void> {
    await httpClient.post(apiConst.deleteRole, { gid: id });
  }

  async getAllCompanies(): Promise<Company[]> {
    const response = await httpClient.post<Company[]>(apiConst.getAllCompany);
    return response.data;
  }

  /**
   * درج یک شرکت جدید.
   * @param data - داده‌های شرکت برای درج.
   */
  async insertCompany(data: Company): Promise<Company> {
    const response = await httpClient.post<Company>(
      apiConst.insertCompany,
      data
    );
    return response.data;
  }

  /**
   * به‌روزرسانی یک شرکت موجود.
   * @param data - داده‌های شرکت برای به‌روزرسانی.
   */
  async updateCompany(data: Company): Promise<Company> {
    const response = await httpClient.post<Company>(
      apiConst.updateCompany,
      data
    );
    return response.data;
  }

  /**
   * حذف یک شرکت بر اساس ID.
   * @param id - شناسه شرکت برای حذف.
   */
  async deleteCompany(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteCompany, { ID: id });
  }

  // Get all post categories
  async getAllPostCat(): Promise<PostCat[]> {
    const response = await httpClient.post<PostCat[]>(apiConst.getAllPostCat);
    return response.data;
  }

  // Insert new post category
  async insertPostCat(data: PostCat): Promise<PostCat> {
    const response = await httpClient.post<PostCat>(apiConst.addPostCat, data);
    return response.data;
  }

  // Update existing post category
  async updatePostCat(data: PostCat): Promise<PostCat> {
    const response = await httpClient.post<PostCat>(apiConst.editPostCat, data);
    return response.data;
  }

  // Delete post category
  async deletePostCat(id: number): Promise<void> {
    await httpClient.post(apiConst.deletePostCat, { ID: id });
  }

  async getAllProject(): Promise<Project[]> {
    const response = await httpClient.post<Project[]>(apiConst.getAllProject);
    return response.data;
  }

  async getAllProjectsWithCalendar(): Promise<ProjectWithCalendar[]> {
    const response = await httpClient.post<ProjectWithCalendar[]>(
      apiConst.getAllProjectsWithCalendar
    );
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await httpClient.post(apiConst.deleteProject, { ID: id });
  }

  async getAllForPostAdmin(): Promise<PostAdmin[]> {
    const response = await httpClient.post<PostAdmin[]>(
      apiConst.getAllForPostAdmin
    );
    return response.data;
  }

  async insertProgramTemplate(
    data: ProgramTemplateItem
  ): Promise<ProgramTemplateItem> {
    const response = await httpClient.post<ProgramTemplateItem>(
      apiConst.insertProgramTemplate,
      data
    );
    return response.data;
  }

  async updateProgramTemplate(
    data: ProgramTemplateItem
  ): Promise<ProgramTemplateItem> {
    const response = await httpClient.post<ProgramTemplateItem>(
      apiConst.updateProgramTemplate,
      data
    );
    return response.data;
  }

  async deleteProgramTemplate(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteProgramTemplate, { ID: id });
  }

  async getAllProgramType(): Promise<ProgramType[]> {
    const response = await httpClient.post<ProgramType[]>(
      apiConst.getAllProgramType
    );
    return response.data;
  }

  async insertProgramType(data: ProgramType): Promise<ProgramType> {
    const response = await httpClient.post<ProgramType>(
      apiConst.insertProgramType,
      data
    );
    return response.data;
  }

  async updateProgramType(data: ProgramType): Promise<ProgramType> {
    const response = await httpClient.post<ProgramType>(
      apiConst.updateProgramType,
      data
    );
    return response.data;
  }

  async deleteProgramType(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteProgramType, { ID: id });
  }

  async getAllOdpWithExtra(): Promise<OdpWithExtra[]> {
    const response = await httpClient.post<OdpWithExtra[]>(
      apiConst.getAllOdpWithExtra
    );
    return response.data;
  }

  async insertOdp(data: OdpWithExtra): Promise<OdpWithExtra> {
    const response = await httpClient.post<OdpWithExtra>(
      apiConst.insertOdp,
      data
    );
    return response.data;
  }

  async updateOdp(data: OdpWithExtra): Promise<OdpWithExtra> {
    const response = await httpClient.post<OdpWithExtra>(
      apiConst.updateOdp,
      data
    );
    return response.data;
  }

  async deleteOdp(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteOdp, { ID: id });
  }

  async getAllEntityCollection(): Promise<EntityCollection[]> {
    const response = await httpClient.post<EntityCollection[]>(
      apiConst.getAllEntityCollection
    );
    return response.data;
  }

  async insertEntityCollection(
    data: EntityCollection
  ): Promise<EntityCollection> {
    const response = await httpClient.post<EntityCollection>(
      apiConst.insertntityCollection,
      data
    );
    return response.data;
  }

  async updateEntityCollection(
    data: EntityCollection
  ): Promise<EntityCollection> {
    const response = await httpClient.post<EntityCollection>(
      apiConst.updatelEntityCollection,
      data
    );
    return response.data;
  }

  async deleteEntityCollection(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteEntityCollection, { ID: id });
  }

  async getAllCalendar(): Promise<Calendar[]> {
    const response = await httpClient.post<Calendar[]>(apiConst.getAllCalendar);
    return response.data;
  }

  async insertCalendar(data: Calendar): Promise<Calendar> {
    const response = await httpClient.post<Calendar>(
      apiConst.insertCalendar,
      data
    );
    return response.data;
  }

  async updateCalendar(data: Calendar): Promise<Calendar> {
    const response = await httpClient.post<Calendar>(
      apiConst.updateCalendar,
      data
    );
    return response.data;
  }

  async deleteCalendar(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteCalendar, { ID: id });
  }

  async getPostSmall(): Promise<PostSmall[]> {
    const response = await httpClient.post<PostSmall[]>(apiConst.getPostSmall);
    return response.data;
  }

  // بعد از تغییر
  async getPostsinProject(gid: string): Promise<AccessProject[]> {
    const response = await httpClient.post<AccessProject[]>(
      apiConst.getPostsinProjectServices,
      { gid } // فیلد مدنظر سرور
    );
    return response.data;
  }

  async insertAccessProject(data: AccessProject): Promise<AccessProject> {
    const response = await httpClient.post<AccessProject>(
      apiConst.insertAccessProject,
      data
    );
    return response.data;
  }

  async updateAccessProject(data: AccessProject): Promise<AccessProject> {
    const response = await httpClient.post<AccessProject>(
      apiConst.updateAccessProject,
      data
    );
    return response.data;
  }

  async deleteAccessProject(id: string): Promise<void> {
    await httpClient.post(apiConst.deleteAccessProject, { gid: id });
  }

  // In api.services.ts, add these methods to the ApiService class

  async addApprovalFlow(data: WfTemplateItem): Promise<WfTemplateItem> {
    const response = await httpClient.post<WfTemplateItem>(
      apiConst.addApprovalFlow,
      data
    );
    return response.data;
  }

  async deleteApprovalFlow(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteApprovalFlow, { ID: id });
  }

  async editApprovalFlow(data: WfTemplateItem): Promise<WfTemplateItem> {
    const response = await httpClient.post<WfTemplateItem>(
      apiConst.editApprovalFlow,
      data
    );
    return response.data;
  }

  async getAllEntityType(): Promise<EntityType[]> {
    const response = await httpClient.post<EntityType[]>(
      apiConst.getAllEntityType
    );
    return response.data;
  }

  async getEntityFieldByEntityTypeId(
    entityTypeId: number
  ): Promise<EntityField[]> {
    const response = await httpClient.post<EntityField[]>(
      apiConst.getEntityFieldByEntityTypeId,
      { ID: entityTypeId } // ارسال شناسه به صورت آبجکت در body
    );
    return response.data;
  }

  async insertEntityField(data: EntityField): Promise<EntityField> {
    console.log("📤 insertEntityField sent data:", data); // ✅ اینجا
    const response = await httpClient.post<EntityField>(
      apiConst.insertEntityField,
      data
    );
    return response.data;
  }

  async updateEntityField(data: EntityField): Promise<EntityField> {
    const response = await httpClient.post<EntityField>(
      apiConst.updateEntityField,
      data
    );
    return response.data;
  }

  async deleteEntityField(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteEntityField, { ID: id });
  }

  async getTableTransmittal(): Promise<EntityTypeComplete[]> {
    const response = await httpClient.post<EntityTypeComplete[]>(
      apiConst.getTableTransmittal
    );
    return response.data;
  }

  async insertEntityType(data: EntityType): Promise<EntityType> {
    const response = await httpClient.post<EntityType>(
      apiConst.insertEntityType,
      data
    );
    return response.data;
  }

  async updateEntityType(data: EntityType): Promise<EntityType> {
    const response = await httpClient.post<EntityType>(
      apiConst.updateEntityType,
      data
    );
    return response.data;
  }

  async deleteEntityType(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteEntityType, { ID: id });
  }

  async duplicateEntityType(id: number): Promise<EntityType> {
    const response = await httpClient.post<EntityType>(
      apiConst.duplicateEntityType,
      { ID: id }
    );
    return response.data;
  }

  async getAllCatA(): Promise<CategoryItem[]> {
    const response = await httpClient.post<CategoryItem[]>(apiConst.getAllCatA);
    return response.data;
  }

  async insertCatA(data: CategoryItem): Promise<CategoryItem> {
    const response = await httpClient.post<CategoryItem>(
      apiConst.insertCatA,
      data
    );
    return response.data;
  }

  async updateCatA(data: CategoryItem): Promise<CategoryItem> {
    const response = await httpClient.post<CategoryItem>(
      apiConst.editCatA,
      data
    );
    return response.data;
  }

  async deleteCatA(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteCatA, { ID: id });
  }

  // Category B methods
  async getAllCatB(): Promise<CategoryItem[]> {
    const response = await httpClient.post<CategoryItem[]>(apiConst.getAllCatB);
    return response.data;
  }

  async insertCatB(data: CategoryItem): Promise<CategoryItem> {
    const response = await httpClient.post<CategoryItem>(
      apiConst.insertCatB,
      data
    );
    return response.data;
  }

  async updateCatB(data: CategoryItem): Promise<CategoryItem> {
    const response = await httpClient.post<CategoryItem>(
      apiConst.editCatB,
      data
    );
    return response.data;
  }

  async deleteCatB(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteCatB, { ID: id });
  }

  async getAllBoxTemplatesByWfTemplateId(id: number): Promise<BoxTemplate[]> {
    const response = await httpClient.post<BoxTemplate[]>(
      apiConst.getAllBoxTemplatesByWfTemplateId,
      { ID: id }
    );
    return response.data;
  }

  // ************** سه متد جدید برای WFBoxTemplate **************
  async insertBoxTemplate(data: BoxTemplate): Promise<BoxTemplate> {
    const response = await httpClient.post<BoxTemplate>(
      apiConst.insertWFBoxTemplate,
      data
    );
    return response.data;
  }

  async updateBoxTemplate(data: BoxTemplate): Promise<BoxTemplate> {
    const response = await httpClient.post<BoxTemplate>(
      apiConst.updateWFBoxTemplate,
      data
    );
    return response.data;
  }

  async deleteBoxTemplate(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteWFBoxTemplate, { ID: id });
  }

  // در داخل کلاس ApiService اضافه کنید:
  async getApprovalContextData(id: number): Promise<WFAproval[]> {
    const response = await httpClient.post<WFAproval[]>(
      apiConst.getApprovalContextData, // مسیر آدرس API: "api/WFApprovTemplate/GetAllByTemplateBoxId"
      { ID: id }
    );
    return response.data;
  }

  async getApprovalCheckList(): Promise<ApprovalChecklist[]> {
    const response = await httpClient.post<ApprovalChecklist[]>(
      apiConst.getApprovalCheckList
    );
    return response.data;
  }

  async getProgramTemplateField(
    programTemplateId: number
  ): Promise<ProgramTemplateField[]> {
    const response = await httpClient.post<ProgramTemplateField[]>(
      apiConst.getProgramTemplateField,
      { ID: programTemplateId }
    );
    return response.data;
  }

  async insertProgramTemplateField(
    data: ProgramTemplateField
  ): Promise<ProgramTemplateField> {
    const response = await httpClient.post<ProgramTemplateField>(
      apiConst.insertProgramTemplateField,
      data
    );
    return response.data;
  }

  async updateProgramTemplateField(
    data: ProgramTemplateField
  ): Promise<ProgramTemplateField> {
    const response = await httpClient.post<ProgramTemplateField>(
      apiConst.editProgramTemplateField,
      data
    );
    return response.data;
  }

  async deleteProgramTemplateField(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteProgramTemplateField, { ID: id });
  }

  async getEntityFieldById(id: number): Promise<EntityField> {
    const response = await httpClient.post<EntityField>(
      apiConst.getEntityFieldById, // ✅ استفاده از constant
      { ID: id }
    );
    return response.data;
  }

  async getPrjRoot(gid: number): Promise<ProjectNode[]> {
    const res = await httpClient.post<any[]>(apiConst.getPrjRoot, { gid });
    return res.data.map(d => ({
      ID: d.ID,
      Name: d.Name,
      // فرض می‌کنیم سرور این فیلد را دقیقاً با همین نام می‌فرستد:
      subProgramID: d.subProgramID,
    }));
  }

  /**
   * لود کودکان هر گره
   * POST /api/ProgramField/GetAllByPrgId
   * body: { subProgramID }
   */
  async getPrjChildren(id: number): Promise<ProjectNode[]> {
    const res = await httpClient.post<any[]>(
      apiConst.getPrjChildren,
      { id }
    );
    return res.data.map(d => ({
      ID: d.ID,
      Name: d.Name,
      // سرور در payload لول‌های بعدی هم subProgramID می‌فرستد:
      subProgramID: d.subProgramID,
    }));
  }

  // -------------------------------
  // AlertingWfTemplate APIs
  // -------------------------------
  async getAllAlertingWfTemplate(): Promise<AlertingWfTemplateItem[]> {
    const response = await httpClient.post<AlertingWfTemplateItem[]>(
      apiConst.getAllAlertingWfTemplate
    );
    return response.data;
  }

  async insertAlertingWfTemplate(
    data: AlertingWfTemplateItem
  ): Promise<AlertingWfTemplateItem> {
    const response = await httpClient.post<AlertingWfTemplateItem>(
      apiConst.insertAlertingWfTemplate,
      data
    );
    return response.data;
  }

  async updateAlertingWfTemplate(
    data: AlertingWfTemplateItem
  ): Promise<AlertingWfTemplateItem> {
    const response = await httpClient.post<AlertingWfTemplateItem>(
      apiConst.updateAlertingWfTemplate,
      data
    );
    return response.data;
  }

  async deleteAlertingWfTemplate(id: number): Promise<void> {
    await httpClient.post(apiConst.deleteAlertingWfTemplate, { ID: id });
  }

  async getAllAlertingWfTemplateByWFBoxTemplateId(
    wfBoxTemplateId: number
  ): Promise<AlertingWfTemplateItem[]> {
    const response = await httpClient.post<AlertingWfTemplateItem[]>(
      apiConst.getAllAlertingWfTemplateByWFBoxTemplateId,
      { ID: wfBoxTemplateId }
    );
    return response.data;
  }



}

// یک خروجی برای استفاده در Context
const AppServices = new ApiService();
export default AppServices;
