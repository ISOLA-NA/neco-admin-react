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
import FileUploadHandler, {
  InsertModel,
} from "../../../../services/FileUploadHandler";
import DataTable from "../../../TableDynamic/DataTable";
import { useSubTabDefinitions } from "../../../../context/SubTabDefinitionsContext";
import AppServices, { MenuItem } from "../../../../services/api.services";
import DynamicConfirm from "../../../utilities/DynamicConfirm";
import { showAlert } from "../../../utilities/Alert/DynamicAlert";
import WindowsCommandSelectorModal from "./WindowsCommandSelectorModal";
import DynamicButton from "../../../utilities/DynamicButtons";
import { useTranslation } from "react-i18next";

interface Accordion3Props {
  selectedMenuGroupId: number | null;
  onRowDoubleClick: (menuItemId: number) => void;
  isOpen: boolean;
  toggleAccordion: () => void;
}

interface RowData3 {
  ID: number;
  Name: string;
  PersianName?: string; // ← اضافه شد (بدون null)
  Command: string;
  CommandWeb: string;
  Description: string;
  Order: number;
  IsVisible?: boolean;
  LastModified?: string | null;
  ModifiedById?: string | null;
  IconImageId?: string | null;
  CommandMobile?: string;
  HelpText?: string;
  KeyTip?: string;
}


