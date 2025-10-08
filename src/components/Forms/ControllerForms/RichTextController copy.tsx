// Simple, free React text editor using React-Quill (TypeScript + no license key)
// Usage:
//   npm i react-quill quill
//   import "react-quill/dist/quill.snow.css";
//   <SimpleEditor />

import { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill, { type ReactQuillProps } from "react-quill";

export default function SimpleEditor() {
  const [value, setValue] = useState("");
  const quillRef = useRef<ReactQuill | null>(null);

  // Toolbar — اضافه شدن گزینه هدینگ و حذف گزینه‌های غیرضروری
  const modules = useMemo<NonNullable<ReactQuillProps["modules"]>>(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }], // هدینگ‌ها
        ["bold", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: "" }, { align: "center" }, { align: "right" }],
        ["link"],
      ],
    }),
    []
  );

  const formats: NonNullable<ReactQuillProps["formats"]> = [
    "header",
    "bold",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "direction",
    "link",
    'table'
  ];

  // پیش‌فرض: RTL + راست‌چین (بدون اجبار CSS)
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const applyDefaultsIfEmpty = () => {
      if (quill.getLength() <= 1) {
        quill.root.setAttribute("dir", "rtl");
        quill.format("direction", "rtl");
        quill.format("align", "right");
      }
    };

    applyDefaultsIfEmpty();
    quill.on("text-change", applyDefaultsIfEmpty);
    return () => {
      quill.off("text-change", applyDefaultsIfEmpty);
    };
  }, []);

  // تولتیپ فارسی برای دکمه‌های موجود
  useEffect(() => {
    const toolbar = document.querySelector(".ql-toolbar");
    if (!toolbar) return;

    const set = (selector: string, text: string) => {
      toolbar.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        el.setAttribute("data-tooltip", text);
      });
    };

    set(".ql-bold", "پررنگ");
    set(".ql-underline", "زیرخط");
    set(".ql-strike", "خط‌خورده");
    set('.ql-list[value="ordered"]', "فهرست عددی");
    set('.ql-list[value="bullet"]', "فهرست نقطه‌ای");
    set(".ql-link", "پیوند");

    // هدینگ‌ها
    set(".ql-header .ql-picker-label", "تیتر");
    set('.ql-header .ql-picker-item[data-value="1"]', "تیتر ۱");
    set('.ql-header .ql-picker-item[data-value="2"]', "تیتر ۲");
    set('.ql-header .ql-picker-item[data-value="3"]', "تیتر ۳");
    set('.ql-header .ql-picker-item[data-value="false"]', "متن عادی");

    // هاور برای دکمه‌های تراز
    set('.ql-align[value="right"]', "راست‌چین");
    set('.ql-align[value="center"]', "وسط‌چین");
    set('.ql-align[value=""]', "چپ‌چین");
    set('.ql-align:not([value])', "چپ‌چین");
  }, []);

  return (
    <div className="w-full bg-slate-50 p-3">
      <div
        className="max-w-3xl mx-auto rounded-2xl border border-slate-200 shadow-sm bg-white"
        style={{ overflow: "visible" }}
      >
        <ReactQuill
          ref={quillRef as any}
          theme="snow"
          value={value}
          onChange={setValue}
          modules={modules}
          formats={formats}
          placeholder="اینجا تایپ کنید…"
        />
      </div>

      {/* UI fixes & Persian hover-tooltips */}
      <style>{`
        /* فقط جهت را اعمال می‌کنیم؛ تراز را به Quill می‌سپاریم */
        .ql-editor { direction: rtl; }
        .ql-editor.ql-blank::before { left: auto; right: 12px; direction: rtl; text-align: right; }

        /* Dropdown های Quill روی کارت بریزند */
        .ql-toolbar .ql-picker { overflow: visible; }
        .ql-toolbar .ql-picker-options { z-index: 50; }

        /* استایل ظرف */
        .ql-container.ql-snow { border: none; }
        .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid #e5e7eb; border-radius: 1rem 1rem 0 0; }
        .ql-container.ql-snow { border-radius: 0 0 1rem 1rem; }

        /* Tooltip فارسی */
        .ql-toolbar button,
        .ql-toolbar .ql-picker-label { position: relative; }

        .ql-toolbar button[data-tooltip]::after,
        .ql-toolbar .ql-picker-label[data-tooltip]::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 120%;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          color: #fff;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          line-height: 1.2;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity .15s ease;
          z-index: 100;
        }

        .ql-toolbar button[data-tooltip]:hover::after,
        .ql-toolbar .ql-picker-label[data-tooltip]:hover::after { opacity: 1; }
      `}</style>
    </div>
  );
}