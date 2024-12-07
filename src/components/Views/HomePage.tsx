import React, { useState, useRef } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface TabsData {
  [key: string]: {
    groups?: Array<{
      label: string
      subtabs: string[]
    }>
    subtabs?: string[]
  }
}

interface ComponentMapping {
  [key: string]: {
    [key: string]: React.LazyExoticComponent<React.FC>
  }
}

const tabsData: TabsData = {
  General: {
    groups: [
      {
        label: 'Settings',
        subtabs: ['Configurations', 'Commands', 'Ribbons']
      },
      {
        label: 'Users Roles',
        subtabs: ['Users', 'Roles', 'Staffing', 'RoleGroups', 'Enterprises']
      }
    ]
  },
  Forms: {
    subtabs: ['Forms', 'Categories']
  },
  ApprovalFlows: {
    subtabs: ['ApprovalFlows', 'ApprovalChecklist']
  },
  Programs: {
    subtabs: ['ProgramTemplate', 'ProgramTypes']
  },
  Projects: {
    subtabs: ['Projects', 'ProjectsAccess', 'Odp', 'Procedures', 'Calendars']
  }
}

const componentMapping: ComponentMapping = {
  General: {
    Configurations: React.lazy(() => import('../General/Configurations')),
    Commands: React.lazy(() => import('../General/CommandSettings')),
    Ribbons: React.lazy(() => import('../General/Ribbons')),
    Users: React.lazy(() => import('../General/Users')),
    Roles: React.lazy(() => import('../General/Roles')),
    Staffing: React.lazy(() => import('../General/Staffing')),
    RoleGroups: React.lazy(() => import('../General/RoleGroups')),
    Enterprises: React.lazy(() => import('../General/Enterprises'))
  },
  Forms: {
    Forms: React.lazy(() => import('../Forms/Forms')),
    Categories: React.lazy(() => import('../Forms/Categories'))
  },
  ApprovalFlows: {
    ApprovalFlows: React.lazy(() => import('../ApprovalFlows/ApprovalFlows')),
    ApprovalChecklist: React.lazy(
      () => import('../ApprovalFlows/ApprovalChecklist')
    )
  },
  Programs: {
    ProgramTemplate: React.lazy(() => import('../Programs/ProgramTemplate')),
    ProgramTypes: React.lazy(() => import('../Programs/ProgramTypes'))
  },
  Projects: {
    Projects: React.lazy(() => import('../Projects/Projects')),
    ProjectsAccess: React.lazy(() => import('../Projects/ProjectsAccess')),
    Odp: React.lazy(() => import('../Projects/Odp')),
    Procedures: React.lazy(() => import('../Projects/Procedures')),
    Calendars: React.lazy(() => import('../Projects/Calendars'))
  }
}

