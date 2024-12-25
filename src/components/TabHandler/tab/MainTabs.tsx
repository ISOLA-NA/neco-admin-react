// src/components/Views/tab/MainTabs.tsx

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
    <div className="relative mx-4 mt-1">
      {/* دکمه اسکرول سمت چپ */}
      <ScrollButton
        direction="left"
        onClick={scrollLeft}
        ariaLabel="اسکرول به چپ برای تب‌ها"
      />

      {/* کانتینر تب‌ها */}
      <div
        className="flex space-x-3 overflow-x-auto scrollbar-hide px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-md"
        ref={tabsRef}
      >
        {tabs.map((tabName) => (
          <button
            key={tabName}
            className={`px-4 py-1 text-xs font-medium rounded-full transition-all duration-300 transform ${
              activeTab === tabName
                ? "bg-white text-indigo-700 shadow-sm scale-100"
                : "text-white hover:bg-indigo-600 hover:scale-100"
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
