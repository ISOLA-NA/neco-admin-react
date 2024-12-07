// TabbedInterface.tsx
import React, { useState, useRef } from 'react';
import MainTabs from './MainTabs';
import SubTabs from './SubTabs';
import TabContent from './TabContent';

// تعریف تایپ‌ها
interface TabsData {
  [key: string]: {
    groups?: Array<{
      label: string;
      subtabs: string[];
    }>;
    subtabs?: string[];
  };
}

interface ComponentMapping {
  [key: string]: {
    [key: string]: React.LazyExoticComponent<React.FC>;
  };
}

// داده‌های تب‌ها
const tabsData: TabsData = {
  General: {
    groups: [
      {
        label: 'Settings',
        subtabs: ['Configurations', 'Commands', 'Ribbons'],
      },
      {
        label: 'Users Roles',
        subtabs: ['Users', 'Roles', 'Staffing', 'RoleGroups', 'Enterprises'],
      },
    ],
  },
  Forms: {
    subtabs: ['Forms', 'Categories'],
  },
  ApprovalFlows: {
    subtabs: ['ApprovalFlows', 'ApprovalChecklist'],
  },
  Programs: {
    subtabs: ['ProgramTemplate', 'ProgramTypes'],
  },
  Projects: {
    subtabs: ['Projects', 'ProjectsAccess', 'Odp', 'Procedures', 'Calendars'],
  },
};

// نقشه‌ی کامپوننت‌ها
const componentMapping: ComponentMapping = {
  General: {
    Configurations: React.lazy(() => import('../General/Configurations')),
    Commands: React.lazy(() => import('../General/CommandSettings')),
    Ribbons: React.lazy(() => import('../General/Ribbons')),
    Users: React.lazy(() => import('../General/Users')),
    Roles: React.lazy(() => import('../General/Roles')),
    Staffing: React.lazy(() => import('../General/Staffing')),
    RoleGroups: React.lazy(() => import('../General/RoleGroups')),
    Enterprises: React.lazy(() => import('../General/Enterprises')),
  },
  Forms: {
    Forms: React.lazy(() => import('../Forms/Forms')),
    Categories: React.lazy(() => import('../Forms/Categories')),
  },
  ApprovalFlows: {
    ApprovalFlows: React.lazy(() => import('../ApprovalFlows/ApprovalFlows')),
    ApprovalChecklist: React.lazy(
      () => import('../ApprovalFlows/ApprovalChecklist')
    ),
  },
  Programs: {
    ProgramTemplate: React.lazy(() => import('../Programs/ProgramTemplate')),
    ProgramTypes: React.lazy(() => import('../Programs/ProgramTypes')),
  },
  Projects: {
    Projects: React.lazy(() => import('../Projects/Projects')),
    ProjectsAccess: React.lazy(() => import('../Projects/ProjectsAccess')),
    Odp: React.lazy(() => import('../Projects/Odp')),
    Procedures: React.lazy(() => import('../Projects/Procedures')),
    Calendars: React.lazy(() => import('../Projects/Calendars')),
  },
};

const TabbedInterface: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<string>('General');
  const [activeSubTab, setActiveSubTab] = useState<string>('Configurations');

  const mainTabsRef = useRef<HTMLDivElement>(null);
  const subTabsRef = useRef<HTMLDivElement>(null);

  const handleMainTabChange = (tabName: string) => {
    setActiveMainTab(tabName);
    const firstGroup = tabsData[tabName].groups
      ? tabsData[tabName].groups![0].subtabs[0]
      : tabsData[tabName].subtabs![0];
    setActiveSubTab(firstGroup);
    // اسکرول به ابتدای تب‌ها
    mainTabsRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
    subTabsRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const handleSubTabChange = (subtab: string) => {
    setActiveSubTab(subtab);
    // اسکرول به ابتدای ساب‌تب‌ها
    subTabsRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const scrollMainTabs = (direction: 'left' | 'right') => {
    if (mainTabsRef.current) {
      const scrollAmount = 150;
      mainTabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const scrollSubTabs = (direction: 'left' | 'right') => {
    if (subTabsRef.current) {
      const scrollAmount = 150;
      subTabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const ActiveComponent =
    componentMapping[activeMainTab]?.[activeSubTab] || null;

  return (
    <div className='w-full h-screen flex flex-col bg-gray-100 overflow-x-hidden'>
      {/* تب‌های اصلی */}
      <MainTabs
        tabs={Object.keys(tabsData)}
        activeTab={activeMainTab}
        onTabChange={handleMainTabChange}
        scrollLeft={() => scrollMainTabs('left')}
        scrollRight={() => scrollMainTabs('right')}
        tabsRef={mainTabsRef}
      />

      {/* ساب‌تب‌ها */}
      <SubTabs
        groups={tabsData[activeMainTab].groups}
        subtabs={tabsData[activeMainTab].subtabs}
        activeSubTab={activeSubTab}
        onSubTabChange={handleSubTabChange}
        scrollLeft={() => scrollSubTabs('left')}
        scrollRight={() => scrollSubTabs('right')}
        subTabsRef={subTabsRef}
      />

      {/* محتوای تب */}
      <TabContent ActiveComponent={ActiveComponent} />
    </div>
  );
};

export default TabbedInterface;
