// api.servicesFile.ts

import { apiConst } from "./api.constant";
import httpClient from "./api.config";
import httpClientFile from "./api.configFile";
import { AxiosResponse } from "axios";

class FileService {
  postUser() {
      throw new Error('Method not implemented.');
  }
  editProfileUser(updated: { 
    IsVisible: boolean; 
    LastModified: Date | null; 
    ID: string; 
    ModifiedById: string; 
    Username: string; 
    Password: string; 
    Status: number; 
    MaxWrongPass: number; 
    Name: string; 
    Family: string; 
    Email: string; 
    Website: string; 
    Mobile: string; 
    CreateDate: string; 
    LastLoginTime: string; 
    UserImageId: string; 
    TTKK: string; 
    userType: number; 
    Code: string; 
  }): Promise<AxiosResponse<any>> {
      // پیاده‌سازی متد مورد نظر
      throw new Error("Method not implemented.");
  }

  // پیاده‌سازی متد getIdByUserToken که خروجی مناسبی برمی‌گرداند:
  async getIdByUserToken(): Promise<AxiosResponse<any>> {
      // در اینجا فرض می‌کنیم که URL مربوط به دریافت توکن کاربر در apiConst.getIdByUserToken قرار دارد.
      // اگر از متد GET استفاده می‌کنید:
      return await httpClient.post(apiConst.getIdByUserToken);
      // در صورتی که API شما از POST استفاده می‌کند، ممکن است به شکل زیر باشد:
      // return await httpClient.post(apiConst.getIdByUserToken, {});
  }

  /**
   * آپلود فایل
   * @param file FormData شامل فایل
   */
  async uploadFile(file: FormData): Promise<AxiosResponse<any>> {
    return await httpClientFile.post(apiConst.uploadFile, file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * درج اطلاعات فایل در دیتابیس
   */
  async insert(model: any): Promise<AxiosResponse<any>> {
    return await httpClient.post(apiConst.insert, model);
  }

  /**
   * گرفتن اطلاعات یک فایل (مثل مسیر یا نوع فایل) 
   */
  async getFile(gid: string): Promise<AxiosResponse<any>> {
    return await httpClient.post(apiConst.getFile, { gid });
  }

  /**
   * دانلود فایل به صورت باینری
   */
  async download(model: any): Promise<AxiosResponse<ArrayBuffer>> {
    return await httpClientFile.post(apiConst.download, model, {
      responseType: "arraybuffer",
    });
  }
}

export default new FileService();
