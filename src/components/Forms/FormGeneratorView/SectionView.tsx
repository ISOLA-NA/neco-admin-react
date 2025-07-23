// src/components/ControllerForms/SectionView.tsx
import React from "react";

interface SectionViewProps {
  data?: {
    DisplayName?: string;
    // در صورت نیاز می‌توانید پراپرتی‌های دیگری هم اضافه کنید
    BgColor?: string;     // مثلاً برای پس‌زمینه
    TextColor?: string;   // رنگ متن
    Align?: "left" | "center" | "right";
  };
}

const SectionView: React.FC<SectionViewProps> = ({ data }) => {
  const title = data?.DisplayName || "Section";
  const bg = data?.BgColor || "#e5e7eb";      // gray-300
  const color = data?.TextColor || "#000000"; // black
  const align = data?.Align || "center";

  console.log("title", title) 

  return (
    <div
      className="font-semibold p-4 rounded-md"
      style={{ backgroundColor: bg, color, textAlign: align as any }}
    >
      {title}
    </div>
  );
};

export default SectionView;
