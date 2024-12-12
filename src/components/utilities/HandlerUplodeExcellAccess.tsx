// HandlerUplodeExcellAccess.tsx
import React, { useRef } from "react";

interface HandlerUplodeExcellAccessProps {
  onWordUpload: (file: File) => void;
  onExcelUpload: (file: File) => void;
}

const HandlerUplodeExcellAccess: React.FC<HandlerUplodeExcellAccessProps> = ({
  onWordUpload,
  onExcelUpload,
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
    <div className="flex flex-col items-center justify-center mb-6 relative">
      {/* عنوان */}
      <div className="flex items-center mb-2">
        <span className="text-gray-800 text-sm font-medium mr-2">
          Template Word File
        </span>

        {/* دکمه‌ها */}
        <div className="flex space-x-2">
          {/* دکمه آپلود ورد */}
          <button
            type="button"
            onClick={handleWordClick}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-800 transition-colors duration-300 w-48"
          >
            آپلود ورد
          </button>
          <input
            type="file"
            accept=".doc,.docx"
            ref={wordInputRef}
            className="hidden"
            onChange={handleWordChange}
          />

          {/* دکمه آپلود اکسل */}
          <button
            type="button"
            onClick={handleExcelClick}
            className="bg-gradient-to-r from-pink-500 to-pink-700 text-white px-6 py-2 rounded-lg shadow hover:from-pink-600 hover:to-pink-800 transition-colors duration-300 w-48"
          >
            آپلود اکسل
          </button>
          <input
            type="file"
            accept=".xls,.xlsx"
            ref={excelInputRef}
            className="hidden"
            onChange={handleExcelChange}
          />
        </div>
      </div>
    </div>
  );
};

export default HandlerUplodeExcellAccess;
