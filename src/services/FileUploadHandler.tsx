import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { FiRefreshCw } from "react-icons/fi";
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
  allowedExtensions?: string[];
  hideUploader?: boolean;
  isEditMode?: boolean;
}

const FileUploadHandler: React.FC<FileUploadHandlerProps> = ({
  selectedFileId,
  onUploadSuccess,
  resetCounter,
  onReset,
  onPreviewUrlChange,
  externalPreviewUrl,
  allowedExtensions,
  hideUploader = false,
  isEditMode = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [internalPreviewUrl, setInternalPreviewUrl] = useState<string | null>(null);

  const updatePreview = (url: string | null) => {
    if (onPreviewUrlChange) onPreviewUrlChange(url);
    setInternalPreviewUrl(url);
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
        const downloadingFileObject = {
          FileName: res.data.FileIQ + res.data.FileType,
          FolderName: res.data.FolderName,
          cacheBust: Date.now(),
        };
        return fileService.download(downloadingFileObject);
      })
      .then((downloadRes) => {
        if (didCancel) return;
        const uint8Array = new Uint8Array(downloadRes.data);
        let mimeType = "application/octet-stream";
        const ext = finalPreviewUrl?.split(".").pop()?.toLowerCase();
        if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
        else if (ext === "png") mimeType = "image/png";
        const blob = new Blob([uint8Array], { type: mimeType });
        const objectUrl = URL.createObjectURL(blob);
        updatePreview(objectUrl);
      })
      .catch(() => {
        if (!didCancel) updatePreview(null);
      })
      .finally(() => {
        if (!didCancel) setIsLoading(false);
      });

    return () => {
      didCancel = true;
    };
  }, [selectedFileId]);

  useEffect(() => {
    if (resetCounter > 0) {
      updatePreview(null);
    }
  }, [resetCounter]);

  useEffect(() => {
    apiService
      .getIdByUserToken()
      .then((res) => {
        if (res && res.length > 0) {
          setUserId(res[0].ID.toString());
        }
      })
      .catch(() => {
        setErrorMessage("Error fetching user information.");
      });
  }, []);

  const handleFileUpload = (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    const validExtensions = allowedExtensions || ["jpg", "jpeg", "png"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !validExtensions.includes(fileExt)) {
      setErrorMessage(`Please select only ${validExtensions.join(", ")} files.`);
      setIsLoading(false);
      return;
    }

    const ID = uuidv4();
    const FileIQ = uuidv4();
    const folderName = new Date().toISOString().split("T")[0];
    const generatedFileName = `${FileIQ}.${fileExt}`;

    const formData = new FormData();
    formData.append("FileName", generatedFileName);
    formData.append("FolderName", folderName);
    formData.append("file", file);

    fileService
      .uploadFile(formData)
      .then((uploadRes) => {
        if (!uploadRes?.status) throw new Error("Upload failed");

        const { FileSize } = uploadRes.data;
        const insertModel: InsertModel = {
          ID,
          FileIQ,
          FileName: generatedFileName,
          FileSize: FileSize || file.size,
          FolderName: folderName,
          IsVisible: true,
          LastModified: null,
          SenderID: userId,
          FileType: `.${fileExt}`,
        };
        return fileService.insert(insertModel);
      })
      .then((insertRes) => {
        if (!insertRes?.status) throw new Error("Insert failed");

        const insertedModel: InsertModel = insertRes.data;
        onUploadSuccess?.(insertedModel);

        if (isEditMode) {
          const previewUrl = URL.createObjectURL(file);
          updatePreview(previewUrl);
        } else {
          updatePreview(null);
        }
      })
      .catch((err) => {
        setErrorMessage(err.message || "Error uploading file.");
        updatePreview(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDelete = () => {
    updatePreview(null);
  };

  return (
    <div className="flex flex-col items-center rounded-lg w-full">
      {!hideUploader && (
        <div className="w-full relative">
          <ImageUploader
            key={`image-uploader-${resetCounter}-${selectedFileId}`}
            onUpload={handleFileUpload}
            externalPreviewUrl={finalPreviewUrl}
            allowedExtensions={allowedExtensions}
          />

          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12 animate-spin" />
            </div>
          )}

{!isLoading && finalPreviewUrl && (
  <button
    onClick={() => {
      if (isEditMode) {
        // در حالت ویرایش → باز کردن فایل جدید (کلیک مجدد روی input)
        const fileInput = document.querySelector<HTMLInputElement>('#hidden-file-input');
        fileInput?.click();
      } else {
        // در حالت افزودن → فقط پاک کردن عکس
        handleDelete();
      }
    }}
    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-lg transition"
  >
    <FiRefreshCw size={16} />
  </button>
)}
ّ
        </div>
      )}

      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
    </div>
  );
};

export default FileUploadHandler;
