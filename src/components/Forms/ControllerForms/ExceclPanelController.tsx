// ExcelPanel.tsx

import React, { useState, useEffect, useCallback } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { FaTrash, FaDownload, FaSync, FaUpload } from "react-icons/fa";
import fileService from "../../../services/api.servicesFile";
import { v4 as uuidv4 } from "uuid";

interface InsertModel {
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

interface ExcelPanelProps {
  onMetaChange?: (data: any) => void;
  data?: any;
}

const ExcelPanel: React.FC<ExcelPanelProps> = ({ data, onMetaChange }) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(data?.metaType1 || null);
  const [fileName, setFileName] = useState<string>(data?.fileName || "");
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [isNewUpload, setIsNewUpload] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isEditMode = !!data?.metaType1;

  useEffect(() => {
    if (!selectedFileId || isNewUpload) return;

    fileService
      .getFile(selectedFileId)
      .then((res) => {
        setFileName(res.data.FileName);
      })
      .catch((err) => {
        console.error("Error fetching file info:", err);
      });
  }, [selectedFileId, isNewUpload]);

  const handleUploadSuccess = (insertedModel: InsertModel) => {
    setSelectedFileId(insertedModel.ID || null);
    setFileName(insertedModel.FileName);
    if (onMetaChange) {
      onMetaChange({ metaType1: insertedModel.ID || null });
    }
  };

  const handleReset = () => {
    setSelectedFileId(null);
    setFileName("");
    setResetCounter((prev) => prev + 1);
    setIsNewUpload(false);
    if (onMetaChange) {
      onMetaChange({ metaType1: null });
    }
  };

  const handleDownloadFile = async () => {
    if (!selectedFileId) {
      alert("No file to download.");
      return;
    }

    try {
      const infoRes = await fileService.getFile(selectedFileId);
      const { FileIQ, FileType, FolderName, FileName } = infoRes.data;

      const downloadRes = await fileService.download({
        FileName: FileIQ + FileType,
        FolderName,
        cacheBust: Date.now(),
      });

      const uint8Array = new Uint8Array(downloadRes.data);
      let mimeType = "application/octet-stream";
      if (FileType === ".xls") mimeType = "application/vnd.ms-excel";
      else if (FileType === ".xlsx") mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([uint8Array], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = FileName;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Failed to download file.");
    }
  };

  const handleTriggerUpload = () => {
    const hiddenInput = document.getElementById("hidden-upload-trigger") as HTMLInputElement;
    hiddenInput?.click();
  };

  const uploadFile = async (file: File) => {
    try {
      setIsLoading(true);

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["xls", "xlsx"].includes(ext || "")) {
        alert("Only .xls and .xlsx files are allowed.");
        setIsLoading(false);
        return;
      }

      const ID = uuidv4();
      const FileIQ = uuidv4();
      const folderName = new Date().toISOString().split("T")[0];
      const generatedFileName = `${FileIQ}.${ext}`;

      const formData = new FormData();
      formData.append("FileName", generatedFileName);
      formData.append("FolderName", folderName);
      formData.append("file", file);

      const uploadRes = await fileService.uploadFile(formData);
      if (!uploadRes?.status) throw new Error("Upload failed");

      const insertModel: InsertModel = {
        ID,
        FileIQ,
        FileName: generatedFileName,
        FileSize: uploadRes.data.FileSize || file.size,
        FolderName: folderName,
        IsVisible: true,
        LastModified: null,
        SenderID: null,
        FileType: `.${ext}`,
      };

      const insertRes = await fileService.insert(insertModel);
      if (!insertRes?.status) throw new Error("Insert failed");

      handleUploadSuccess(insertRes.data);
      setFileName(file.name);
      setIsNewUpload(true);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Upload failed: " + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full mt-10">
      <div className="flex items-center gap-2 w-full">
        {isLoading ? (
          <div className="w-[32px] h-[32px] rounded-full border-4 border-t-blue-500 border-gray-300 animate-spin" />
        ) : (
          <>
            {selectedFileId && isEditMode && (
              <button
                type="button"
                title="Upload new file"
                onClick={handleTriggerUpload}
                className="text-white p-1 rounded transition duration-300 bg-blue-500 hover:bg-blue-700"
              >
                <FaSync size={16} />
              </button>
            )}
            {!isEditMode && !selectedFileId && (
              <button
                type="button"
                title="Upload file"
                onClick={handleTriggerUpload}
                className="text-white p-1 rounded transition duration-300 bg-green-600 hover:bg-green-700"
              >
                <FaUpload size={16} />
              </button>
            )}
            {selectedFileId && !isEditMode && (
              <button
                type="button"
                title="Remove file"
                onClick={handleReset}
                className="text-white p-1 rounded transition duration-300 bg-red-500 hover:bg-red-700"
              >
                <FaTrash size={16} />
              </button>
            )}
          </>
        )}

        <DynamicInput
          name="fileName"
          type="text"
          value={fileName || ""}
          placeholder="No file selected"
          className="flex-grow -mt-6"
          disabled
        />

        <button
          type="button"
          onClick={handleDownloadFile}
          className={`flex items-center px-3 py-2 bg-purple-500 text-white font-semibold text-sm rounded transition duration-300 ${
            selectedFileId && !isLoading
              ? "hover:bg-purple-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!selectedFileId || isLoading}
        >
          <FaDownload size={16} className="mr-2" />
          Download
        </button>
      </div>

      <input
        id="hidden-upload-trigger"
        type="file"
        accept=".xls,.xlsx"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
      />
    </div>
  );
};

export default ExcelPanel;
