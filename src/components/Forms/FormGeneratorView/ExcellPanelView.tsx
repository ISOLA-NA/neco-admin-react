// src/components/ExcelPanelView.tsx
import React, { useState, useEffect } from "react";
import fileService from "../../../services/api.servicesFile";
import { useTranslation } from "react-i18next";

interface ExcelPanelViewProps {
  data?: {
    DisplayName?: string;
    PersianName?: string;
    metaType4?: string;
    fileName?: string;
  };
  isFaMode?: boolean;
}

const ExcelPanelView: React.FC<ExcelPanelViewProps> = ({
  data,
  isFaMode = false,
}) => {
  const { t } = useTranslation();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    data?.metaType4 || null
  );
  const [fileName, setFileName] = useState<string>(data?.fileName || "");

  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || ""
    : data?.DisplayName || data?.PersianName || "";

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
      alert("No file to download.");
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
      const blobUrl = (window.URL || window.webkitURL).createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = FileName;
      link.click();
      (window.URL || window.webkitURL).revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Failed to download file.");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-gray-300"
      dir={isFaMode ? "rtl" : "ltr"}
    >
      {label && (
        <div className="mb-4 text-xs font-semibold text-gray-800">{label}</div>
      )}
      <button
        type="button"
        onClick={handleDownloadFile}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        {t("excelpanel.Labels.ShowDocument")}
      </button>
    </div>
  );
};

export default ExcelPanelView;