// src/components/TabView.tsx
import React from "react";

interface TabViewProps {
  data?: {
    DisplayName?: string;
  };
}

const TabView: React.FC<TabViewProps> = ({ data }) => {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-300">
      <div className="text-xl font-bold text-gray-800">
        {data?.DisplayName || ""}
      </div>
    </div>
  );
};

export default TabView;
