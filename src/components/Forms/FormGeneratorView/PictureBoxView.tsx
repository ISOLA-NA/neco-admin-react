// src/components/PictureBoxView.tsx
import React, { useState, useCallback, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicModal from "../../utilities/DynamicModal";
import { FaTrash, FaEye, FaUpload } from "react-icons/fa";
import FileUploadHandler, {
  InsertModel,
} from "../../../services/FileUploadHandler";
import fileService from "../../../services/api.servicesFile";
import { useTranslation } from "react-i18next";

interface PictureBoxViewProps {
  data?: {
    metaType1?: string;
    fileName?: string;
    DisplayName?: string;
  };
  onMetaChange?: (data: any) => void;
}

const PictureBoxView: React.FC<PictureBoxViewProps> = ({
  data,
  onMetaChange,
}) => {
  const { t } = useTranslation();

  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    data?.metaType1 || null
  );
  const [fileName, setFileName] = useState<string>(
    data?.fileName || "No file selected"
  );
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showUploadHandler, setShowUploadHandler] = useState<boolean>(false);

  // واکشی اطلاعات فایل (نام و URL پیش‌نمایش) در صورت وجود selectedFileId
  useEffect(() => {
    if (selectedFileId) {
      fileService
        .getFile(selectedFileId)
        .then((res) => {
          // فرض بر این است که res.data شامل FileName و FileIQ (URL پیش‌نمایش) می‌باشد
          setFileName(res.data.FileName);
          setPreviewUrl(res.data.FileIQ || null);
        })
        .catch((err) => {
          console.error("Error fetching file info:", err);
        });
    } else {
      setFileName("No file selected");
      setPreviewUrl(null);
    }
  }, [selectedFileId]);

  // Callback جهت دریافت تغییرات URL پیش‌نمایش از FileUploadHandler
  const handlePreviewUrlChange = useCallback((url: string | null) => {
    setPreviewUrl(url);
  }, []);

  // در صورت آپلود موفق فایل جدید
  const handleUploadSuccess = (insertedModel: InsertModel) => {
    setSelectedFileId(insertedModel.ID || null);
    setFileName(insertedModel.FileName);
    if (onMetaChange) {
      onMetaChange({ metaType1: insertedModel.ID || null });
    }
    setShowUploadHandler(false);
  };

  // حذف فایل
  const handleReset = () => {
    setSelectedFileId(null);
    setResetCounter((prev) => prev + 1);
    setFileName("No file selected");
    if (onMetaChange) {
      onMetaChange({ metaType1: null });
    }
    setPreviewUrl(null);
  };

  // بازکردن مدال جهت نمایش پیش‌نمایش فایل
  const handleShowFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (previewUrl) {
      setIsModalOpen(true);
    } else {
      alert(t("PictureBoxFile.Messages.NoFileUploaded"));
    }
  };

  // تغییر وضعیت نمایش بخش آپلود؛ با کلیک روی دکمه Upload، بخش آپلود زیر سطر اصلی ظاهر/مخفی می‌شود و previewUrl پاک می‌شود
  const handleToggleUploadHandler = () => {
    setShowUploadHandler((prev) => !prev);
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col items-center w-full mt-10">
      {/* سطر اصلی: دکمه Delete، DynamicInput نمایش نام فایل (label از DisplayName)، دکمه Upload و دکمه View */}
      <div className="flex flex-row items-center gap-2 w-full">
        {selectedFileId && (
          <button
            type="button"
            onClick={handleReset}
            title={t("PictureBoxFile.Titles.ClickToDelete")}
            className="inline-flex items-center justify-center bg-red-500 text-white p-1 rounded hover:bg-red-700 transition duration-300 mt-5"
          >
            <FaTrash size={16} />
          </button>
        )}

        <DynamicInput
          name={data?.DisplayName || t("PictureBoxFile.Labels.FileName")}
          type="text"
          value={fileName}
          placeholder={t("PictureBoxFile.Labels.NoFileSelected")}
          disabled
          className="flex-grow"
        />

        <button
          type="button"
          onClick={handleToggleUploadHandler}
          className="inline-flex items-center gap-2 px-2 py-1 bg-blue-500 text-white font-semibold rounded transition duration-300 hover:bg-blue-700 mt-5"
          title={t("PictureBoxFile.Titles.UploadFile")}
        >
          <FaUpload size={16} />
          {t("PictureBoxFile.Buttons.Upload")}
        </button>

        <button
          type="button"
          onClick={handleShowFile}
          className={`inline-flex items-center gap-2 px-2 py-1 bg-purple-500 text-white font-semibold rounded transition duration-300 mt-5 ${
            previewUrl
              ? "hover:bg-purple-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!previewUrl}
          title={t("PictureBoxFile.Titles.ViewFile")}
        >
          <FaEye size={16} />
          {t("PictureBoxFile.Buttons.View")}
        </button>
      </div>

      {/* بخش آپلود: تنها زمانی نمایش داده می‌شود که showUploadHandler فعال باشد */}
      {showUploadHandler && (
        <div className="w-full mt-4">
          <FileUploadHandler
            selectedFileId={selectedFileId || ""}
            resetCounter={resetCounter}
            onReset={() => {}}
            onUploadSuccess={handleUploadSuccess}
            onPreviewUrlChange={handlePreviewUrlChange}
            externalPreviewUrl={null} // باکس آپلود به صورت خالی نمایش داده شود
          />
          <button
            type="button"
            onClick={handleToggleUploadHandler}
            className="mt-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300"
          >
            {t("PictureBoxFile.Buttons.Cancel")}
          </button>
        </div>
      )}

      {/* FileUploadHandler مخفی جهت واکشی previewUrl در پس‌زمینه (در صورت عدم نمایش بخش آپلود) */}
      {selectedFileId && !showUploadHandler && (
        <div className="hidden">
          <FileUploadHandler
            selectedFileId={selectedFileId}
            resetCounter={resetCounter}
            onReset={() => {}}
            onUploadSuccess={() => {}}
            onPreviewUrlChange={handlePreviewUrlChange}
            externalPreviewUrl={previewUrl}
          />
        </div>
      )}

      {/* مدال نمایش پیش‌نمایش فایل با عرض نصف صفحه و تصویر مربعی */}
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
              if (window.confirm(t("PictureBoxFile.Messages.DeleteConfirm"))) {
                handleReset();
                setIsModalOpen(false);
              }
            }}
            title={t("PictureBoxFile.Buttons.Delete")}
          />
        ) : (
          <p className="text-gray-500 text-center">
            {t("PictureBoxFile.Messages.NoFileToDisplay")}
          </p>
        )}
      </DynamicModal>
    </div>
  );
};

export default PictureBoxView;
