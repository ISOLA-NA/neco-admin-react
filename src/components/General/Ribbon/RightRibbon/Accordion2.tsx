import React, { useState, useEffect, useRef, useMemo } from "react";
import DataTable from "../../../TableDynamic/DataTable";
import DynamicInput from "../../../utilities/DynamicInput";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaSave, FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { useSubTabDefinitions } from "../../../../context/SubTabDefinitionsContext";
import AppServices, { MenuGroup } from "../../../../services/api.services";
import DynamicConfirm from "../../../utilities/DynamicConfirm";
import { showAlert } from "../../../utilities/Alert/DynamicAlert";
import FileUploadHandler, {
  InsertModel,
} from "../../../../services/FileUploadHandler";
import { useTranslation } from "react-i18next";
import DynamicButton from "../../../utilities/DynamicButtons";

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
  IconImageId?: string | null;
}

const Accordion2: React.FC<Accordion2Props> = ({
  selectedMenuTabId,
  onRowClick,
  onRowDoubleClick,
  isOpen,
  toggleAccordion,
}) => {
  const { t } = useTranslation();

  const { subTabDefinitions, fetchDataForSubTab } = useSubTabDefinitions();
  const [rowData, setRowData] = useState<RowData2[]>([]);
  const [selectedRow, setSelectedRow] = useState<RowData2 | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [iconImageId, setIconImageId] = useState<string | null>(null);
  const [resetCounter, setResetCounter] = useState<number>(0);

  // Form state
  const [formData, setFormData] = useState<Partial<RowData2>>({
    ID: 0,
    Name: "",
    Description: "",
    Order: 0,
    IconImageId: null,
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
    return rowData.filter(
      (row) =>
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
      setIconImageId(row.IconImageId || null);
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
      IconImageId: null,
    });
    setIsAdding(true);
    setIsEditing(false);
    setIconImageId(null);
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
        IconImageId: iconImageId || null,
      };
      console.log("Inserting MenuGroup:", newMenuGroup);
      showAlert("success", null, "", "MenuGroup updated successfully.");
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
      setIconImageId(null);
      setResetCounter((prev) => prev + 1);
    } catch (error: any) {
      console.error("Error inserting MenuGroup:", error);
      const data = error.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.value?.message ||
            data?.message ||
            "خطایی در فرآیند ذخیره دستور رخ داده است.";
      showAlert("error", null, "Error", message);
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
        IconImageId: iconImageId || null,
      };
      console.log("Updating MenuGroup:", updatedMenuGroup);
      showAlert("success", null, "", "MenuGroup updated successfully.");
      await AppServices.updateMenuGroup(updatedMenuGroup);
      await loadRowData();
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating MenuGroup:", error);
      const data = error.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.value?.message ||
            data?.message ||
            "خطایی در فرآیند ذخیره دستور رخ داده است.";
      showAlert("error", null, "Error", message);
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

  const handleUploadSuccess = (insertModel: InsertModel) => {
    setIconImageId(insertModel.ID || null);
    setFormData((prev) => ({
      ...prev,
      IconImageId: insertModel.ID || null,
    }));
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
              <div
                style={{
                  height: "300px",
                  overflowY: "auto",
                  marginTop: "-15px",
                }}
                ref={tableContainerRef}
              >
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
                    name={t("Ribbons.Name")}
                    type="text"
                    value={formData.Name || ""}
                    placeholder="Name"
                    onChange={(e) =>
                      setFormData({ ...formData, Name: e.target.value })
                    }
                    className="mt-2 flex-1"
                  />
                  <DynamicInput
                    name={t("Ribbons.Description")}
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
                    name={t("Ribbons.Order")}
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
                <div className="mt-4">
                  <FileUploadHandler
                    selectedFileId={iconImageId}
                    onUploadSuccess={handleUploadSuccess}
                    resetCounter={resetCounter}
                    onReset={() => setResetCounter((prev) => prev + 1)}
                    isEditMode={isEditing}
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-center items-center gap-4 mt-6">
                  {/* Save - سبز سازمانی (همان منطق قبلی: وقتی ردیف انتخاب شده باشد غیرفعال) */}
                  <DynamicButton
                    text={t("Global.New")}
                    leftIcon={<FaSave />}
                    onClick={handleInsert}
                    isDisabled={!!selectedRow}
                    variant="orgGreen"
                    size="md"
                  />

                  {/* Edit - زرد سازمانی (فقط وقتی ردیفی انتخاب شده فعال) */}
                  <DynamicButton
                    text={t("Global.Edit")}
                    leftIcon={<FaEdit />}
                    onClick={handleUpdate}
                    isDisabled={!selectedRow}
                    variant="orgYellow"
                    size="md"
                  />

                  {/* Delete - قرمز سازمانی (مثل قبل) */}
                  <DynamicButton
                    text={t("Global.Delete")}
                    leftIcon={<FaTrash />}
                    onClick={handleDeleteClick}
                    isDisabled={!selectedRow}
                    variant="orgRed"
                    size="md"
                  />

                  {/* New - آبی سازمانی (مثل قبل: وقتی ردیفی انتخاب نشده غیرفعال) */}
                  <DynamicButton
                    text={t("Global.New")}
                    leftIcon={<FaPlus />}
                    onClick={handleNew}
                    isDisabled={!selectedRow}
                    variant="orgBlue"
                    size="md"
                  />
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
