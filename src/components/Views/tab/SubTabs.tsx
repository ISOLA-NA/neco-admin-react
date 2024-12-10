// src/components/Views/tab/SubTabs.tsx
import React from "react";
import ScrollButton from "./ScrollButton";

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
    <div className="relative mt-2 mx-4">
      {/* دکمه اسکرول سمت چپ */}
      <ScrollButton
        direction="left"
        onClick={scrollLeft}
        size={12}
        ariaLabel="اسکرول به چپ برای زیرتب‌ها"
      />

      {/* کانتینر ساب‌تب‌ها با ارتفاع ثابت */}
      <div
        className="flex items-start space-x-6 overflow-x-auto scrollbar-hide px-6 py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 rounded-lg shadow-xl"
        ref={subTabsRef}
      >
        {groups ? (
          groups.map((group, groupIndex) => (
            <React.Fragment key={group.label}>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex space-x-4">
                  {group.subtabs.map((subtab) => (
                    <button
                      key={subtab}
                      className="flex flex-col items-center space-y-1 p-2 text-xs rounded-full relative focus:outline-none"
                      onClick={() => onSubTabChange(subtab)}
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <span
                        className={`inline-block transition-colors duration-300 ${
                          activeSubTab === subtab
                            ? "text-white font-medium border-b-2 border-white"
                            : "text-white border-b-2 border-transparent hover:text-indigo-200"
                        }`}
                      >
                        {subtab}
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-xs text-white mt-3">{group.label}</span>
              </div>
              {groupIndex < groups.length - 1 && (
                <div className="self-stretch w-px bg-white mx-4"></div>
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="flex space-x-4">
              {subtabs!.map((subtab) => (
                <button
                  key={subtab}
                  className="flex flex-col items-center space-y-1 p-2 text-xs rounded-full relative focus:outline-none"
                  onClick={() => onSubTabChange(subtab)}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <span
                    className={`inline-block transition-colors duration-300 ${
                      activeSubTab === subtab
                        ? "text-white font-medium border-b-2 border-white"
                        : "text-white border-b-2 border-transparent hover:text-indigo-200"
                    }`}
                  >
                    {subtab}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* خط عمودی انتهای کل ساب‌تب‌ها */}
        <div className="self-stretch w-px bg-white"></div>
      </div>

      {/* دکمه اسکرول سمت راست */}
      <ScrollButton
        direction="right"
        onClick={scrollRight}
        size={12}
        ariaLabel="اسکرول به راست برای زیرتب‌ها"
      />
    </div>
  );
};

export default SubTabs;
