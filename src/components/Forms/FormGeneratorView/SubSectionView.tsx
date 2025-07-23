// src/components/ControllerForms/SubSectionView.tsx
import React from "react";

interface SubSectionViewProps {
  data?: {
    DisplayName?: string;
    BgColor?: string;
    TextColor?: string;
    Align?: "left" | "center" | "right";
  };
  selectedRow?: any; // فقط برای سازگاری با سایر ویوها، درصورت عدم نیاز می‌توانید حذف کنید
}

const SubSectionView: React.FC<SubSectionViewProps> = ({ data }) => {
  const title = data?.DisplayName || "Sub Section";
  const bg = data?.BgColor || "#d1d5db";      // gray-300
  const color = data?.TextColor || "#000000"; // black
  const align = data?.Align || "center";

  return (
    <div
      className="font-normal p-2 rounded-md"
      style={{ backgroundColor: bg, color, textAlign: align as any }}
    >
      {title}
    </div>
  );
};

export default SubSectionView;
