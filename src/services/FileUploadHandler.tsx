// FileUploadHandler.tsx

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import fileService from "./api.servicesFile";
import apiService from "./api.services";
import ImageUploader from "../components/utilities/ImageUploader";

export interface InsertModel {
  ID?: string;
  FileIQ?: string;
  FileName: string;
  FileSize: number;
  FolderName: string;
  IsVisible: boolean;
  LastModified: Date | null;
  SenderID: string | null;
  FileType: string | null;
}

interface FileUploadHandlerProps {
  selectedFileId: string | null;
  onUploadSuccess?: (insertModel: InsertModel) => void;
  resetCounter: number;
  onReset: () => void;
  onPreviewUrlChange?: (url: string | null) => void;
  externalPreviewUrl?: string | null;
  /**
   * در صورتی که بخواهید فرمت های مجاز را محدود کنید
   * مثلاً ["doc","docx"] یا ["jpg","jpeg","png"]
   */
  allowedExtensions?: string[];
  /**
   * اگر در حالت ویرایش هستیم و نیاز به نمایش قسمت آپلود نداریم، این مقدار true خواهد بود.
   */
  hideUploader?: boolean;
}

const FileUploadHandler: React.FC<FileUploadHandlerProps> = ({
  selectedFileId,
  onUploadSuccess,
  resetCounter,
  onReset,
  onPreviewUrlChange,
  externalPreviewUrl,
  allowedExtensions, // <-- پراپ جدید
  hideUploader = false, // مقدار پیش‌فرض false
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [internalPreviewUrl, setInternalPreviewUrl] = useState<string | null>(null);

  // تابع کمکی به‌روز‌رسانی preview
  const updatePreview = (url: string | null) => {
    if (onPreviewUrlChange) {
      onPreviewUrlChange(url);
    } else {
      setInternalPreviewUrl(url);
    }
  };

  const finalPreviewUrl = externalPreviewUrl ?? internalPreviewUrl;

  useEffect(() => {
    if (!selectedFileId || selectedFileId.trim() === "") {
      updatePreview(null);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    let didCancel = false;
    fileService
      .getFile(selectedFileId)
      .then((res) => {
        // مثالی از دریافت اطلاعات فایل از سرور
        const downloadingFileObject = {
          FileName: res.data.FileIQ + res.data.FileType,
          FolderName: res.data.FolderName,
          cacheBust: Date.now(),
        };
        fileService
          .download(downloadingFileObject)
          .then((downloadRes) => {
            const uint8Array = new Uint8Array(downloadRes.data);
            let mimeType = "application/octet-stream";

            // بر اساس نوع فایل می‌توانید mimeType را تعیین کنید
            if (res.data.FileType === ".jpg" || res.data.FileType === ".jpeg") {
              mimeType = "image/jpeg";
            } else if (res.data.FileType === ".png") {
              mimeType = "image/png";
            } else if (res.data.FileType === ".doc") {
              mimeType = "application/msword";
            } else if (res.data.FileType === ".docx") {
              mimeType =
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            }
            const blob = new Blob([uint8Array], { type: mimeType });
            const objectUrl = (window.URL || window.webkitURL).createObjectURL(blob);
            updatePreview(objectUrl);
          })
          .catch(() => {
            updatePreview(null);
          })
          .finally(() => {
            if (!didCancel) setIsLoading(false);
          });
      })
      .catch((err) => {
        updatePreview(null);
        setIsLoading(false);
      });
    return () => {
      didCancel = true;
    };
  }, [selectedFileId]);

  // ریست کردن preview در صورت تغییر resetCounter
  useEffect(() => {
    if (resetCounter > 0) {
      updatePreview(null);
    }
  }, [resetCounter]);

  // دریافت شناسه کاربر برای آپلود
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await apiService.getIdByUserToken();
        if (res && res.length > 0) {
          setUserId(res[0].ID.toString());
        }
      } catch (err: any) {
        setErrorMessage("Error fetching user information.");
      }
    };
    fetchUserId();
  }, []);

  const handleFileUpload = (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    // اگر چیزی ست نشده باشد پیش فرض بر فرمت‌های تصویری است
    const validExtensions = allowedExtensions || ["jpg", "jpeg", "png"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      setErrorMessage(
        `Please select only ${validExtensions.join(", ")} files.`
      );
      setIsLoading(false);
      return;
    }

    const ID = uuidv4();
    const FileIQ = uuidv4();
    const folderName = new Date().toISOString().split("T")[0];
    const generatedFileName = `${FileIQ}.${fileExtension}`;

    const formData = new FormData();
    formData.append("FileName", generatedFileName);
    formData.append("FolderName", folderName);
    formData.append("file", file);

    fileService
      .uploadFile(formData)
      .then((uploadRes) => {
        if (uploadRes && uploadRes.status) {
          const { FileSize } = uploadRes.data;
          const insertModel: InsertModel = {
            ID: ID,
            FileIQ: FileIQ,
            FileName: generatedFileName,
            FileSize: FileSize || file.size,
            FolderName: folderName,
            IsVisible: true,
            LastModified: null,
            SenderID: userId,
            FileType: `.${fileExtension}`,
          };
          fileService
            .insert(insertModel)
            .then((insertRes) => {
              if (insertRes && insertRes.status) {
                const insertedModel: InsertModel = insertRes.data;
                if (onUploadSuccess) onUploadSuccess(insertedModel);

                // تولید Preview برای فایل‌هایی که قابل نمایش تصویری هستند
                if (
                  fileExtension === "jpg" ||
                  fileExtension === "jpeg" ||
                  fileExtension === "png"
                ) {
                  const previewUrl = URL.createObjectURL(file);
                  updatePreview(previewUrl);
                } else {
                  // برای فایل‌های غیرتصویری، Preview تصویر ندارد
                  updatePreview(null);
                }
              } else {
                setErrorMessage("Failed to insert file info to database.");
              }
            })
            .catch((err) => {
              setErrorMessage("Error inserting file info to database.");
            })
            .finally(() => setIsLoading(false));
        } else {
          setErrorMessage("File upload failed.");
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setErrorMessage("Error uploading file.");
        setIsLoading(false);
      });
  };

  return (
    <div className="flex flex-col items-center rounded-lg w-full">
      {/* بخش آپلود تنها در صورتی نمایش داده می‌شود که hideUploader برابر false باشد */}
      {!hideUploader && (
        <div className="w-full flex flex-col items-center space-y-4">
          <ImageUploader
            key={`image-uploader-${resetCounter}-${selectedFileId}`}
            onUpload={handleFileUpload}
            externalPreviewUrl={finalPreviewUrl}
            allowedExtensions={allowedExtensions}  
          />
        </div>
      )}
      {isLoading && (
        <p className="text-blue-500 mt-2">Uploading / downloading ...</p>
      )}
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
    </div>
  );
};

export default FileUploadHandler;
