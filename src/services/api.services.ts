// src/services/api.services.ts
import httpClient from './api.config';
import { apiConst } from './api.constant';

// تعریف اینترفیس‌ها
export interface AppSetting {
  ID: number;
  Name: string;
  LetterBtns: string;
  // ... سایر فیلدها
}

export interface Configuration {
  ID: number;
  Name: string;
  FirstIDProgramTemplate: number;
  SelMenuIDForMain: number;
  Description: string;
  IsVisible: boolean;
  LastModified: string;
  DefaultBtn: string;
  LetterBtns: string;
  MeetingBtns: string;
  EntityTypeIDForLessonLearn: number;
  SelMenuIDForLessonLearnAfTemplate: number;
  EntityTypeIDForTaskComment: number;
  EntityTypeIDForProcedure: number;
  // ... سایر فیلدها
}

export interface ProgramType {
  ID: number;
  Name: string;
  // ... سایر فیلدها خاص به ProgramType
}

export interface MyUser {
  ID: string; // یا number اگر مطمئن هستید
  TTKK: string;
  Username: string;
  Name: string;
  Email: string;
  // ... سایر فیلدها
  userType?: number;
}

export interface WebLoginResponse {
  data: { MyUser: any; tokenLife: any; };
  AppSetting: AppSetting;
  MyUser: MyUser;
  // ... سایر فیلدها
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

class ApiService {
  async webLogin(userData: WebLoginRequest): Promise<WebLoginResponse> {
    const response = await httpClient.post<WebLoginResponse>(apiConst.webLogin, userData);
    return response.data;
  }

  async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
    const response = await httpClient.post<SendOtpResponse>(apiConst.sendOtp, data);
    return response.data;
  }

  async loginWithOtp(data: LoginWithOtpRequest): Promise<LoginWithOtpResponse> {
    const response = await httpClient.post<LoginWithOtpResponse>(apiConst.loginWithOtp, data);
    return response.data;
  }

  async tokenSetup(): Promise<TokenSetupResponse> {
    const response = await httpClient.post<TokenSetupResponse>(apiConst.tokenSetup);
    return response.data;
  }

  // متد دریافت تنظیمات
  async getAllConfiguration(): Promise<Configuration[]> {
    const response = await httpClient.post<Configuration[]>(apiConst.getAllConfiguration);
    return response.data;
  }

  // متد دریافت انواع برنامه‌ها
  async getAllProgramType(): Promise<ProgramType[]> {
    const response = await httpClient.post<ProgramType[]>(apiConst.getAllProgramType);
    return response.data;
  }

  // سایر متدهای API
}

const AppServices = new ApiService();
export default AppServices;
