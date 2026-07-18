// src/services/programDesigner/services.ts

import httpClient from "../api.config";
import * as pako from "pako";
import {
  SinglePFI,
  UpdateProgramFieldPayload,
  ProgramDesignerRow,
  ProgramValidationResult,
  ImportExcelTemplatePayload,
  ExcelTemplateFileInfo,
} from "./types";

const FILE_SERVER_URL = import.meta.env.VITE_URL_FILE;

// ================== کمک‌تابع decode خروجی GCMDZip ==================

function decodeGCMDZip<T = any>(base64Zipped: string): {
  CmdDTO: any;
  DataTable: T[];
  allcount: number;
  ErrorMsg: string | null;
} {
  const binary = atob(base64Zipped);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decompressedBytes = pako.ungzip(bytes);
  const decompressedText = new TextDecoder("utf-8").decode(decompressedBytes);
  return JSON.parse(decompressedText);
}

// ================== کلاس سرویس ==================

class ProgramDesignerService {
  /** گرفتن لایه‌ی ریشه (بار اول باز شدن صفحه) */
  async getRootRows(programTemplateId: number): Promise<ProgramDesignerRow[]> {
    const response = await httpClient.post<string>("api/Command/GCMDZip", {
      Cmd: "AdminProgramDesigner",
      PaginDTO: {
        CountPerPage: 100,
        Filters: null,
        Groups: null,
        isAsending: false,
        Page: 1,
        Search: null,
        SortData: null,
      },
      ProjectIds: null,
      ProjectName: null,
      QParam: `ProgramTemplateID =${programTemplateId}`,
      QParam2: null,
      TableName: null,
    });
    const result = decodeGCMDZip<ProgramDesignerRow>(response.data);
    return result.DataTable;
  }

  /** گرفتن فرزندهای یک ردیف InFPP (lazy load روی expand) */
  async getChildRows(parentGPIC: string): Promise<ProgramDesignerRow[]> {
    const response = await httpClient.post<string>("api/Command/GCMDZip", {
      Cmd: "AdminProgramDesigner",
      PaginDTO: null,
      ProjectIds: null,
      ProjectName: null,
      QParam: `GPIC ='${parentGPIC}'`,
      QParam2: null,
      TableName: null,
    });
    const result = decodeGCMDZip<ProgramDesignerRow>(response.data);
    return result.DataTable;
  }

  /** جزئیات کامل یک ردیف برای باز کردن مودال Edit */
  async getSinglePFI(id: number): Promise<SinglePFI> {
    const response = await httpClient.post<SinglePFI>(
      "api/ProgramDesigner/GetSinglePFI",
      { id }
    );
    return response.data;
  }

  /** افزودن ردیف (چه ریشه چه فرزند InFPP) */
  async addOneProgramFieldTemplate(
    payload: UpdateProgramFieldPayload
  ): Promise<SinglePFI> {
    const response = await httpClient.post<SinglePFI>(
      "api/ProgramDesigner/AddOneProgramFieldTemplate",
      payload
    );
    return response.data;
  }

  /** ویرایش ردیف موجود */
  async updateOneProgramFieldTemplate(
    payload: UpdateProgramFieldPayload
  ): Promise<any> {
    const response = await httpClient.post(
      "api/ProgramDesigner/UpdateOneProgramFieldTemplate",
      payload
    );
    return response.data;
  }

  /** حذف یک ردیف */
  async deleteOneProgramFieldTemplate(id: number): Promise<boolean> {
    const response = await httpClient.post<boolean>(
      "api/ProgramDesigner/DeleteOneProgramFieldTemplate",
      { id }
    );
    return response.data;
  }

  /** آیا موتور در حال پردازش این تمپلیت است؟ (قفل بودن) */
  async checkIsWaitingForEngine(programTemplateId: number): Promise<boolean> {
    const response = await httpClient.post<string>(
      "api/ProgramDesigner/CheckIsWaitingForEngine",
      { id: programTemplateId }
    );
    const lines = response.data.toString().split("\n");
    return lines[1]?.trim() === "true";
  }

  /** بررسی سلامت (Health Check) */
  async checkValidation(
    programTemplateId: number
  ): Promise<ProgramValidationResult> {
    const response = await httpClient.post<ProgramValidationResult>(
      "api/ProgramDesigner/CheckValidation",
      { id: programTemplateId, tf: true }
    );
    return response.data;
  }

  /** گرفتن فایل اکسل تولید‌شده برای Export */
  async getExcelTemplate(
    programTemplateId: number
  ): Promise<ExcelTemplateFileInfo> {
    const response = await httpClient.post<ExcelTemplateFileInfo>(
      "api/ProgramDesigner/GetExcelTemplate",
      { id: programTemplateId }
    );
    return response.data;
  }

  /** دانلود خودِ فایل (سرور فایل جدا) */
  async downloadFile(fileName: string, folderName: string): Promise<Blob> {
    const response = await httpClient.post(
      `${FILE_SERVER_URL}/api/File/Download`,
      { FileName: fileName, FolderName: folderName },
      { responseType: "blob" }
    );
    return response.data;
  }

  /** آپلود فایل خام (سرور فایل جدا) - مرحله‌ی اول Import */
  async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await httpClient.post(
      `${FILE_SERVER_URL}/api/File/Upload`,
      formData,
      { headers: { "Content-Type": undefined } }
    );
    return response.data;
  }

  /** ثبت متادیتای فایل - مرحله‌ی دوم Import */
  async insertFileRecord(fileMeta: any): Promise<any> {
    const response = await httpClient.post("api/File/Insert", fileMeta);
    return response.data;
  }

  /** اجرای Import - مرحله‌ی سوم */
  async importExcelTemplate(
    payload: ImportExcelTemplatePayload
  ): Promise<void> {
    await httpClient.post("api/ProgramDesigner/ImportExcelTemplate", payload);
  }
}

const ProgramDesignerServices = new ProgramDesignerService();
export default ProgramDesignerServices;