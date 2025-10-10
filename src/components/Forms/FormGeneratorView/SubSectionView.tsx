// src/components/ControllerForms/SubSectionView.tsx
import React from "react";

interface SubSectionViewProps {
  data?: {
    DisplayName?: string;
    BgColor?: string;
    TextColor?: string;
    Align?: "left" | "center" | "right";
  };
  selectedRow?: any;
  /** از FormGeneratorView پاس می‌شود */
  rtl?: boolean;
}

const SubSectionView: React.FC<SubSectionViewProps> = ({
  data,
  rtl = false,
}) => {
  const title = data?.DisplayName || "Sub Section";
  const bg = data?.BgColor || "#d1d5db"; // gray-300
  const color = data?.TextColor || "#000000"; // black
  const align = data?.Align || (rtl ? "right" : "left");

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="font-normal p-2 rounded-md"
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

export default SubSectionView;
