// src/services/FileUploadHandler.tsx

import React, { useState, useEffect } from "react";
import fileService from "./api.servicesFile"; // اطمینان از مسیر صحیح
import apiService from "./api.services"; // اطمینان از مسیر صحیح
import ImageUploader from "../components/utilities/ImageUploader";

interface InsertModel {
  ID: string;
  gid: string;
  FileIQ: string;
  FileName: string;
  FileSize: number;
  FolderName: string;
  IsVisible: boolean;
  LastModified: Date | null;
  SenderID: string | null;
  FileType: string | null;
}

interface FileUploadHandlerProps {
  selectedFileId: string | null; // شناسه فایل برای دانلود
  onUploadSuccess?: (insertModel: InsertModel) => void; // callback پس از آپلود موفقیت‌آمیز
  resetCounter: number; // prop جدید برای ریست کردن پیش‌نمایش
  onReset: () => void; // prop جدید برای ریست کردن از خارج
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
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [downloadedPreviewUrl, setDownloadedPreviewUrl] = useState<string | null>(null);

  // دریافت ID کاربر هنگام mount شدن کامپوننت
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await apiService.getIdByUserToken();
        if (res && res.length > 0) {
          setUserId(res[0].ID.toString());
        }
      } catch (err: any) {
        console.error("خطا در دریافت ID کاربر:", err);
        setErrorMessage("خطا در دریافت اطلاعات کاربر.");
      }
    };
    fetchUserId();
  }, []);

  // نظارت بر تغییرات selectedFileId برای دانلود فایل
  useEffect(() => {
    const downloadFile = async () => {
      if (!selectedFileId) {
        setDownloadedPreviewUrl(null); // پاک کردن تصویر اگر fileId خالی باشد
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      setUploadedPreviewUrl(null); // پاک کردن تصویر آپلود شده هنگام دانلود فایل جدید

      try {
        // دریافت جزئیات فایل با استفاده از selectedFileId
        const res = await fileService.getFile(selectedFileId);

        if (!res.data) {
          setErrorMessage("فایل مورد نظر یافت نشد.");
          setDownloadedPreviewUrl(null); // پاک کردن پیش‌نمایش دانلود شده
          return;
        }

        // استخراج داده‌های مورد نیاز
        const { FileIQ, FileType, FolderName } = res.data;
        const obj = {
          FileName: `${FileIQ}${FileType}`,
          FolderName: FolderName,
        };

        // دانلود فایل به صورت باینری
        const downloadResponse = await fileService.download(obj);

        // تبدیل آرایه بایت به Blob
        const blob = new Blob([downloadResponse.data], {
          type: "application/octet-stream",
        });

        // استفاده از FileReader برای تبدیل Blob به Data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setDownloadedPreviewUrl(result);
        };
        reader.readAsDataURL(blob);
      } catch (err: any) {
        console.error("خطا در دانلود فایل:", err);
        setErrorMessage("خطا در دانلود فایل.");

        // تنظیم هر دو پیش‌نمایش به null برای پاک کردن تصاویر
        setUploadedPreviewUrl(null);
        setDownloadedPreviewUrl(null);

        // ریست کردن ImageUploader با فراخوانی onReset
        onReset();
      } finally {
        setIsLoading(false);
      }
    };

    downloadFile();
  }, [selectedFileId, onReset]);

  // نظارت بر تغییرات resetCounter برای ریست کردن preview
  useEffect(() => {
    if (resetCounter > 0) {
      setDownloadedPreviewUrl(null);
      setUploadedPreviewUrl(null);
    }
  }, [resetCounter]);

  // توابع کمکی
  const uuid = (): string => {
    let uuidValue = "",
      k,
      randomValue;
    for (k = 0; k < 32; k++) {
      randomValue = (Math.random() * 16) | 0;
      if (k === 8 || k === 12 || k === 16 || k === 20) {
        uuidValue += "-";
      }
      uuidValue +=
        k === 12
          ? "4"
          : k === 16
          ? ((randomValue & 3) | 8).toString(16)
          : randomValue.toString(16);
    }
    return uuidValue;
  };

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

  // هندل کردن آپلود فایل
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setDownloadedPreviewUrl(null); // پاک کردن تصویر دانلود شده هنگام آپلود فایل جدید

    try {
      // اعتبارسنجی پسوند فایل
      const allowedExtensions = ["jpg", "jpeg", "png"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setErrorMessage(
          "لطفاً فقط فایل‌های با پسوند jpg، jpeg یا png را انتخاب کنید."
        );
        setIsLoading(false);
        return;
      }

      // تولید UUID برای gid و سایر شناسه‌ها
      const UUID = uuid();
      const folderName = dateFormat(new Date(), "yy-MM-dd");

      // ایجاد FormData
      const formData = new FormData();
      formData.append("gid", UUID); // افزودن gid به payload
      formData.append("FileName", `${UUID}.${fileExtension}`);
      formData.append("FolderName", folderName);
      formData.append("file", file); // کلید "file" مطابق نیاز سرویس

      // آپلود فایل
      const uploadResponse = await fileService.uploadFile(formData);

      if (uploadResponse && uploadResponse.data) {
        const { FileIQ, FileName, FileSize } = uploadResponse.data;

        // ایجاد مدل برای درج در دیتابیس
        const insertModel: InsertModel = {
          ID: UUID,
          gid: UUID, // اختصاص gid
          FileIQ: FileIQ || UUID,
          FileName: FileName || file.name,
          FileSize: FileSize || file.size,
          FolderName: folderName,
          IsVisible: true,
          LastModified: null,
          SenderID: userId,
          FileType: `.${fileExtension}`,
        };

        // درج اطلاعات فایل در دیتابیس
        await fileService.insert(insertModel);

        // به‌روزرسانی وضعیت‌ها
        setUploadedFileInfo(insertModel);

        // استفاده از FileReader برای تبدیل فایل آپلود شده به Data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        alert("فایل با موفقیت آپلود و درج شد.");

        // فراخوانی callback پس از موفقیت‌آمیز بودن آپلود
        if (onUploadSuccess) {
          onUploadSuccess(insertModel);
        }
      }
    } catch (error: any) {
      console.error("خطا در آپلود یا درج فایل:", error);
      setErrorMessage("خطا در آپلود یا درج فایل.");

      // تنظیم هر دو پیش‌نمایش به null برای پاک کردن تصاویر
      setUploadedPreviewUrl(null);
      setDownloadedPreviewUrl(null);

      // ریست کردن ImageUploader با فراخوانی onReset
      onReset();
    } finally {
      setIsLoading(false);
    }
  };

  const previewSrc = downloadedPreviewUrl || uploadedPreviewUrl;

  return (
    <div className="flex flex-col items-center rounded-lg w-full">
      {/* آپلود و پیش‌نمایش در یک بخش مجتمع */}
      <div className="w-full flex flex-col items-center space-y-4">
        {/* کامپوننت آپلود تصویر با پیش‌نمایش مشترک */}
        <ImageUploader
          key={`image-uploader-${resetCounter}`} // افزودن key برای ریست کردن
          onUpload={handleFileUpload}
          externalPreviewUrl={previewSrc}
        />

        {/* نمایش اطلاعات فایل آپلود شده (اختیاری) */}
        {uploadedFileInfo && (
          <div className="w-full bg-green-100 p-4 rounded-lg">
            <h3 className="text-md font-semibold">فایل آپلودشده:</h3>
            <p>
              <strong>GID:</strong> {uploadedFileInfo.gid}
            </p>
            <p>
              <strong>File IQ:</strong> {uploadedFileInfo.FileIQ}
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

        {/* نمایش پیام در حال بارگذاری */}
        {isLoading && <p className="text-blue-500">در حال آپلود یا دانلود...</p>}

        {/* نمایش پیام خطا */}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default FileUploadHandler;
