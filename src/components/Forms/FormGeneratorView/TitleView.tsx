// src/components/Forms/FORMGENERATORVIEW/TitleView.tsx
import React from "react";

interface TitleViewProps {
  data?: {
    DisplayName?: string;
    // اگر در آینده متادیتایی مثل سایز/رنگ داشتید اینجا اضافه کنید
  };
  /** از FormGeneratorView پاس می‌شود؛ فقط همین بلاک را راست‌چین/چپ‌چین می‌کنیم */
  rtl?: boolean;
}

const TitleView: React.FC<TitleViewProps> = ({ data, rtl = false }) => {
  const text = data?.DisplayName ?? "Title";

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="w-full"
      style={{ unicodeBidi: "plaintext" }}
    >
      <h1
        className="font-bold text-xl"
        style={{ textAlign: rtl ? "right" : "left" }}
      >
        {text}
      </h1>

      {/* در صورت نیاز می‌تونی یک خط زیر عنوان هم داشته باشی */}
      {/* <div className="mt-1 h-px bg-gray-200" /> */}
    </div>
  );
};

export default TitleView;
