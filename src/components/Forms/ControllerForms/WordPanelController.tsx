import React, { useState } from "react";
import DynamicInput from "../../utilities/DynamicInput"; // مسیر صحیح را وارد کنید
import { FaTrash, FaEye, FaEllipsisH } from "react-icons/fa";

const WordPanel: React.FC = () => {
  const [isShowNewWindow, setIsShowNewWindow] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("old");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

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
    if (fileUrl && fileName) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("No file uploaded!");
    }
  };

  const handleReset = () => {
    setFileName(null);
    setFileUrl(null);
  };

  const handleEllipsisClick = () => {
    document.getElementById("file-upload")?.click();
  };

  return (
    <div className="p-2 bg-gray-50 flex items-center justify-center ">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          {/* Checkbox و Label */}
          <div className="flex items-center space-x-3">
            <input
              id="isShowNewWindow"
              type="checkbox"
              checked={isShowNewWindow}
              onChange={(e) => setIsShowNewWindow(e.target.checked)}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="isShowNewWindow" className="text-lg text-gray-700">
              Show in New Window
            </label>
          </div>

          {/* Default Value Button */}
          <button
            type="button" // افزودن type="button"
            className="flex items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-2 rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 transition duration-300"
            onClick={() => alert("Default Value Button Clicked")}
          >
            Def Val
          </button>

          {/* Radio Group - Arranged Vertically */}
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="version"
                value="old"
                checked={selectedVersion === "old"}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500"
              />
              <span className="text-gray-700">Old Version</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="version"
                value="new"
                checked={selectedVersion === "new"}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500"
              />
              <span className="text-gray-700">New Word Panel</span>
            </label>
          </div>
        </div>

        {/* File Upload Section */}
        {selectedVersion === "new" && (
          <div className="mt-8">
            <div className="flex flex-col space-y-6 bg-gray-100 p-6 rounded-lg shadow-inner">
              {/* File Input */}
              <div className="flex items-center space-x-4">
                {/* Delete Button */}
                {fileName && (
                  <button
                    type="button" // افزودن type="button"
                    onClick={handleReset}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
                    title="Delete file"
                  >
                    <FaTrash />
                  </button>
                )}

                {/* Dynamic Input */}
                <DynamicInput
                  name=""
                  type="text"
                  value={fileName || ""}
                  placeholder="No file selected"
                  className="flex-grow bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                />

                {/* Ellipsis Button */}
                <button
                  type="button" // افزودن type="button"
                  onClick={handleEllipsisClick}
                  className="p-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition duration-300"
                  title="Upload File"
                >
                  <FaEllipsisH />
                </button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Show File Button */}
              <div className="flex justify-center">
                <button
                  type="button" // افزودن type="button"
                  onClick={handleShowFile}
                  className={`flex items-center px-5 py-2 rounded-lg shadow-md text-white transition duration-300 ${
                    fileUrl
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!fileUrl}
                >
                  <FaEye className="mr-2" />
                  Show
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordPanel;
