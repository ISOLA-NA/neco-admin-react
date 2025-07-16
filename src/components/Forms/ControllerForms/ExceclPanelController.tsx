// ExcelPanel.tsx
import React, { useState, useEffect, useCallback } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { FaTrash, FaDownload, FaSync, FaUpload } from "react-icons/fa";
import fileService from "../../../services/api.servicesFile";
import { v4 as uuidv4 } from "uuid";

/* ------------------------------------------------------------------ */
/* ----------------------------- Types ------------------------------- */
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

interface ExcelPanelProps {
  onMetaChange?: (meta: any) => void;
  data?: {
    metaType1?: string | null; // Guid
    fileName?: string;         // نام اصلی فایل (اختیاری است)
  };
}

/* ------------------------------------------------------------------ */
/* --------------------------- Component ----------------------------- */
/* ------------------------------------------------------------------ */
const ExcelPanel: React.FC<ExcelPanelProps> = ({ data = {}, onMetaChange }) => {
  /* -------------------------  Local state  ------------------------- */
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    data.metaType1 ?? null
  );
  const [fileName, setFileName] = useState<string>(data.fileName ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUpload, setIsNewUpload] = useState(false); // وقتی کاربر همین الان فایل را آپلود کرده
  const [resetCounter, setResetCounter] = useState(0);   // برای ریست input [type=file]

  const isEditMode = !!data.metaType1; // رکورد موجود (ویرایش)

  /* ---------------------  Sync incoming props → state  -------------------- */
  useEffect(() => {
    setSelectedFileId(data.metaType1 ?? null);
    setFileName(data.fileName ?? "");
    // اگر کاربر بیرون از این کامپوننت metaType1 را تغییر دهد،
    // isNewUpload باید false شود تا useEffect بعدی بتواند فایل را واکشی کند.
    setIsNewUpload(false);
  }, [data.metaType1, data.fileName]);

  /* --------------------  Fetch file‑info (edit mode) --------------------- */
  /**
   * اگر در حالت ویرایش هستیم و fileName هنوز مشخص نیست
   * (یا به‌هر دلیل کاربر در بار اول فایل را ندیده)،
   * اطلاعات فایل را از سرور می‌گیریم
   */
  useEffect(() => {
    if (!selectedFileId || isNewUpload || fileName) return; // چیزی برای واکشی وجود ندارد
    let ignore = false;

    (async () => {
      try {
        const res = await fileService.getFile(selectedFileId);
        if (!ignore) {
          // بعضی API ها نام اصلی را در OriginalFileName برمی‌گردانند
          setFileName(res.data.FileName || res.data.OriginalFileName || "");
        }
      } catch (err) {
        console.error("Error fetching file info:", err);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [selectedFileId, isNewUpload, fileName]);

  /* -----------------  Helpers: emit meta changes upstream  -------------- */
  const emitMeta = useCallback(
    (extra: any) => {
      if (onMetaChange) {
        onMetaChange({ ...data, ...extra });
      }
    },
    [onMetaChange, data]
  );

  /* --------------------------  File upload ----------------------------- */
  const uploadFile = async (file: File) => {
    try {
      setIsLoading(true);

      /* ---- validate extension ---- */
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["xls", "xlsx"].includes(ext || "")) {
        alert("Only .xls or .xlsx files are allowed.");
        return;
      }

      /* ---- generate IDs ---- */
      const ID = uuidv4();
      const FileIQ = uuidv4();
      const folderName = new Date().toISOString().split("T")[0];
      const generatedFileName = `${FileIQ}.${ext}`;

      /* ---- upload physical file ---- */
      const formData = new FormData();
      formData.append("FileName", generatedFileName);
      formData.append("FolderName", folderName);
      formData.append("file", file);

      const uploadRes = await fileService.uploadFile(formData);
      if (!uploadRes?.status) throw new Error("Upload failed");

      /* ---- insert DB record ---- */
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

      /* ---- success ---- */
      setSelectedFileId(insertRes.data.ID!);
      setFileName(file.name);
      setIsNewUpload(true);
      emitMeta({ metaType1: insertRes.data.ID });
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.message || "Upload failed.");
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------  Remove / Reset --------------------------- */
  const handleReset = () => {
    setSelectedFileId(null);
    setFileName("");
    setIsNewUpload(false);
    setResetCounter((c) => c + 1);
    emitMeta({ metaType1: null });
  };

  /* ------------------------  Download existing file --------------------- */
  const handleDownloadFile = async () => {
    if (!selectedFileId) return alert("No file to download.");
    setIsLoading(true);
    try {
      const info = await fileService.getFile(selectedFileId);
      const { FileIQ, FileType, FolderName, FileName } = info.data;

      const dl = await fileService.download({
        FileName: FileIQ + FileType,
        FolderName,
        cacheBust: Date.now(),
      });

      const mime =
        FileType === ".xls"
          ? "application/vnd.ms-excel"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([new Uint8Array(dl.data)], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = FileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file.");
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------  UI  -------------------------------- */
  return (
    <div className="flex flex-col items-center w-full mt-10">
      {/* -------------- Action buttons + filename field -------------- */}
      <div className="flex items-center gap-2 w-full">
        {/* loading spinner */}
        {isLoading ? (
          <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 border-gray-300 animate-spin" />
        ) : (
          <>
            {/* ► ویرایش: امکان «جایگزینی» فایل با یک فایل جدید */}
            {selectedFileId && isEditMode && (
              <button
                type="button"
                title="Upload new file"
                onClick={() =>
                  (document.getElementById("hidden-upload") as HTMLInputElement)?.click()
                }
                className="text-white p-1 rounded bg-blue-500 hover:bg-blue-700 transition"
              >
                <FaSync size={16} />
              </button>
            )}

            {/* ► ایجاد رکورد جدید: آپلود اولیه */}
            {!isEditMode && !selectedFileId && (
              <button
                type="button"
                title="Upload file"
                onClick={() =>
                  (document.getElementById("hidden-upload") as HTMLInputElement)?.click()
                }
                className="text-white p-1 rounded bg-green-600 hover:bg-green-700 transition"
              >
                <FaUpload size={16} />
              </button>
            )}

            {/* ► حذف فایل (فقط در ایجاد رکورد جدید) */}
            {selectedFileId && !isEditMode && (
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

        {/* فیلد نام فایل */}
        <DynamicInput
          name="fileName"
          type="text"
          value={fileName || ""}
          placeholder="No file selected"
          className="flex-grow"
          disabled
        />

        {/* دکمه دانلود */}
        <button
          type="button"
          onClick={handleDownloadFile}
          className={`flex items-center px-3 py-2 text-sm font-semibold rounded transition
            ${
              selectedFileId && !isLoading
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-400 cursor-not-allowed text-white"
            }`}
          disabled={!selectedFileId || isLoading}
        >
          <FaDownload size={16} className="mr-2" />
          Download
        </button>
      </div>

      {/* input [type=file] پنهان */}
      <input
        key={resetCounter} // هر بار reset می‌شود تا فایل قبلی قابل انتخاب دوباره باشد
        id="hidden-upload"
        type="file"
        accept=".xls,.xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
      />
    </div>
  );
};

export default ExcelPanel;
