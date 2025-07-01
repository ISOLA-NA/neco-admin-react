import React, { useState, useMemo, useEffect } from "react";
import {
  FiCopy,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { FaSearch, FaSave, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import DynamicInput from "../../../utilities/DynamicInput";
import DynamicRadioGroup from "../../../utilities/DynamicRadiogroup";
import FileUploadHandler, { InsertModel } from "../../../../services/FileUploadHandler";
import DataTable from "../../../TableDynamic/DataTable";
import { useSubTabDefinitions } from "../../../../context/SubTabDefinitionsContext";
import AppServices, { MenuItem } from "../../../../services/api.services";
import DynamicConfirm from "../../../utilities/DynamicConfirm";
import { showAlert } from "../../../utilities/Alert/DynamicAlert";
import WindowsCommandSelectorModal from "./WindowsCommandSelectorModal";

interface Accordion3Props {
  selectedMenuGroupId: number | null;
  onRowDoubleClick: (menuItemId: number) => void;
  isOpen: boolean;
  toggleAccordion: () => void;
}

interface RowData3 {
  ID: number;
  Name: string;
  Command: string;
  CommandWeb: string;
  Description: string;
  Order: number;
  IsVisible?: boolean;
  LastModified?: string | null;
  ModifiedById?: string | null;
  IconImageId?: string | null;
}

const Accordion3: React.FC<Accordion3Props> = ({
  selectedMenuGroupId,
  onRowDoubleClick,
  isOpen,
  toggleAccordion,
}) => {
  const { subTabDefinitions, fetchDataForSubTab } = useSubTabDefinitions();
  const [rowData, setRowData] = useState<RowData3[]>([]);
  const [selectedRow, setSelectedRow] = useState<RowData3 | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // حالت های ادیت و ادد
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [commandModalOpen, setCommandModalOpen] = useState(false);
  const [windowsAppCommand, setWindowsAppCommand] = useState<string>("");

  // state فرم
  const [formData, setFormData] = useState<Partial<RowData3>>({
    Name: "",
    Command: "",
    Description: "",
    Order: 0,
    CommandWeb: "",
  });

  // کنترل عکس و preview
  const [iconImageId, setIconImageId] = useState<string | null>(null);
  const [resetCounter, setResetCounter] = useState<number>(0);

  // سایر stateها
  const [selectedSize, setSelectedSize] = useState<string>("0");
  const [confirmInsertOpen, setConfirmInsertOpen] = useState<boolean>(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState<boolean>(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [errorConfirmOpen, setErrorConfirmOpen] = useState<boolean>(false);

  // ستون‌های جدول
  const columnDefs = [
    ...(subTabDefinitions["MenuItem"]?.columnDefs || []),
    {
      headerName: "Actions",
      field: "operations",
      sortable: false,
      filter: false,
      width: 150,
      cellRendererFramework: (params: any) => (
        <div className="flex space-x-2">
          <button
            className="text-yellow-600 hover:text-yellow-800 transition"
            onClick={() => handleDuplicate(params.data)}
            title="Duplicate"
          >
            <FiCopy size={20} />
          </button>
          <button
            className="text-blue-600 hover:text-blue-800 transition"
            onClick={() => handleEdit(params.data)}
            title="Edit"
          >
            <FiEdit size={20} />
          </button>
          <button
            className="text-red-600 hover:text-red-800 transition"
            onClick={() => handleDelete(params.data)}
            title="Delete"
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      ),
    },
  ];

  // گرفتن داده‌ها
  const loadRowData = async () => {
    if (isOpen && selectedMenuGroupId !== null) {
      setIsLoading(true);
      try {
        const data: RowData3[] = await fetchDataForSubTab("MenuItem", {
          ID: selectedMenuGroupId,
        });
        const sanitizedData = data.map((item) => ({
          ...item,
          ModifiedById: item.ModifiedById === "" ? null : item.ModifiedById,
          IconImageId: item.IconImageId === "" ? null : item.IconImageId,
        }));
        setRowData(sanitizedData);
      } catch (error) {
        console.error("Error fetching MenuItems:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setRowData([]);
      setSelectedRow(null);
      setIsEditing(false);
      setIsAdding(false);
      setFormData({ Name: "", Command: "", Description: "", Order: 0 });
      setSelectedSize("0");
      setIconImageId(null);
      setResetCounter((prev) => prev + 1);
    }
  };

  useEffect(() => {
    loadRowData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedMenuGroupId]);

  // سرچ
  const filteredRowData = useMemo(() => {
    if (!searchText) return rowData;
    return rowData.filter(
      (row) =>
        row.Name.toLowerCase().includes(searchText.toLowerCase()) ||
        row.Command.toLowerCase().includes(searchText.toLowerCase()) ||
        row.Description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, rowData]);

  // پر کردن فرم موقع کلیک روی ردیف
  const handleRowClick = (row: RowData3) => {
    const sanitizedRow: RowData3 = {
      ...row,
      ModifiedById: row.ModifiedById === "" ? null : row.ModifiedById,
      IconImageId: row.IconImageId === "" ? null : row.IconImageId,
    };
  
    setSelectedRow(sanitizedRow);               // انتخاب ردیف
    setFormData(sanitizedRow);                  // پر کردن فرم (Command و CommandWeb هر دو داخلش هستند)
    setWindowsAppCommand(sanitizedRow.Command || "");  // مقدار ورودی WindowsAppCommand
    setSelectedSize(String(sanitizedRow.Order ?? 0));  // رادیو سایز
    setIconImageId(sanitizedRow.IconImageId ?? null);  // عکس آیکن
    setIsEditing(true);
    setIsAdding(false);
  };
  

  const handleRowDoubleClick = (row: RowData3) => {
    onRowDoubleClick(row.ID);
  };

  // دابلیکیت
  const handleDuplicate = (row: RowData3) => {
    const duplicatedRow: RowData3 = {
      ...row,
      ID: 0,
      Name: `${row.Name} (Copy)`,
      ModifiedById: null,
      IconImageId: null,
    };
    setFormData(duplicatedRow);
    setSelectedSize("0");
    setIconImageId(null);
    setIsAdding(true);
    setIsEditing(false);
    setSelectedRow(null);
    setResetCounter((prev) => prev + 1);
  };

  // ادیت
const handleEdit = (row: RowData3) => {
  setSelectedRow(row);                         // همان ردیف
  setFormData(row);                            // داده‌های فرم
  setWindowsAppCommand(row.Command || "");     // هم‌زمان ورودی WindowsAppCommand
  setSelectedSize(String(row.Order ?? 0));     // سایز
  setIconImageId(row.IconImageId ?? null);     // آیکن
  setIsEditing(true);
  setIsAdding(false);
};

  // حذف از اکشن جدول
  const handleDelete = (row: RowData3) => {
    setSelectedRow(row);
    setConfirmDeleteOpen(true);
  };

  // حذف از دکمه بالا
  const handleDeleteClick = () => {
    if (!selectedRow) return;
    setConfirmDeleteOpen(true);
  };

  // ریست کامل فرم (New)
  const handleNew = () => {
    if (selectedMenuGroupId === null) {
      setErrorConfirmOpen(true);
      return;
    }
    const newRow: RowData3 = {
      ID: 0,
      Name: "",
      Command: "",
      Description: "",
      Order: 0,
      IsVisible: true,
      LastModified: null,
      ModifiedById: null,
      IconImageId: null,
    };
    setSelectedRow(null);
    setFormData(newRow);
    setSelectedSize("0");
    setIconImageId(null);
    setIsAdding(true);
    setIsEditing(false);
    setResetCounter((prev) => prev + 1);
    setWindowsAppCommand("");
  };

  // ورودی‌های فرم
  const handleInputChange = (
    name: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // تغییر رادیو
  const handleRadioChange = (value: string) => {
    setSelectedSize(value);
    setFormData((prev) => ({
      ...prev,
      Order: parseInt(value, 10),
    }));
  };

  // آپلود عکس موفق
  const handleUploadSuccess = (insertModel: InsertModel) => {
    setIconImageId(insertModel.ID || null);
    setFormData((prev) => ({
      ...prev,
      IconImageId: insertModel.ID || null,
    }));
  };

  // ذخیره (Insert)
  const handleInsert = () => {
    if (!validateForm()) return;
    setConfirmInsertOpen(true);
  };

  // آپدیت
  const handleUpdate = () => {
    if (!selectedRow) return;
    if (!validateForm()) return;
    setConfirmUpdateOpen(true);
  };

  // اعتبارسنجی فرم
  const validateForm = (): boolean => {
    if (!formData.Name) {
      setErrorConfirmOpen(true);
      return false;
    }
    return true;
  };

  // تأیید نهایی Insert
  const confirmInsert = async () => {
    try {
      const newMenuItem: MenuItem = {
        ID: 0,
        Name: formData.Name!,
        Command: formData.Command || "",
        CommandWeb: formData.CommandWeb || "", 
        Description: formData.Description || "",
        Order: formData.Order || 0,
        nMenuGroupId: selectedMenuGroupId!,
        IsVisible: formData.IsVisible ?? true,
        LastModified: null,
        ModifiedById: formData.ModifiedById || null,
        IconImageId: iconImageId || null,
        CommandMobile: "",
        HelpText: "",
        KeyTip: "",
        Size: formData.Order || 0,
        
      };
      showAlert("success", null, "", "MenuItem updated successfully.");
      await AppServices.insertMenuItem(newMenuItem);
      await loadRowData();
      setFormData({ Name: "", Command: "", Description: "", Order: 0 });
      setWindowsAppCommand(""); 
      setSelectedSize("0");
      setIconImageId(null);
      setIsAdding(false);
      setResetCounter((prev) => prev + 1);
    } catch (error: any) {
      console.error("Error inserting MenuItem:", error);
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

  // تأیید نهایی Update
  const confirmUpdate = async () => {
    if (!selectedRow) return;
    try {
      const updatedMenuItem: MenuItem = {
        ID: formData.ID!,
        Name: formData.Name!,
        Command: formData.Command || "",
        CommandWeb: formData.CommandWeb || "",
        Description: formData.Description || "",
        Order: formData.Order || 0,
        nMenuGroupId: selectedMenuGroupId!,
        IsVisible: formData.IsVisible ?? true,
        LastModified: formData.LastModified || null,
        ModifiedById: formData.ModifiedById || null,
        IconImageId: formData.IconImageId || null,
        CommandMobile: "",
        HelpText: "",
        KeyTip: "",
        Size: formData.Order || 0,
      };
      showAlert("success", null, "", "MenuItem updated successfully.");
      await AppServices.updateMenuItem(updatedMenuItem);
      await loadRowData();
      setIsEditing(false);
      setResetCounter((prev) => prev + 1);
    } catch (error: any) {
      console.error("Error updating MenuItem:", error);
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

  // تأیید نهایی حذف
  const confirmDelete = async () => {
    if (!selectedRow) return;
    try {
      await AppServices.deleteMenuItem(selectedRow.ID);
      await loadRowData();
      setSelectedRow(null);
      setFormData({ Name: "", Command: "", Description: "", Order: 0 });
      setIsEditing(false);
      setIsAdding(false);
      setSelectedSize("0");
      setIconImageId(null);
      setResetCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting MenuItem:", error);
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  // خطای اعتبارسنجی
  const closeErrorConfirm = () => {
    setErrorConfirmOpen(false);
  };

  const handleSelectCommand = (cmd: string) => {             // ⭐ NEW
    console.log("🎯 Windows Cmd selected:", cmd);            // ⭐ NEW
    setWindowsAppCommand(cmd);                               // ⭐ NEW
    setFormData((prev) => ({ ...prev, Command: cmd }));      // ⭐ NEW  ← اگر می‌خواهید همراه رکورد ذخیره شود
    setCommandModalOpen(false);                              // ⭐ NEW  ← بستن مودال
  };

  return (
    <div className="mb-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 transition-all duration-300">
      {/* Accordion header */}
      <div
        className="flex justify-between items-center p-4 bg-white border-b border-gray-300 rounded-t-lg cursor-pointer"
        onClick={toggleAccordion}
      >
        <span className="text-xl font-medium">Menu Items</span>
        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
          {isOpen ? (
            <FiChevronUp className="text-gray-700" size={20} />
          ) : (
            <FiChevronDown className="text-gray-700" size={20} />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-white rounded-b-lg">
          {selectedMenuGroupId !== null ? (
            <>
              {/* Search bar */}
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

              {/* DataTable */}
              <div
                style={{
                  height: "300px",
                  overflowY: "auto",
                  marginTop: "-15px",
                }}
              >
                <DataTable
                  columnDefs={columnDefs}
                  rowData={filteredRowData}
                  onRowClick={handleRowClick}
                  onRowDoubleClick={(data) => handleRowDoubleClick(data)}
                  isLoading={isLoading}
                  showSearch={false}
                  domLayout="normal"
                  showAddIcon={false}
                  showEditIcon={false}
                  showDeleteIcon={false}
                  showDuplicateIcon={false}
                />
              </div>

              {/* The form */}
              <div className="mt-4 p-4 border rounded bg-gray-50 shadow-inner">
                <div className="grid grid-cols-1 gap-6">
                  <DynamicInput
                    name="Name"
                    type="text"
                    value={formData.Name || ""}
                    placeholder="Name"
                    onChange={(e) => handleInputChange("Name", e.target.value)}
                    className="mt-2"
                  />

                  <DynamicInput
                    name="Windows web Command"
                    type="text"
                    value={formData.CommandWeb || ""}
                    placeholder=""
                    onChange={(e) =>
                      handleInputChange("CommandWeb", e.target.value)
                    }
                    className="mt-2"
                  />

                  {/* 🟢 Windows App Command input + modal button */}
                  <div className="flex items-center gap-2">
                    <DynamicInput
                      name="Windows App Command"
                      type="text"
                      value={windowsAppCommand}
                      placeholder=""
                      onChange={(e) => {
                        const val = e.target.value;
                        setWindowsAppCommand(val);                          
                        setFormData((prev) => ({ ...prev, Command: val }));  
                      }}
                      className="flex-1"                               
                    />

                    <button
                      type="button"
                      title="انتخاب Command"
                      onClick={() => setCommandModalOpen(true)}
                      className="h-9 px-3 bg-purple-600 hover:bg-purple-800 text-white rounded font-bold
               flex items-center justify-center mt-4"
                    >
                      cmd
                    </button>
                  </div>


                  <DynamicInput
                    name="Description"
                    type="text"
                    value={formData.Description || ""}
                    placeholder="Description"
                    onChange={(e) =>
                      handleInputChange("Description", e.target.value)
                    }
                    className="mt-2"
                  />

                  <DynamicInput
                    name="Order"
                    type="number"
                    value={formData.Order || 0}
                    placeholder="Order"
                    onChange={(e) =>
                      handleInputChange(
                        "Order",
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    className="mt-2"
                  />

                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <DynamicRadioGroup
                      options={[
                        { value: "0", label: "Large" },
                        { value: "1", label: "Medium" },
                        { value: "2", label: "Small" },
                      ]}
                      title="Size"
                      name="size"
                      selectedValue={selectedSize}
                      onChange={handleRadioChange}
                      className="w-full md:w-1/2"
                      isRowClicked={true}
                    />
                    <FileUploadHandler
                      selectedFileId={iconImageId}
                      onUploadSuccess={handleUploadSuccess}
                      resetCounter={resetCounter}
                      onReset={() => setResetCounter((prev) => prev + 1)}
                      isEditMode={isEditing}
                    />
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={handleInsert}
                    disabled={isEditing}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition ${isEditing
                        ? "bg-green-300 text-gray-200 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                      }`}
                  >
                    <FaSave /> Save
                  </button>

                  <button
                    onClick={handleUpdate}
                    disabled={!selectedRow}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition ${selectedRow
                        ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        : "bg-blue-300 text-gray-200 cursor-not-allowed"
                      }`}
                  >
                    <FaEdit /> Update
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={!selectedRow}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition ${selectedRow
                        ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                        : "bg-red-300 text-gray-200 cursor-not-allowed"
                      }`}
                  >
                    <FaTrash /> Delete
                  </button>
                  <button
                    onClick={handleNew}
                    disabled={!selectedRow}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition ${!selectedRow
                        ? "bg-gray-300 text-gray-200 cursor-not-allowed"
                        : "bg-gray-500 text-white hover:bg-gray-600 cursor-pointer"
                      }`}
                  >
                    <FaPlus /> New
                  </button>
                </div>
              </div>
            </>
          ) : (
            // If no MenuGroup is selected
            isOpen && (
              <p className="text-gray-500">
                Please select a Menu Group in Accordion2 so the Menu Items will
                be displayed.
              </p>
            )
          )}
        </div>
      )}

      {/* Confirm Insert */}
      <DynamicConfirm
        isOpen={confirmInsertOpen}
        title="Insert Confirmation"
        message="Are you sure you want to add this Menu Item?"
        onConfirm={confirmInsert}
        onClose={() => setConfirmInsertOpen(false)}
        variant="add"
      />

      {/* Confirm Update */}
      <DynamicConfirm
        isOpen={confirmUpdateOpen}
        title="Update Confirmation"
        message="Are you sure you want to update this Menu Item?"
        onConfirm={confirmUpdate}
        onClose={() => setConfirmUpdateOpen(false)}
        variant="edit"
      />

      {/* Confirm Delete */}
      <DynamicConfirm
        isOpen={confirmDeleteOpen}
        title="Delete Confirmation"
        message={`Are you sure you want to delete Menu Item "${selectedRow?.Name}"?`}
        onConfirm={confirmDelete}
        onClose={() => setConfirmDeleteOpen(false)}
        variant="delete"
      />

      {/* Error message (only Name is required now) */}
      <DynamicConfirm
        isOpen={errorConfirmOpen}
        title="Error"
        message="Name is required."
        onConfirm={closeErrorConfirm}
        onClose={closeErrorConfirm}
        variant="error"
        hideCancelButton={true}
      />

      {/* ---- Windows App Command Modal ---- */}
      <WindowsCommandSelectorModal
        isOpen={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
        onSelect={handleSelectCommand}
      />
    </div>
  );

};

export default Accordion3;
