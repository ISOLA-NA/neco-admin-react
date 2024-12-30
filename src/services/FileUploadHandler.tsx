// src/services/FileUploadHandler.tsx

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import fileService from "./api.servicesFile"; // اطمینان از مسیر صحیح
import apiService from "./api.services";      // اطمینان از مسیر صحیح
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

export interface FileUploadHandlerRef {
  handleFileUpload: (file: File) => Promise<void>;
  handleFileDownload: (userImg: string) => Promise<void>;
  clearDownloadedImage: () => void;
  clearUploadedImage: () => void;
}

interface FileUploadHandlerProps {
  onUploadSuccess?: (insertModel: InsertModel) => void; // افزودن onUploadSuccess
}

const FileUploadHandler = forwardRef<FileUploadHandlerRef, FileUploadHandlerProps>(
  ({ onUploadSuccess }, ref) => {
    const [uploadedFileInfo, setUploadedFileInfo] = useState<InsertModel | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
    const [downloadedPreviewUrl, setDownloadedPreviewUrl] = useState<string | null>(null);

    // قالب‌بندی تاریخ
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

    // تولید UUID ساده
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

    // دریافت ID کاربر از سرور
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

    /**
     * متد آپلود فایل
     */
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
      } finally {
        setIsLoading(false);
      }
    };

    /**
     * متد دانلود فایل
     * @param userImg شناسه فایل (مثلاً IconImageId) ارسال شده به سرور
     */
    const handleFileDownload = async (userImg: string) => {
      if (!userImg) {
        setDownloadedPreviewUrl(null); // پاک کردن تصویر اگر userImg خالی باشد
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      setUploadedPreviewUrl(null); // پاک کردن تصویر آپلود شده هنگام دانلود فایل جدید

      try {
        // دریافت جزئیات فایل با استفاده از userImg
        const res = await fileService.getFile(userImg);

        if (!res.data) {
          setErrorMessage("فایل مورد نظر یافت نشد.");
          setIsLoading(false);
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
        const blob = new Blob([downloadResponse.data], { type: "application/octet-stream" });

        // استفاده از FileReader برای تبدیل Blob به Data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setDownloadedPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (err: any) {
        console.error("خطا در دانلود فایل:", err);
        setErrorMessage("خطا در دانلود فایل.");
      } finally {
        setIsLoading(false);
      }
    };

    /**
     * متد پاک کردن پیش‌نمایش تصویر دانلود شده
     */
    const clearDownloadedImage = () => {
      console.log("پاکسازی تصویر دانلود شده:", downloadedPreviewUrl);
      setDownloadedPreviewUrl(null);
    };

    /**
     * متد پاک کردن پیش‌نمایش تصویر آپلود شده
     */
    const clearUploadedImage = () => {
      console.log("پاکسازی تصویر آپلود شده:", uploadedPreviewUrl);
      setUploadedPreviewUrl(null);
    };

    // نمایش متدها به والد از طریق ref
    useImperativeHandle(ref, () => ({
      handleFileUpload,
      handleFileDownload,
      clearDownloadedImage,
      clearUploadedImage,
    }));

    return (
      <div className="flex flex-col items-center rounded-lg w-1/2">
        {/* آپلود و پیش‌نمایش در یک بخش مجتمع */}
        <div className="w-full max-w-md flex flex-col items-center space-y-4">
          {/* کامپوننت آپلود تصویر با پیش‌نمایش مشترک */}
          <ImageUploader
            onUpload={handleFileUpload}
            externalPreviewUrl={downloadedPreviewUrl}
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
  }
);

export default FileUploadHandler;
