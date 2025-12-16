// src/components/ControllerForms/RichTextControllerView.tsx
import React from "react";
import HTMLReactParser from "html-react-parser";

interface RichTextControllerViewProps {
  data?: any;
}

const RichTextControllerView: React.FC<RichTextControllerViewProps> = ({ data }) => {
  if (!data) return null;

  // عنوان فیلد: هم DisplayName هم label را ساپورت کن
  const displayName: string =
    data.DisplayName ??
    data.label ??
    "";

  // مقدار واقعی RichText:
  // 1) value
  // 2) metaType1
  // 3) entityValue.Value (اگر موجود بود)
  let rawHtml: string = "";

  if (typeof data.value === "string" && data.value.trim() !== "") {
    rawHtml = data.value;
  } else if (typeof data.metaType1 === "string" && data.metaType1.trim() !== "") {
    rawHtml = data.metaType1;
  } else if (
    data.entityValue &&
    typeof data.entityValue.Value === "string" &&
    data.entityValue.Value.trim() !== ""
  ) {
    rawHtml = data.entityValue.Value;
  }

  return (
    <div className="mt-4 p-4 bg-white border rounded shadow-sm">
      {displayName && (
        <label className="block mb-2 font-semibold text-gray-700">
          {displayName}
        </label>
      )}

      <div className="prose max-w-none" dir="rtl">
        {rawHtml && rawHtml.trim().length > 0 ? (
          HTMLReactParser(rawHtml)
        ) : (
          <span className="text-gray-400">— بدون مقدار —</span>
        )}
      </div>
    </div>
  );
};

export default RichTextControllerView;
