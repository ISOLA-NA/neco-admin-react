// src/components/utilities/ImageUploader.tsx

import React, { useState, useEffect } from "react";
import { FiImage } from "react-icons/fi";

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  externalPreviewUrl?: string | null; // URL of the downloaded image (Data URL)
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, externalPreviewUrl }) => {
  const [internalPreview, setInternalPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setInternalPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      onUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setInternalPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (externalPreviewUrl) {
      console.log("External preview URL updated:", externalPreviewUrl);
      setInternalPreview(null); // Clear internal preview if externalPreviewUrl changes
    }
  }, [externalPreviewUrl]);

  return (
    <div className="flex justify-between items-center space-x-6 p-4 bg-gray-100 rounded-lg shadow-md w-full">
      <span className="text-lg font-semibold text-gray-700">Image :</span>
      <div
        className={`border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer transition-colors duration-200 
        ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white"
        }`}
        style={{ width: "150px", height: "150px" }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute opacity-0 w-full h-full cursor-pointer"
        />
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