const Accordion3: React.FC<Accordion3Props> = ({
  selectedMenuGroupId,
  onRowDoubleClick,
  isOpen,
  toggleAccordion,
}) => {
  const { t, i18n } = useTranslation();
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
    PersianName: "", // ← اضافه شد
    Command: "",
    Description: "",
    Order: 0,
    CommandWeb: "",
    CommandMobile: "",
    HelpText: "",
    KeyTip: "",
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

  const [isFaMode, setIsFaMode] = useState(true); // EN=false, FA=true


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
    const q = searchText.toLowerCase();
    return rowData.filter(
      (row) =>
        (row.Name || "").toLowerCase().includes(q) ||
        (row.PersianName || "").toLowerCase().includes(q) || // ← اضافه شد
        (row.Command || "").toLowerCase().includes(q) ||
        (row.Description || "").toLowerCase().includes(q)
    );
  }, [searchText, rowData]);

  // پر کردن فرم موقع کلیک روی ردیف
  const handleRowClick = (row: RowData3) => {
    const sanitizedRow: RowData3 = {
      ...row,
      PersianName: row.PersianName ?? "",
      ModifiedById: row.ModifiedById === "" ? null : row.ModifiedById,
      IconImageId: row.IconImageId === "" ? null : row.IconImageId,
    };

    setSelectedRow(sanitizedRow); // انتخاب ردیف
    setFormData(sanitizedRow); // پر کردن فرم (Command و CommandWeb هر دو داخلش هستند)
    setWindowsAppCommand(sanitizedRow.Command || ""); // مقدار ورودی WindowsAppCommand
    setSelectedSize(String(sanitizedRow.Order ?? 0)); // رادیو سایز
    setIconImageId(sanitizedRow.IconImageId ?? null); // عکس آیکن
    setIsEditing(true);
    setIsAdding(false);
    setIsFaMode(true);
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
      PersianName: row.PersianName ?? "", // ← اضافه شد
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
    setSelectedRow(row); // همان ردیف
    setFormData(row); // داده‌های فرم
    setFormData({ ...row, PersianName: row.PersianName ?? "" });
    setWindowsAppCommand(row.Command || ""); // هم‌زمان ورودی WindowsAppCommand
    setSelectedSize(String(row.Order ?? 0)); // سایز
    setIconImageId(row.IconImageId ?? null); // آیکن
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
      PersianName: "",
      Command: "",
      Description: "",
      Order: 0,
      IsVisible: true,
      LastModified: null,
      ModifiedById: null,
      IconImageId: null,
      CommandWeb: "",
      CommandMobile: "",
      HelpText: "",
      KeyTip: "",
    };
    setSelectedRow(null);
    setFormData(newRow);
    setSelectedSize("0");
    setIconImageId(null);
    setIsAdding(true);
    setIsFaMode(true);
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
    const nameTrim = (formData.Name || "").trim();
    const pNameTrim = (formData.PersianName || "").trim();

    // ✅ فقط اگر هر دو خالی بودن خطا بده
    if (!nameTrim && !pNameTrim) {
      showAlert("warning", null, "Warning", "Name یا PersianName را وارد کنید");
      return false;
    }
    return true;
  };

  const nameTrim = (formData.Name || "").trim();
  const pNameTrim = (formData.PersianName || "").trim();

  // تأیید نهایی Insert
  const confirmInsert = async () => {
    try {
      const newMenuItem: MenuItem = {
        ID: 0,
        Name: nameTrim || pNameTrim,     // ✅ fallback
        PersianName: pNameTrim || null,  // ✅ null اگر خالی بود
        Command: formData.Command || "",
        CommandWeb: formData.CommandWeb || "",
        Description: formData.Description || "",
        Order: formData.Order || 0,
        nMenuGroupId: selectedMenuGroupId!,
        IsVisible: formData.IsVisible ?? true,
        LastModified: null,
        ModifiedById: formData.ModifiedById || null,
        IconImageId: iconImageId || null,
        CommandMobile: formData.CommandMobile || "",
        HelpText: formData.HelpText || "",
        KeyTip: formData.KeyTip || "",
        Size: formData.Order || 0,

      };
      showAlert("success", null, "", t("Alerts.Added.MenuItem"));

      await AppServices.insertMenuItem(newMenuItem);
      await loadRowData();
      setFormData({
        Name: "",
        PersianName: "",
        Command: "",
        Description: "",
        Order: 0,
        CommandWeb: "",
        CommandMobile: "",
        HelpText: "",
        KeyTip: "",
      });
      setWindowsAppCommand("");
      setSelectedSize("0");
      setIconImageId(null);
      setIsAdding(true);
      setIsFaMode(true);
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

      const nameTrim = (formData.Name || "").trim();
      const pNameTrim = (formData.PersianName || "").trim();

      const updatedMenuItem: MenuItem = {
        ID: formData.ID!,
        Name: nameTrim || pNameTrim,
        PersianName: pNameTrim || null,
        Command: formData.Command || "",
        CommandWeb: formData.CommandWeb || "",
        Description: formData.Description || "",
        Order: formData.Order || 0,
        nMenuGroupId: selectedMenuGroupId!,
        IsVisible: formData.IsVisible ?? true,
        LastModified: formData.LastModified || null,
        ModifiedById: formData.ModifiedById || null,
        IconImageId: formData.IconImageId || null,
        CommandMobile: formData.CommandMobile || "",
        HelpText: formData.HelpText || "",
        KeyTip: formData.KeyTip || "",
        Size: formData.Order || 0,

      };
      showAlert("success", null, "", t("Alerts.Updated.MenuTab"));
      setFormData({
        Name: "",
        PersianName: "",
        Command: "",
        Description: "",
        Order: 0,
        CommandWeb: "",
        CommandMobile: "",
        HelpText: "",
        KeyTip: "",
      });
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
      setFormData({
        Name: "",
        Command: "",
        Description: "",
        Order: 0,
        CommandWeb: "",
        CommandMobile: "",
        HelpText: "",
        KeyTip: "",
      });

      setIsEditing(false);
      setIsAdding(false);
      setSelectedSize("0");
      setIconImageId(null);
      setResetCounter((prev) => prev + 1);
      showAlert("success", null, "", t("Alerts.Deleted.MenuItem"));
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

  const handleSelectCommand = (cmd: string) => {
    console.log("🎯 Windows Cmd selected:", cmd);
    setWindowsAppCommand(cmd);
    setFormData((prev) => ({ ...prev, Command: cmd }));
    setCommandModalOpen(false);
  };

  const baseDefs = subTabDefinitions["MenuItem"]?.columnDefs || [];

  const columnDefsWithFa = useMemo(() => {
    const defs = Array.isArray(baseDefs) ? [...baseDefs] : [];
    const hasFa = defs.some((c: any) => (c.field ?? "").toString() === "PersianName");
    if (hasFa) return defs;

    const faCol = {
      headerName: "PersianName",
      field: "PersianName",
      sortable: true,
      filter: true,
      resizable: true,
    };

    const nameIdx = defs.findIndex(
      (c: any) => (c.field ?? "").toString().toLowerCase() === "name"
    );
    if (nameIdx === -1) return [...defs, faCol];

    const before = defs.slice(0, nameIdx + 1);
    const after = defs.slice(nameIdx + 1);
    return [...before, faCol, ...after];
  }, [baseDefs]);

  const actionsCol = {
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
  };



  return (
    <>
      {/* Radio margin for LTR and RTL */}
      <style>{`
      [dir="ltr"] input[type="radio"] {
        margin-right: 6px;
      }
      [dir="rtl"] input[type="radio"] {
        margin-left: 6px;
      }
    `}</style>

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
                  <div className="relative max-w-sm w-full">
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
                    direction={i18n.dir()}
                    columnDefs={columnDefsWithFa}
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
                  {/* دو ستونه دقیق و هم‌راستا */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Row 1: Name | Description */}
                    <div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <DynamicInput
                            name={!isFaMode ? t("Forms.PersianName") : t("Forms.Name")}
                            type="text"
                            value={!isFaMode ? (formData.PersianName ?? "") : (formData.Name ?? "")}
                            placeholder={!isFaMode ? t("Forms.PersianName") : t("Forms.Name")}
                            onChange={(e) => {
                              const v = e.target.value;
                              setFormData((prev) =>
                                !isFaMode ? { ...prev, PersianName: v } : { ...prev, Name: v }
                              );
                            }}
                          // required={isFaMode} // وقتی FA هستی داری Name می‌زنی، پس Name اجباریه
                          />
                        </div>

                        {/* دکمه EN/FA با استایل گرادیانی */}
                        <button
                          type="button"
                          onClick={() => setIsFaMode((p) => !p)}
                          className={[
                            "shrink-0 inline-flex items-center justify-center h-10 px-4 rounded-xl",
                            "bg-gradient-to-r from-fuchsia-500 to-pink-500",
                            "text-white font-semibold tracking-wide",
                            "shadow-md shadow-pink-200/50",
                            "transition-all duration-200",
                            "hover:from-fuchsia-600 hover:to-pink-600 hover:shadow-lg hover:scale-[1.02]",
                            "active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-pink-300",
                          ].join(" ")}
                          title={
                            isFaMode
                              ? t("Forms.SwitchToEN", { field: t("Forms.PersianName") })
                              : t("Forms.SwitchToFA", { field: t("Forms.Name") })
                          }
                        >
                          {isFaMode ? "FA" : "EN"}
                        </button>
                      </div>
                    </div>
                    <div>
                      <DynamicInput
                        name={t("Ribbons.Description")}
                        type="text"
                        value={formData.Description || ""}
                        placeholder="Description"
                        onChange={(e) => handleInputChange("Description", e.target.value)}
                      />
                    </div>

                    {/* Row 2: Order | Help Text */}
                    <div>
                      <DynamicInput
                        name={t("Ribbons.Order")}
                        type="number"
                        value={formData.Order || 0}
                        placeholder="Order"
                        onChange={(e) =>
                          handleInputChange(
                            "Order",
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                      />
                    </div>

                    <div>
                      <DynamicInput
                        name={t("Ribbons.HelpText")}
                        type="text"
                        value={formData.HelpText || ""}
                        placeholder=""
                        onChange={(e) => handleInputChange("HelpText", e.target.value)}
                      />
                    </div>

                    {/* Row 3: Windows App Command (+cmd) | Windows Web Command */}
                    <div>
                      {/* Windows App Command + cmd button (کوچیک و هم‌تراز پایین اینپوت) */}
                      <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                        <DynamicInput
                          name={t("Ribbons.WindowsAppCommand")}
                          type="text"
                          value={formData.Command || ""}
                          placeholder=""
                          onChange={(e) => handleInputChange("Command", e.target.value)}
                          className="w-full"
                        />
                        <button
                          type="button"
                          title="انتخاب Command"
                          onClick={() => setCommandModalOpen(true)}
                          className="h-9 px-3 text-sm leading-none bg-purple-600 hover:bg-purple-800 text-white rounded-md font-medium shrink-0 self-end"
                        >
                          cmd
                        </button>

                      </div>
                    </div>

                    <div>
                      <DynamicInput
                        name={t("Ribbons.WindowsWebCommand")}
                        type="text"
                        value={formData.CommandWeb || ""}
                        placeholder=""
                        onChange={(e) => handleInputChange("CommandWeb", e.target.value)}
                      />
                    </div>

                    {/* Row 4: Mobile App Command | Key Tip */}
                    <div>
                      <DynamicInput
                        name={t("Ribbons.MobileAppCommand")}
                        type="text"
                        value={formData.CommandMobile || ""}
                        placeholder=""
                        onChange={(e) =>
                          handleInputChange("CommandMobile", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <DynamicInput
                        name={t("Ribbons.KeyTip")}
                        type="text"
                        value={formData.KeyTip || ""}
                        placeholder=""
                        onChange={(e) => handleInputChange("KeyTip", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Size radios and File Upload side by side */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-lg font-medium">
                        {" "}
                        {t("Ribbons.Size")}
                      </span>
                      {/* Inline radios */}
                      <label className="flex items-center text-lg">
                        <input
                          type="radio"
                          name="size"
                          value="0"
                          checked={selectedSize === "0"}
                          onChange={() => handleRadioChange("0")}
                        />
                        {t("Ribbons.Large")}
                      </label>
                      <label className="flex items-center text-lg">
                        <input
                          type="radio"
                          name="size"
                          value="1"
                          checked={selectedSize === "1"}
                          onChange={() => handleRadioChange("1")}
                        />
                        {t("Ribbons.Medium")}
                      </label>
                      <label className="flex items-center text-lg">
                        <input
                          type="radio"
                          name="size"
                          value="2"
                          checked={selectedSize === "2"}
                          onChange={() => handleRadioChange("2")}
                        />
                        {t("Ribbons.Small")}
                      </label>
                    </div>
                    <div className="w-full sm:w-96">
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
                  <div className="flex justify-center items-center gap-4 mt-6">
                    {/* Add - سبز سازمانی */}
                    <DynamicButton
                      text={t("Global.Add")}
                      leftIcon={<FaSave />}
                      onClick={handleInsert}
                      isDisabled={isEditing}
                      variant="orgGreen"
                      size="md"
                    />

                    {/* Edit - زرد سازمانی */}
                    <DynamicButton
                      text={t("Global.Edit")}
                      leftIcon={<FaEdit />}
                      onClick={handleUpdate}
                      isDisabled={!selectedRow}
                      variant="orgYellow"
                      size="md"
                    />

                    {/* Delete - قرمز سازمانی */}
                    <DynamicButton
                      text={t("Global.Delete")}
                      leftIcon={<FaTrash />}
                      onClick={handleDeleteClick}
                      isDisabled={!selectedRow}
                      variant="orgRed"
                    />
                    {/* New - آبی سازمانی */}
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
                Please select a Menu Group in Accordion2 so the Menu Items will be displayed.
              </p>
            )}
          </div>
        )}

        {/* Confirm dialogs & Modal */}
        <DynamicConfirm
          isOpen={confirmInsertOpen}
          title="Insert Confirmation"
          message="Are you sure you want to add this Menu Item?"
          onConfirm={confirmInsert}
          onClose={() => setConfirmInsertOpen(false)}
          variant="add"
        />
        <DynamicConfirm
          isOpen={confirmUpdateOpen}
          title="Update Confirmation"
          message="Are you sure you want to update this Menu Item?"
          onConfirm={confirmUpdate}
          onClose={() => setConfirmUpdateOpen(false)}
          variant="edit"
        />
        <DynamicConfirm
          isOpen={confirmDeleteOpen}
          title="Delete Confirmation"
          message={`Are you sure you want to delete Menu Item "${selectedRow?.Name}"?`}
          onConfirm={confirmDelete}
          onClose={() => setConfirmDeleteOpen(false)}
          variant="delete"
        />
        <DynamicConfirm
          isOpen={errorConfirmOpen}
          title="Error"
          message="Name is required."
          onConfirm={closeErrorConfirm}
          onClose={closeErrorConfirm}
          variant="error"
          hideCancelButton={true}
        />
        <WindowsCommandSelectorModal
          isOpen={commandModalOpen}
          onClose={() => setCommandModalOpen(false)}
          onSelect={handleSelectCommand}
        />
      </div>
    </>
  );


};

export default Accordion3;
