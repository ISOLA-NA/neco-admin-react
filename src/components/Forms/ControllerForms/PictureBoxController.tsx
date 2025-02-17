import React, { useState, useCallback, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicModal from "../../utilities/DynamicModal";
import { FaTrash, FaEye } from "react-icons/fa";
import FileUploadHandler, {
  InsertModel,
} from "../../../services/FileUploadHandler";
import fileService from "../../../services/api.servicesFile";

interface AttachFileProps {
  onMetaChange?: (data: any) => void;
  data?: any;
}

const PictureBoxFile: React.FC<AttachFileProps> = ({ data, onMetaChange }) => {
  // اگر در حالت ویرایش شناسه فایل وجود داشته باشد، از آن استفاده می‌کنیم
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    data?.metaType1 || null
  );
  const [fileName, setFileName] = useState<string>(data?.fileName || "");
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // دریافت نام فایل از سرویس اگر شناسه فایل موجود باشد
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

  const handleUploadSuccess = (insertedModel: InsertModel) => {
    setSelectedFileId(insertedModel.ID || null);
    setFileName(insertedModel.FileName);
    if (onMetaChange) {
      onMetaChange({ metaType1: insertedModel.ID || null });
    }
  };

  const handleReset = () => {
    setSelectedFileId(null);
    setResetCounter((prev) => prev + 1);
    setFileName("");
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

  // استفاده از useCallback برای جلوگیری از تغییر مکرر تابع
  const handlePreviewUrlChange = useCallback((url: string | null) => {
    setPreviewUrl(url);
  }, []);

  return (
    <div className="flex flex-col items-center w-full mt-10">
      {/* ردیف بالا: دکمه Reset، ورودی و دکمه Show */}
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
          name="fileName"
          type="text"
          value={fileName || ""}
          placeholder="No file selected"
          className="flex-grow -mt-6"
        />

        <button
          type="button"
          onClick={handleShowFile}
          className={`flex items-center px-2 py-1 bg-purple-500 text-white font-semibold rounded transition duration-300 ${
            previewUrl
              ? "hover:bg-purple-700"
              : "bg-gray-400 cursor-not-allowed"
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
          <p className="text-gray-500 text-center">
            No file available to display.
          </p>
        )}
      </DynamicModal>
    </div>
  );
};

export default PictureBoxFile;
