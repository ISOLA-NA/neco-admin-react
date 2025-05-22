import React, { useState, useEffect } from "react";
import { FiImage } from "react-icons/fi";

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  externalPreviewUrl?: string | null;
  allowedExtensions?: string[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  externalPreviewUrl,
  allowedExtensions,
}) => {
  const [internalPreview, setInternalPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const acceptStr = allowedExtensions
    ? allowedExtensions.map((ext) => `.${ext}`).join(",")
    : "image/*";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      const previewUrl = URL.createObjectURL(file);
      setInternalPreview(previewUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onUpload(file);
      const previewUrl = URL.createObjectURL(file);
      setInternalPreview(previewUrl);
    }
  };

  useEffect(() => {
    if (externalPreviewUrl) {
      setInternalPreview(null);
    }
  }, [externalPreviewUrl]);

  useEffect(() => {
    return () => {
      if (internalPreview) {
        URL.revokeObjectURL(internalPreview);
      }
    };
  }, [internalPreview]);

  const previewSrc = externalPreviewUrl || internalPreview;

  return (
    <>
      <input
  id="hidden-file-input"
  type="file"
  accept={acceptStr}
  onChange={handleFileChange}
  className="hidden"
/>

    <div className="w-full flex flex-col space-y-2">
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all duration-200
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}
        `}
        style={{ minHeight: "200px" }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptStr}
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {previewSrc ? (
          <img
            src={previewSrc}
            alt="Preview"
            className="max-h-48 object-contain rounded-md"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <FiImage size={48} />
            <p className="mt-2 text-sm">Drag & Drop or Click to Upload</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ImageUploader;
