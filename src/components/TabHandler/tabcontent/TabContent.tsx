// src/components/Views/tabcontent/TabContent.tsx

import React, {
  useState,
  useEffect,
  Suspense,
  useRef,
  MouseEvent,
  useCallback,
  FC
} from 'react';
import DataTable from '../../TableDynamic/DataTable';
import PanelHeader from '../tabcontent/PanelHeader'; // اطمینان از مسیر صحیح
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { showAlert } from '../../utilities/Alert/DynamicAlert'; // اطمینان از مسیر صحیح
import { ConfigurationHandle } from '../../General/Configuration/Configurations'; // اطمینان از مسیر صحیح
import { useApi } from '../../../context/ApiContext'; // اطمینان از مسیر صحیح

// Lazy load for ProjectsAccess panels, if needed
const LeftProjectAccess = React.lazy(
  () => import('../../Projects/ProjectAccess/Panel/LeftProjectAccess')
);
const RightProjectAccess = React.lazy(
  () => import('../../Projects/ProjectAccess/Panel/RightProjectAccess')
);

interface TabContentProps {
  component: React.LazyExoticComponent<React.ComponentType<any>> | null;
  columnDefs: any[];
  rowData: any[];
  onRowDoubleClick: (data: any) => void;
  selectedRow: any;
  activeSubTab: string;
  showDuplicateIcon: boolean;
  showEditIcon: boolean;
  showAddIcon: boolean;
  showDeleteIcon: boolean;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRowClick: (data: any) => void;
}

