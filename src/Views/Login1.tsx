import React, { useRef, useState } from "react";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const WordPanel: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [editorValue, setEditorValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

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
          setEditorValue(result.value.replace(/<[^>]*>?/gm, "")); // متن خالص بدون تگ
        } else {
          setContent("<p style='color:red'>فرمت فایل مناسب نیست</p>");
        }
      } catch (err) {
        setContent("<p style='color:red'>خطا در نمایش فایل ورد</p>");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ساخت فایل docx و دانلود
  const handleDownload = async () => {
    // هر خط یک پاراگراف در ورد جدید
    const paragraphs = editorValue.split(/\r?\n/).map((line) => 
      new Paragraph({ children: [new TextRun(line)] })
    );

    const doc = new Document({ sections: [{ children: paragraphs }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName || "edited.docx");
  };

  return (
    <div style={{ padding: 40 }}>
      <input
        type="file"
        accept=".docx"
        ref={inputRef}
        onChange={handleFileChange}
      />
      <div style={{ marginTop: 16, marginBottom: 8, color: "#888" }}>
        {fileName && `نام فایل: ${fileName}`}
      </div>

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
        onChange={(e) => setEditorValue(e.target.value)}
      />

      <button
        style={{
          padding: "12px 32px",
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
    </div>
  );
};

export default WordPanel;
