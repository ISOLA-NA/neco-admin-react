// TabContent.tsx
import React from 'react';

interface TabContentProps {
  ActiveComponent: React.LazyExoticComponent<React.FC> | null;
}

const TabContent: React.FC<TabContentProps> = ({ ActiveComponent }) => {
  return (
    <div className='flex-grow bg-white overflow-auto p-6 mt-4 border border-gray-300 rounded-lg mx-4 mb-6'>
      <React.Suspense fallback={<div>Loading...</div>}>
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <div>Component Not Found</div>
        )}
      </React.Suspense>
    </div>
  );
};

export default TabContent;
