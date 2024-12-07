// src/components/views/tab/MainTabs.tsx

import React from "react";
import ScrollButton from "./ScrollButton";

interface MainTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  scrollLeft: () => void;
  scrollRight: () => void;
  tabsRef: React.RefObject<HTMLDivElement>;
}

const MainTabs: React.FC<MainTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  scrollLeft,
  scrollRight,
  tabsRef,
}) => {
  return (
    <div className="relative mx-4">
      {/* دکمه اسکرول سمت چپ */}
      <ScrollButton
        direction="left"
        onClick={scrollLeft}
        ariaLabel="اسکرول به چپ برای تب‌ها"
      />

      {/* کانتینر تب‌ها */}
      <div
        className="flex space-x-4 overflow-x-auto scrollbar-hide px-6 py-3 bg-white border-b border-gray-300 rounded-lg shadow-md"
        ref={tabsRef}
      >
        {tabs.map((tabName) => (
          <button
            key={tabName}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
              activeTab === tabName
                ? "bg-orange-500 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:bg-orange-200 hover:text-black"
            }`}
            onClick={() => onTabChange(tabName)}
          >
            {tabName}
          </button>
        ))}
      </div>

      {/* دکمه اسکرول سمت راست */}
      <ScrollButton
        direction="right"
        onClick={scrollRight}
        ariaLabel="اسکرول به راست برای تب‌ها"
      />
    </div>
  );
};

export default MainTabs;
