import React, { useState, useEffect } from "react";
import fileService from "../../../services/api.servicesFile";

interface WordPanelViewProps {
  data?: {
    DisplayName?: string;
    metaType4?: string;
    fileName?: string;
  };
}

const WordPanelView: React.FC<WordPanelViewProps> = ({ data }) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(data?.metaType4 || null);
  const [fileName, setFileName] = useState<string>(data?.fileName || "");

  useEffect(() => {
    if (selectedFileId) {
      fileService
        .getFile(selectedFileId)
        .then((res) => {
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
      alert("No file to download.");
      return;
    }
    try {
      const infoRes = await fileService.getFile(selectedFileId);
      const { FileIQ, FileType, FolderName, FileName } = infoRes.data;
      const downloadingFileObject = {
        FileName: FileIQ + FileType, // مثلاً 123e4567.doc
        FolderName: FolderName,
        cacheBust: Date.now(),
      };
      const downloadRes = await fileService.download(downloadingFileObject);
      const uint8Array = new Uint8Array(downloadRes.data);
      let mimeType = "application/octet-stream";
      if (FileType === ".doc") {
        mimeType = "application/msword";
      } else if (FileType === ".docx") {
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      }
      const blob = new Blob([uint8Array], { type: mimeType });
      const blobUrl = (window.URL || window.webkitURL).createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = FileName;
      link.click();
      (window.URL || window.webkitURL).revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file.");
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
        Show Document
      </button>
    </div>
  );
};

export default WordPanelView;
