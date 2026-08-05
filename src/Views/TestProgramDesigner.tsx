// src/Views/TestProgramDesigner.tsx

import React, { useRef, useState } from "react";
import Cookies from "js-cookie";
import SpeedIcon from "@mui/icons-material/Speed";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import CircularProgress from "@mui/material/CircularProgress";
import ProgramDesignerGrid, {
  PROGRAM_DESIGNER_TOGGLEABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMN_KEYS,
} from "../components/Programs/ProgramTemplate/ProgramDesignerGrid";
import AddEditProgramField from "../components/Programs/ProgramTemplate/AddEditProgramField";
import HealthCheckPanel from "../components/Programs/ProgramTemplate/Healthcheckpanel";
import DynamicConfirm from "../components/utilities/DynamicConfirm";
import { showAlert } from "../components/utilities/Alert/DynamicAlert";
import { useProgramDesigner } from "../context/ProgramDesignerContext";
import {
  SinglePFI,
  ProgramValidationResult,
} from "../services/programDesigner/types";

interface SelectedRowInfo {
  ID: string;
  GPIC: string;
  ActivityType: string;
}

const TestProgramDesigner: React.FC = () => {
  // ⚠️ موقتی: فقط برای تست، بعداً از selectedRow واقعی گرفته می‌شود
  const TEST_PROGRAM_TEMPLATE_ID = 2063;

  const {
    getSinglePFI,
    deleteOneProgramFieldTemplate,
    checkValidation,
    getExcelTemplate,
    downloadFile,
    uploadFile,
    insertFileRecord,
    importExcelTemplate,
    checkIsWaitingForEngine,
  } = useProgramDesigner();

  const [selectedRow, setSelectedRow] = useState<SelectedRowInfo | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalParentGPIC, setModalParentGPIC] = useState<string | null>(null);
  const [modalInitialData, setModalInitialData] = useState<SinglePFI | null>(
    null
  );

  // ================== Delete Row ==================
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteRowClick = () => {
    if (!selectedRow) {
      setWarningMessage("لطفاً ابتدا یک ردیف را انتخاب کنید.");
      return;
    }
    setWarningMessage(null);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDeleteRow = async () => {
    if (!selectedRow) {
      setShowDeleteConfirm(false);
      return;
    }
    setIsDeleting(true);
    try {
      await deleteOneProgramFieldTemplate(Number(selectedRow.ID));
      setSelectedRow(null);
      setRefreshKey((k) => k + 1);
      showAlert(
        "success",
        null,
        "Delete",
        "Row has been deleted successfully."
      );
    } catch (err: any) {
      console.error("Delete failed:", err);
      showAlert(
        "error",
        null,
        "Error",
        err?.response?.data?.toString() ||
          err?.message ||
          "خطا در حذف ردیف."
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // ================== Column Chooser ==================
  const [isColumnChooserOpen, setIsColumnChooserOpen] = useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<Set<string>>(
    new Set(DEFAULT_VISIBLE_COLUMN_KEYS)
  );

  const handleToggleColumn = (key: string) => {
    setVisibleColumnKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // ================== Health Check ==================
  const [isHealthCheckOpen, setIsHealthCheckOpen] = useState(false);
  const [isLoadingHealthCheck, setIsLoadingHealthCheck] = useState(false);
  const [healthCheckResult, setHealthCheckResult] =
    useState<ProgramValidationResult | null>(null);
  const [healthCheckError, setHealthCheckError] = useState<string | null>(
    null
  );

  const runHealthCheck = async () => {
    setIsLoadingHealthCheck(true);
    setHealthCheckError(null);
    try {
      const result = await checkValidation(TEST_PROGRAM_TEMPLATE_ID);
      setHealthCheckResult(result);
    } catch (err: any) {
      console.error("Health check failed:", err);
      setHealthCheckError("خطا در دریافت اطلاعات سلامت برنامه.");
      setHealthCheckResult(null);
    } finally {
      setIsLoadingHealthCheck(false);
    }
  };

  const handleToggleHealthCheck = () => {
    if (isHealthCheckOpen) {
      setIsHealthCheckOpen(false);
      return;
    }
    setIsHealthCheckOpen(true);
    runHealthCheck();
  };

  // ================== Export ==================
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const { FileName, FolderName } = await getExcelTemplate(
        TEST_PROGRAM_TEMPLATE_ID
      );
      const blob = await downloadFile(FileName, FolderName);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = FileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      showAlert(
        "success",
        null,
        "Export",
        "Export has completed successfully."
      );
    } catch (err) {
      console.error("Export failed:", err);
      setExportError("خطا در دریافت فایل خروجی اکسل.");
    } finally {
      setIsExporting(false);
    }
  };

  // ================== Import ==================
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isWaitingForEngine, setIsWaitingForEngine] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleImportButtonClick = () => {
    importInputRef.current?.click();
  };

  // Polling: هر ۳ ثانیه CheckIsWaitingForEngine را می‌پرسیم تا false برگردد
  // (یعنی موتور پردازش تمام شده). حداکثر ~۲ دقیقه صبر می‌کنیم تا گیر نکند.
  // در صورت timeout، Error پرتاب می‌شود تا catch بیرونی آن را مدیریت کند.
  const waitForEngine = async () => {
    setIsWaitingForEngine(true);
    const maxAttempts = 40;
    try {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const isWaiting = await checkIsWaitingForEngine(
          TEST_PROGRAM_TEMPLATE_ID
        );
        if (!isWaiting) return;
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      throw new Error(
        "پردازش موتور بیش از حد انتظار طول کشید. لطفاً بعداً گرید را رفرش کنید."
      );
    } finally {
      setIsWaitingForEngine(false);
    }
  };

  const handleImportFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // تا انتخاب مجدد همان فایل هم onChange را دوباره صدا بزند
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    try {
      // مرحله ۱: آپلود فایل خام
      // ✅ FileIQ توسط خودِ uploadFile (کلاینت) ساخته می‌شود، نه از پاسخ سرور
      const uploadResult = await uploadFile(file);
      const fileIQ = uploadResult.fileIQ;

      const userId = Cookies.get("userId");
      if (!userId) {
        throw new Error(
          "شناسه‌ی کاربر (userId) یافت نشد. لطفاً دوباره وارد شوید."
        );
      }

      // مرحله ۲: ثبت متادیتای فایل → یک ID واقعی و نهایی از سرور برمی‌گردد
      // (این ID با FileIQ فرق دارد و همان چیزی است که باید به Import برود)
      const insertResult = await insertFileRecord({
        FileIQ: fileIQ,
        FileName: file.name,
        FolderName: "prgdes",
        FileSize: file.size,
        FileType: file.name.substring(file.name.lastIndexOf(".")),
        ID: crypto.randomUUID(),
        IsVisible: true,
        LastModified: null,
        SenderID: userId,
      });

      const fileId = insertResult.ID;
      if (!fileId) {
        throw new Error("ID نهایی فایل از پاسخ Insert دریافت نشد.");
      }

      // مرحله ۳: اجرای Import
      const postId = Cookies.get("userPostId");
      if (!postId) {
        throw new Error(
          "PostID کاربر یافت نشد (userPostId). لطفاً دوباره وارد شوید."
        );
      }

      await importExcelTemplate({
        FileID: fileId,
        IsForceEdit: true,
        PostID: postId,
        ProgramID: TEST_PROGRAM_TEMPLATE_ID,
      });

      // مرحله ۴: صبر تا موتور پردازش تمام شود، سپس رفرش گرید
      await waitForEngine();
      setRefreshKey((k) => k + 1);

      showAlert(
        "success",
        null,
        "Import",
        "Import has completed successfully."
      );
    } catch (err: any) {
      console.error("Import failed:", err);
      setImportError(
        err?.response?.data?.toString() ||
          err?.message ||
          "خطا در وارد کردن فایل اکسل."
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleRowSelect = (row: any) => {
    setSelectedRow({
      ID: row.ID,
      GPIC: row.GPIC,
      ActivityType: row["Activity Type"],
    });
    setWarningMessage(null);
  };

  const handleAddRoot = () => {
    setModalMode("add");
    setModalParentGPIC(null);
    setModalInitialData(null);
    setModalOpen(true);
  };

  const handleAddChildForInFPP = () => {
    if (!selectedRow) {
      setWarningMessage("لطفاً ابتدا یک ردیف را انتخاب کنید.");
      return;
    }
    if (selectedRow.ActivityType !== "InFPP") {
      setWarningMessage(
        "برای افزودن زیرمجموعه، ردیف انتخاب‌شده باید از نوع InFPP باشد."
      );
      return;
    }
    setWarningMessage(null);
    setModalMode("add");
    setModalParentGPIC(selectedRow.GPIC);
    setModalInitialData(null);
    setModalOpen(true);
  };

  // parentGPIC: والد واقعی همین ردیف در درخت (از ProgramDesignerGrid می‌آید)
  const handleRowDoubleClick = async (row: any, parentGPIC: string | null) => {
    const fullData = await getSinglePFI(Number(row.ID));
    setModalMode("edit");
    setModalParentGPIC(parentGPIC);
    setModalInitialData(fullData);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setRefreshKey((k) => k + 1);
  };

  const isBusyWithImport = isImporting || isWaitingForEngine;

  return (
    <div className="p-6" dir="rtl">
      <h2 className="text-lg font-bold mb-4 text-purple-700">
        تست Program Designer (ProgramTemplateID = {TEST_PROGRAM_TEMPLATE_ID})
      </h2>

      {/* ================== نوار ابزار بالای جدول ==================
          سه ستون: [آیکون‌های Import/Export - سمت چپ]
                   [دکمه‌های افزودن/حذف ردیف - وسط‌چین]
                   [آیکون‌های تست سرعت/Column Chooser - سمت راست] */}
      <div
        className="grid grid-cols-[auto_1fr_auto] items-center gap-2 mb-3"
        dir="ltr"
      >
        <div className="flex items-center gap-2 justify-self-start">
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportFileSelected}
            style={{ display: "none" }}
          />

          <button
            onClick={handleExport}
            disabled={isExporting}
            title="Export Excel"
            className="w-9 h-9 flex items-center justify-center rounded-full border bg-white text-purple-600 border-purple-300 hover:bg-purple-50 disabled:opacity-50 transition"
          >
            {isExporting ? (
              <CircularProgress size={16} />
            ) : (
              <CloudDownloadIcon sx={{ fontSize: 20 }} />
            )}
          </button>

          <button
            onClick={handleImportButtonClick}
            disabled={isBusyWithImport}
            title="Import Excel"
            className="w-9 h-9 flex items-center justify-center rounded-full border bg-white text-purple-600 border-purple-300 hover:bg-purple-50 disabled:opacity-50 transition"
          >
            {isBusyWithImport ? (
              <CircularProgress size={16} />
            ) : (
              <CloudUploadIcon sx={{ fontSize: 20 }} />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 justify-center">
          <button
            onClick={handleAddChildForInFPP}
            className="px-4 py-2 bg-pink-500 text-white text-sm rounded hover:bg-pink-600"
          >
            + Add Row For InFPP
          </button>
          <button
            onClick={handleAddRoot}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
          >
            + Add Row
          </button>
          <button
            onClick={handleDeleteRowClick}
            disabled={!selectedRow}
            title="حذف ردیف"
            className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <DeleteIcon sx={{ fontSize: 18 }} />
            Delete Row
          </button>
        </div>

        <div className="flex items-center gap-2 justify-self-end relative">
          <button
            onClick={handleToggleHealthCheck}
            title=""
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition ${
              isHealthCheckOpen
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-purple-600 border-purple-300 hover:bg-purple-50"
            }`}
          >
            <SpeedIcon sx={{ fontSize: 20 }} />
          </button>

          <button
            onClick={() => setIsColumnChooserOpen((o) => !o)}
            title="انتخاب ستون‌ها"
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition ${
              isColumnChooserOpen
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-purple-600 border-purple-300 hover:bg-purple-50"
            }`}
          >
            <ViewColumnIcon sx={{ fontSize: 20 }} />
          </button>

          {isColumnChooserOpen && (
            <div
              dir="rtl"
              className="absolute top-11 right-0 z-20 w-64 max-h-80 overflow-y-auto bg-white border border-purple-200 rounded-lg shadow-lg p-3 space-y-1"
            >
              {PROGRAM_DESIGNER_TOGGLEABLE_COLUMNS.map((col) => (
                <label
                  key={col.key as string}
                  className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumnKeys.has(col.key as string)}
                    onChange={() => handleToggleColumn(col.key as string)}
                    className="w-4 h-4 accent-purple-600"
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================== پیام‌های وضعیت Import/Export ================== */}
      {isWaitingForEngine && (
        <div className="mb-3 flex items-center justify-center gap-2 py-2 text-gray-500 text-sm">
          <CircularProgress size={16} />
          در حال پردازش فایل توسط موتور برنامه... لطفاً صبر کنید.
        </div>
      )}
      {importError && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-300 text-red-600 text-sm rounded">
          {importError}
        </div>
      )}
      {exportError && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-300 text-red-600 text-sm rounded">
          {exportError}
        </div>
      )}

      {/* ================== پنل نتایج Health Check ================== */}
      {isHealthCheckOpen &&
        (isLoadingHealthCheck ? (
          <div className="mb-3 flex items-center justify-center gap-2 py-4 text-gray-400 text-sm">
            <CircularProgress size={16} />
            در حال بررسی سلامت برنامه...
          </div>
        ) : healthCheckError ? (
          <div className="mb-3 px-3 py-2 bg-red-50 border border-red-300 text-red-600 text-sm rounded">
            {healthCheckError}
          </div>
        ) : healthCheckResult ? (
          <HealthCheckPanel result={healthCheckResult} />
        ) : null)}

      {warningMessage && (
        <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-300 text-yellow-700 text-sm rounded">
          {warningMessage}
        </div>
      )}

      <ProgramDesignerGrid
        programTemplateId={TEST_PROGRAM_TEMPLATE_ID}
        onRowSelect={handleRowSelect}
        onRowDoubleClick={handleRowDoubleClick}
        selectedRowId={selectedRow?.GPIC ?? null}
        refreshKey={refreshKey}
        visibleColumnKeys={visibleColumnKeys}
      />

      {modalOpen && (
        <AddEditProgramField
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          mode={modalMode}
          mainProgramId={TEST_PROGRAM_TEMPLATE_ID}
          parentGPIC={modalParentGPIC}
          initialData={modalInitialData}
          onSaved={handleSaved}
        />
      )}

      <DynamicConfirm
        isOpen={showDeleteConfirm}
        onConfirm={handleConfirmDeleteRow}
        onClose={() => setShowDeleteConfirm(false)}
        variant="delete"
        title="Delete Confirmation"
        message={
          isDeleting
            ? "در حال حذف..."
            : "آیا از حذف این ردیف مطمئن هستید؟"
        }
      />
    </div>
  );
};

export default TestProgramDesigner;