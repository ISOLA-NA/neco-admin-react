// src/components/ExcelPanelView.tsx
import React, { useState, useEffect } from "react";
import fileService from "../../../services/api.servicesFile";
import { useTranslation } from "react-i18next";

interface ExcelPanelViewProps {
  data?: {
    DisplayName?: string;
    metaType4?: string; // شناسه فایل اکسل آپلود شده
    fileName?: string;
  };
  /** از FormGeneratorView پاس داده می‌شود؛ فقط همین کنترل RTL/LTR شود */
  rtl?: boolean;
}

const ExcelPanelView: React.FC<ExcelPanelViewProps> = ({
  data,
  rtl = false,
}) => {
  const { t } = useTranslation();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    data?.metaType4 || null
  );
  const [fileName, setFileName] = useState<string>(data?.fileName || "");

  useEffect(() => {
    if (selectedFileId) {
      fileService
        .getFile(selectedFileId)
        .then((res) => {
          // فرض بر این است که res.data شامل FileName می‌باشد
          setFileName(res.data.FileName);
        })
        .catch((err) => {
          console.error("Error fetching file info:", err);
        });
    } else {
      setFileName("");
    }
  }, [selectedFileId]);

  const handleDownloadFile = async () => {
    if (!selectedFileId) {
      alert(t("excelpanel.Alerts.NoFileToDownload") || "No file to download.");
      return;
    }
    try {
      const infoRes = await fileService.getFile(selectedFileId);
      const { FileIQ, FileType, FolderName, FileName } = infoRes.data;

      const downloadingFileObject = {
        FileName: FileIQ + FileType,
        FolderName: FolderName,
        cacheBust: Date.now(),
      };

      const downloadRes = await fileService.download(downloadingFileObject);
      const uint8Array = new Uint8Array(downloadRes.data);

      let mimeType = "application/octet-stream";
      if (FileType === ".xls") {
        mimeType = "application/vnd.ms-excel";
      } else if (FileType === ".xlsx") {
        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      }

      const blob = new Blob([uint8Array], { type: mimeType });
      const blobUrl = (window.URL || (window as any).webkitURL).createObjectURL(
        blob
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = FileName;
      link.click();
      (window.URL || (window as any).webkitURL).revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert(
        t("excelpanel.Alerts.DownloadFailed") || "Failed to download file."
      );
    }
  };

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="flex flex-col p-6 bg-white rounded-lg border border-gray-300"
      style={{
        unicodeBidi: "plaintext",
        textAlign: rtl ? "right" : "left",
      }}
    >
      {/* عنوان پانل */}
      {!!data?.DisplayName && (
        <div className="mb-4 text-xl font-bold text-gray-800">
          {data.DisplayName}
        </div>
      )}

      {/* نام فایل (اختیاری) */}
      {fileName && (
        <div className="mb-3 text-sm text-gray-600">
          {t("excelpanel.Labels.CurrentFile") || "Current file"}: {fileName}
        </div>
      )}

      {/* دکمه دانلود */}
      <div>
        <button
          type="button"
          onClick={handleDownloadFile}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {t("excelpanel.Labels.ShowDocument")}
        </button>
      </div>

      {/* اصلاحات جزئی فاصله‌ها در حالت RTL (فقط همین کنترل) */}
      <style>
        {`
          [dir="rtl"] .ml-2 { margin-right: .5rem; margin-left: 0; }
          [dir="rtl"] .mr-2 { margin-left: .5rem; margin-right: 0; }
        `}
      </style>
    </div>
  );
};

export default ExcelPanelView;
