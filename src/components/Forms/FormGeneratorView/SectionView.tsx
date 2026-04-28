// src/components/ControllerForms/SectionView.tsx
import React from "react";

interface SectionViewProps {
  data?: {
    DisplayName?: string;
    PersianName?: string;
    BgColor?: string;
    TextColor?: string;
    Align?: "left" | "center" | "right";
  };
  isFaMode?: boolean;
}

const SectionView: React.FC<SectionViewProps> = ({ data, isFaMode = false }) => {
  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || "Section"
    : data?.DisplayName || data?.PersianName || "Section";

  const bg = data?.BgColor || "#e5e7eb";
  const color = data?.TextColor || "#000000";
  const align = data?.Align || "center";

  console.log("title", label);

  return (
    <div
      className="font-semibold p-4 rounded-md"
      style={{ backgroundColor: bg, color, textAlign: align as any }}
    >
      {label}
    </div>
  );
};

export default SectionView;