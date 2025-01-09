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
import PanelHeader from "../tabcontent/PanelHeader";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import { ConfigurationHandle } from "../../General/Configuration/Configurations";
import { useApi } from "../../../context/ApiContext";
import { CommandHandle } from "../../General/CommandSettings";
import { UserHandle } from "../../General/Users";
import { RoleHandle } from "../../General/Roles";
import { CompanyHandle } from "../../General/Enterprises";
import { RoleGroupsHandle } from "../../General/RoleGroups";
import { StaffingHandle } from "../../General/Staffing";
import { ProgramTemplateHandle } from "../../Programs/ProgramTemplate/ProgramTemplate";
import { ProgramTypeHandle } from "../../Programs/ProgramTypes";
import { ProcedureHandle } from "../../Projects/Procedures";
import { CalendarHandle } from "../../Projects/Calendars";
import { OdpHandle } from "../../Projects/Odp";
import ProjectAccess, {
  ProjectAccessHandle,
} from "../../Projects/ProjectAccess/ProjectsAccess";
import DynamicConfirm from "../../utilities/DynamicConfirm";
import DynamicInput from "../../utilities/DynamicInput";
import { FaSave, FaEdit, FaTrash } from "react-icons/fa";

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
  const api = useApi();
  const [panelWidth, setPanelWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRightMaximized, setIsRightMaximized] = useState(false);
  const isMaximized = panelWidth >= 97;

  const configurationRef = useRef<ConfigurationHandle>(null);
  const commandRef = useRef<CommandHandle>(null);
  const userRef = useRef<UserHandle>(null);
  const roleRef = useRef<RoleHandle>(null);
  const companyRef = useRef<CompanyHandle>(null);
  const roleGroupsRef = useRef<RoleGroupsHandle>(null);
  const staffingRef = useRef<StaffingHandle>(null);
  const programTemplateRef = useRef<ProgramTemplateHandle>(null);
  const programTypeRef = useRef<ProgramTypeHandle>(null);
  const odpRef = useRef<OdpHandle>(null);
  const procedureRef = useRef<ProcedureHandle>(null);
  const calendarRef = useRef<CalendarHandle>(null);
  const projectAccessRef = useRef<ProjectAccessHandle>(null);

  // State for DynamicConfirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVariant, setConfirmVariant] = useState<"delete" | "edit">(
    "delete"
  );
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  // Panel State Management
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingSelectedRow, setPendingSelectedRow] = useState<any>(null);
  const [showRightAccessPanel, setShowRightAccessPanel] = useState(false);
  const [selectedSubItemForRight, setSelectedSubItemForRight] =
    useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchedRowData, setFetchedRowData] = useState<any[]>([]);

  // Form inputs state for Ribbons
  const [nameInput, setNameInput] = useState<string>("");
  const [descriptionInput, setDescriptionInput] = useState<string>("");

  // Panel size management
  const togglePanelSize = () => {
    setIsRightMaximized(false);
    setPanelWidth((prevWidth) => (isMaximized ? 50 : 97));
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

  // Dragging functionality
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
      newWidth = Math.max(2, Math.min(97, newWidth));
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

  // Data fetching
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let data;
      switch (activeSubTab) {
        case "Configurations":
          data = await api.getAllConfigurations();
          break;
        case "Commands":
          data = await api.getAllCommands();
          break;
        case "Ribbons":
          data = await api.getAllMenu();
          break;
        case "Users":
          data = await api.getAllUsers();
          break;
        case "Roles":
          data = await api.getAllRoles();
          break;
        case "Enterprises":
          data = await api.getAllCompanies();
          break;
        case "RoleGroups":
          data = await api.getAllPostCat();
          break;
        case "Staffing":
          data = await api.getAllRoles();
          break;
        case "ProgramTemplate":
          data = await api.getAllProgramTemplates();
          break;
        case "ProgramTypes":
          data = await api.getAllProgramType();
          break;
        case "Projects":
          data = await api.getAllProjectsWithCalendar();
          break;
        case "Odp":
          data = await api.getAllOdpWithExtra();
          break;
        case "Procedures":
          data = await api.getAllEntityCollection();
          break;
        case "Calendars":
          data = await api.getAllCalendar();
          break;
        case "ProjectsAccess":
          data = await api.getAllProjectsWithCalendar();
          break;
        default:
          data = rowData;
      }
      setFetchedRowData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert("error", null, "Error", "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [api, activeSubTab, rowData]);

  useEffect(() => {
    if (activeSubTab) {
      fetchData();
    }
  }, [activeSubTab]);

  // Save/Update handlers
  const handleInsert = async () => {
    try {
      switch (activeSubTab) {
        case "Configurations":
          if (configurationRef.current) {
            await configurationRef.current.save();
            showAlert(
              "success",
              null,
              "Saved",
              "Configuration added successfully."
            );
            await fetchData();
          }
          break;
        case "Commands":
          if (commandRef.current) {
            await commandRef.current.save();
            showAlert("success", null, "Saved", "Command added successfully.");
            await fetchData();
          }
          break;
        case "Users":
          if (userRef.current) {
            const result = await userRef.current.save();
            if (result) {
              // فقط اگر ذخیره موفقیت‌آمیز بود
              showAlert("success", null, "Saved", "User added successfully.");
              await fetchData();
            }
          }
          break;
        case "Ribbons":
          await api.insertMenu({
            Name: nameInput,
            Description: descriptionInput,
            IsVisible: true,
          });
          showAlert("success", null, "Saved", "Ribbon added successfully.");
          await fetchData();
          break;
        case "Roles": // اضافه شده
          if (roleRef.current) {
            await roleRef.current.save();
            showAlert("success", null, "Saved", "Role added successfully.");
            await fetchData();
          }
          break;
        case "Enterprises": // Add this case
          if (companyRef.current) {
            await companyRef.current.save();
            showAlert(
              "success",
              null,
              "Saved",
              "Enterprise added successfully."
            );
            await fetchData();
          }
          break;
        case "RoleGroups":
          if (roleGroupsRef.current) {
            await roleGroupsRef.current.save();
            showAlert(
              "success",
              null,
              "Saved",
              "Role Group added successfully."
            );
            await fetchData();
          }
          break;
        case "Staffing":
          if (staffingRef.current) {
            await staffingRef.current.save();
            showAlert("success", null, "Saved", "Staffing added successfully.");
            await fetchData();
          }
          break;
        case "ProgramTemplate":
          if (programTemplateRef.current) {
            await programTemplateRef.current.save();
            await fetchData();
          }
          break;
        case "ProgramTypes":
          if (programTypeRef.current) {
            await programTypeRef.current.save();
            await fetchData();
          }
          break;
        case "Odp":
          if (odpRef.current) {
            await odpRef.current.save();
            await fetchData();
          }
          break;
        case "Procedures":
          if (procedureRef.current) {
            await procedureRef.current.save();
            showAlert(
              "success",
              null,
              "Saved",
              "Procedures added successfully."
            );
            await fetchData();
          }
          break;
        case "Calendars":
          if (calendarRef.current) {
            await calendarRef.current.save();
            showAlert("success", null, "Saved", "Calendar added successfully.");
            await fetchData();
          }
          break;
        case "ProjectsAccess":
          if (projectAccessRef.current) {
            await projectAccessRef.current.save();
            await fetchData();
          }
          break;
      }
      setIsPanelOpen(false);
      setIsAdding(false);
      resetInputs();
    } catch (error) {
      console.error("Error saving:", error);
      showAlert("error", null, "Error", "Failed to save data.");
    }
  };

  const handleUpdate = async () => {
    try {
      switch (activeSubTab) {
        case "Configurations":
          if (configurationRef.current) {
            await configurationRef.current.save();
            showAlert(
              "success",
              null,
              "Updated",
              "Configuration updated successfully."
            );
            await fetchData();
          }
          break;
        case "Commands":
          if (commandRef.current) {
            await commandRef.current.save();
            showAlert(
              "success",
              null,
              "Updated",
              "Command updated successfully."
            );
            await fetchData();
          }
          break;
        case "Users":
          if (userRef.current) {
            const result = await userRef.current.save();
            if (result) {
              // فقط اگر آپدیت موفقیت‌آمیز بود
              await fetchData();
            }
          }
          break;
        case "Ribbons":
          if (selectedRow) {
            await api.updateMenu({
              ID: selectedRow.ID,
              Name: nameInput,
              Description: descriptionInput,
              IsVisible: selectedRow.IsVisible,
            });
            showAlert(
              "success",
              null,
              "Updated",
              "Ribbon updated successfully."
            );
            await fetchData();
          }
          break;
        case "Roles":
          if (selectedRow && roleRef.current) {
            await roleRef.current.save();
            showAlert("success", null, "Updated", "Role updated successfully.");
            await fetchData();
          }
          break;
        case "Enterprises":
          if (selectedRow && companyRef.current) {
            await companyRef.current.save();
            showAlert(
              "success",
              null,
              "Updated",
              "Enterprise updated successfully."
            );
            await fetchData();
          }
          break;
        case "RoleGroups":
          if (selectedRow && roleGroupsRef.current) {
            await roleGroupsRef.current.save();
            showAlert(
              "success",
              null,
              "Updated",
              "Role Group updated successfully."
            );
            await fetchData();
          }
          break;
        case "Staffing":
          if (staffingRef.current) {
            await staffingRef.current.save();
            showAlert("success", null, "Saved", "Staffing saved successfully.");
            await fetchData();
          }
          break;
        case "ProgramTemplate":
          if (programTemplateRef.current) {
            await programTemplateRef.current.save();
            // showAlert('success', null, 'Updated', 'Program Template updated successfully.')
            await fetchData();
          }
          break;
        case "ProgramTypes":
          if (programTypeRef.current) {
            await programTypeRef.current.save();
            // showAlert('success', null, 'Updated', 'Program Template updated successfully.')
            await fetchData();
          }
          break;
        case "Odp":
          if (odpRef.current) {
            await odpRef.current.save();
            await fetchData();
          }
          break;
        case "Procedures":
          if (procedureRef.current) {
            await procedureRef.current.save();
            await fetchData();
          }
          break;
        case "Calendars":
          if (calendarRef.current) {
            await calendarRef.current.save();
            showAlert(
              "success",
              null,
              "Updated",
              "Calendar updated successfully."
            );
            await fetchData();
          }
          break;
        case "ProjectsAccess":
          if (projectAccessRef.current) {
            await projectAccessRef.current.save();
            await fetchData();
          }
          break;
      }
      setIsPanelOpen(false);
      resetInputs();
    } catch (error) {
      console.error("Error updating:", error);
      showAlert("error", null, "Error", "Failed to update data.");
    }
  };

  const handleClose = () => {
    setIsPanelOpen(false);
    setIsAdding(false);
    resetRightPanel();
    resetInputs();
  };

  const resetRightPanel = () => {
    setShowRightAccessPanel(false);
    setSelectedSubItemForRight(null);
  };

  const resetInputs = () => {
    setNameInput("");
    setDescriptionInput("");
  };

  // Row interaction handlers
  const handleDoubleClick = (data: any) => {
    onRowDoubleClick(data);
    setIsAdding(false);
    setIsPanelOpen(true);
    if (activeSubTab === "Ribbons") {
      setNameInput(data.Name);
      setDescriptionInput(data.Description);
    }
  };

  const handleRowClickLocal = (data: any) => {
    setPendingSelectedRow(data);
    onRowClick(data);
    if (activeSubTab === "Ribbons") {
      setNameInput(data.Name);
      setDescriptionInput(data.Description);
    }
  };

  // CRUD operation handlers
  const handleAddClick = () => {
    setIsAdding(true);
    setIsPanelOpen(true);
    onAdd();
    resetRightPanel();
    resetInputs();
  };

  const handleDeleteClick = () => {
    if (!pendingSelectedRow) {
      showAlert("warning", null, "Warning", "Please select a row to delete.");
      return;
    }
    setConfirmVariant("delete");
    setConfirmTitle("Delete Confirmation");
    setConfirmMessage(
      `Are you sure you want to delete this ${activeSubTab.toLowerCase()}?`
    );
    setConfirmAction(() => async () => {
      try {
        switch (activeSubTab) {
          case "Users":
            await api.deleteUser(pendingSelectedRow.ID);
            break;
          case "Ribbons":
            await api.deleteMenu(pendingSelectedRow.ID);
            break;
          case "Commands":
            await api.deleteCommand(pendingSelectedRow.ID);
            break;
          case "Configurations":
            await api.deleteConfiguration(pendingSelectedRow.ID);
            break;
          case "Roles":
            await api.deleteRole(pendingSelectedRow.ID);
            break;
          case "Enterprises":
            await api.deleteCompany(pendingSelectedRow.ID);
            break;
          case "RoleGroups":
            await api.deletePostCat(pendingSelectedRow.ID);
            break;
          case "Staffing":
            await api.deleteRole(pendingSelectedRow.ID);
            break;
          case "ProgramTemplate":
            await api.deleteProgramTemplate(pendingSelectedRow.ID);
            break;
          case "ProgramTypes":
            await api.deleteProgramType(pendingSelectedRow.ID);
            break;
          case "ProgramTypes":
            await api.deleteProgramType(pendingSelectedRow.ID);
            break;
          case "Projects":
            await api.deleteProject(pendingSelectedRow.ID);
            break;
          case "Odp":
            await api.deleteOdp(pendingSelectedRow.ID);
            break;
          case "Procedures":
            await api.deleteEntityCollection(pendingSelectedRow.ID);
            break;
          case "Calendars":
            await api.deleteCalendar(pendingSelectedRow.ID);
            break;
          case "ProjectsAccess":
            await api.deleteAccessProject(pendingSelectedRow.ID);
            break;
        }
        showAlert(
          "success",
          null,
          "Deleted",
          `${activeSubTab} deleted successfully.`
        );
        await fetchData();
      } catch (error) {
        console.error("Error deleting:", error);
        showAlert("error", null, "Error", "Failed to delete data.");
      }
    });
    setConfirmOpen(true);
  };

  const handleDuplicateClick = () => {
    if (selectedRow) {
      onDuplicate();
      if (activeSubTab === "Ribbons") {
        setNameInput(selectedRow.Name);
        setDescriptionInput(selectedRow.Description);
        setIsAdding(true);
        setIsPanelOpen(true);
      }
    } else {
      showAlert(
        "warning",
        null,
        "Warning",
        "Please select a row to duplicate."
      );
    }
  };

  const handleLeftProjectDoubleClick = (subItemRow: any) => {
    setSelectedSubItemForRight(subItemRow);
    setShowRightAccessPanel(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    await confirmAction();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescriptionInput(e.target.value);
  };

  // Determine which ref to use based on activeSubTab
  const getActiveRef = () => {
    switch (activeSubTab) {
      case "Configurations":
        return configurationRef;
      case "Commands":
        return commandRef;
      case "Users":
        return userRef;
      case "Roles":
        return roleRef;
      case "Enterprises":
        return companyRef;
      case "RoleGroups":
        return roleGroupsRef;
      case "Staffing":
        return staffingRef;
      case "ProgramTemplate":
        return programTemplateRef;
      case "ProgramTypes":
        return programTypeRef;
      case "Odp":
        return odpRef;
      case "Procedures":
        return procedureRef;
      case "Calendars":
        return calendarRef;
      case "ProjectsAccess":
        return projectAccessRef;
      default:
        return null;
    }
  };

  const handleAddFromLeft = () => {
    setIsPanelOpen(true); // پنل را باز می‌کنیم
    setIsAdding(true); // حالت اضافه‌کردن را فعال می‌کنیم
    // هر کار دیگری که لازم دارید...
  };

  const handleEditFromLeft = () => {
    setIsAdding(false); // حالت ویرایش
    setIsPanelOpen(true);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden mt-2 border border-gray-300 rounded-lg mb-6 flex relative"
      style={{ height: "100%" }}
    >
      <DynamicConfirm
        isOpen={confirmOpen}
        variant={confirmVariant}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={handleConfirm}
        onClose={() => setConfirmOpen(false)}
      />

      {/* Left Panel */}
      <div
        className="flex flex-col overflow-auto bg-gray-100 box-border"
        style={{
          flex: `0 0 calc(${panelWidth}% - 1px)`,
          transition: isDragging ? "none" : "flex-basis 0.1s ease-out",
          backgroundColor: "#f3f4f6",
        }}
      >
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

        <div className="h-full p-4 overflow-auto relative">
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
            onEdit={onEdit}
            onDelete={handleDeleteClick}
            onDuplicate={handleDuplicateClick}
            isLoading={isLoading}
          />

          {/* Ribbons Form */}
          {activeSubTab === "Ribbons" && isPanelOpen && (
            <div className="-mt-32 w-full p-4 bg-white rounded-md shadow-md absolute">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <DynamicInput
                  name="Name"
                  type="text"
                  value={nameInput}
                  placeholder="Enter name"
                  onChange={handleNameChange}
                  required
                />
                <DynamicInput
                  name="Description"
                  type="text"
                  value={descriptionInput}
                  placeholder="Enter description"
                  onChange={handleDescriptionChange}
                  required
                />
              </div>
              <div className="flex items-center gap-4 mt-4">
                {/* Save Button - Only for Inserting */}
                <button
                  onClick={handleInsert}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  <FaSave /> Save
                </button>

                {/* Update and Delete Buttons - Only for Editing */}
                {!isAdding && selectedRow && (
                  <>
                    {/* Update Button */}
                    <button
                      onClick={handleUpdate}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      <FaEdit /> Update
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={handleDeleteClick}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      <FaTrash /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div
        onMouseDown={startDragging}
        className="flex items-center justify-center cursor-ew-resize w-2"
        style={{ userSelect: "none", cursor: "col-resize", zIndex: 30 }}
      >
        <div className="h-full w-1 bg-[#dd4bae] rounded"></div>
      </div>

      {/* Right Panel */}
      {isPanelOpen && (
        <div
          className={`flex-1 transition-opacity duration-100 bg-gray-100 ${
            isMaximized ? "opacity-50 pointer-events-none" : "opacity-100"
          }`}
          style={{
            transition: "opacity 0.1s ease-out",
            backgroundColor: "#f3f4f6",
            display: "flex",
            flexDirection: "column",
            overflowX: panelWidth <= 30 ? "auto" : "hidden",
            maxWidth: panelWidth <= 30 ? "100%" : "100%",
          }}
        >
          <div
            className="h-full p-4 flex flex-col"
            style={{
              minWidth: panelWidth <= 30 ? "300px" : "auto",
            }}
          >
            {activeSubTab !== "Ribbons" && (
              <PanelHeader
                isExpanded={false}
                toggleExpand={() => {}}
                onSave={
                  isAdding &&
                  (activeSubTab === "Configurations" ||
                    activeSubTab === "Commands" ||
                    activeSubTab === "Users" ||
                    activeSubTab === "Ribbons" ||
                    activeSubTab === "Roles" ||
                    activeSubTab === "RoleGroups" ||
                    activeSubTab === "Enterprises" ||
                    activeSubTab === "Staffing" ||
                    activeSubTab === "ProgramTemplate" ||
                    activeSubTab === "ProgramTypes" ||
                    activeSubTab === "Odp" ||
                    activeSubTab === "Procedures" ||
                    activeSubTab === "Calendars" ||
                    activeSubTab === "ProjectsAccess")
                    ? handleInsert
                    : undefined
                }
                onUpdate={
                  !isAdding &&
                  (activeSubTab === "Configurations" ||
                    activeSubTab === "Commands" ||
                    activeSubTab === "Users" ||
                    activeSubTab === "Ribbons" ||
                    activeSubTab === "Roles" ||
                    activeSubTab === "Enterprises" ||
                    activeSubTab === "RoleGroups" ||
                    activeSubTab === "Staffing" ||
                    activeSubTab === "ProgramTemplate" ||
                    activeSubTab === "ProgramTypes" ||
                    activeSubTab === "Odp" ||
                    activeSubTab === "Procedures" ||
                    activeSubTab === "Calendars" ||
                    activeSubTab === "ProjectsAccess")
                    ? handleUpdate
                    : undefined
                }
                onClose={handleClose}
                onTogglePanelSizeFromRight={togglePanelSizeFromRight}
                isRightMaximized={isRightMaximized}
              />
            )}

            {/* محتوای Right Panel */}
            {activeSubTab === "ProjectsAccess" && (
              <Suspense fallback={<div>Loading Projects Access...</div>}>
                <ProjectAccess
                  ref={projectAccessRef}
                  selectedProject={selectedRow}
                  onAddFromLeft={handleAddFromLeft}
                  onEditFromLeft={handleEditFromLeft} // ارسال متد جدید
                />
              </Suspense>
            )}

            {activeSubTab !== "ProjectsAccess" && Component && (
              <div className="mt-5 flex-grow overflow-y-auto">
                <div style={{ minWidth: "600px" }}>
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
                      ref={getActiveRef()}
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
// 2/در جدول لفت پروجکت اکسس وقتی روی ادد کلیک کردم update در پنل هدر به save تبدیل بشه

// 3/در جدول که در لفت  پروچکت اکسس است وقتی روی ردیف دابل کلیک کردم یا یک کلیک کردم و سپس روی ادیت جدول زدم save در پنل هدر به اپدیت تبدیل بشه

// 4/وقتی روی ادد در جدول لفت پروجکت اکسس میزنم اطلاعات جدول لفت پروجکت اکسس پاک نشن

// 5/ و در نهایت وقتی روی دلیت در جدول لفت پروجکت اکسس زدم api زیر کال بشه

// deleteAccessProject
