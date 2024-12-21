import React, { useState } from "react";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicModal from "../../utilities/DynamicModal";
import { FaTrash, FaUpload, FaEye } from "react-icons/fa";

const PictureBoxFile: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setFileUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleShowFile = () => {
    if (fileUrl) {
      setIsModalOpen(true);
    } else {
      alert("No file uploaded!");
    }
  };

  const handleReset = () => {
    setFileName(null);
    setFileUrl(null);
  };

  const handleImageClick = () => {
    if (window.confirm("Do you want to delete the uploaded file?")) {
      handleReset();
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-6 p-8 border border-gray-300 rounded-lg shadow-md bg-gradient-to-r from-pink-100 to-blue-100">
      <div className="flex items-center w-full space-x-4">
        {/* Reset Button (Trash Icon) - Moved to the Left */}
        {fileName && (
          <button
            onClick={handleReset}
            className="flex items-center justify-center bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full hover:bg-red-700 transition duration-300"
            title="Delete file"
          >
            <FaTrash />
          </button>
        )}

        {/* DynamicInput */}
        <DynamicInput
          name=""
          type="text"
          value={fileName || ""}
          placeholder="No file selected"
          className="flex-grow"
        />

        {/* Upload Button */}
        <label
          htmlFor="file-upload"
          className="flex items-center px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg cursor-pointer hover:bg-purple-700 transition duration-300"
        >
          <FaUpload className="mr-2" />
          Upload
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Show Button Centered */}
      <div className="flex justify-center w-full">
        <button
          type="button" // Prevent default form submission
          onClick={handleShowFile}
          className={`flex items-center px-6 py-2 font-semibold text-white rounded-lg transition duration-300 ${
            fileUrl
              ? "bg-purple-500 hover:bg-purple-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!fileUrl}
        >
          <FaEye className="mr-2" />
          Show
        </button>
      </div>

      {/* DynamicModal */}
      <DynamicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {fileUrl ? (
          <img
            src={fileUrl}
            alt="Uploaded Preview"
            className="max-w-full max-h-[80vh] mx-auto rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105"
            onClick={handleImageClick}
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
