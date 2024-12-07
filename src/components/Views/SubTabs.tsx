// SubTabs.tsx
import React from 'react';
import ScrollButton from './ScrollButton';

interface SubTabsProps {
  groups?: Array<{
    label: string;
    subtabs: string[];
  }>;
  subtabs?: string[];
  activeSubTab: string;
  onSubTabChange: (subtab: string) => void;
  scrollLeft: () => void;
  scrollRight: () => void;
  subTabsRef: React.RefObject<HTMLDivElement>;
}

const SubTabs: React.FC<SubTabsProps> = ({
  groups,
  subtabs,
  activeSubTab,
  onSubTabChange,
  scrollLeft,
  scrollRight,
  subTabsRef,
}) => {
  return (
    <div className='relative mt-2 mx-4'>
      {/* دکمه اسکرول سمت چپ */}
      <ScrollButton
        direction='left'
        onClick={scrollLeft}
        size={12}
        ariaLabel='Scroll SubTabs Left'
      />

      {/* کانتینر ساب‌تب‌ها با padding مناسب */}
      <div
        className='flex items-start space-x-4 overflow-x-auto scrollbar-hide px-4 py-2 bg-white border-b border-gray-300 pl-10 pr-10'
        ref={subTabsRef}
      >
        {groups ? (
          groups.map((group, groupIndex) => (
            <React.Fragment key={group.label}>
              <div className='flex flex-col items-center space-y-2'>
                <div className='flex space-x-4'>
                  {group.subtabs.map((subtab) => (
                    <button
                      key={subtab}
                      className={`flex flex-col items-center space-y-1 p-2 text-xs rounded text-center transition-all ${
                        activeSubTab === subtab
                          ? 'bg-orange-500 text-black shadow-md transform scale-105'
                          : 'text-gray-700 hover:bg-orange-200'
                      }`}
                      onClick={() => onSubTabChange(subtab)}
                    >
                      <div className='w-12 h-12 bg-gray-300 rounded-full'></div>
                      <span>{subtab}</span>
                    </button>
                  ))}
                </div>
                <span className='text-xs text-gray-500' style={{ marginTop: '30px' }}>
                  {group.label}
                </span>
              </div>
              {groupIndex < groups.length - 1 && (
                <div className='self-stretch w-px bg-orange-500 mx-4'></div>
              )}
            </React.Fragment>
          ))
        ) : (
          <div className='flex flex-col items-center space-y-2'>
            <div className='flex space-x-4'>
              {subtabs!.map((subtab) => (
                <button
                  key={subtab}
                  className={`flex flex-col items-center space-y-1 p-2 text-xs rounded text-center transition-all ${
                    activeSubTab === subtab
                      ? 'bg-orange-500 text-black shadow-md transform scale-105'
                      : 'text-gray-700 hover:bg-orange-200'
                  }`}
                  onClick={() => onSubTabChange(subtab)}
                >
                  <div className='w-12 h-12 bg-gray-300 rounded-full'></div>
                  <span>{subtab}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* خط عمودی انتهای کل ساب‌تب‌ها */}
        <div className='self-stretch w-px bg-orange-500'></div>
      </div>

      {/* دکمه اسکرول سمت راست */}
      <ScrollButton
        direction='right'
        onClick={scrollRight}
        size={12}
        ariaLabel='Scroll SubTabs Right'
      />
    </div>
  );
};

export default SubTabs;
