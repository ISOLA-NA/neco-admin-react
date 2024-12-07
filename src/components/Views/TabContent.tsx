// TabContent.tsx
import React from 'react';
import { Splitter, SplitterPanel } from 'primereact/splitter';

interface TabContentProps {
  ActiveComponent: React.LazyExoticComponent<React.FC> | null;
}

const TabContent: React.FC<TabContentProps> = ({ ActiveComponent }) => {
  return (
    <div className="flex-grow bg-white overflow-auto p-6 mt-4 border border-gray-300 rounded-lg mx-4 mb-6">
      <React.Suspense fallback={<div>Loading...</div>}>
        <Splitter style={{ height: '300px' }}>
          <SplitterPanel className="flex align-items-center justify-content-center">
            <div>
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.
            </div>
          </SplitterPanel>
          <SplitterPanel className="flex align-items-center justify-content-center">
            {ActiveComponent ? (
              <ActiveComponent />
            ) : (
              <div>Component Not Found</div>
            )}
          </SplitterPanel>
        </Splitter>
      </React.Suspense>
    </div>
  );
};

export default TabContent;
