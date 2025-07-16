import React, { useRef, useState, useEffect } from "react";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import fileService from "../../../../services/api.servicesFile";

interface WordPanelOldProps {
  data?: any;
  onMetaChange?: (meta: any) => void;
  onNew?: () => void;
}

const WordPanelOld: React.FC<WordPanelOldProps> = ({ data, onMetaChange, onNew }) => {
  const [content, setContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [editorValue, setEditorValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // اگر مقدار metaType1 فقط آیدی فایل است، فایل را بگیر و نمایش بده
  useEffect(() => {
    const isGuid = (str: string) =>
      !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(str);

    if (data?.metaType1 && isGuid(data.metaType1)) {
      setLoading(true);
      fileService.getFile(data.metaType1).then(async (fileRes) => {
        setFileName(fileRes.data.FileName || "");
        const path = {
          FileName: fileRes.data.FileIQ + fileRes.data.FileType,
          FolderName: fileRes.data.FolderName,
          cacheBust: Date.now(),
        };
        const downloadRes = await fileService.download(path);
        const blob = new Blob([new Uint8Array(downloadRes.data)], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const arrayBuffer = await blob.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const plain = result.value.replace(/<[^>]*>?/gm, "");
        setEditorValue(plain);
        setContent(result.value);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else if (data?.metaType1) {
      // فرض بر این است که متن خام ذخیره شده (بسیار نادر!)
      setEditorValue(data.metaType1);
      setContent(
        data.metaType1.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;")
      );
    } else {
      setEditorValue("");
      setContent("");
      setFileName("");
    }
    if (data?.fileName) setFileName(data.fileName);
    // eslint-disable-next-line
  }, [data?.metaType1, data?.fileName]);

  // آپلود و تبدیل به متن
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const arrayBuffer = ev.target?.result;
      try {
        if (arrayBuffer instanceof ArrayBuffer) {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setContent(result.value);
          const text = result.value.replace(/<[^>]*>?/gm, "");
          setEditorValue(text);
          if (onMetaChange) {
            onMetaChange({ metaType1: text, fileName: file.name });
          }
        } else {
          setContent("<p style='color:red'>فرمت فایل مناسب نیست</p>");
        }
      } catch (err) {
        setContent("<p style='color:red'>خطا در نمایش فایل ورد</p>");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ذخیره docx
  const handleDownload = async () => {
    const paragraphs = editorValue.split(/\r?\n/).map((line) =>
      new Paragraph({ children: [new TextRun(line)] })
    );
    const doc = new Document({ sections: [{ children: paragraphs }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName || "edited.docx");
  };

  // هر تغییر در textarea => ذخیره در metaType1 و آپدیت preview
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setEditorValue(value);
    setContent(
      value.replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;")
    );
    if (onMetaChange) {
      onMetaChange({ metaType1: value, fileName });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <input
        type="file"
        accept=".docx"
        ref={inputRef}
        onChange={handleFileChange}
        style={{ marginBottom: 18 }}
      />
      <div style={{ marginBottom: 8, color: "#888" }}>
        {fileName && `نام فایل: ${fileName}`}
      </div>
      {loading ? (
        <div style={{ color: "#4f46e5", margin: "20px 0", fontWeight: "bold" }}>در حال بارگذاری فایل ...</div>
      ) : (
        <>
          <textarea
            style={{
              width: "100%",
              minHeight: 200,
              marginBottom: 16,
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: 10,
              fontSize: 16,
              direction: "rtl",
              fontFamily: "Vazirmatn, Tahoma, sans-serif",
            }}
            value={editorValue}
            onChange={handleTextareaChange}
          />
          <div style={{ display: "flex", gap: 12 }}>
            <button
              style={{
                padding: "10px 32px",
                fontSize: 16,
                borderRadius: 8,
                background: "#4f46e5",
                color: "#fff",
                fontWeight: "bold",
                border: "none",
              }}
              onClick={handleDownload}
              disabled={!editorValue}
            >
              دانلود ورد ویرایش‌شده
            </button>
            {onNew && (
              <button
                style={{
                  padding: "10px 24px",
                  background: "#14b8a6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: "bold",
                  fontSize: 16,
                }}
                onClick={onNew}
              >
                New
              </button>
            )}
          </div>

        </>
      )}
    </div>
  );
};

export default WordPanelOld;
