// src/components/AttachFileView.tsx
import React, { useState, useCallback, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicModal from "../../utilities/DynamicModal";
import { FaTrash, FaEye, FaUpload } from "react-icons/fa";
import FileUploadHandler, { InsertModel } from "../../../services/FileUploadHandler";
import fileService from "../../../services/api.servicesFile";

interface AttachFileViewProps {
  data: {
    metaType1?: string;
    fileName?: string;
    DisplayName?: string;
  };
  onMetaChange?: (data: any) => void;
}

const AttachFileView: React.FC<AttachFileViewProps> = ({ data, onMetaChange }) => {
  // مقدار اولیه fileName حالا به عنوان رشته خالی است؛ در صورت دریافت فایل، نام فایل در state ذخیره می‌شود
  const [fileId, setFileId] = useState<string | null>(data.metaType1 || null);
  const [fileName, setFileName] = useState<string>(data.fileName || "");
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showUploadHandler, setShowUploadHandler] = useState<boolean>(false);

  // دریافت preview URL فایل آپلود شده با استفاده از منطق دانلود مشابه FileUploadHandler
  useEffect(() => {
    if (fileId) {
      fileService
        .getFile(fileId)
        .then((res) => {
          // در اینجا اطلاعات فایل دریافت می‌شود و سپس فایل دانلود و blob ساخته می‌شود
          const downloadingFileObject = {
            FileName: res.data.FileIQ + res.data.FileType,
            FolderName: res.data.FolderName,
            cacheBust: Date.now(),
          };
          return fileService
            .download(downloadingFileObject)
            .then((downloadRes) => {
              const uint8Array = new Uint8Array(downloadRes.data);
              let mimeType = "application/octet-stream";
              if (res.data.FileType === ".jpg" || res.data.FileType === ".jpeg") {
                mimeType = "image/jpeg";
              } else if (res.data.FileType === ".png") {
                mimeType = "image/png";
              }
              const blob = new Blob([uint8Array], { type: mimeType });
              const objectUrl = URL.createObjectURL(blob);
              setPreviewUrl(objectUrl);
              // همچنین نام فایل دریافت شده از سرور را در state ذخیره می‌کنیم
              setFileName(res.data.FileName);
            })
            .catch((err) => {
              console.error("Error downloading file:", err);
              setPreviewUrl(null);
            });
        })
        .catch((err) => {
          console.error("Error fetching file info:", err);
          setPreviewUrl(null);
        });
    } else {
      setPreviewUrl(null);
      setFileName("");
    }
  }, [fileId]);

  const handleUploadSuccess = (insertedModel: InsertModel) => {
    setFileId(insertedModel.ID || null);
    setFileName(insertedModel.FileName);
    if (onMetaChange) {
      onMetaChange({ metaType1: insertedModel.ID || null });
    }
  };

  const handleReset = () => {
    setFileId(null);
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

  const handleToggleUploadHandler = () => {
    setShowUploadHandler((prev) => !prev);
    // در زمان تغییر وضعیت آپلود، preview پاک می‌شود
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col items-center w-full mt-10">
      <div className="flex flex-row items-center gap-2 w-full">
        {fileId && (
          <button
            type="button"
            onClick={handleReset}
            title="Delete file"
            className="bg-red-500 text-white p-1 rounded hover:bg-red-700 transition duration-300 mt-5"
          >
            <FaTrash size={16} />
          </button>
        )}

        {/* در اینجا به جای placeholder ثابت، مقدار fileName که از سرور گرفته شده استفاده می‌شود */}
        <DynamicInput
          name={data?.DisplayName || "File Name"}
          type="text"
          value={fileName}
          placeholder=""
          disabled
          className="flex-grow"
        />

        <button
          type="button"
          onClick={handleToggleUploadHandler}
          className="flex items-center px-2 py-1 bg-blue-500 text-white font-semibold rounded transition duration-300 hover:bg-blue-700 mt-5"
          title="Upload file"
        >
          <FaUpload size={16} className="mr-1" />
          Upload
        </button>

        <button
          type="button"
          onClick={handleShowFile}
          className={`flex items-center px-2 py-1 bg-purple-500 text-white font-semibold rounded transition duration-300 mt-5 ${
            previewUrl ? "hover:bg-purple-700" : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!previewUrl}
          title="View file"
        >
          <FaEye size={16} className="mr-1" />
          View
        </button>
      </div>

      {showUploadHandler && (
        <div className="w-full mt-4">
          <FileUploadHandler
            selectedFileId={fileId || ""}
            resetCounter={resetCounter}
            onReset={() => {}}
            onUploadSuccess={handleUploadSuccess}
            onPreviewUrlChange={(url) => setPreviewUrl(url)}
            externalPreviewUrl={null}
            allowedExtensions={["jpg", "jpeg", "png", "doc", "docx", "xlsx", "xls"]}
          />
          <button
            type="button"
            onClick={handleToggleUploadHandler}
            className="mt-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300"
          >
            Cancel
          </button>
        </div>
      )}

      {fileId && !showUploadHandler && (
        <div className="hidden">
          <FileUploadHandler
            selectedFileId={fileId}
            resetCounter={resetCounter}
            onReset={() => {}}
            onUploadSuccess={() => {}}
            onPreviewUrlChange={(url) => setPreviewUrl(url)}
            externalPreviewUrl={previewUrl}
            allowedExtensions={["jpg", "jpeg", "png", "doc", "docx", "xlsx", "xls"]}
          />
        </div>
      )}

      <DynamicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalClassName="w-1/2 mx-auto"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={fileName || "Uploaded file"}
            className="w-[300px] h-[300px] object-cover mx-auto rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105"
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

export default AttachFileView;
