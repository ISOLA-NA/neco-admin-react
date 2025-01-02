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
  ID: number;
  Name: string;
}

// ================== EntityType ==================
export interface EntityTypeItem {
  ID: number;
  Name: string;
  Category: string;
}

export interface WfTemplateItem {
  ID: number;
  Name: string;
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
  ID: number;
  ModifiedById: string;
  Name: string;
  Description: string;
  IsVisible: boolean;
  LastModified: string;
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
}

// Interface for MenuGroup
export interface MenuGroup {
  ID: number;
  ModifiedById: string;
  IconImageId: string | null;
  Name: string;
  Order: number;
  Description: string;
  nMenuTabId: number;
  IsVisible: boolean;
  LastModified: string;
}

// Interface for MenuItem
export interface MenuItem {
  ID: number;
  ModifiedById: string;
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
  LastModified: string;
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

  async getTableTransmittal(): Promise<EntityTypeItem[]> {
    const response = await httpClient.post<EntityTypeItem[]>(
      apiConst.getTableTransmittal
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
   * Fetch all menu tabs for a given menu ID.
   * @param menuId - The ID of the menu.
   */
  async getAllMenuTab(menuId: number): Promise<MenuTab[]> {
    const response = await httpClient.post<MenuTab[]>(
      `${apiConst.getAllMenuTab}?nMenuId=${menuId}`
    );
    return response.data;
  }

  /**
   * Fetch all menu groups for a given menu tab ID.
   * @param menuTabId - The ID of the menu tab.
   */
  async getAllMenuGroup(menuTabId: number): Promise<MenuGroup[]> {
    const response = await httpClient.post<MenuGroup[]>(
      `${apiConst.getAllMenuGroup}?nMenuTabId=${menuTabId}`
    );
    return response.data;
  }

  /**
   * Fetch all menu items for a given menu group ID.
   * @param menuGroupId - The ID of the menu group.
   */
  async getAllMenuItem(menuGroupId: number): Promise<MenuItem[]> {
    const response = await httpClient.post<MenuItem[]>(
      `${apiConst.getAllMenuItem}?nMenuGroupId=${menuGroupId}`
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
}

// یک خروجی برای استفاده در Context
const AppServices = new ApiService();
export default AppServices;