const TabContent: FC<TabContentProps> = ({
  component: Component,
  columnDefs,
  rowData,
  onRowDoubleClick,
  selectedRow,
  activeSubTab,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onRowClick,
  showDuplicateIcon,
  showEditIcon,
  showAddIcon,
  showDeleteIcon,
}) => {
  // دسترسی به API
  const api = useApi();

  // State related to panels and dragging
  const [panelWidth, setPanelWidth] = useState(50); // Initial width in percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track if the right panel is maximized
  const [isRightMaximized, setIsRightMaximized] = useState(false);

  const isMaximized = panelWidth >= 97; // Adjusted to 97% to account for splitter

  const togglePanelSize = () => {
    setIsRightMaximized(false);
    setPanelWidth(prevWidth => (isMaximized ? 50 : 97)); // Toggle between 50% and 97%
  };

  const togglePanelSizeFromRight = (maximize: boolean) => {
    if (maximize) {
      setIsRightMaximized(true);
      setPanelWidth(2); // Shrink left panel to 2% when right is maximized
    } else {
      setIsRightMaximized(false);
      setPanelWidth(50); // Restore left panel to 50%
    }
  };

  const startDragging = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent | globalThis.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      let newWidth =
        ((e.clientX - containerRect.left) / containerRef.current.clientWidth) *
        100;

      if (newWidth < 2) newWidth = 2; // Minimum width to prevent collapse
      if (newWidth > 97) newWidth = 97; // Maximum width to prevent overflow

      // Disable right maximization when manually resizing
      setIsRightMaximized(false);
      setPanelWidth(newWidth);
    },
    [isDragging]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopDragging);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDragging);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDragging);
    };
  }, [isDragging, handleMouseMove, stopDragging]);

  // State for panel visibility and actions
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingSelectedRow, setPendingSelectedRow] = useState<any>(null);
  const [showRightAccessPanel, setShowRightAccessPanel] = useState(false);
  const [selectedSubItemForRight, setSelectedSubItemForRight] =
    useState<any>(null);

  // State for loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchedRowData, setFetchedRowData] = useState<any[]>([]);

  // Ref to the Configuration component
  const configurationRef = useRef<ConfigurationHandle>(null);

  // تابع واکشی داده‌ها
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllConfigurations();
      setFetchedRowData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // واکشی داده‌ها هنگام بارگذاری کامپوننت
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // تابع handleSave که از PanelHeader فراخوانی می‌شود
  const handleSave = async () => {
    if (configurationRef.current) {
      try {
        await configurationRef.current.save();
        // بعد از ذخیره، داده‌ها را دوباره واکشی کنید
        await fetchData();
        showAlert('success', null, 'ذخیره', 'پیکربندی با موفقیت ذخیره شد.');
        setIsPanelOpen(false);
        setIsAdding(false);
      } catch (error) {
        console.error('Error saving configuration:', error);
        showAlert('error', null, 'خطا', 'ذخیره پیکربندی با خطا مواجه شد.');
      }
    } else {
      console.warn("Configuration ref is not set");
    }
  };

  const handleUpdate = async () => {
    if (activeSubTab === 'Configurations') {
      try {
        // فراخوانی متد save از Configuration
        const updatedConfig = await configurationRef.current?.save();
        if (updatedConfig) {
          await fetchData();
          // به‌روزرسانی currentRowData
          setCurrentRowData(prevData => {
            const index = prevData.findIndex((row: { ID: any; }) => row.ID === updatedConfig);
            if (index !== -1) {
              const newData = [...prevData];
              newData[index] = updatedConfig;
              
              return newData;
              
            }
            
            return prevData;
          });
          // نمایش پیام موفقیت
          showAlert('success', null, 'آپدیت شد', 'با موفقیت آپدیت شد.');
        }
      } catch (error) {
        // نمایش پیام خطا
        showAlert('error', null, 'خطا', 'آپدیت با خطا مواجه شد.');
        console.error("Error updating configuration:", error);
      }
    }
    // بستن پنل
    setIsPanelOpen(false);
  };

  const handleClose = (): void => {
    setIsPanelOpen(false);
    setIsAdding(false);
    resetRightPanel();
  };

  const resetRightPanel = () => {
    setShowRightAccessPanel(false);
    setSelectedSubItemForRight(null);
  };

  const handleDoubleClick = (data: any) => {
    onRowDoubleClick(data);
    setIsAdding(false);
    setIsPanelOpen(true);
  };

  const handleRowClickLocal = (data: any) => {
    setPendingSelectedRow(data);
    onRowClick(data);
  };

  const handleEditClick = () => {
    if (pendingSelectedRow) {
      onEdit();
      setIsAdding(false);
      setIsPanelOpen(true);
    } else {
      alert('لطفاً یک ردیف را قبل از ویرایش انتخاب کنید.');
    }
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setIsPanelOpen(true);
    onAdd();
    resetRightPanel();
  };

  const handleDeleteClick = () => {
    if (selectedRow) {
      onDelete();
    } else {
      alert('لطفاً یک ردیف را برای حذف انتخاب کنید.');
    }
  };

  const handleDuplicateClick = () => {
    if (selectedRow) {
      onDuplicate();
    } else {
      alert('لطفاً یک ردیف را برای تکرار انتخاب کنید.');
    }
  };

  const handleLeftProjectDoubleClick = (subItemRow: any) => {
    setSelectedSubItemForRight(subItemRow);
    setShowRightAccessPanel(true);
  };

  return (
    <div
      ref={containerRef}
      className='flex-1 overflow-hidden mt-2 border border-gray-300 rounded-lg mb-6 flex relative'
      style={{ height: '100%' }}
    >
      {/* Left Panel */}
      <div
        className='flex flex-col overflow-auto bg-gray-100 box-border'
        style={{
          flex: `0 0 calc(${panelWidth}% - 1px)`, // Subtract half of splitter width (1px)
          transition: isDragging ? 'none' : 'flex-basis 0.1s ease-out',
          backgroundColor: '#f3f4f6'
        }}
      >
        {/* Left Panel Header */}
        <div className='flex items-center justify-between p-2 border-b border-gray-300 bg-gray-100 w-full'>
          <div className='font-bold text-gray-700 text-sm'>{activeSubTab}</div>
          <button
            onClick={togglePanelSize}
            className='text-gray-700 hover:text-gray-900 transition'
          >
            {isMaximized ? (
              <FiMinimize2 size={18} />
            ) : (
              <FiMaximize2 size={18} />
            )}
          </button>
        </div>

        {/* DataTable */}
        <div className='h-full p-4 overflow-auto'>
          <DataTable
            columnDefs={columnDefs}
            rowData={fetchedRowData}
            onRowDoubleClick={handleDoubleClick}
            setSelectedRowData={handleRowClickLocal}
            showDuplicateIcon={showDuplicateIcon}
            showEditIcon={showEditIcon}
            showAddIcon={showAddIcon}
            showDeleteIcon={showDeleteIcon}
            onAdd={handleAddClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onDuplicate={handleDuplicateClick}
            isLoading={isLoading} // ارسال وضعیت لودینگ
          />
        </div>
      </div>

      {/* Splitter */}
      <div
        onMouseDown={startDragging}
        className='flex items-center justify-center cursor-ew-resize w-2'
        style={{ userSelect: 'none', cursor: 'col-resize', zIndex: 30 }}
      >
        <div className='h-full w-1 bg-[#dd4bae] rounded'></div>
      </div>

      {/* Right Panel: نمایش فقط زمانی که isPanelOpen برابر با true است */}
      {isPanelOpen && (
        <div
          className={`flex-1 transition-opacity duration-100 bg-gray-100 ${
            isMaximized ? 'opacity-50 pointer-events-none' : 'opacity-100'
          }`}
          style={{
            transition: 'opacity 0.1s ease-out',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            flexDirection: 'column',
            overflowX: panelWidth <= 30 ? 'auto' : 'hidden',
            maxWidth: panelWidth <= 30 ? '100%' : '100%'
          }}
        >
          <div
            className='h-full p-4 flex flex-col'
            style={{
              minWidth: panelWidth <= 30 ? '300px' : 'auto' // Minimum width to prevent content overflow
            }}
          >
            {/* PanelHeader */}
            <PanelHeader
              isExpanded={false}
              toggleExpand={() => {}}
              onSave={isAdding &&activeSubTab === 'Configurations' ? handleSave : undefined} // ارسال handleSave تنها برای Configurations
              onUpdate={!isAdding && activeSubTab === 'Configurations' ? handleUpdate : undefined} // ارسال handleUpdate تنها برای Configurations و زمانی که در حالت افزودن نیست
              onClose={handleClose}
              onTogglePanelSizeFromRight={togglePanelSizeFromRight}
              isRightMaximized={isRightMaximized}
            />

            {/* ProjectsAccess SubTab */}
            {activeSubTab === 'ProjectsAccess' && (
              <Suspense fallback={<div>Loading Projects Access...</div>}>
                {/* تغییرات در این بخش برای پاسخگویی به عرض پنل */}
                <div className='flex-grow mt-5 flex flex-wrap gap-2 h-full overflow-y-auto'>
                  {/* Left Access Panel */}
                  <div className='flex flex-col bg-gray-200 rounded-l-lg overflow-hidden min-w-[300px] w-1/2 border-r border-gray-300 p-2'>
                    <div className='h-full p-2 overflow-auto'>
                      <LeftProjectAccess
                        selectedRow={selectedRow}
                        onDoubleClickSubItem={handleLeftProjectDoubleClick}
                      />
                    </div>
                  </div>
                  {/* Right Access Panel */}
                  <div className='flex flex-col bg-gray-200 rounded-r-lg overflow-hidden min-w-[300px] w-1/2 p-2 h-full'>
                    <div className='h-full p-2 overflow-auto'>
                      {showRightAccessPanel && selectedSubItemForRight ? (
                        <RightProjectAccess
                          selectedRow={selectedSubItemForRight}
                        />
                      ) : (
                        <div className='text-center text-gray-400 mt-10'>
                          Double click on a left table row to show details here.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Suspense>
            )}

            {/* Dynamic Component for Other SubTabs */}
            {activeSubTab !== 'ProjectsAccess' && Component && (
              <div className='mt-5 flex-grow overflow-y-auto'>
                <div style={{ minWidth: '600px' }}>
                  {/* Ensure minimum width to prevent content overflow */}
                  <Suspense fallback={<div>Loading...</div>}>
                    <Component
                      key={
                        isAdding
                          ? 'add-mode'
                          : selectedRow
                          ? selectedRow.ID
                          : 'no-selection'
                      }
                      selectedRow={isAdding ? null : selectedRow}
                      ref={activeSubTab === "Configurations" ? configurationRef : null} // اتصال ref تنها برای Configurations
                    />
                  </Suspense>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TabContent;
function setCurrentRowData(arg0: (prevData: any) => any) {
  throw new Error('Function not implemented.');
}

