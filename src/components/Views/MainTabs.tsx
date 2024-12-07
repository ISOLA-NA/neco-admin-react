// MainTabs.tsx
import React from 'react';
import ScrollButton from './ScrollButton';

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
    <div className='relative mx-4'>
      {/* دکمه اسکرول سمت چپ */}
      <ScrollButton
        direction='left'
        onClick={scrollLeft}
        ariaLabel='Scroll Main Tabs Left'
      />

      {/* کانتینر تب‌ها با padding مناسب */}
      <div
        className='flex space-x-2 overflow-x-auto scrollbar-hide px-4 py-2 bg-white border-b border-gray-300 pl-10 pr-10'
        ref={tabsRef}
      >
        {tabs.map((tabName) => (
          <button
            key={tabName}
            className={`m-1 px-4 py-1 rounded text-sm transition-all ${
              activeTab === tabName
                ? 'bg-orange-500 text-black font-semibold'
                : 'text-gray-700 hover:bg-orange-200'
            }`}
            onClick={() => onTabChange(tabName)}
          >
            {tabName}
          </button>
        ))}
      </div>

      {/* دکمه اسکرول سمت راست */}
      <ScrollButton
        direction='right'
        onClick={scrollRight}
        ariaLabel='Scroll Main Tabs Right'
      />
    </div>
  );
};

export default MainTabs;
