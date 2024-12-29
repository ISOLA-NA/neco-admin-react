// src/components/utilities/ImageUploader.tsx

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FiImage } from "react-icons/fi";

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  externalPreviewUrl?: string | null; // URL تصویر دانلود شده
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, externalPreviewUrl }) => {
  const [internalPreview, setInternalPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onUpload(file);
        setInternalPreview(URL.createObjectURL(file));
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: false,
  });

  // زمانی که externalPreviewUrl تغییر کند، internalPreview را پاک می‌کنیم
  useEffect(() => {
    if (externalPreviewUrl) {
      setInternalPreview(null);
    }
  }, [externalPreviewUrl]);

  // پاکسازی URL های ایجاد شده برای جلوگیری از نشت حافظه
  useEffect(() => {
    return () => {
      if (externalPreviewUrl) {
        URL.revokeObjectURL(externalPreviewUrl);
      }
      if (internalPreview) {
        URL.revokeObjectURL(internalPreview);
      }
    };
  }, [externalPreviewUrl, internalPreview]);

  return (
    <div className="flex justify-between items-center space-x-6 p-4 bg-gray-100 rounded-lg shadow-md w-full">
      <span className="text-lg font-semibold text-gray-700">Image :</span>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer transition-colors duration-200 
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white"
        }`}
        style={{ width: "150px", height: "150px" }}
      >
        <input {...getInputProps()} />
        {externalPreviewUrl ? (
          <img
            src={externalPreviewUrl}
            alt="Downloaded Preview"
            className="w-full h-full object-cover rounded-md"
          />
        ) : internalPreview ? (
          <img
            src={internalPreview}
            alt="Uploaded Preview"
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <FiImage className="text-gray-400" size={48} />
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
