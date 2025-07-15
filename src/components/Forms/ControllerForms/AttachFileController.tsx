// src/components/ControllerForms/AttachFile.tsx
import React, { useState, useEffect, useCallback } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicModal from "../../utilities/DynamicModal";
import { FaEye, FaSync, FaUpload, FaTrash } from "react-icons/fa";
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
  onMetaChange?: (data: { metaType1: string | null }) => void;
  data?: { metaType1?: string | null; fileName?: string };
}

const AttachFile: React.FC<AttachFileProps> = ({ data = {}, onMetaChange }) => {
  /* ---------------- state ---------------- */
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    data.metaType1 ?? null
  );
  const [fileName, setFileName] = useState<string>(data.fileName ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewUpload, setIsNewUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetCounter, setResetCounter] = useState(0); // ← اضافه شد

  const isEditMode = !!selectedFileId;

  /* -------- بارگذاری پیش‌نمایش در حالت ادیت -------- */
  useEffect(() => {
    let revokeUrl: string | undefined;

    const loadPreview = async () => {
      if (!selectedFileId || isNewUpload) return;
      setIsLoading(true);
      try {
        const metaRes = await fileService.getFile(selectedFileId);
        const {
          FileIQ,
          FileType,
          FileName: serverFileName,
          FolderName,
        } = metaRes.data;

        setFileName(serverFileName);

        const downloadRes = await fileService.download({
          FileName: `${FileIQ}${FileType}`,
          FolderName,
          cacheBust: Date.now(),
        });

        const mime =
          FileType?.toLowerCase() === ".jpg" || FileType?.toLowerCase() === ".jpeg"
            ? "image/jpeg"
            : FileType?.toLowerCase() === ".png"
            ? "image/png"
            : "application/octet-stream";

        const blob = new Blob([new Uint8Array(downloadRes.data)], { type: mime });
        const url = URL.createObjectURL(blob);
        revokeUrl = url;
        setPreviewUrl(url);
      } catch (err) {
        console.error("Error loading preview:", err);
        setPreviewUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [selectedFileId, isNewUpload]);

  /* -------- helpers -------- */
  const handlePreviewUrlChange = useCallback((url: string | null) => {
    setPreviewUrl(url);
  }, []);

  const handleUploadSuccess = (inserted: InsertModel) => {
    setSelectedFileId(inserted.ID || null);
    onMetaChange?.({ metaType1: inserted.ID || null });
  };

  const handleReset = () => {
    setSelectedFileId(null);
    setFileName("");
    setPreviewUrl(null);
    setIsNewUpload(false);
    setResetCounter((c) => c + 1); // ← ریست input
    onMetaChange?.({ metaType1: null });
  };

  const handleTriggerUpload = () =>
    (document.getElementById("hidden-upload-trigger") as HTMLInputElement)?.click();

  /* -------- آپلود فایل -------- */
  const uploadFile = async (file: File) => {
    try {
      setIsLoading(true);

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["jpg", "jpeg", "png"].includes(ext || "")) {
        alert("Invalid file type. Only jpg, jpeg, png allowed.");
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
        FileSize: uploadRes.data.FileSize ?? file.size,
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
      handlePreviewUrlChange(URL.createObjectURL(file));
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Upload failed: " + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex flex-col items-center w-full mt-10">
      <div className="flex items-center gap-2 w-full">
        {isLoading ? (
          <div className="w-[32px] h-[32px] rounded-full border-4 border-t-blue-500 border-gray-300 animate-spin" />
        ) : (
          <>
            {isEditMode ? (
              <button
                type="button"
                title="Upload new file"
                onClick={handleTriggerUpload}
                className="text-white p-1 rounded bg-blue-500 hover:bg-blue-700 transition"
              >
                <FaSync size={16} />
              </button>
            ) : (
              <button
                type="button"
                title="Upload file"
                onClick={handleTriggerUpload}
                className="text-white p-1 rounded bg-green-600 hover:bg-green-700 transition"
              >
                <FaUpload size={16} />
              </button>
            )}

            {previewUrl && (
              <button
                type="button"
                title="Remove file"
                onClick={handleReset}
                className="text-white p-1 rounded bg-red-500 hover:bg-red-700 transition"
              >
                <FaTrash size={16} />
              </button>
            )}
          </>
        )}

        <DynamicInput
          name="fileName"
          type="text"
          value={fileName}
          placeholder="No file selected"
          className="flex-grow -mt-6"
          disabled
        />

        <button
          type="button"
          onClick={() => previewUrl && setIsModalOpen(true)}
          disabled={!previewUrl || isLoading}
          className={`flex items-center px-2 py-1 font-semibold rounded transition ${
            previewUrl
              ? "bg-purple-500 hover:bg-purple-700 text-white"
              : "bg-gray-400 cursor-not-allowed text-white"
          }`}
        >
          <FaEye size={16} className="mr-1" />
          Show
        </button>
      </div>

      {/* input مخفی آپلود */}
      <input
        key={resetCounter} /* ← ریست‌شونده */
        id="hidden-upload-trigger"
        type="file"
        accept=".jpg,.jpeg,.png"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
      />

      {/* مدال نمایش تصویر */}
      <DynamicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Uploaded Preview"
            className="max-w-full max-h-[80vh] mx-auto rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
            title="Click to delete the file"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Delete the uploaded file?")) {
                handleReset();
                setIsModalOpen(false);
              }
            }}
          />
        ) : (
          <p className="text-center text-gray-500">No file available to display.</p>
        )}
      </DynamicModal>
    </div>
  );
};

export default AttachFile;
