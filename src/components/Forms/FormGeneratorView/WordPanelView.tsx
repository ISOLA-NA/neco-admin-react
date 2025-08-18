import React, { useState, useEffect } from "react";
import fileService from "../../../services/api.servicesFile";
import { useTranslation } from "react-i18next";

interface WordPanelViewProps {
  data?: {
    DisplayName?: string;
    metaType4?: string;
    fileName?: string;
  };
}

const WordPanelView: React.FC<WordPanelViewProps> = ({ data }) => {
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
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-gray-300">
      <div className="mb-4 text-xl font-bold text-gray-800">
        {data?.DisplayName || ""}
      </div>
      <button
        type="button"
        onClick={handleDownloadFile}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        {t("wordpanel.View.ButtonShowDocument")}
      </button>
    </div>
  );
};

export default WordPanelView;
