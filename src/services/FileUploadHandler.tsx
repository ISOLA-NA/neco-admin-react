// src/services/FileUploadHandler.tsx

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import fileService from "./api.servicesFile"; // Ensure correct path
import apiService from "./api.services";      // Ensure correct path
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

  useEffect(() => {
    const downloadFile = async () => {
      if (!selectedFileId || selectedFileId.trim() === "") {
        setDownloadedPreviewUrl(null);
        return;
      }

      if (uploadedPreviewUrl) {
        // If there's an uploaded preview, don't download from server
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      setUploadedPreviewUrl(null);

      try {
        const res = await fileService.getFile(selectedFileId);

        if (!res.data) {
          setErrorMessage("File not found.");
          setDownloadedPreviewUrl(null);
          return;
        }

        const { FileIQ, FileType, FolderName } = res.data;
        const obj = {
          FileName: `${FileIQ}${FileType}`,
          FolderName: FolderName,
          cacheBust: Date.now(), // Add cache busting parameter
        };

        const downloadResponse = await fileService.download(obj);

        const blob = new Blob([downloadResponse.data], {
          type: "application/octet-stream",
        });

        const objectUrl = URL.createObjectURL(blob);
        setDownloadedPreviewUrl(objectUrl);
        console.log("Downloaded preview URL set:", objectUrl);
      } catch (err: any) {
        console.error("Error downloading file:", err);
        setUploadedPreviewUrl(null);
        setDownloadedPreviewUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    downloadFile();
  }, [selectedFileId, uploadedPreviewUrl]);

  useEffect(() => {
    if (resetCounter > 0) {
      setDownloadedPreviewUrl(null);
      setUploadedPreviewUrl(null);
      console.log("Preview reset due to resetCounter:", resetCounter);
    }
  }, [resetCounter]);

  useEffect(() => {
    return () => {
      if (downloadedPreviewUrl) {
        URL.revokeObjectURL(downloadedPreviewUrl);
      }
      if (uploadedPreviewUrl) {
        URL.revokeObjectURL(uploadedPreviewUrl);
      }
    };
  }, [downloadedPreviewUrl, uploadedPreviewUrl]);

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

  const handleFileUpload = async (file: File) => {
    console.log("Uploading file:", file.name);
    setIsLoading(true);
    setErrorMessage(null);
    setUploadedPreviewUrl(null);
    setDownloadedPreviewUrl(null); // Clear previous download preview

    try {
      const allowedExtensions = ["jpg", "jpeg", "png"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setErrorMessage("Please select only jpg, jpeg, or png files.");
        setIsLoading(false);
        return;
      }

      const ID = uuidv4();
      const FileIQ = uuidv4();

      const folderName = dateFormat(new Date(), "yy-MM-dd");
      const generatedFileName = `${FileIQ}.${fileExtension}`;

      const formData = new FormData();
      formData.append("FileName", generatedFileName);
      formData.append("FolderName", folderName);
      formData.append("file", file);

      const uploadResponse = await fileService.uploadFile(formData);
      console.log("Upload response:", uploadResponse);

      if (uploadResponse && uploadResponse.status) {
        const { FileSize } = uploadResponse.data;

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

        const insertResponse = await fileService.insert(insertModel);

        if (insertResponse && insertResponse.status) {
          const insertedModel: InsertModel = insertResponse.data;
          setUploadedFileInfo(insertedModel);

          const previewUrl = URL.createObjectURL(file);
          setUploadedPreviewUrl(previewUrl);
          console.log("Uploaded preview URL set:", previewUrl);

          alert("File uploaded and inserted successfully.");

          if (onUploadSuccess) {
            onUploadSuccess(insertedModel);
          }
        } else {
          setErrorMessage("Failed to insert file info to database.");
        }
      } else {
        setErrorMessage("File upload failed.");
      }
    } catch (error: any) {
      console.error("Error uploading or inserting file:", error);
      setErrorMessage("Error uploading or inserting file.");
      setUploadedFileInfo(null);
      setUploadedPreviewUrl(null);
      setDownloadedPreviewUrl(null);
      onReset();
    } finally {
      setIsLoading(false);
    }
  };

  const previewSrc = uploadedPreviewUrl || downloadedPreviewUrl;

  return (
    <div className="flex flex-col items-center rounded-lg w-full">
      <div className="w-full flex flex-col items-center space-y-4">
        <ImageUploader
          key={`image-uploader-${resetCounter}-${selectedFileId}-${uploadedPreviewUrl}-${downloadedPreviewUrl}`}
          onUpload={handleFileUpload}
          externalPreviewUrl={previewSrc}
        />
      </div>
      {isLoading && <p className="text-blue-500 mt-2">Uploading...</p>}
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
    </div>
  );
};

export default FileUploadHandler;
