import React, { useState, useEffect, Suspense } from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import DataTable from "../../TableDynamic/DataTable";
import MyPanel from "./PanelHeader";
import "./TabContent.css";
import { categoriesCata, categoriesCatb, ProjectsAccess } from "../tab/tabData";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [categoryType, setCategoryType] = useState<"cata" | "catb">("cata");
  const [showRightAccessPanel, setShowRightAccessPanel] = useState(false);

  // state جدید برای نگهداری ردیفی که در LeftProjectAccess دوبار کلیک شده
  const [selectedSubItemForRight, setSelectedSubItemForRight] =
    useState<any>(null);

  const [currentColumnDefs, setCurrentColumnDefs] = useState<any[]>(columnDefs);
  const [currentRowData, setCurrentRowData] = useState<any[]>(rowData);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleSave = (): void => {
    console.log("Save clicked");
    setIsAdding(false);
    setIsPanelOpen(false);
    resetRightPanel();
  };

  const handleUpdate = (): void => {
    if (selectedRow) {
      console.log("Update clicked for row:", selectedRow);
      setIsPanelOpen(false);
      resetRightPanel();
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
    onRowDoubleClick(data);
    setIsAdding(false);
    setIsPanelOpen(true);
  };

  const handleRowClickLocal = (data: any) => {
    if (!isPanelOpen || isAdding) {
      onRowClick(data);
    }
  };

  const handleEditClick = () => {
    if (selectedRow) {
      setIsAdding(false);
      setIsPanelOpen(true);
      onEdit();
    } else {
      alert("Please select a row to edit.");
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
    // این تابع از LeftProjectAccess صدا زده می‌شود وقتی کاربر دوبار روی یک زیر آیتم کلیک کند.
    setSelectedSubItemForRight(subItemRow);
    setShowRightAccessPanel(true);
  };

  const resetRightPanel = () => {
    setShowRightAccessPanel(false);
    setSelectedSubItemForRight(null);
  };

  return (
    <div className="flex-grow bg-white overflow-hidden mt-4 border border-gray-300 rounded-lg mx-4 mb-6 transition-all duration-500 h-full">
      <Splitter
        className="h-full"
        layout="horizontal"
        style={{ height: "100%" }}
      >
        {/* Left Panel */}
        <SplitterPanel
          className="flex flex-col"
          size={isExpanded ? 100 : 50}
          minSize={20}
        >
          <div className="flex items-center justify-between p-2 border-b border-gray-300 bg-gray-100">
            <div className="font-bold text-gray-700 text-sm">
              {activeSubTab}
            </div>
            <button
              onClick={toggleExpand}
              className="text-gray-700 hover:text-gray-900 transition"
            >
              {isExpanded ? (
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
        </SplitterPanel>

        {/* Right Panel */}
        <SplitterPanel
          className="flex flex-col"
          size={isExpanded ? 0 : 50}
          minSize={30}
          style={{
            overflow: "hidden",
          }}
        >
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
                <Splitter
                  layout="horizontal"
                  style={{ height: "100%", marginTop: "20px" }}
                >
                  <SplitterPanel
                    size={50}
                    minSize={20}
                    className="p-2 border-r border-gray-300"
                  >
                    {/* توجه: اینجا selectedRow از بالا را برای LeftProjectAccess ارسال می‌کنیم.
                        LeftProjectAccess هنگامی که کاربر دوبار کلیک کرد، تابع handleLeftProjectDoubleClick را صدا می‌زند
                        و subItemRow را به ما می‌دهد. */}
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <LeftProjectAccess
                        selectedRow={selectedRow}
                        onDoubleClickSubItem={handleLeftProjectDoubleClick}
                      />
                    </React.Suspense>
                  </SplitterPanel>
                  <SplitterPanel size={50} minSize={20} className="p-2">
                    {showRightAccessPanel && selectedSubItemForRight ? (
                      <React.Suspense fallback={<div>Loading...</div>}>
                        <RightProjectAccess
                          selectedRow={selectedSubItemForRight}
                        />
                      </React.Suspense>
                    ) : (
                      <div className="text-center text-gray-400 mt-10">
                        Double click on a left table row to show details here.
                      </div>
                    )}
                  </SplitterPanel>
                </Splitter>
              </Suspense>
            )}

            {isPanelOpen && activeSubTab !== "ProjectsAccess" && Component && (
              <div className="mt-5">
                <Suspense fallback={<div>Loading...</div>}>
                  <Component
                    key={isAdding ? "add-mode" : "edit-mode"}
                    selectedRow={isAdding ? null : selectedRow}
                  />
                </Suspense>
              </div>
            )}
          </div>
        </SplitterPanel>
      </Splitter>
    </div>
  );
};

export default TabContent;
