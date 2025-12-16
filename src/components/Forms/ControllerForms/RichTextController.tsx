// RichTextController.tsx
import { useMemo, useState, useEffect } from "react";
import JoditEditor from "jodit-react";
import FileUploadHandler, { InsertModel } from "../../../services/FileUploadHandler";
import { FiX, FiCheck, FiImage } from "react-icons/fi";

interface RichTextControllerProps {
  data?: { metaType1?: string };
  onMetaChange: (meta: { metaType1: string }) => void;
  isDisable?: boolean;
  placeholder?: string;
}

function RichTextController({
  data = {},
  onMetaChange,
  isDisable = false,
  placeholder = "شروع به نوشتن کنید...",
}: RichTextControllerProps) {
  /* مقدار اولیه */
  const [content, setContent] = useState<string>(data.metaType1 ?? "");

  /* Sync هنگام ادیت */
  useEffect(() => {
    setContent(data.metaType1 ?? "");
  }, [data.metaType1]);

  /* ارسال تغییرات */
  useEffect(() => {
    onMetaChange({ metaType1: content });
  }, [content]);

  /* ───────────── مدیریت آپلود ───────────── */
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [resetCounter, setResetCounter] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const insertImageToEditor = () => {
    if (previewUrl) {
      const imgTag = `<p><img src="${previewUrl}" alt="image" style="max-width:100%; height:auto; border-radius:4px;" /></p>`;
      setContent(prev => prev + imgTag);

      setShowUploadDialog(false);
      setSelectedFileId(null);
      setPreviewUrl(null);
      setResetCounter(c => c + 1);
    }
  };

  /* ───────────── کانفیگ ادیتور ───────────── */

  const effectivePlaceholder = content?.trim()
    ? "" // اگر مقدار داریم، placeholder را کاملاً حذف کن
    : placeholder;

  const config = useMemo(
    () => ({
      readonly: isDisable,
      placeholder: effectivePlaceholder,
      direction: "rtl" as const,
      language: "fa",
      toolbarAdaptive: false,
      height: 400,

      uploader: {
        insertImageAsBase64URI: false,
        url: "",
      },

      buttons: [
        "source",
        "|",
        "bold",
        "strikethrough",
        "underline",
        "italic",
        "|",
        "superscript",
        "subscript",
        "|",
        "ul",
        "ol",
        "|",
        "outdent",
        "indent",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "image",
        "video",
        "table",
        "link",
        "|",
        "align",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "copyformat",
        "|",
        "symbol",
        "fullsize",
        "print",
        "about",
      ],

      image: {
        openOnDblClick: true,
        editSrc: true,
        useImageEditor: true,
        showPreview: true,
      },

      allowResizeY: true,
      minHeight: 300,
      maxHeight: 800,

      controls: {
        image: {
          exec: () => {
            if (!isDisable) setShowUploadDialog(true);
          },
        },
      },
    }),
    [effectivePlaceholder, isDisable]
  );

  const handleChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleUploadSuccess = (insertModel: InsertModel) => {
    setSelectedFileId(insertModel.ID || null);
  };

  const handleReset = () => {
    setSelectedFileId(null);
    setPreviewUrl(null);
    setResetCounter(c => c + 1);
  };

  const handleCloseDialog = () => {
    setShowUploadDialog(false);
    handleReset();
  };

  return (
    <div className="w-full">

      {/* ───────────── Editor ───────────── */}
      <div className="relative">
        <JoditEditor
          value={content}
          config={config}
          onBlur={handleChange}
          onChange={() => {}}
        />
      </div>

      {/* ───────────── Modal آپلود ───────────── */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] animate-fadeIn">

          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden animate-slideUp">

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <FiImage className="text-white" size={24} />
                </div>
                <h2 className="text-xl font-bold text-white">آپلود تصویر</h2>
              </div>
              <button
                onClick={handleCloseDialog}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <FileUploadHandler
                selectedFileId={selectedFileId}
                onUploadSuccess={handleUploadSuccess}
                resetCounter={resetCounter}
                onReset={handleReset}
                onPreviewUrlChange={setPreviewUrl}
                externalPreviewUrl={previewUrl}
                allowedExtensions={["jpg", "jpeg", "png", "gif", "webp"]}
                hideUploader={false}
                isEditMode={false}
              />
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">

              <button
                onClick={insertImageToEditor}
                disabled={!previewUrl}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold
                  ${previewUrl
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:scale-[1.02]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"}
                `}
              >
                <FiCheck size={20} />
                درج تصویر
              </button>

              <button
                onClick={handleCloseDialog}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
              >
                <FiX size={20} />
                انصراف
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ❌ پیش‌نمایش حذف شد */}
    </div>
  );
}

export default RichTextController;
