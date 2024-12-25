// src/components/Views/tabcontent/TabContent.tsx

import React, {
  useState,
  useEffect,
  Suspense,
  useRef,
  MouseEvent,
  useCallback,
  FC,
} from "react";
import DataTable from "../../TableDynamic/DataTable";
import MyPanel from "./PanelHeader";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";

// Lazy load for ProjectsAccess panels, if needed
const LeftProjectAccess = React.lazy(
  () => import("../../Projects/ProjectAccess/Panel/LeftProjectAccess")
);
const RightProjectAccess = React.lazy(
  () => import("../../Projects/ProjectAccess/Panel/RightProjectAccess")
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
  // state مربوط به پنل‌ها و درگ
  const [panelWidth, setPanelWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track if right panel is maximized
  const [isRightMaximized, setIsRightMaximized] = useState(false);

  const isMaximized = panelWidth >= 98;

  const togglePanelSize = () => {
    setIsRightMaximized(false);
    setPanelWidth((prev) => {
      if (isMaximized) return 50;
      return 98;
    });
  };

  const togglePanelSizeFromRight = (maximize: boolean) => {
    if (maximize) {
      setIsRightMaximized(true);
      setPanelWidth(2);
    } else {
      setIsRightMaximized(false);
      setPanelWidth(50);
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
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      if (newWidth < 10) newWidth = 1;
      if (newWidth > 98) newWidth = 99;

      // وقتی کاربر دستی اندازه را تغییر می‌دهد، ماکسیمایز از راست را غیرفعال کنیم
      setIsRightMaximized(false);
      setPanelWidth(newWidth);
    },
    [isDragging]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", stopDragging);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [isDragging, handleMouseMove, stopDragging]);

  // مدیریت حالت باز و بسته بودن فرم و ...
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingSelectedRow, setPendingSelectedRow] = useState<any>(null);
  const [showRightAccessPanel, setShowRightAccessPanel] = useState(false);
  const [selectedSubItemForRight, setSelectedSubItemForRight] =
    useState<any>(null);

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
  };

  const handleEditClick = () => {
    if (pendingSelectedRow) {
      onRowClick(pendingSelectedRow);
      setIsAdding(false);
      setIsPanelOpen(true);
      onEdit();
    } else {
      alert("Please select a row before editing.");
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
      alert("Please select a row to delete.");
    }
  };

  const handleDuplicateClick = () => {
    if (selectedRow) {
      onDuplicate();
    } else {
      alert("Please select a row to duplicate.");
    }
  };

  const handleLeftProjectDoubleClick = (subItemRow: any) => {
    setSelectedSubItemForRight(subItemRow);
    setShowRightAccessPanel(true);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden mt-2 border border-gray-300 rounded-lg mb-6 flex relative mx-4"
      style={{ height: "100%" }}
    >
      {/* پنل چپ */}
      <div
        className="flex flex-col overflow-auto bg-gray-100 box-border"
        style={{
          flex: `0 0 ${panelWidth}%`,
          transition: isDragging ? "none" : "flex-basis 0.1s ease-out",
          backgroundColor: "#f3f4f6",
        }}
      >
        {/* هدر پنل چپ */}
        <div className="flex items-center justify-between p-2 border-b border-gray-300 bg-gray-100 w-full">
          <div className="font-bold text-gray-700 text-sm">{activeSubTab}</div>
          <button
            onClick={togglePanelSize}
            className="text-gray-700 hover:text-gray-900 transition"
          >
            {isMaximized ? (
              <FiMinimize2 size={18} />
            ) : (
              <FiMaximize2 size={18} />
            )}
          </button>
        </div>

        {/* دیتاتیبل */}
        <div className="h-full p-4 overflow-auto">
          <DataTable
            columnDefs={columnDefs}
            rowData={rowData}
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
            isRowSelected={!!selectedRow}
          />
        </div>
      </div>

      {/* اسپلیتر */}
      <div
        onMouseDown={startDragging}
        className="flex items-center justify-center lg:divider lg:divider-horizontal cursor-ew-resize w-2"
        style={{ userSelect: "none", cursor: "col-resize", zIndex: 30 }}
      >
        <div className="h-full w-1 bg-[#dd4bae] rounded"></div>
      </div>

      {/* پنل راست */}
      <div
        className={`flex-1 overflow-auto transition-opacity duration-100 bg-gray-100 ${
          isMaximized ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
        style={{
          transition: "opacity 0.1s ease-out",
          backgroundColor: "#f3f4f6",
        }}
      >
        <div className="h-full overflow-auto p-4">
          {!isPanelOpen ? (
            <div className="text-gray-500 flex justify-center items-center h-full">
              Select a row to view details.
            </div>
          ) : (
            <MyPanel
              isExpanded={false}
              toggleExpand={() => {}}
              onSave={isAdding ? () => console.log("save") : undefined}
              onClose={handleClose}
              onUpdate={!isAdding ? () => console.log("update") : undefined}
              onTogglePanelSizeFromRight={togglePanelSizeFromRight}
              isRightMaximized={isRightMaximized}
            />
          )}

          {/* اگر ساب‌تب ProjectsAccess باشد نمونه کد دو پنله */}
          {isPanelOpen && activeSubTab === "ProjectsAccess" && (
            <Suspense fallback={<div>Loading Projects Access...</div>}>
              <div className="flex-grow mt-5 flex gap-2 h-full">
                {/* پنل چپ پروژه‌ها */}
                <div className="flex flex-col bg-gray-200 rounded-l-lg overflow-hidden w-1/2 border-r border-gray-300 p-2">
                  <div className="h-full p-2 overflow-auto">
                    <LeftProjectAccess
                      selectedRow={selectedRow}
                      onDoubleClickSubItem={handleLeftProjectDoubleClick}
                    />
                  </div>
                </div>
                {/* پنل راست */}
                <div className="flex flex-col bg-gray-200 rounded-r-lg overflow-hidden w-1/2 p-2 h-full">
                  <div className="h-full p-2 overflow-auto">
                    {showRightAccessPanel && selectedSubItemForRight ? (
                      <RightProjectAccess
                        selectedRow={selectedSubItemForRight}
                      />
                    ) : (
                      <div className="text-center text-gray-400 mt-10">
                        Double click on a left table row to show details here.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Suspense>
          )}

          {/* در غیر این صورت اگر کامپوننت دینامیک داریم */}
          {isPanelOpen && activeSubTab !== "ProjectsAccess" && Component && (
            <div className="mt-5">
              <Suspense fallback={<div>Loading...</div>}>
                <Component
                  key={
                    isAdding
                      ? "add-mode"
                      : selectedRow
                      ? selectedRow.ID
                      : "no-selection"
                  }
                  selectedRow={isAdding ? null : selectedRow}
                />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabContent;
