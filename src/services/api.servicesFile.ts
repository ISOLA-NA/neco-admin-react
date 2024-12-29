// api.servicesFile.ts
import { apiConst } from "./api.constant";
import httpClient from "./api.config";
import httpClientFile from "./api.configFile";
import { AxiosResponse } from "axios";

class FileService {
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
