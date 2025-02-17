import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import fileService from "./api.servicesFile"; // مسیر صحیح را بررسی کنید
import apiService from "./api.services";       // مسیر صحیح را بررسی کنید
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
}

const FileUploadHandler: React.FC<FileUploadHandlerProps> = ({
  selectedFileId,
  onUploadSuccess,
  resetCounter,
  onReset,
  onPreviewUrlChange,
  externalPreviewUrl,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // دانلود فایل در صورت وجود selectedFileId
  useEffect(() => {
    if (!selectedFileId || selectedFileId.trim() === "") {
      if (onPreviewUrlChange) onPreviewUrlChange(null);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    let didCancel = false;
    fileService
      .getFile(selectedFileId)
      .then((res) => {
        console.log("getFile response:", res.data);
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
            if (res.data.FileType === ".jpg" || res.data.FileType === ".jpeg") {
              mimeType = "image/jpeg";
            } else if (res.data.FileType === ".png") {
              mimeType = "image/png";
            }
            const blob = new Blob([uint8Array], { type: mimeType });
            const objectUrl = (window.URL || window.webkitURL).createObjectURL(blob);
            if (onPreviewUrlChange) {
              onPreviewUrlChange(objectUrl);
            }
            console.log("Downloaded preview URL:", objectUrl);
          })
          .catch(() => {
            if (onPreviewUrlChange) onPreviewUrlChange(null);
            console.error("Error downloading file");
          })
          .finally(() => {
            if (!didCancel) setIsLoading(false);
          });
      })
      .catch((err) => {
        console.error("Error in getFile:", err);
        if (onPreviewUrlChange) onPreviewUrlChange(null);
        setIsLoading(false);
      });
    return () => {
      didCancel = true;
    };
  }, [selectedFileId, onPreviewUrlChange]);

  // ریست کردن preview URL در صورت تغییر resetCounter
  useEffect(() => {
    if (resetCounter > 0 && onPreviewUrlChange) {
      onPreviewUrlChange(null);
      console.log("Preview reset due to resetCounter:", resetCounter);
    }
  }, [resetCounter, onPreviewUrlChange]);

  // دریافت شناسه کاربر برای آپلود
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await apiService.getIdByUserToken();
        if (res && res.length > 0) {
          setUserId(res[0].ID.toString());
          console.log("User ID fetched:", res[0].ID.toString());
        }
      } catch (err: any) {
        console.error("Error fetching user ID:", err);
        setErrorMessage("Error fetching user information.");
      }
    };
    fetchUserId();
  }, []);

  const handleFileUpload = (file: File) => {
    console.log("Uploading file:", file.name);
    setIsLoading(true);
    setErrorMessage(null);

    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setErrorMessage("Please select only jpg, jpeg, or png files.");
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
        console.log("Upload response:", uploadRes);
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
                const previewUrl = (window.URL || window.webkitURL).createObjectURL(file);
                if (onPreviewUrlChange) onPreviewUrlChange(previewUrl);
                console.log("Uploaded preview URL:", previewUrl);
              } else {
                setErrorMessage("Failed to insert file info to database.");
              }
            })
            .catch((err) => {
              console.error("Error inserting file info:", err);
              setErrorMessage("Error inserting file info to database.");
            })
            .finally(() => setIsLoading(false));
        } else {
          setErrorMessage("File upload failed.");
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error uploading file:", err);
        setErrorMessage("Error uploading file.");
        setIsLoading(false);
      });
  };

  return (
    <div className="flex flex-col items-center rounded-lg w-full">
      <div className="w-full flex flex-col items-center space-y-4">
        <ImageUploader
          key={`image-uploader-${resetCounter}-${selectedFileId}`}
          onUpload={handleFileUpload}
          externalPreviewUrl={externalPreviewUrl}
        />
      </div>
      {isLoading && <p className="text-blue-500 mt-2">Uploading/downloading...</p>}
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
    </div>
  );
};

export default FileUploadHandler;
