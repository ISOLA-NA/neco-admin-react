import React, { useState, useCallback, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicModal from "../../utilities/DynamicModal";
import { FaTrash, FaEye, FaSync, FaUpload } from "react-icons/fa";
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

interface AttachFileProps {
  onMetaChange?: (data: any) => void;
  data?: any;
}

const PictureBoxFile: React.FC<AttachFileProps> = ({ data, onMetaChange }) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(data?.metaType1 || null);
  const [fileName, setFileName] = useState<string>(data?.fileName || "");
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isNewUpload, setIsNewUpload] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isEditMode = !!data?.metaType1;

  // ✅ لود فایل از سرور در حالت edit
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
        const uint8Array = new Uint8Array(downloadRes.data);
        let mimeType = "application/octet-stream";
        const ext = fileName.split(".").pop()?.toLowerCase();
        if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
        else if (ext === "png") mimeType = "image/png";

        const blob = new Blob([uint8Array], { type: mimeType });
        const objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch((err) => {
        console.error("Preview error:", err);
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
    setResetCounter((prev) => prev + 1);
    setFileName("");
    setIsNewUpload(false);
    setPreviewUrl(null);
    if (onMetaChange) {
      onMetaChange({ metaType1: null });
    }
  };

  const handleShowFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (previewUrl) {
      setIsModalOpen(true);
    } else {
      alert("No file uploaded!");
    }
  };

  const handleTriggerUpload = () => {
    const input = document.getElementById("hidden-upload-trigger") as HTMLInputElement;
    input?.click();
  };

  const uploadFile = async (file: File) => {
    try {
      setIsLoading(true);

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["jpg", "jpeg", "png"].includes(ext || "")) {
        alert("Invalid file type. Only jpg, jpeg, png allowed.");
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

      const insertedModel = insertRes.data;

      handleUploadSuccess(insertedModel);
      setFileName(file.name);
      setIsNewUpload(true);
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    } catch (err: any) {
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
          onClick={handleShowFile}
          className={`flex items-center px-2 py-1 bg-purple-500 text-white font-semibold rounded transition duration-300 ${
            previewUrl
              ? "hover:bg-purple-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!previewUrl || isLoading}
        >
          <FaEye size={16} className="mr-1" />
          Show
        </button>
      </div>

      <input
        id="hidden-upload-trigger"
        type="file"
        accept=".jpg,.jpeg,.png"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
      />

      <DynamicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Uploaded Preview"
            className="max-w-full max-h-[80vh] mx-auto rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Do you want to delete the uploaded file?")) {
                handleReset();
                setIsModalOpen(false);
              }
            }}
            title="Click to delete the file"
          />
        ) : (
          <p className="text-gray-500 text-center">No file available to display.</p>
        )}
      </DynamicModal>
    </div>
  );
};

export default PictureBoxFile;
