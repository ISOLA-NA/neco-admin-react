// src/utilities/ImageUploader.tsx
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiImage } from "react-icons/fi";

interface ImageUploaderProps {
  onUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onUpload(file);
        setPreview(URL.createObjectURL(file));
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

  return (
    <div className="flex justify-between items-center space-x-6 p-4 bg-gray-100 rounded-lg shadow-md">
      <span className="text-lg font-semibold text-gray-700">Image :</span>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer transition-colors duration-200 
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white"
        }`}
        style={{ width: "100px", height: "100px" }}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <FiImage className="text-gray-400" size={32} />
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
