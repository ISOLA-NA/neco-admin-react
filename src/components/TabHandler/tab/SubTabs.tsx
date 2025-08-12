// src/components/Views/tab/SubTabs.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import ScrollButton from "./ScrollButton";

interface SubTabsProps {
  groups?: Array<{
    label: string;       // کلید گروه (برای ترجمه)
    subtabs: string[];   // کلیدهای ساب‌تب
  }>;
  subtabs?: string[];    // وقتی گروه نداریم
  activeSubTab: string;
  onSubTabChange: (subtab: string) => void;
  scrollLeft: () => void;
  scrollRight: () => void;
  subTabsRef: React.RefObject<HTMLDivElement>;
  isLoading?: boolean;   // ← اختیاری
}

const subtabIcons: { [key: string]: string } = {
  Configurations: "/images/general/setting.png",
  Commands: "/images/general/command.png",
  Ribbons: "/images/general/menu.png",
  Users: "/images/general/Users.png",
  Roles: "/images/general/roles.png",
  Staffing: "/images/general/assignment.png",
  RoleGroups: "/images/general/grouping.png",
  Enterprises: "/images/general/company.png",

  Forms: "/images/forms/forms.png",
  Categories: "/images/forms/cata.png",

  ApprovalFlows: "/images/approval/appflow.png",
  ProgramTemplate: "/images/approval/check.png",
  ProgramTypes: "/images/approval/check.png",

  Projects: "/images/project/projects.png",
  ProjectsAccess: "/images/project/padlock.png",
  Odp: "/images/project/ODP.png",
  Procedures: "/images/project/proc.png",
  Calendars: "/images/project/calendar.png",
};

const SubTabs: React.FC<SubTabsProps> = ({
  groups,
  subtabs,
  activeSubTab,
  onSubTabChange,
  scrollLeft,
  scrollRight,
  subTabsRef,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  /** برای نمایش لیبل ترجمه‌شده یا کلید خام در صورت نبود ترجمه */
  const renderLabel = (key: string) => t(`SubMenu.${key}`, key);

  return (
    <div className="relative mt-1 mx-4">
      {/* دکمه اسکرول چپ */}
      <ScrollButton
        direction="left"
        onClick={scrollLeft}
        size={12}
        ariaLabel="اسکرول به چپ برای زیرتب‌ها"
      />

      {/* کانتینر ساب‌تب‌ها */}
      <div
        ref={subTabsRef}
        className="flex items-start space-x-5 overflow-x-auto scrollbar-hide px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 rounded-lg shadow-md"
      >
        {groups ? (
          groups.map((group, groupIndex) => (
            <React.Fragment key={group.label}>
              <div className="flex flex-col items-center space-y-1">
                {/* آیکون‌ها و ساب‌تب‌ها */}
                <div className="flex space-x-3">
                  {group.subtabs.map((subtab) => (
                    <button
                      key={subtab}
                      onClick={() => onSubTabChange(subtab)}
                      disabled={isLoading}
                      className="flex flex-col items-center space-y-0.5 p-1.5 text-xs rounded-full relative focus:outline-none"
                    >
                      <img
                        src={subtabIcons[subtab]}
                        alt={`${subtab} icon`}
                        className="w-6 h-6 object-cover"
                      />
                      <span
                        className={`inline-block transition-colors duration-300 ${
                          activeSubTab === subtab
                            ? "text-white font-medium border-b-2 border-white"
                            : "text-white border-b-2 border-transparent hover:text-indigo-200"
                        }`}
                      >
                        {renderLabel(subtab)}
                      </span>
                    </button>
                  ))}
                </div>

                {/* عنوان گروه */}
                <div style={{ marginTop: "15px" }}>
                  <span className="text-xs text-white">
                    {renderLabel(group.label)}
                  </span>
                </div>
              </div>

              {/* جداکننده بین گروه‌ها */}
              {groupIndex < groups.length - 1 && (
                <div className="self-stretch w-px bg-white mx-3" />
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="flex flex-col items-center space-y-1">
            <div className="flex space-x-3">
              {subtabs?.map((subtab) => (
                <button
                  key={subtab}
                  onClick={() => onSubTabChange(subtab)}
                  disabled={isLoading}
                  className="flex flex-col items-center space-y-0.5 p-1.5 text-xs rounded-full relative focus:outline-none"
                >
                  <img
                    src={subtabIcons[subtab]}
                    alt={`${subtab} icon`}
                    className="w-6 h-6 object-cover"
                  />
                  <span
                    className={`inline-block transition-colors duration-300 ${
                      activeSubTab === subtab
                        ? "text-white font-medium border-b-2 border-white"
                        : "text-white border-b-2 border-transparent hover:text-indigo-200"
                    }`}
                  >
                    {renderLabel(subtab)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* خط انتهایی ساب‌تب‌ها */}
        <div className="self-stretch w-px bg-white" />
      </div>

      {/* دکمه اسکرول راست */}
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
