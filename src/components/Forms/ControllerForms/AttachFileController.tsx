// src/components/ControllerForms/AttachFile.tsx
import React, { useState, useEffect, useCallback } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicModal from "../../utilities/DynamicModal";
import { FaEye, FaSync, FaUpload, FaTrash } from "react-icons/fa";
import fileService from "../../../services/api.servicesFile";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";

/* ------------------------------------------------------------------ */
/* -----------------------------  Types  ----------------------------- */
/* ------------------------------------------------------------------ */
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
  onMetaChange?: (meta: { metaType1: string | null }) => void;
  data?: { metaType1?: string | null; fileName?: string };
}

/* ------------------------------------------------------------------ */
/* --------------------------- Component ----------------------------- */
/* ------------------------------------------------------------------ */
const AttachFile: React.FC<AttachFileProps> = ({ data = {}, onMetaChange }) => {
  const { t } = useTranslation();
  /* ---------------------------  State  --------------------------- */
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    data.metaType1 ?? null
  );
  const [fileName, setFileName] = useState<string>(data.fileName ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewUpload, setIsNewUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetCounter, setResetCounter] = useState(0); // ریست input

  const isEditMode = !!selectedFileId;

  /* ------------------------------------------------------------------ */
  /* ---------------------  Helpers: fetch file info  ------------------ */
  const fetchFileInfo = useCallback(
    async (openAfter = false) => {
      if (!selectedFileId) return;

      setIsLoading(true);
      let revoke: string | undefined;
      try {
        const meta = await fileService.getFile(selectedFileId);
        const {
          FileIQ,
          FileType,
          FileName: srvName,
          OriginalFileName, // در برخی APIها
          FolderName,
        } = meta.data;

        // نمایش نام
        setFileName(srvName || OriginalFileName || "");

        // دریافت فایل برای پیش‌نمایش
        const dl = await fileService.download({
          FileName: `${FileIQ}${FileType}`,
          FolderName,
          cacheBust: Date.now(),
        });

        const mime = [".jpg", ".jpeg"].includes(FileType?.toLowerCase() ?? "")
          ? "image/jpeg"
          : FileType?.toLowerCase() === ".png"
          ? "image/png"
          : "application/octet-stream";

        const blob = new Blob([new Uint8Array(dl.data)], { type: mime });
        const url = URL.createObjectURL(blob);
        revoke = url;
        setPreviewUrl(url);
        if (openAfter) setIsModalOpen(true);
      } catch (err) {
        console.error("Error fetching file info:", err);
        setPreviewUrl(null);
      } finally {
        setIsLoading(false);
        return () => revoke && URL.revokeObjectURL(revoke);
      }
    },
    [selectedFileId]
  );

  /* ------------------------------------------------------------------ */
  /* ----------  Auto‑fetch name & preview when props change  ---------- */
  useEffect(() => {
    setSelectedFileId(data.metaType1 ?? null);
    setFileName(data.fileName ?? "");
    setPreviewUrl(null);
    setIsNewUpload(false);
  }, [data.metaType1, data.fileName]);

  useEffect(() => {
    if (selectedFileId && !isNewUpload) fetchFileInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFileId, isNewUpload]);

  /* ------------------------------------------------------------------ */
  /* ---------------------  Upload Success handler  -------------------- */
  const handleUploadSuccess = (inserted: InsertModel) => {
    setSelectedFileId(inserted.ID || null);
    onMetaChange?.({ metaType1: inserted.ID || null });
  };

  /* ------------------------------------------------------------------ */
  /* ---------------------------  Reset  ------------------------------ */
  const handleReset = () => {
    setSelectedFileId(null);
    setFileName("");
    setPreviewUrl(null);
    setIsNewUpload(false);
    setResetCounter((c) => c + 1);
    onMetaChange?.({ metaType1: null });
  };

  /* ------------------------------------------------------------------ */
  /* --------------------------  Upload  ------------------------------ */
  const uploadFile = async (file: File) => {
    try {
      setIsLoading(true);
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["jpg", "jpeg", "png"].includes(ext || "")) {
        alert(t("AttachFile.Errors.InvalidType"));
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

      const up = await fileService.uploadFile(formData);
      if (!up?.status) throw new Error("Upload failed");

      const insertModel: InsertModel = {
        ID,
        FileIQ,
        FileName: generatedFileName,
        FileSize: up.data.FileSize ?? file.size,
        FolderName: folderName,
        IsVisible: true,
        LastModified: null,
        SenderID: null,
        FileType: `.${ext}`,
      };

      const ins = await fileService.insert(insertModel);
      if (!ins?.status) throw new Error("Insert failed");

      handleUploadSuccess(ins.data);
      setFileName(file.name);
      setIsNewUpload(true);
      setPreviewUrl(URL.createObjectURL(file));
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.message || "Upload failed.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------  UI  ------------------------------ */
  return (
    <div className="w-full mt-10">
      {/* ردیف اصلی: سه ستون، همه از پایین هم‌تراز */}
      <div className="grid grid-cols-[auto,1fr,auto] items-end gap-2 w-full">
        {/* ستون چپ: گروه دکمه‌ها داخل یک ظرف ثابت */}
        <div className="flex items-end gap-2">
          {isLoading ? (
            <div className="h-10 w-10 rounded-full border-4 border-t-blue-500 border-gray-300 animate-spin" />
          ) : (
            <>
              {/* آپلود یا جایگزینی */}
              <button
                type="button"
                title={
                  isEditMode
                    ? t("AttachFile.Titles.UploadNewFile")
                    : t("AttachFile.Titles.UploadFile")
                }
                onClick={() =>
                  (
                    document.getElementById("hidden-upload") as HTMLInputElement
                  )?.click()
                }
                className={`shrink-0 inline-flex items-center justify-center h-10 w-10 text-white rounded transition ${
                  isEditMode
                    ? "bg-blue-500 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isEditMode ? <FaSync size={16} /> : <FaUpload size={16} />}
              </button>

              {/* حذف فایل */}
              {selectedFileId && (
                <button
                  type="button"
                  title={t("AttachFile.Titles.RemoveFile")}
                  onClick={handleReset}
                  className="shrink-0 inline-flex items-center justify-center h-10 w-10 text-white rounded bg-red-500 hover:bg-red-700 transition"
                >
                  <FaTrash size={16} />
                </button>
              )}
            </>
          )}
        </div>

        {/* ستون وسط: اینپوت (با لیبل داخلی خودش) */}
        <div className="min-w-0">
          <DynamicInput
            // name="fileName"
            name={t("AttachFile.Labels.FileName")}
            type="text"
            value={fileName}
            placeholder={t("AttachFile.Labels.NoFileSelected")}
            className="w-full"
            disabled
          />
        </div>

        {/* ستون راست: دکمه نمایش */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={async () => {
              if (previewUrl) {
                setIsModalOpen(true);
              } else if (selectedFileId) {
                await fetchFileInfo(true); // بعد از بارگیری باز شود
              }
            }}
            disabled={!selectedFileId || isLoading}
            className={`shrink-0 inline-flex items-center gap-2 justify-center h-10 px-4 font-semibold rounded transition
            ${
              selectedFileId && !isLoading
                ? "bg-purple-500 hover:bg-purple-700 text-white"
                : "bg-gray-400 cursor-not-allowed text-white"
            }`}
          >
            <FaEye size={16} />
            {t("AttachFile.Buttons.Show")}
          </button>
        </div>
      </div>

      {/* input[file] مخفی */}
      <input
        key={resetCounter}
        id="hidden-upload"
        type="file"
        accept=".jpg,.jpeg,.png"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
      />

      {/* Modal preview */}
      <DynamicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-[80vh] mx-auto rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
            title={t("AttachFile.Titles.ClickToDelete")}
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(t("AttachFile.Messages.DeleteConfirm"))) {
                handleReset();
                setIsModalOpen(false);
              }
            }}
          />
        ) : (
          <p className="text-center text-gray-500">
            {t("AttachFile.Messages.NoFileToDisplay")}
          </p>
        )}
      </DynamicModal>
    </div>
  );
};

export default AttachFile;
