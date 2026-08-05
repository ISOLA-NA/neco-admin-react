// src/services/programDesigner/services.ts

import httpClient from "../api.config";
import * as pako from "pako";
import {
  SinglePFI,
  UpdateProgramFieldPayload,
  ProgramDesignerRow,
  ProgramValidationResult,
  ImportExcelTemplatePayload,
  ImportExcelTemplateResponse,
  ExcelTemplateFileInfo,
  FileInsertPayload,
  FileInsertResponse,
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

/**
 * جایگزین امن برای crypto.randomUUID() — چون آن متد فقط توی Secure Context
 * (HTTPS یا localhost) کار می‌کند و روی سرورهای HTTP خطای
 * "crypto.randomUUID is not a function" می‌دهد. crypto.getRandomValues()
 * برخلاف randomUUID نیازی به Secure Context ندارد و همه‌جا کار می‌کند.
 */
function generateUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof (crypto as any).randomUUID === "function"
  ) {
    try {
      return (crypto as any).randomUUID();
    } catch {
      // ادامه به fallback زیر
    }
  }

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
      .slice(6, 8)
      .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
  }

  // fallback خیلی نادر (مرورگرهای بسیار قدیمی که هیچ‌کدام از موارد بالا را ندارند)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
      { id, tf: true }
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

  /**
   * حذف یک ردیف
   * ✅ طبق درخواست کارفرما: چون این API با ProgramDesigner شروع می‌شود و
   * ورودی‌اش شبیه IDDTO است، tf: true هم فرستاده می‌شود.
   */
  async deleteOneProgramFieldTemplate(id: number): Promise<boolean> {
    const response = await httpClient.post<boolean>(
      "api/ProgramDesigner/DeleteOneProgramFieldTemplate",
      { id, tf: true }
    );
    return response.data;
  }

  /**
   * آیا موتور در حال پردازش این تمپلیت است؟ (قفل بودن)
   * ✅ بادی کامل با امضای مشترک این بخش (تا 400 Bad Request نگیریم).
   */
  async checkIsWaitingForEngine(programTemplateId: number): Promise<boolean> {
    const response = await httpClient.post<string>(
      "api/ProgramDesigner/CheckIsWaitingForEngine",
      {
        db: null,
        dt: null,
        dt2: null,
        gid: null,
        id: programTemplateId,
        id2: null,
        id3: null,
        lid: null,
        str: null,
        str2: null,
        tf: true,
      }
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
      {
        db: null,
        dt: null,
        dt2: null,
        gid: null,
        id: programTemplateId,
        id2: null,
        id3: null,
        lid: null,
        str: null,
        str2: null,
        tf: true,
      }
    );
    return response.data;
  }

  /**
   * گرفتن فایل اکسل تولید‌شده برای Export
   * ✅ طبق درخواست کارفرما: tf: true اضافه شد.
   */
  async getExcelTemplate(
    programTemplateId: number
  ): Promise<ExcelTemplateFileInfo> {
    const response = await httpClient.post<ExcelTemplateFileInfo>(
      "api/ProgramDesigner/GetExcelTemplate",
      { id: programTemplateId, tf: true }
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

  /**
   * آپلود فایل خام (سرور فایل جدا) - مرحله‌ی اول Import
   * ✅ تأیید‌شده با فیدلر: بادی باید دقیقاً سه فیلد multipart داشته باشد:
   * FileName (یک GUID تصادفی + پسوند اصلی فایل)، FolderName (ثابت: "prgdes")،
   * و Data (خودِ فایل باینری). اسم فیلد فایل "Data" است، نه "file".
   */
  async uploadFile(file: File): Promise<{ fileIQ: string; raw: any }> {
    const extension = file.name.substring(file.name.lastIndexOf("."));
    const fileIQ = generateUUID();
    const generatedFileName = `${fileIQ}${extension}`;

    const formData = new FormData();
    formData.append("FileName", generatedFileName);
    formData.append("FolderName", "prgdes");
    formData.append("Data", file, file.name);

    const response = await httpClient.post(
      `${FILE_SERVER_URL}/api/File/Upload`,
      formData,
      { headers: { "Content-Type": undefined } }
    );
    return { fileIQ, raw: response.data };
  }

  /**
   * ثبت متادیتای فایل - مرحله‌ی دوم Import
   * ✅ بادی و پاسخ تأیید‌شده با فیدلر.
   */
  async insertFileRecord(
    fileMeta: FileInsertPayload
  ): Promise<FileInsertResponse> {
    const response = await httpClient.post<FileInsertResponse>(
      "api/File/Insert",
      fileMeta
    );
    return response.data;
  }

  /**
   * اجرای Import - مرحله‌ی سوم
   * ⚠️ اصلاح حیاتی: این endpoint همیشه با کد HTTP 200 پاسخ می‌دهد، حتی
   * وقتی واقعاً شکست خورده باشد (Validation های InFPP مثل
   * "Total Weight is Above"). قبلاً این متد فقط void برمی‌گرداند و
   * Response واقعی (isHaveError/isSuccess/Msg) اصلاً خوانده نمی‌شد، پس
   * شکست‌های واقعی به‌اشتباه موفق تلقی می‌شدند. الان کل Response برگردانده
   * می‌شود تا صدازننده (ProgramTemplate.tsx) بتواند isSuccess را چک کند.
   */
  async importExcelTemplate(
    payload: ImportExcelTemplatePayload
  ): Promise<ImportExcelTemplateResponse> {
    const response = await httpClient.post<ImportExcelTemplateResponse>(
      "api/ProgramDesigner/ImportExcelTemplate",
      payload
    );
    return response.data;
  }
}

const ProgramDesignerServices = new ProgramDesignerService();
export default ProgramDesignerServices;