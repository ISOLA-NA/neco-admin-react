// src/components/ControllerForms/SectionView.tsx
import React from "react";

interface SectionViewProps {
  data?: {
    DisplayName?: string;
    BgColor?: string; // رنگ پس‌زمینه
    TextColor?: string; // رنگ متن
    Align?: "left" | "center" | "right";
  };
  /** از FormGeneratorView پاس می‌شود */
  rtl?: boolean;
}

const SectionView: React.FC<SectionViewProps> = ({ data, rtl = false }) => {
  const title = data?.DisplayName || "Section";
  const bg = data?.BgColor || "#e5e7eb"; // gray-300
  const color = data?.TextColor || "#000000"; // black
  const align = data?.Align || (rtl ? "right" : "left");

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="p-4 rounded-md font-semibold"
      style={{
        backgroundColor: bg,
        color,
        textAlign: align as any,
        unicodeBidi: "plaintext",
      }}
    >
      {title}
    </div>
  );
};

export default SectionView;
