import React, { useRef, useState } from "react";
import { FiTrash2, FiDownload, FiLoader } from "react-icons/fi";

interface UploadFilesPanelProps {
  onWordUpload: (file: File) => Promise<any>;
  onExcelUpload: (file: File) => Promise<any>;
  wordFileName: string;
  excelFileName: string;
  onDeleteWord: () => void;
  onDeleteExcel: () => void;
  onDownloadWord?: () => void;
  onDownloadExcel?: () => void;
}

const UploadFilesPanel: React.FC<UploadFilesPanelProps> = ({
  onWordUpload,
  onExcelUpload,
  wordFileName,
  excelFileName,
  onDeleteWord,
  onDeleteExcel,
  onDownloadWord,
  onDownloadExcel,
}) => {
  const wordInputRef = useRef<HTMLInputElement | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);

  const [wordLoading, setWordLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  const handleWordClick = () => wordInputRef.current?.click();
  const handleExcelClick = () => excelInputRef.current?.click();

  const handleWordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setWordLoading(true);
      await onWordUpload(file);
    } catch (err) {
      console.error("Error uploading Word file:", err);
    } finally {
      setWordLoading(false);
      // اجازه انتخاب دوباره همان فایل
      e.target.value = "";
    }
  };

  const handleExcelChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setExcelLoading(true);
      await onExcelUpload(file);
    } catch (err) {
      console.error("Error uploading Excel file:", err);
    } finally {
      setExcelLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-wrap items-start gap-6">
      {/* ====== Word block ====== */}
      <div className="flex flex-col items-start gap-2 min-w-0">
        <button
          type="button"
          onClick={handleWordClick}
          disabled={wordLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {wordLoading && <FiLoader className="animate-spin" size={18} />}
          {wordFileName ? "Change Word File" : "Upload Word File"}
        </button>

        {/* info row (small) */}
        <div className="flex items-center gap-2 text-xs text-gray-700 min-w-0">
          {wordFileName ? (
            <>
              <button
                type="button"
                onClick={onDownloadWord}
                className="p-1 border border-gray-300 rounded hover:bg-gray-50 transition"
                title="Download Word File"
                aria-label="Download Word File"
              >
                <FiDownload size={14} />
              </button>
              <span className="max-w-[180px] truncate">{wordFileName}</span>
              <button
                type="button"
                onClick={onDeleteWord}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                title="Delete Word File"
                aria-label="Delete Word File"
              >
                <FiTrash2 size={14} />
              </button>
            </>
          ) : (
            <span className="text-gray-400">No Word file selected</span>
          )}
        </div>

        <input
          type="file"
          accept=".doc,.docx"
          ref={wordInputRef}
          className="hidden"
          onChange={handleWordChange}
        />
      </div>

      {/* ====== Excel block ====== */}
      <div className="flex flex-col items-start gap-2 min-w-0">
        <button
          type="button"
          onClick={handleExcelClick}
          disabled={excelLoading}
          className="bg-pink-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {excelLoading && <FiLoader className="animate-spin" size={18} />}
          {excelFileName ? "Change Excel File" : "Upload Excel File"}
        </button>

        {/* info row (small) */}
        <div className="flex items-center gap-2 text-xs text-gray-700 min-w-0">
          {excelFileName ? (
            <>
              <button
                type="button"
                onClick={onDownloadExcel}
                className="p-1 border border-gray-300 rounded hover:bg-gray-50 transition"
                title="Download Excel File"
                aria-label="Download Excel File"
              >
                <FiDownload size={14} />
              </button>
              <span className="max-w-[180px] truncate">{excelFileName}</span>
              <button
                type="button"
                onClick={onDeleteExcel}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                title="Delete Excel File"
                aria-label="Delete Excel File"
              >
                <FiTrash2 size={14} />
              </button>
            </>
          ) : (
            <span className="text-gray-400">No Excel file selected</span>
          )}
        </div>

        <input
          type="file"
          accept=".xls,.xlsx"
          ref={excelInputRef}
          className="hidden"
          onChange={handleExcelChange}
        />
      </div>
    </div>
  );
};

export default UploadFilesPanel;
