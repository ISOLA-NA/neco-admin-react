import React, { useState, useMemo } from "react";

interface TabViewProps {
  data?: {
    metaType1?: string;
  };
}

const TabView: React.FC<TabViewProps> = ({ data }) => {
  // تبدیل متن metaType1 به آرایه‌ای از تب‌ها با استفاده از useMemo
  const tabs = useMemo(() => {
    return data?.metaType1
      ? data.metaType1.split("\n").map(tab => tab.trim()).filter(Boolean)
      : [];
  }, [data]);

  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-300">
      {/* نمایش تب‌ها */}
      <div className="flex border-b border-gray-300 mb-4">
        {tabs.map((tab, index) => (
          <div
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 cursor-pointer ${
              activeTab === index
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
          >
            {tab}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabView;
