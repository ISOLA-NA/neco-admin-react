// src/components/ControllerForms/SubSectionView.tsx
import React from "react";

interface SubSectionViewProps {
  data?: {
    DisplayName?: string;
    PersianName?: string;
    BgColor?: string;
    TextColor?: string;
    Align?: "left" | "center" | "right";
  };
  selectedRow?: any;
  isFaMode?: boolean;
}

const SubSectionView: React.FC<SubSectionViewProps> = ({
  data,
  isFaMode = false,
}) => {
  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || "Sub Section"
    : data?.DisplayName || data?.PersianName || "Sub Section";

  const bg = data?.BgColor || "#d1d5db";
  const color = data?.TextColor || "#000000";
  const align = data?.Align || "center";

  return (
    <div
      className="font-normal p-2 rounded-md"
      style={{ backgroundColor: bg, color, textAlign: align as any }}
    >
      {label}
    </div>
  );
};

export default SubSectionView;