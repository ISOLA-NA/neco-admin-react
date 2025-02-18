// ExcelPanel.tsx

import React, { useState, useEffect } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import { FaTrash, FaEye } from "react-icons/fa";
import fileService from "../../../services/api.servicesFile";
import FileUploadHandler, { InsertModel } from "../../../services/FileUploadHandler";

interface ExcelPanelProps {
  /**
   * تابعی برای ارسال تغییرات به فرم پدر
   * اگر در حالت ویرایش باشیم، مقدار قبلی را برمی‌گرداند.
   */
  onMetaChange?: (data: any) => void;
  /**
   * داده‌های قبلی در حالت ادیت
   */
  data?: any;
}

const ExcelPanel: React.FC<ExcelPanelProps> = ({ data, onMetaChange }) => {
  // نگهداری شناسه فایل انتخاب یا آپلود شده
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    data?.metaType4 || null
  );
  // نگهداری نام فایل جهت نمایش
  const [fileName, setFileName] = useState<string>(data?.fileName || "");
  // شمارنده برای ریست کردن FileUploadHandler
  const [resetCounter, setResetCounter] = useState<number>(0);

  // دریافت اطلاعات فایل از سرور در صورت وجود شناسه فایل
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

  // زمانی که آپلود فایل موفقیت‌آمیز انجام شود
  const handleUploadSuccess = (insertedModel: InsertModel) => {
    setSelectedFileId(insertedModel.ID || null);
    setFileName(insertedModel.FileName);
    if (onMetaChange) {
      onMetaChange({ metaType4: insertedModel.ID || null });
    }
  };

  // ریست کردن فایل انتخاب شده
  const handleReset = () => {
    setSelectedFileId(null);
    setFileName("");
    setResetCounter((prev) => prev + 1);
    if (onMetaChange) {
      onMetaChange({ metaType4: null });
    }
  };

  // دانلود فایل از سرور
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
      // تعیین MIME برای فایل‌های اکسل
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
    <div className="flex flex-col items-center w-full mt-10">
      {/* ردیف بالایی: دکمه حذف فایل، ورودی نام فایل و دکمه دانلود */}
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
          onClick={handleDownloadFile}
          className={`flex items-center px-2 py-1 bg-purple-500 text-white font-semibold rounded transition duration-300 ${
            selectedFileId
              ? "hover:bg-purple-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!selectedFileId}
        >
          <FaEye size={16} className="mr-1" />
          Download
        </button>
      </div>

      {/* بخش آپلود فایل اکسل (فقط در حالت افزودن نمایش داده می‌شود) */}
        <div className="w-full mt-4">
          <FileUploadHandler
            selectedFileId={selectedFileId}
            resetCounter={resetCounter}
            onReset={() => {}}
            onUploadSuccess={handleUploadSuccess}
            // تنها فایل‌های اکسل با پسوندهای .xls و .xlsx مجاز باشند
            allowedExtensions={["xls", "xlsx"]}
          />
        </div>
    </div>
  );
};

export default ExcelPanel;
