import React, { useState, useCallback } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicModal from "../../utilities/DynamicModal";
import { FaTrash, FaEye } from "react-icons/fa";
import FileUploadHandler, { InsertModel } from "../../../services/FileUploadHandler";

interface AttachFileProps {
  onMetaChange?: (data: any) => void;
  data?: any;
}

const AttachFile: React.FC<AttachFileProps> = ({ data, onMetaChange }) => {
  // در حالت ادیت، شناسه فایل از داده‌های اولیه گرفته می‌شود
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    data?.metaType1 || null
  );
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleUploadSuccess = (insertedModel: InsertModel) => {
    setSelectedFileId(insertedModel.ID || null);
    if (onMetaChange) {
      onMetaChange({ metaType1: insertedModel.ID || null });
    }
  };

  const handleReset = () => {
    setSelectedFileId(null);
    setResetCounter((prev) => prev + 1);
    if (onMetaChange) {
      onMetaChange({ metaType1: null });
    }
    setPreviewUrl(null);
  };

  const handleShowFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (previewUrl) {
      setIsModalOpen(true);
    } else {
      alert("No file uploaded!");
    }
  };

  console.log("initialData", data);

  // استفاده از useCallback برای جلوگیری از تغییر مکرر تابع
  const handlePreviewUrlChange = useCallback((url: string | null) => {
    setPreviewUrl(url);
  }, []);

  return (
    <div className="flex flex-col items-center w-full mt-10">
      {/* ردیف بالا: Trash، Input و Show */}
      <div className="flex items-center gap-2 w-full">
        {selectedFileId && (
          <button
            type="button"
            onClick={handleReset}
            title="Reset file"
            className="bg-red-500 text-white p-1 rounded hover:bg-red-700 transition duration-300"
          >
            <FaTrash size={16} />
          </button>
        )}

        <DynamicInput
          name="fileId"
          type="text"
          value={selectedFileId || ""}
          placeholder="No file selected"
          className="flex-grow -mt-6" 
        />

        <button
          type="button"
          onClick={handleShowFile}
          className={`flex items-center px-2 py-1 bg-purple-500 text-white font-semibold rounded transition duration-300 ${
            previewUrl ? "hover:bg-purple-700" : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!previewUrl}
        >
          <FaEye size={16} className="mr-1" />
          Show
        </button>
      </div>

      {/* FileUploadHandler با ارسال externalPreviewUrl */}
      <div className="w-full mt-4">
        <FileUploadHandler
          selectedFileId={selectedFileId}
          resetCounter={resetCounter}
          onReset={() => {}}
          onUploadSuccess={handleUploadSuccess}
          onPreviewUrlChange={handlePreviewUrlChange}
          externalPreviewUrl={previewUrl}
        />
      </div>

      {/* مدال نمایش پیش‌نمایش فایل */}
      <DynamicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Uploaded Preview"
            className="max-w-full max-h-[80vh] mx-auto rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Do you want to delete the uploaded file?")) {
                handleReset();
                setIsModalOpen(false);
              }
            }}
            title="Click to delete the file"
          />
        ) : (
          <p className="text-gray-500 text-center">No file available to display.</p>
        )}
      </DynamicModal>
    </div>
  );
};

export default AttachFile;
