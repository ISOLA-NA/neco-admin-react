// src/components/TabContent/TabContent.tsx

import React, {
  useState,
  useEffect,
  Suspense,
  useRef,
  MouseEvent,
  useCallback,
} from "react";
import DataTable from "../../TableDynamic/DataTable";
import MyPanel from "./PanelHeader";
import "./TabContent.css";
import {
  categoriesCata,
  categoriesCatb,
  ProjectsAccess,
} from "../tab/tabData";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";

// Lazy load the additional components
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

const TabContent: React.FC<TabContentProps> = ({
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
  const [isMaximized, setIsMaximized] = useState(false);
  const [panelWidth, setPanelWidth] = useState(50); // Initial left panel width in percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize panelWidth with event listeners
  const panelWidthRef = useRef(panelWidth);
  useEffect(() => {
    panelWidthRef.current = panelWidth;
  }, [panelWidth]);

  const togglePanelSize = () => {
    setIsMaximized((prev) => {
      if (prev) {
        // If maximized, restore to 50%
        setPanelWidth(50);
      } else {
        // If not maximized, expand right panel to 100%
        setPanelWidth(0);
      }
      return !prev;
    });
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
      const containerOffsetLeft = containerRect.left;
      const containerWidth = containerRect.width;
      let newWidth =
        ((e.clientX - containerOffsetLeft) / containerWidth) * 100;

      // Constraints on left panel width
      if (newWidth < 10) newWidth = 10;
      if (newWidth > 90) newWidth = 90;

      // If maximized and user resizes beyond minimum, restore normal state
      if (isMaximized && newWidth > 10) {
        setIsMaximized(false);
      }

      setPanelWidth(newWidth);
    },
    [isDragging, isMaximized]
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

  // Panel States
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [categoryType, setCategoryType] = useState<"cata" | "catb">("cata");
  const [showRightAccessPanel, setShowRightAccessPanel] = useState(false);

  // Row Selection States
  const [pendingSelectedRow, setPendingSelectedRow] = useState<any>(null);
  const [selectedSubItemForRight, setSelectedSubItemForRight] =
    useState<any>(null);

  // Current Data States
  const [currentColumnDefs, setCurrentColumnDefs] = useState<any[]>(
    columnDefs
  );
  const [currentRowData, setCurrentRowData] = useState<any[]>(rowData);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleSave = (): void => {
    console.log("Save clicked");
  };

  const handleUpdate = (): void => {
    if (selectedRow) {
      console.log("Update clicked for row:", selectedRow);
    } else {
      alert("Please select a row to update.");
    }
  };

  const handleClose = (): void => {
    setIsPanelOpen(false);
    setIsAdding(false);
    resetRightPanel();
  };

  const handleDoubleClick = (data: any) => {
    // Double click selects the row and opens the panel
    onRowDoubleClick(data);
    setIsAdding(false);
    setIsPanelOpen(true);
  };

  // Single row click updates pendingSelectedRow
  const handleRowClickLocal = (data: any) => {
    setPendingSelectedRow(data);
  };

  const handleEditClick = () => {
    if (pendingSelectedRow) {
      onRowClick(pendingSelectedRow); // Update selectedRow in parent
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

  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value as "cata" | "catb";
    setCategoryType(value);
  };

  useEffect(() => {
    if (activeSubTab === "Categories") {
      if (categoryType === "cata") {
        setCurrentColumnDefs(categoriesCata.columnDefs);
        setCurrentRowData(categoriesCata.rowData);
      } else if (categoryType === "catb") {
        setCurrentColumnDefs(categoriesCatb.columnDefs);
        setCurrentRowData(categoriesCatb.rowData);
      }
    } else if (activeSubTab === "ProjectsAccess") {
      setCurrentColumnDefs(ProjectsAccess.columnDefs);
      setCurrentRowData(ProjectsAccess.rowData);
    } else {
      setCurrentColumnDefs(columnDefs);
      setCurrentRowData(rowData);
    }
  }, [activeSubTab, categoryType, columnDefs, rowData]);

  const handleLeftProjectDoubleClick = (subItemRow: any) => {
    setSelectedSubItemForRight(subItemRow);
    setShowRightAccessPanel(true);
  };

  const resetRightPanel = () => {
    setShowRightAccessPanel(false);
    setSelectedSubItemForRight(null);
  };

  return (
    <div
      ref={containerRef}
      className="flex w-full flex-col lg:flex-row h-full gap-0 relative bg-base-100"
      style={{ height: "600px" }} // Adjust height as needed
    >
      {/* Left Panel */}
      <div
        className="panel-1 card bg-base-300 rounded-box h-full flex flex-col"
        style={{
          width: isMaximized ? "0%" : `${panelWidth}%`,
          overflow: "hidden",
          transition: isDragging ? "none" : "width 0.2s ease",
          minWidth: "10%", // Ensure minimum width
        }}
      >
        <div className="flex items-center justify-between p-2 border-b border-gray-300 bg-gray-100">
          <div className="font-bold text-gray-700 text-sm">
            {activeSubTab}
          </div>
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

        {activeSubTab === "Categories" && (
          <div className="px-4 py-2">
            <select
              id="categoryType"
              value={categoryType}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="cata">Cata</option>
              <option value="catb">Cat B</option>
            </select>
          </div>
        )}

        <div className="h-full p-4 overflow-hidden">
          <DataTable
            columnDefs={currentColumnDefs}
            rowData={currentRowData}
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

      {/* Divider */}
      {!isMaximized && (
        <div
          onMouseDown={startDragging}
          className="flex items-center justify-center lg:divider lg:divider-horizontal cursor-ew-resize w-2"
          style={{ userSelect: "none", cursor: "col-resize", background: "#e5e7eb" }}
        >
          <div className="h-full w-1 bg-neutral rounded"></div>
        </div>
      )}

      {/* Right Panel */}
      <div
        className="panel-2 card bg-base-300 rounded-box h-full flex flex-col relative"
        style={{
          width: isMaximized ? "100%" : `${100 - panelWidth}%`,
          flexGrow: isMaximized ? 1 : 0,
          transition: isDragging ? "none" : "width 0.2s ease",
          minWidth: "30%", // Ensure minimum width
        }}
      >
        {/* Action Buttons can be placed here if needed */}
        <div className="h-full overflow-auto p-4">
          {!isPanelOpen ? (
            <div className="text-gray-500 flex justify-center items-center h-full">
              Select a row to view details.
            </div>
          ) : (
            <MyPanel
              isExpanded={isExpanded}
              toggleExpand={toggleExpand}
              onSave={isAdding ? handleSave : undefined}
              onClose={handleClose}
              onUpdate={!isAdding ? handleUpdate : undefined}
            />
          )}

          {isPanelOpen && activeSubTab === "ProjectsAccess" && (
            <Suspense fallback={<div>Loading Projects Access...</div>}>
              <div className="flex-grow mt-5 flex">
                {/* Nested Split Panel for ProjectsAccess */}
                <div
                  className="nested-panel-1 bg-base-200 rounded-box flex flex-col"
                  style={{
                    width: "50%",
                    overflow: "hidden",
                    borderRight: "1px solid #d1d5db",
                  }}
                >
                  <div className="p-2 border-b border-gray-300 bg-gray-100">
                    <span className="font-bold text-gray-700 text-sm">
                      Projects Access Left
                    </span>
                  </div>
                  <div className="h-full p-2 overflow-auto">
                    <LeftProjectAccess
                      selectedRow={selectedRow}
                      onDoubleClickSubItem={handleLeftProjectDoubleClick}
                    />
                  </div>
                </div>
                <div
                  className="nested-panel-2 bg-base-200 rounded-box flex flex-col"
                  style={{ width: "50%", overflow: "hidden" }}
                >
                  <div className="p-2 border-b border-gray-300 bg-gray-100">
                    <span className="font-bold text-gray-700 text-sm">
                      Projects Access Right
                    </span>
                  </div>
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

          {isPanelOpen && activeSubTab !== "ProjectsAccess" && Component && (
            <div className="mt-5">
              <Suspense fallback={<div>Loading...</div>}>
                <Component
                  key={
                    isAdding
                      ? "add-mode"
                      : selectedRow
                      ? selectedRow.id
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
