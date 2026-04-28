import React from "react";

interface TitleViewProps {
  data?: {
    DisplayName?: string;
    PersianName?: string;
  };
  isFaMode?: boolean;
}

const TitleView: React.FC<TitleViewProps> = ({ data, isFaMode = false }) => {
  const label = isFaMode
    ? data?.PersianName || data?.DisplayName || "Title"
    : data?.DisplayName || data?.PersianName || "Title";

  return (
    <div className="flex items-center justify-center h-full">
      <h1 className="text-center font-bold">{label}</h1>
    </div>
  );
};

export default TitleView;