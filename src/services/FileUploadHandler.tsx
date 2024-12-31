// src/services/FileUploadHandler.tsx

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import fileService from "./api.servicesFile"; // لطفاً مسیر را بررسی کنید
import apiService from "./api.services";      // لطفاً مسیر را بررسی کنید
import ImageUploader from "../components/utilities/ImageUploader";

// تعریف و صادرات InsertModel
export interface InsertModel {
  ID?: string;       // UUID مجزا برای رکورد
  FileIQ?: string;   // UUID مجزا برای فایل
  FileName: string;
  FileSize: number;
  FolderName: string;
  IsVisible: boolean;
  LastModified: Date | null;
  SenderID: string | null;
  FileType: string | null;
}

interface FileUploadHandlerProps {
  selectedFileId: string | null; // شناسه فایل برای دانلود (ID رکورد)
  onUploadSuccess?: (insertModel: InsertModel) => void; // کال‌بک پس از آپلود موفقیت‌آمیز
  resetCounter: number; // برای ریست کردن پیش‌نمایش
  onReset: () => void;  // تابع ریست که از خارج ارسال می‌شود
}

const FileUploadHandler: React.FC<FileUploadHandlerProps> = ({
  selectedFileId,
  onUploadSuccess,
  resetCounter,
  onReset,
}) => {
  const [uploadedFileInfo, setUploadedFileInfo] = useState<InsertModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // پیش‌نمایش مربوط به فایلی که به‌تازگی آپلود شده
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  // پیش‌نمایش مربوط به فایلی که از سرور دانلود می‌کنیم
  const [downloadedPreviewUrl, setDownloadedPreviewUrl] = useState<string | null>(null);

  // این state نشان می‌دهد که فایل جدیداً آپلود شده یا خیر
  const [justUploaded, setJustUploaded] = useState<boolean>(false);

  // دریافت شناسه کاربر
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await apiService.getIdByUserToken();
        if (res && res.length > 0) {
          setUserId(res[0].ID.toString());
          console.log("شناسه کاربر دریافت شد:", res[0].ID.toString());
        }
      } catch (err: any) {
        console.error("خطا در دریافت شناسه کاربر:", err);
        setErrorMessage("خطا در دریافت اطلاعات کاربر.");
      }
    };
    fetchUserId();
  }, []);

  // تغییر selectedFileId
  useEffect(() => {
    const downloadFile = async () => {
      if (!selectedFileId) {
        // اگر شناسه خالی باشد، چیزی برای دانلود نداریم
        setDownloadedPreviewUrl(null);
        return;
      }

      // اگر فایل جدیداً آپلود شده باشد، لازم نیست دوباره دانلود کنیم.
      // چون preview لوکال را داریم.
      if (justUploaded) {
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      setUploadedPreviewUrl(null); // پاک کردن پیش‌نمایش آپلودی قبلی

      try {
        // با selectedFileId فایل را از سرور می‌گیریم
        const res = await fileService.getFile(selectedFileId);

        if (!res.data) {
          setErrorMessage("فایل مورد نظر یافت نشد.");
          setDownloadedPreviewUrl(null);
          return;
        }

        // در پاسخ سرور، فرض بر این است که FileIQ، FileType و FolderName موجود است
        const { FileIQ, FileType, FolderName } = res.data;
        const obj = {
          FileName: `${FileIQ}${FileType}`,
          FolderName: FolderName,
        };

        const downloadResponse = await fileService.download(obj);

        // تبدیل آرایه بایت به Blob
        const blob = new Blob([downloadResponse.data], {
          type: "application/octet-stream",
        });

        // ساخت DataURL از Blob
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setDownloadedPreviewUrl(result);
        };
        reader.readAsDataURL(blob);
      } catch (err: any) {
        console.error("خطا در دانلود فایل:", err);
        setErrorMessage("خطا در دانلود فایل.");
        setUploadedPreviewUrl(null);
        setDownloadedPreviewUrl(null);
        onReset();
      } finally {
        setIsLoading(false);
      }
    };

    downloadFile();
  }, [selectedFileId, onReset, justUploaded]);

  // ریست کردن پیش‌نمایش با افزایش resetCounter
  useEffect(() => {
    if (resetCounter > 0) {
      setDownloadedPreviewUrl(null);
      setUploadedPreviewUrl(null);
      // همچنین اگر reset فراخوانی شود، یعنی دیگر فایل جدید آپلودشده نداریم
      setJustUploaded(false);
      console.log("پیش‌نمایش ریست شد به دلیل تغییر در resetCounter:", resetCounter);
    }
  }, [resetCounter]);

  // تابع فرمت تاریخ (استفاده می‌شود برای ساخت نام فولدر بر اساس تاریخ روز)
  const dateFormat = (inputDate: Date, format: string): string => {
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    let formatted = format.replace("MM", month.toString().padStart(2, "0"));

    if (formatted.includes("yyyy")) {
      formatted = formatted.replace("yyyy", year.toString());
    } else if (formatted.includes("yy")) {
      formatted = formatted.replace("yy", year.toString().substr(2, 2));
    }

    formatted = formatted.replace("dd", day.toString().padStart(2, "0"));
    return formatted;
  };

  // آپلود فایل
  const handleFileUpload = async (file: File) => {
    console.log("در حال آپلود فایل:", file.name);
    setIsLoading(true);
    setErrorMessage(null);
    setUploadedPreviewUrl(null);

    try {
      // اعتبارسنجی پسوند
      const allowedExtensions = ["jpg", "jpeg", "png"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setErrorMessage("لطفاً فقط فایل‌های با پسوند jpg، jpeg یا png را انتخاب کنید.");
        setIsLoading(false);
        return;
      }

      // تولید دو UUID مجزا برای ID و FileIQ
      const ID = uuidv4();
      const FileIQ = uuidv4();

      // نام پوشه بر اساس تاریخ
      const folderName = dateFormat(new Date(), "yy-MM-dd");
      // نام کامل فایل (مثلاً 0364bfee-1eb2-48d7-bd68-1281d81a33a7.jpg)
      const generatedFileName = `${FileIQ}.${fileExtension}`;

      // آماده‌سازی FormData
      const formData = new FormData();
      formData.append("FileName", generatedFileName);
      formData.append("FolderName", folderName);
      formData.append("file", file);

      // آپلود فایل به سرور
      const uploadResponse = await fileService.uploadFile(formData);
      console.log("پاسخ آپلود:", uploadResponse);

      if (uploadResponse && uploadResponse.status) {
        const { FileSize, FileType } = uploadResponse.data;

        // ایجاد InsertModel با دو UUID مجزا
        const insertModel: InsertModel = {
          ID: ID,                   // UUID جدید برای ID
          FileIQ: FileIQ,           // UUID جدید برای FileIQ
          FileName: generatedFileName,
          FileSize: FileSize || file.size,
          FolderName: folderName,
          IsVisible: true,
          LastModified: null,
          SenderID: userId,
          FileType: `.${fileExtension}`,
        };

        // درج اطلاعات فایل در دیتابیس
        const insertResponse = await fileService.insert(insertModel);

        if (insertResponse && insertResponse.status) {
          const insertedModel: InsertModel = insertResponse.data;
          setUploadedFileInfo(insertedModel);

          // ساخت پیش‌نمایش آپلودشده (لوکال)
          const reader = new FileReader();
          reader.onloadend = () => {
            setUploadedPreviewUrl(reader.result as string);
            console.log("URL پیش‌نمایش فایل آپلود شده تنظیم شد.");
          };
          reader.readAsDataURL(file);

          alert("فایل با موفقیت آپلود و درج شد.");

          // اعلام کنیم که فایل آپلود شده
          setJustUploaded(true);

          // فراخوانی callback
          if (onUploadSuccess) {
            onUploadSuccess(insertedModel);
          }
        } else {
          setErrorMessage("درج اطلاعات فایل در دیتابیس ناموفق بود.");
        }
      } else {
        setErrorMessage("آپلود فایل ناموفق بود.");
      }
    } catch (error: any) {
      console.error("خطا در آپلود یا درج فایل:", error);
      setErrorMessage("خطا در آپلود یا درج فایل.");
      setUploadedFileInfo(null);
      setUploadedPreviewUrl(null);
      onReset();
    } finally {
      setIsLoading(false);
    }
  };

  // تعیین پیش‌نمایش نهایی (دانلودی یا آپلودی)
  const previewSrc = downloadedPreviewUrl || uploadedPreviewUrl;

  return (
    <div className="flex flex-col items-center rounded-lg w-full">
      <div className="w-full flex flex-col items-center space-y-4">
        {/* کامپوننت آپلود تصویر */}
        <ImageUploader
          key={`image-uploader-${resetCounter}`}
          onUpload={handleFileUpload}
          externalPreviewUrl={previewSrc}
        />

        {/* اطلاعات فایل آپلود شده (اختیاری) */}
        {uploadedFileInfo && (
          <div className="w-full bg-green-100 p-4 rounded-lg">
            <h3 className="text-md font-semibold">فایل آپلودشده:</h3>
            <p>
              <strong>ID:</strong> {uploadedFileInfo.ID}
            </p>
            <p>
              <strong>FileIQ:</strong> {uploadedFileInfo.FileIQ}
            </p>
            <p>
              <strong>File Name:</strong> {uploadedFileInfo.FileName}
            </p>
            <p>
              <strong>File Size:</strong> {uploadedFileInfo.FileSize} bytes
            </p>
            <p>
              <strong>Folder Name:</strong> {uploadedFileInfo.FolderName}
            </p>
            <p>
              <strong>Sender ID:</strong> {uploadedFileInfo.SenderID}
            </p>
            <p>
              <strong>File Type:</strong> {uploadedFileInfo.FileType}
            </p>
          </div>
        )}

        {isLoading && <p className="text-blue-500">در حال آپلود...</p>}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default FileUploadHandler;