const TabbedInterface: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<string>('General')
  const [activeSubTab, setActiveSubTab] = useState<string>('Configurations')

  const mainTabsRef = useRef<HTMLDivElement>(null)
  const subTabsRef = useRef<HTMLDivElement>(null)

  const handleMainTabChange = (tabName: string) => {
    setActiveMainTab(tabName)
    const firstGroup = tabsData[tabName].groups
      ? tabsData[tabName].groups![0].subtabs[0]
      : tabsData[tabName].subtabs![0]
    setActiveSubTab(firstGroup)
    // Scroll to start when tab changes
    mainTabsRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
    subTabsRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
  }

  const handleSubTabChange = (subtab: string) => {
    setActiveSubTab(subtab)
    // Scroll to start when subtab changes
    subTabsRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
  }

  const scrollMainTabs = (direction: 'left' | 'right') => {
    if (mainTabsRef.current) {
      const scrollAmount = 150
      mainTabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const scrollSubTabs = (direction: 'left' | 'right') => {
    if (subTabsRef.current) {
      const scrollAmount = 150
      subTabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const ActiveComponent =
    componentMapping[activeMainTab]?.[activeSubTab] || null

  return (
    <div className='w-full h-screen flex flex-col overflow-hidden bg-gray-100'>
      {/* Main Tabs */}
      <div className='relative mx-4'>
        {/* Left Arrow */}
        <button
          className='absolute left-0 top-0 bottom-0 m-auto h-8 w-8 bg-white bg-opacity-50 rounded-full shadow-md flex items-center justify-center z-10 md:hidden'
          onClick={() => scrollMainTabs('left')}
          aria-label='Scroll Left'
        >
          <FaChevronLeft />
        </button>

        {/* Tabs Container */}
        <div
          className='flex space-x-2 overflow-x-auto scrollbar-hide px-4 py-2 bg-white border-b border-gray-300'
          ref={mainTabsRef}
        >
          {Object.keys(tabsData).map(tabName => (
            <button
              key={tabName}
              className={`m-1 px-4 py-1 rounded text-sm transition-all ${
                activeMainTab === tabName
                  ? 'bg-orange-500 text-black font-semibold'
                  : 'text-gray-700 hover:bg-orange-200'
              }`}
              onClick={() => handleMainTabChange(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          className='absolute right-0 top-0 bottom-0 m-auto h-8 w-8 bg-white bg-opacity-50 rounded-full shadow-md flex items-center justify-center z-10 md:hidden'
          onClick={() => scrollMainTabs('right')}
          aria-label='Scroll Right'
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Sub Tabs with Icons */}
      <div className='relative mt-2 mx-4'>
        {/* Left Arrow */}
        <button
          className='absolute left-0 top-0 bottom-0 m-auto h-6 w-6 bg-white bg-opacity-50 rounded-full shadow-md flex items-center justify-center z-10 md:hidden'
          onClick={() => scrollSubTabs('left')}
          aria-label='Scroll Left'
        >
          <FaChevronLeft size={12} />
        </button>

        {/* SubTabs Container */}
        <div
          className='flex items-start space-x-4 overflow-x-auto scrollbar-hide px-4 py-2 bg-white border-b border-gray-300'
          ref={subTabsRef}
        >
          {tabsData[activeMainTab].groups ? (
            tabsData[activeMainTab].groups!.map((group, groupIndex) => (
              <React.Fragment key={group.label}>
                <div className='flex flex-col items-center space-y-2'>
                  <div className='flex space-x-4'>
                    {group.subtabs.map(subtab => (
                      <button
                        key={subtab}
                        className={`flex flex-col items-center space-y-1 p-2 text-xs rounded text-center transition-all ${
                          activeSubTab === subtab
                            ? 'bg-orange-500 text-black shadow-md transform scale-105'
                            : 'text-gray-700 hover:bg-orange-200'
                        }`}
                        onClick={() => handleSubTabChange(subtab)}
                      >
                        <div className='w-12 h-12 bg-gray-300 rounded-full'></div>
                        <span>{subtab}</span>
                      </button>
                    ))}
                  </div>
                  <span className='text-xs text-gray-500 ' style={{marginTop:"30px"}}>{group.label}</span>
                </div>
                {groupIndex < tabsData[activeMainTab].groups!.length - 1 && (
                  <div className='self-stretch w-px bg-orange-500 mx-4'></div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div className='flex flex-col items-center space-y-2'>
              <div className='flex space-x-4'>
                {tabsData[activeMainTab].subtabs!.map(subtab => (
                  <button
                    key={subtab}
                    className={`flex flex-col items-center space-y-1 p-2 text-xs rounded text-center transition-all ${
                      activeSubTab === subtab
                        ? 'bg-orange-500 text-black shadow-md transform scale-105'
                        : 'text-gray-700 hover:bg-orange-200'
                    }`}
                    onClick={() => handleSubTabChange(subtab)}
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

        {/* Right Arrow */}
        <button
          className='absolute right-0 top-0 bottom-0 m-auto h-6 w-6 bg-white bg-opacity-50 rounded-full shadow-md flex items-center justify-center z-10 md:hidden'
          onClick={() => scrollSubTabs('right')}
          aria-label='Scroll Right'
        >
          <FaChevronRight size={12} />
        </button>
      </div>

      {/* محتوای تب */}
      <div className='flex-grow bg-white overflow-auto p-6 mt-4 border border-gray-300 rounded-lg mx-4 mb-6'>
        <React.Suspense fallback={<div>Loading...</div>}>
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div>Component Not Found</div>
          )}
        </React.Suspense>
      </div>
    </div>
  )
}

export default TabbedInterface
