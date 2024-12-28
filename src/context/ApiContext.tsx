// src/context/ApiContext.tsx

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
  WfTemplateItem,
  AFBtnItem,
} from "../services/api.services";

// تعریف نوع برای context
interface ApiContextType {
  webLogin: (data: WebLoginRequest) => Promise<WebLoginResponse>;
  sendOtp: (data: SendOtpRequest) => Promise<SendOtpResponse>;
  loginWithOtp: (data: LoginWithOtpRequest) => Promise<LoginWithOtpResponse>;
  tokenSetup: () => Promise<TokenSetupResponse>;
  getAllConfigurations: () => Promise<ConfigurationItem[]>;
  getAllProgramTemplates: () => Promise<ProgramTemplateItem[]>;
  getAllDefaultRibbons: () => Promise<DefaultRibbonItem[]>;
  getTableTransmittal: () => Promise<EntityTypeItem[]>;
  getAllWfTemplate: () => Promise<WfTemplateItem[]>;
  getAllAfbtn: () => Promise<AFBtnItem[]>;
  insertConfiguration: (data: ConfigurationItem) => Promise<ConfigurationItem>;
  updateConfiguration: (data: ConfigurationItem) => Promise<ConfigurationItem>;
  // اضافه کردن متدهای دیگر در صورت نیاز
}

// ایجاد context
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// ایجاد Provider
export const APIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const api = {
    webLogin: AppServices.webLogin.bind(AppServices),
    sendOtp: AppServices.sendOtp.bind(AppServices),
    loginWithOtp: AppServices.loginWithOtp.bind(AppServices),
    tokenSetup: AppServices.tokenSetup.bind(AppServices),
    getAllConfigurations: AppServices.getAllConfigurations.bind(AppServices),
    getAllProgramTemplates:
      AppServices.getAllProgramTemplates.bind(AppServices),
    getAllDefaultRibbons: AppServices.getAllDefaultRibbons.bind(AppServices),
    getTableTransmittal: AppServices.getTableTransmittal.bind(AppServices),
    getAllWfTemplate: AppServices.getAllWfTemplate.bind(AppServices),
    getAllAfbtn: AppServices.getAllAfbtn.bind(AppServices),
    insertConfiguration: AppServices.insertConfiguration.bind(AppServices),
    updateConfiguration: AppServices.updateConfiguration.bind(AppServices), // Added method


    // اضافه کردن متدهای دیگر در صورت نیاز
  };

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

// ایجاد هوک برای استفاده از context
export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi باید داخل یک APIProvider استفاده شود");
  }
  return context;
};

// صادر کردن نوع‌ها برای استفاده در کامپوننت‌ها
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
};
