import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { FaTrash, FaDownload, FaUpload, FaSync } from "react-icons/fa";
import fileService from "../../../services/api.servicesFile";
import { v4 as uuidv4 } from "uuid";
import type { InsertModel } from "../../../services/FileUploadHandler";

interface WordPanelProps {
  onMetaChange?: (data: any) => void;
  data?: any;
}

const WordPanel: React.FC<WordPanelProps> = ({ data, onMetaChange }) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(data?.metaType1 || null);
  const [fileName, setFileName] = useState<string>(data?.fileName || "");
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [isNewUpload, setIsNewUpload] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isEditMode = !!data?.metaType1;

  useEffect(() => {
    if (!selectedFileId || isNewUpload) return;

    fileService
      .getFile(selectedFileId)
      .then((res) => {
        setFileName(res.data.FileName);
        const path = {
          FileName: res.data.FileIQ + res.data.FileType,
          FolderName: res.data.FolderName,
          cacheBust: Date.now(),
        };
        return fileService.download(path);
      })
      .then((downloadRes) => {
        const blob = new Blob([new Uint8Array(downloadRes.data)], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        setPreviewUrl(URL.createObjectURL(blob));
      })
      .catch((err) => {
        console.error("Error fetching file info:", err);
      });
  }, [selectedFileId, isNewUpload]);

  const handleUploadSuccess = (insertedModel: InsertModel) => {
    setSelectedFileId(insertedModel.ID || null);
    setFileName(insertedModel.FileName);
    setIsNewUpload(true);
    if (onMetaChange) {
      onMetaChange({ metaType1: insertedModel.ID || null });
    }
  };

  const handleReset = () => {
    setSelectedFileId(null);
    setFileName("");
    setResetCounter((prev) => prev + 1);
    setIsNewUpload(false);
    setPreviewUrl(null);
    if (onMetaChange) {
      onMetaChange({ metaType1: null });
    }
  };

  const handleDownloadFile = async () => {
    if (!selectedFileId) return alert("No file to download.");

    try {
      const infoRes = await fileService.getFile(selectedFileId);
      const { FileIQ, FileType, FolderName, FileName } = infoRes.data;

      const path = {
        FileName: FileIQ + FileType,
        FolderName: FolderName,
        cacheBust: Date.now(),
      };

      const res = await fileService.download(path);
      const mimeType = FileType === ".doc"
        ? "application/msword"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      const blob = new Blob([new Uint8Array(res.data)], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = FileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Download failed.");
    }
  };

  return (
    <div className="flex flex-col items-center w-full mt-10">
      <div className="flex items-center gap-3 w-full">
        {isLoading ? (
          <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 border-gray-300 animate-spin" />
        ) : (
          <>
            {selectedFileId && isEditMode && (
              <button
                type="button"
                title="Upload new Word file"
                onClick={() => document.getElementById("hidden-upload-word")?.click()}
                className="text-white p-2 rounded transition duration-300 bg-blue-500 hover:bg-blue-700"
              >
                <FaSync size={16} />
              </button>
            )}
            {!isEditMode && !selectedFileId && (
              <button
                type="button"
                title="Upload Word file"
                onClick={() => document.getElementById("hidden-upload-word")?.click()}
                className="text-white p-2 rounded transition duration-300 bg-green-600 hover:bg-green-700"
              >
                <FaUpload size={16} />
              </button>
            )}
            {selectedFileId && !isEditMode && (
              <button
                type="button"
                title="Remove file"
                onClick={handleReset}
                className="text-white p-2 rounded transition duration-300 bg-red-500 hover:bg-red-700"
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
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-purple-600 text-white rounded-md transition ${
            previewUrl ? "hover:bg-purple-700" : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!previewUrl || isLoading}
        >
          <FaDownload />
          Download
        </button>
      </div>

      <input
        id="hidden-upload-word"
        type="file"
        accept=".doc,.docx"
        style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          try {
            setIsLoading(true);
            const ext = file.name.split(".").pop()?.toLowerCase();
            if (!["doc", "docx"].includes(ext || "")) {
              alert("Only .doc or .docx files are allowed.");
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
            setPreviewUrl(URL.createObjectURL(file));
          } catch (err: any) {
            alert("Upload error: " + (err.message || err));
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
};

export default WordPanel;
