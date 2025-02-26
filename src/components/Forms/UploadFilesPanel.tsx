import React, { useRef } from "react";
import { FiTrash2 } from "react-icons/fi";

interface UploadFilesPanelProps {
  onWordUpload: (file: File) => void;
  onExcelUpload: (file: File) => void;
  wordFileName: string;
  excelFileName: string;
  onDeleteWord: () => void;
  onDeleteExcel: () => void;
}

const UploadFilesPanel: React.FC<UploadFilesPanelProps> = ({
  onWordUpload,
  onExcelUpload,
  wordFileName,
  excelFileName,
  onDeleteWord,
  onDeleteExcel,
}) => {
  const wordInputRef = useRef<HTMLInputElement | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);

  const handleWordClick = () => {
    wordInputRef.current?.click();
  };

  const handleExcelClick = () => {
    excelInputRef.current?.click();
  };

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onWordUpload(e.target.files[0]);
    }
  };

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onExcelUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* بخش فایل ورد */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleWordClick}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {wordFileName ? wordFileName : "فایل ورد پیدا نشد"}
        </button>
        {wordFileName && (
          <button
            type="button"
            onClick={onDeleteWord}
            className="text-red-500 ml-2"
          >
            <FiTrash2 size={18} />
          </button>
        )}
        <input
          type="file"
          accept=".doc,.docx"
          ref={wordInputRef}
          className="hidden"
          onChange={handleWordChange}
        />
      </div>

      {/* بخش فایل اکسل */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleExcelClick}
          className="bg-pink-600 text-white px-4 py-2 rounded"
        >
          {excelFileName ? excelFileName : "فایل اکسل پیدا نشد"}
        </button>
        {excelFileName && (
          <button
            type="button"
            onClick={onDeleteExcel}
            className="text-red-500 ml-2"
          >
            <FiTrash2 size={18} />
          </button>
        )}
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
