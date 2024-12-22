// src/services/api.services.ts
import httpClient from './api.config';
import { apiConst } from './api.constant';

// رابط (interface) مربوط به پاسخ لاگین
export interface AppSetting {
  ID: number;
  Name: string;
  LetterBtns: string;
  // ... هر فیلد دیگر که در شیء AppSetting دیدید
}

export interface MyUser {
  ID: string;           // یا number اگر مطمئن هستید
  TTKK: string;
  Username: string;
  Name: string;
  Email: string;
  // ... سایر فیلدها (Mobile, Password, Website, etc.)
  userType?: number;    // اگر واقعاً در پاسخ وجود دارد (در تصویر userType ندیدیم)
}

export interface WebLoginResponse {
  data: { MyUser: any; tokenLife: any; };
  AppSetting: AppSetting;
  MyUser: MyUser;
  // ... اگر فیلدهای دیگری مثل Status, Message یا UserPosts در ریشه دارید، اضافه کنید
}

// اگر OTP و سایر APIها ساختار متفاوت دارند، مشابه همین تعریف کنید
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
}

const AppServices = new ApiService();
export default AppServices;
