// src/components/WordPanelView.tsx
import React, { useState, useEffect } from "react";
import fileService from "../../../services/api.servicesFile";
import { useTranslation } from "react-i18next";

interface WordPanelViewProps {
  data?: {
    DisplayName?: string;
    metaType4?: string;
    fileName?: string;
  };
  /** از FormGeneratorView پاس داده می‌شود؛ فقط همین کنترل RTL/LTR شود */
  rtl?: boolean;
}

const WordPanelView: React.FC<WordPanelViewProps> = ({ data, rtl = false }) => {
  const { t } = useTranslation();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    data?.metaType4 || null
  );
  const [fileName, setFileName] = useState<string>(data?.fileName || "");

  useEffect(() => {
    if (selectedFileId) {
      fileService
        .getFile(selectedFileId)
        .then((res) => setFileName(res.data.FileName))
        .catch((err) => console.error("Error fetching file info:", err));
    } else {
      setFileName("");
    }
  }, [selectedFileId]);

  const handleDownloadFile = async () => {
    if (!selectedFileId) {
      alert(t("wordpanel.View.Alerts.NoFileToDownload"));
      return;
    }
    try {
      const infoRes = await fileService.getFile(selectedFileId);
      const { FileIQ, FileType, FolderName, FileName } = infoRes.data;

      const downloadingFileObject = {
        FileName: FileIQ + FileType,
        FolderName,
        cacheBust: Date.now(),
      };
      const downloadRes = await fileService.download(downloadingFileObject);
      const uint8Array = new Uint8Array(downloadRes.data);

      let mimeType = "application/octet-stream";
      if (FileType === ".doc") mimeType = "application/msword";
      else if (FileType === ".docx")
        mimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      const blob = new Blob([uint8Array], { type: mimeType });
      const blobUrl = (window.URL || window.webkitURL).createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = FileName;
      link.click();
      (window.URL || window.webkitURL).revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert(t("wordpanel.View.Alerts.DownloadFailed"));
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
          {t("wordpanel.View.CurrentFile")}: {fileName}
        </div>
      )}

      {/* دکمه دانلود */}
      <div>
        <button
          type="button"
          onClick={handleDownloadFile}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {t("wordpanel.View.ButtonShowDocument")}
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

export default WordPanelView;
