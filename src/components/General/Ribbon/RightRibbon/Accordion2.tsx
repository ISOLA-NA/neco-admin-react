import React, { useState, useEffect, useRef, useMemo } from "react";
import DataTable from "../../../TableDynamic/DataTable";
import DynamicInput from "../../../utilities/DynamicInput";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaSave, FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { useSubTabDefinitions } from "../../../../context/SubTabDefinitionsContext";
import AppServices, { MenuGroup } from "../../../../services/api.services";
import DynamicConfirm from "../../../utilities/DynamicConfirm";

interface Accordion2Props {
  selectedMenuTabId: number | null;
  onRowClick: (row: any) => void;
  onRowDoubleClick: (menuGroupId: number) => void;
  isOpen: boolean;
  toggleAccordion: () => void;
}

interface RowData2 {
  ID: number;
  Name: string;
  Description: string;
  Order: number;
  nMenuTabId: number;
  IsVisible: boolean;
  LastModified: string | null;
  ModifiedById: string | null;
}

const Accordion2: React.FC<Accordion2Props> = ({
  selectedMenuTabId,
  onRowClick,
  onRowDoubleClick,
  isOpen,
  toggleAccordion,
}) => {
  const { subTabDefinitions, fetchDataForSubTab } = useSubTabDefinitions();
  const [rowData, setRowData] = useState<RowData2[]>([]);
  const [selectedRow, setSelectedRow] = useState<RowData2 | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState<Partial<RowData2>>({
    ID: 0,
    Name: "",
    Description: "",
    Order: 0,
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Search state
  const [searchText, setSearchText] = useState<string>("");

  // DynamicConfirm states for Insert, Update and Delete operations
  const [confirmInsertOpen, setConfirmInsertOpen] = useState<boolean>(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState<boolean>(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);

  // Flag to temporarily suppress auto-selection of a row (after delete)
  const [suppressSelection, setSuppressSelection] = useState<boolean>(false);

  // Ref for table container scroll
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Column definitions from subTabDefinitions (if exists)
  const columnDefs = subTabDefinitions["MenuGroup"]?.columnDefs || [];

  // Load data function
  const loadRowData = async () => {
    if (isOpen && selectedMenuTabId !== null) {
      setIsLoading(true);
      try {
        const data: RowData2[] = await fetchDataForSubTab("MenuGroup", {
          ID: selectedMenuTabId,
        });
        setRowData(data);
        // Clear any selection after loading data
        setSelectedRow(null);
        onRowClick(null);
      } catch (error) {
        console.error("Error fetching MenuGroups:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setRowData([]);
      setSelectedRow(null);
      onRowClick(null);
      setIsEditing(false);
      setIsAdding(false);
      setFormData({ ID: 0, Name: "", Description: "", Order: 0 });
    }
  };

  useEffect(() => {
    loadRowData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedMenuTabId, fetchDataForSubTab]);

  // Filter rows by search text (بر اساس نام، توضیحات یا ترتیب)
  const filteredRowData = useMemo(() => {
    if (!searchText) return rowData;
    return rowData.filter((row) =>
      row.Name.toLowerCase().includes(searchText.toLowerCase()) ||
      row.Description.toLowerCase().includes(searchText.toLowerCase()) ||
      row.Order.toString().includes(searchText)
    );
  }, [searchText, rowData]);

  // Update form when a row is selected (suppress if needed)
  const handleSetSelectedRowData = (row: RowData2 | null) => {
    if (suppressSelection) return;
    setSelectedRow(row);
    onRowClick(row);
    if (row) {
      setFormData({ ...row });
    }
  };

  // Row double click event
  const handleRowDoubleClick = (row: RowData2) => {
    setSelectedRow(row);
    onRowDoubleClick(row.ID);
  };

  // "New" button: clear form (do not validate)
  const handleNew = () => {
    const newId =
      rowData.length > 0 ? Math.max(...rowData.map((r) => r.ID)) + 1 : 1;
    setSelectedRow(null);
    setFormData({
      ID: newId,
      Name: "",
      Description: "",
      Order: 0,
    });
    setIsAdding(true);
    setIsEditing(false);
    onRowClick(null);
  };

  // Validate form: ensure Name is not empty
  const validateForm = (): boolean => {
    if (!formData.Name || formData.Name.trim() === "") {
      return false;
    }
    return true;
  };

  // When user clicks "Save" in add mode
  const handleInsert = () => {
    if (!validateForm()) return;
    setConfirmInsertOpen(true);
  };

  // When user clicks "Update"
  const handleUpdate = () => {
    if (!selectedRow) return;
    if (!validateForm()) return;
    setConfirmUpdateOpen(true);
  };

  // When user clicks "Delete"
  const handleDeleteClick = () => {
    if (!selectedRow) return;
    setConfirmDeleteOpen(true);
  };

  // Confirm Insert operation
  const confirmInsert = async () => {
    try {
      const newMenuGroup: MenuGroup = {
        ID: formData.ID!,
        Name: formData.Name!,
        Description: formData.Description || "",
        Order: formData.Order || 0,
        nMenuTabId: selectedMenuTabId!,
        IsVisible: true,
        ModifiedById: null,
        LastModified: null,
      };
      console.log("Inserting MenuGroup:", newMenuGroup);
      await AppServices.insertMenuGroup(newMenuGroup);
      await loadRowData();
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop =
          tableContainerRef.current.scrollHeight;
      }
      const newId =
        rowData.length > 0 ? Math.max(...rowData.map((r) => r.ID)) + 1 : 1;
      setFormData({
        ID: newId,
        Name: "",
        Description: "",
        Order: 0,
      });
      setSelectedRow(null);
      onRowClick(null);
      setIsAdding(false);
    } catch (error) {
      console.error("Error inserting MenuGroup:", error);
    } finally {
      setConfirmInsertOpen(false);
    }
  };

  // Confirm Update operation
  const confirmUpdate = async () => {
    try {
      const updatedMenuGroup: MenuGroup = {
        ID: formData.ID!,
        Name: formData.Name!,
        Description: formData.Description || "",
        Order: formData.Order || 0,
        nMenuTabId: formData.nMenuTabId || selectedMenuTabId!,
        IsVisible: true,
        ModifiedById: null,
        LastModified: null,
      };
      console.log("Updating MenuGroup:", updatedMenuGroup);
      await AppServices.updateMenuGroup(updatedMenuGroup);
      await loadRowData();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating MenuGroup:", error);
    } finally {
      setConfirmUpdateOpen(false);
    }
  };

  // Confirm Delete operation
  const confirmDelete = async () => {
    if (!selectedRow) return;
    try {
      await AppServices.deleteMenuGroup(selectedRow.ID);
      // Suppress new selection immediately after deletion
      setSuppressSelection(true);
      await loadRowData();
      setSelectedRow(null);
      onRowClick(null);
      setIsEditing(false);
      setIsAdding(false);
      setFormData({ ID: 0, Name: "", Description: "", Order: 0 });
      // After a short delay, allow selection again
      setTimeout(() => {
        setSuppressSelection(false);
      }, 500);
    } catch (error) {
      console.error("Error deleting MenuGroup:", error);
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  // Cancel form operation and clear form
  const handleFormCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setFormData({ ID: 0, Name: "", Description: "", Order: 0 });
    setSelectedRow(null);
    onRowClick(null);
  };

  return (
    <div className="mb-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 transition-all duration-300">
      {/* Accordion header */}
      <div
        className="flex justify-between items-center p-4 bg-white border-b border-gray-300 rounded-t-lg cursor-pointer"
        onClick={toggleAccordion}
      >
        <span className="text-xl font-medium mt-5">Menu Groups</span>
        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mt-5">
          {isOpen ? (
            <FiChevronUp className="text-gray-700" size={20} />
          ) : (
            <FiChevronDown className="text-gray-700" size={20} />
          )}
        </div>
      </div>

      {/* Accordion content */}
      {isOpen && (
        <div className="p-4 bg-white rounded-b-lg">
          {selectedMenuTabId !== null ? (
            <>
              {/* Search bar مشابه Accordion3 */}
              <div className="flex items-center justify-between mb-4">
                <div className="relative max-w-sm">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    style={{ fontFamily: "inherit" }}
                  />
                </div>
              </div>

              {/* DataTable with fixed scroll container */}
              <div style={{ height: "300px", overflowY: "auto" ,marginTop:'-15px'}} ref={tableContainerRef}>
                <DataTable
                  columnDefs={columnDefs}
                  rowData={filteredRowData}
                  onRowDoubleClick={handleRowDoubleClick}
                  setSelectedRowData={handleSetSelectedRowData}
                  showDuplicateIcon={false}
                  showEditIcon={false}
                  showAddIcon={false}
                  showDeleteIcon={false}
                  showViewIcon={false}
                  onView={() => {}}
                  onAdd={handleNew}
                  onEdit={() => {
                    if (selectedRow) {
                      setIsEditing(true);
                      setIsAdding(false);
                    }
                  }}
                  onDelete={handleDeleteClick}
                  onDuplicate={() => {}}
                  isLoading={isLoading}
                  showSearch={false}
                  domLayout="normal"
                />
              </div>

              {/* Form always visible */}
              <div className="mt-4 p-4 border rounded bg-gray-50 shadow-inner">
                <div className="flex gap-4">
                  <DynamicInput
                    name="Name"
                    type="text"
                    value={formData.Name || ""}
                    placeholder="Name"
                    onChange={(e) =>
                      setFormData({ ...formData, Name: e.target.value })
                    }
                    className="mt-2 flex-1"
                  />
                  <DynamicInput
                    name="Description"
                    type="text"
                    value={formData.Description || ""}
                    placeholder="Description"
                    onChange={(e) =>
                      setFormData({ ...formData, Description: e.target.value })
                    }
                    className="mt-2 flex-1"
                  />
                </div>
                <div className="mt-4">
                  <DynamicInput
                    name="Order"
                    type="number"
                    value={formData.Order || 0}
                    placeholder="Order"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Order: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="mt-2"
                  />
                </div>
                {/* Buttons */}
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={handleInsert}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    <FaSave /> Save
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={!selectedRow}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                      selectedRow
                        ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        : "bg-blue-300 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    <FaEdit /> Update
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={!selectedRow}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                      selectedRow
                        ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                        : "bg-red-300 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    <FaTrash /> Delete
                  </button>
                  <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                  >
                    <FaPlus /> New
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500">
              Please select a Menu Tab in Accordion1 to display Menu Groups.
            </p>
          )}
        </div>
      )}

      {/* DynamicConfirm for Insert */}
      <DynamicConfirm
        isOpen={confirmInsertOpen}
        title="Insert Confirmation"
        message="Are you sure you want to add this Menu Group?"
        onConfirm={confirmInsert}
        onClose={() => setConfirmInsertOpen(false)}
        variant="add"
      />

      {/* DynamicConfirm for Update */}
      <DynamicConfirm
        isOpen={confirmUpdateOpen}
        title="Update Confirmation"
        message="Are you sure you want to update this Menu Group?"
        onConfirm={confirmUpdate}
        onClose={() => setConfirmUpdateOpen(false)}
        variant="edit"
      />

      {/* DynamicConfirm for Delete */}
      <DynamicConfirm
        isOpen={confirmDeleteOpen}
        title="Delete Confirmation"
        message={`Are you sure you want to delete the Menu Group "${selectedRow?.Name}"?`}
        onConfirm={confirmDelete}
        onClose={() => setConfirmDeleteOpen(false)}
        variant="delete"
      />
    </div>
  );
};

export default Accordion2;
