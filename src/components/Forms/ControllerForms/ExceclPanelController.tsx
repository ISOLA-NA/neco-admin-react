// ExcelPanel.tsx
import React, { useState, useEffect, useCallback } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { FaTrash, FaDownload, FaSync, FaUpload } from "react-icons/fa";
import fileService from "../../../services/api.servicesFile";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";

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
    fileName?: string; // نام اصلی فایل (اختیاری است)
  };
}

/* ------------------------------------------------------------------ */
/* --------------------------- Component ----------------------------- */
/* ------------------------------------------------------------------ */
const ExcelPanel: React.FC<ExcelPanelProps> = ({ data = {}, onMetaChange }) => {
  const { t } = useTranslation();

  /* -------------------------  Local state  ------------------------- */
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    data.metaType1 ?? null
  );
  const [fileName, setFileName] = useState<string>(data.fileName ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUpload, setIsNewUpload] = useState(false); // وقتی کاربر همین الان فایل را آپلود کرده
  const [resetCounter, setResetCounter] = useState(0); // برای ریست input [type=file]

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
        alert(t("excelpanel.Alerts.OnlyExcelAllowed"));
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
    if (!selectedFileId) return alert(t("excelpanel.Alerts.DownloadFailed"));

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
    <div className="w-full mt-10">
      {/* ردیف اصلی: سه ستون (دکمه‌های چپ / اینپوت / دکمه دانلود) */}
      <div className="grid grid-cols-[auto,1fr,auto] items-end gap-2 w-full">
        {/* ستون چپ: اکشن‌ها با عرض ثابت تا پرش نداشته باشد */}
        <div className="flex gap-2 self-end shrink-0 w-[88px]">
          {isLoading ? (
            <div className="h-10 w-10 rounded-full border-4 border-t-blue-500 border-gray-300 animate-spin" />
          ) : (
            <>
              {/* جایگزینی فایل (ویرایش) */}
              {selectedFileId && isEditMode && (
                <button
                  type="button"
                  title={t("excelpanel.Tooltips.UploadNew")}
                  onClick={() =>
                    (
                      document.getElementById(
                        "hidden-upload"
                      ) as HTMLInputElement
                    )?.click()
                  }
                  className="inline-flex items-center justify-center h-10 w-10 text-white rounded bg-blue-500 hover:bg-blue-700 transition"
                >
                  <FaSync size={16} />
                </button>
              )}

              {/* آپلود اولیه (ایجاد) */}
              {!isEditMode && !selectedFileId && (
                <button
                  type="button"
                  title={t("excelpanel.Tooltips.Upload")}
                  onClick={() =>
                    (
                      document.getElementById(
                        "hidden-upload"
                      ) as HTMLInputElement
                    )?.click()
                  }
                  className="inline-flex items-center justify-center h-10 w-10 text-white rounded bg-green-600 hover:bg-green-700 transition"
                >
                  <FaUpload size={16} />
                </button>
              )}

              {/* حذف فایل (ایجاد) */}
              {selectedFileId && !isEditMode && (
                <button
                  type="button"
                  title={t("excelpanel.Tooltips.Remove")}
                  onClick={handleReset}
                  className="inline-flex items-center justify-center h-10 w-10 text-white rounded bg-red-500 hover:bg-red-700 transition"
                >
                  <FaTrash size={16} />
                </button>
              )}
            </>
          )}
        </div>

        {/* ستون وسط: اینپوت نام فایل (لیبل + اینپوت داخل خودش) */}
        <div className="min-w-0 self-end">
          <DynamicInput
            name={t("excelpanel.Labels.FileName")}
            type="text"
            value={fileName || ""}
            placeholder={t("excelpanel.Placeholders.NoFileSelected")}
            className="w-full"
            disabled
          />
        </div>

        {/* ستون راست: دکمه دانلود */}
        <div className="self-end shrink-0">
          <button
            type="button"
            onClick={handleDownloadFile}
            disabled={!selectedFileId || isLoading}
            className={`inline-flex items-center gap-2 justify-center h-10 px-4 text-sm font-semibold rounded transition ${
              selectedFileId && !isLoading
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-400 cursor-not-allowed text-white"
            }`}
          >
            <FaDownload size={16} />
            {t("excelpanel.Buttons.Download")}
          </button>
        </div>
      </div>

      {/* input[type=file] پنهان */}
      <input
        key={resetCounter}
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
