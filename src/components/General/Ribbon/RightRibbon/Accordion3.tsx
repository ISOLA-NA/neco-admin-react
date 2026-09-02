import React, { useState, useMemo, useEffect } from "react";
import {
  FiCopy,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import DynamicInput from "../../../utilities/DynamicInput";
import FileUploadHandler, {
  InsertModel,
} from "../../../../services/FileUploadHandler";
import DataTable from "../../../TableDynamic/DataTable";
import { useSubTabDefinitions } from "../../../../context/SubTabDefinitionsContext";
import AppServices, { MenuItem } from "../../../../services/api.services";
import DynamicConfirm from "../../../utilities/DynamicConfirm";
import { showAlert } from "../../../utilities/Alert/DynamicAlert";
import WindowsCommandSelectorModal from "./WindowsCommandSelectorModal";
import { useTranslation } from "react-i18next";

interface Accordion3Props {
  selectedMenuGroupId: number | null;
  selectedMenuGroupName?: string | null;
  onRowDoubleClick: (menuItemId: number) => void;
  isOpen: boolean;
  toggleAccordion: () => void;
}

interface RowData3 {
  ID: number;
  Name: string;
  PersianName?: string;
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
  Size?: number;
}

const Accordion3: React.FC<Accordion3Props> = ({
  selectedMenuGroupId,
  selectedMenuGroupName,
  onRowDoubleClick,
  isOpen,
  toggleAccordion,
}) => {
  const { t, i18n } = useTranslation();
  const TT = (key: string, fa: string, en: string) =>
    t(key, {
      defaultValue: i18n.language === "fa" ? fa : en,
    });

  const { subTabDefinitions, fetchDataForSubTab } = useSubTabDefinitions();
  const [rowData, setRowData] = useState<RowData3[]>([]);
  const [selectedRow, setSelectedRow] = useState<RowData3 | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [commandModalOpen, setCommandModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<RowData3>>({
    Name: "",
    PersianName: "",
    Command: "",
    Description: "",
    Order: 0,
    CommandWeb: "",
    CommandMobile: "",
    HelpText: "",
    KeyTip: "",
    Size: 0,
  });

  const [iconImageId, setIconImageId] = useState<string | null>(null);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("0");
  const [confirmInsertOpen, setConfirmInsertOpen] = useState<boolean>(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState<boolean>(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [errorConfirmOpen, setErrorConfirmOpen] = useState<boolean>(false);
  const [isFaMode, setIsFaMode] = useState(true);

  const baseDefs = subTabDefinitions["MenuItem"]?.columnDefs || [];

  const accordionTitle = useMemo(() => {
    const baseName =
      (selectedMenuGroupName || "").trim() ||
      TT("Ribbons.SelectedMenuGroupFallback", "بخش انتخاب شده", "Selected Section");

    return i18n.language === "fa"
      ? `لیست موارد برای بخش ${baseName}`
      : `Item List for Section:${baseName}`;
  }, [selectedMenuGroupName, i18n.language]);

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
          PersianName: item.PersianName ?? "",
          Command: item.Command ?? "",
          CommandWeb: item.CommandWeb ?? "",
          Description: item.Description ?? "",
          CommandMobile: item.CommandMobile ?? "",
          HelpText: item.HelpText ?? "",
          KeyTip: item.KeyTip ?? "",
          Size: item.Size ?? item.Order ?? 0,
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
        Size: 0,
      });
      setSelectedSize("0");
      setIconImageId(null);
      setResetCounter((prev) => prev + 1);
    }
  };

  useEffect(() => {
    loadRowData();
  }, [isOpen, selectedMenuGroupId]);

  const filteredRowData = useMemo(() => {
    if (!searchText) return rowData;
    const q = searchText.toLowerCase();
    return rowData.filter(
      (row) =>
        (row.Name || "").toLowerCase().includes(q) ||
        (row.PersianName || "").toLowerCase().includes(q) ||
        (row.Command || "").toLowerCase().includes(q) ||
        (row.KeyTip || "").toLowerCase().includes(q) ||
        (row.Description || "").toLowerCase().includes(q) ||
        String(row.Order ?? "").includes(searchText)
    );
  }, [searchText, rowData]);

  const handleRowClick = (row: RowData3) => {
    const sanitizedRow: RowData3 = {
      ...row,
      PersianName: row.PersianName ?? "",
      ModifiedById: row.ModifiedById === "" ? null : row.ModifiedById,
      IconImageId: row.IconImageId === "" ? null : row.IconImageId,
      Command: row.Command ?? "",
      CommandWeb: row.CommandWeb ?? "",
      Description: row.Description ?? "",
      CommandMobile: row.CommandMobile ?? "",
      HelpText: row.HelpText ?? "",
      KeyTip: row.KeyTip ?? "",
      Size: row.Size ?? row.Order ?? 0,
    };
    setSelectedRow(sanitizedRow);
    setFormData(sanitizedRow);
    setSelectedSize(String(sanitizedRow.Size ?? sanitizedRow.Order ?? 0));
    setIconImageId(sanitizedRow.IconImageId ?? null);
    setIsFaMode(true);
  };

  const handleRowDoubleClick = (row: RowData3) => {
    onRowDoubleClick(row.ID);
  };

  const handleDuplicate = (row: RowData3) => {
    const duplicatedRow: RowData3 = {
      ...row,
      ID: 0,
      Name: `${row.Name} (Copy)`,
      PersianName: row.PersianName ?? "",
      ModifiedById: null,
      IconImageId: null,
      Size: row.Size ?? row.Order ?? 0,
    };
    setFormData(duplicatedRow);
    setSelectedSize(String(duplicatedRow.Size ?? duplicatedRow.Order ?? 0));
    setIconImageId(null);
    setSelectedRow(null);
    setResetCounter((prev) => prev + 1);
  };

  const handleDelete = (row: RowData3) => {
    setSelectedRow(row);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteClick = () => {
    if (!selectedRow) return;
    setConfirmDeleteOpen(true);
  };

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
      Size: 0,
    };
    setSelectedRow(null);
    setFormData(newRow);
    setSelectedSize("0");
    setIconImageId(null);
    setIsFaMode(true);
    setResetCounter((prev) => prev + 1);
  };

  const handleInputChange = (name: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setSelectedSize(value);
    setFormData((prev) => ({
      ...prev,
      Size: parseInt(value, 10),
    }));
  };

  const handleUploadSuccess = (insertModel: InsertModel) => {
    setIconImageId(insertModel.ID || null);
    setFormData((prev) => ({ ...prev, IconImageId: insertModel.ID || null }));
  };

  const validateForm = (): boolean => {
    const nameTrim = (formData.Name || "").trim();
    const pNameTrim = (formData.PersianName || "").trim();
    if (!nameTrim && !pNameTrim) {
      showAlert(
        "warning",
        null,
        TT("Alerts.Title.Warning", "هشدار", "Warning"),
        "Name یا PersianName را وارد کنید"
      );
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (selectedRow) setConfirmUpdateOpen(true);
    else setConfirmInsertOpen(true);
  };

  const nameTrim = (formData.Name || "").trim();
  const pNameTrim = (formData.PersianName || "").trim();

  const confirmInsert = async () => {
    try {
      const newMenuItem: MenuItem = {
        ID: 0,
        Name: nameTrim || pNameTrim,
        PersianName: pNameTrim || null,
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
        Size: formData.Size ?? 0,
      };
      await AppServices.insertMenuItem(newMenuItem);
      showAlert(
        "success",
        null,
        "",
        TT("Alerts.Added.MenuItem", "با موفقیت اضافه شد", "Added successfully")
      );
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
        Size: 0,
      });
      setSelectedSize("0");
      setIconImageId(null);
      setIsFaMode(true);
      setResetCounter((prev) => prev + 1);
    } catch (error: any) {
      const data = error.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.value?.message || data?.message || "خطا در ذخیره";
      showAlert("error", null, "Error", message);
    } finally {
      setConfirmInsertOpen(false);
    }
  };

  const confirmUpdate = async () => {
    if (!selectedRow) return;
    try {
      const nameTrimLocal = (formData.Name || "").trim();
      const pNameTrimLocal = (formData.PersianName || "").trim();
      const updatedMenuItem: MenuItem = {
        ID: formData.ID!,
        Name: nameTrimLocal || pNameTrimLocal,
        PersianName: pNameTrimLocal || null,
        Command: formData.Command || "",
        CommandWeb: formData.CommandWeb || "",
        Description: formData.Description || "",
        Order: formData.Order || 0,
        nMenuGroupId: selectedMenuGroupId!,
        IsVisible: formData.IsVisible ?? true,
        LastModified: formData.LastModified || null,
        ModifiedById: formData.ModifiedById || null,
        IconImageId: iconImageId || null,
        CommandMobile: formData.CommandMobile || "",
        HelpText: formData.HelpText || "",
        KeyTip: formData.KeyTip || "",
        Size: formData.Size ?? 0,
      };
      await AppServices.updateMenuItem(updatedMenuItem);
      showAlert(
        "success",
        null,
        "",
        TT("Alerts.Updated.MenuItem", "با موفقیت ویرایش شد", "Updated successfully")
      );
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
        Size: 0,
      });
      await loadRowData();
      setResetCounter((prev) => prev + 1);
    } catch (error: any) {
      const data = error.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.value?.message || data?.message || "خطا در ویرایش";
      showAlert("error", null, "Error", message);
    } finally {
      setConfirmUpdateOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedRow) return;
    try {
      await AppServices.deleteMenuItem(selectedRow.ID);
      await loadRowData();
      setSelectedRow(null);
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
        Size: 0,
      });
      setSelectedSize("0");
      setIconImageId(null);
      setResetCounter((prev) => prev + 1);
      showAlert(
        "success",
        null,
        "",
        TT("Alerts.Deleted.MenuItem", "با موفقیت حذف شد", "Deleted successfully")
      );
    } catch (error) {
      console.error("Error deleting MenuItem:", error);
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  const closeErrorConfirm = () => {
    setErrorConfirmOpen(false);
  };

  const handleSelectCommand = (cmd: string) => {
    setFormData((prev) => ({ ...prev, Command: cmd }));
    setCommandModalOpen(false);
  };

  const columnDefsWithFaAndExtra = useMemo(() => {
    const defs = Array.isArray(baseDefs) ? [...baseDefs] : [];

    const ensureColumn = (
      field: string,
      headerFa: string,
      headerEn: string,
      width?: number
    ) => {
      const exists = defs.some(
        (c: any) => (c.field ?? "").toString().toLowerCase() === field.toLowerCase()
      );
      if (!exists) {
        defs.push({
          headerName: TT(`Ribbons.${field}`, headerFa, headerEn),
          field,
          sortable: true,
          filter: true,
          resizable: true,
          ...(width ? { width } : {}),
        });
      }
    };

    ensureColumn("Name", "نام", "Name", 180);
    ensureColumn("PersianName", "نام فارسی", "Persian Name", 180);
    ensureColumn("Command", "فرمان", "Command", 260);
    ensureColumn("KeyTip", "نکته کلیدی", "Key Tip", 140);
    ensureColumn("Order", "ترتیب", "Order", 110);
    ensureColumn("Description", "شرح", "Description", 180);

    const orderedFields = [
      "Name",
      "PersianName",
      "Command",
      "KeyTip",
      "Order",
      "Description",
    ];

    const orderedDefs = orderedFields
      .map((field) =>
        defs.find(
          (c: any) => (c.field ?? "").toString().toLowerCase() === field.toLowerCase()
        )
      )
      .filter(Boolean);

    const restDefs = defs.filter(
      (c: any) =>
        !orderedFields.includes((c.field ?? "").toString())
    );

    return [...orderedDefs, ...restDefs];
  }, [baseDefs, t, i18n.language]);

  const iconBtn =
    "rounded-full p-2 transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none";

  return (
    <>
      <style>{`
        [dir="ltr"] input[type="radio"] { margin-right: 6px; }
        [dir="rtl"] input[type="radio"] { margin-left: 6px; }
      `}</style>

      <div className="mb-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 transition-all duration-300">
        <div
          className="flex justify-between items-center p-4 bg-white border-b border-gray-300 rounded-t-lg cursor-pointer"
          onClick={toggleAccordion}
        >
          <span className="text-xl font-medium">{accordionTitle}</span>
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
                <div className="flex items-center justify-between mb-4 gap-4">
                  <div className="relative max-w-sm w-full">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder={TT(
                        "Ribbons.SearchPlaceholder",
                        "جستجو...",
                        "Full Text Search"
                      )}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                      style={{ fontFamily: "inherit" }}
                    />
                  </div>

                  <div className="flex justify-end gap-2 shrink-0">
                    <button
                      title={TT("Ribbons.Save", "ذخیره", "Save")}
                      onClick={handleSave}
                      className={`${iconBtn} bg-blue-50 hover:bg-blue-100 text-blue-600`}
                    >
                      <FiEdit size={20} />
                    </button>
                    <button
                      title={TT("Ribbons.New", "جدید", "New")}
                      onClick={handleNew}
                      className={`${iconBtn} bg-green-50 hover:bg-green-100 text-green-600`}
                    >
                      <FiPlus size={20} />
                    </button>
                    <button
                      title={TT("Ribbons.Delete", "حذف", "Delete")}
                      onClick={handleDeleteClick}
                      disabled={!selectedRow}
                      className={`${iconBtn} bg-red-50 hover:bg-red-100 text-red-600 ${
                        !selectedRow ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <FiTrash2 size={20} />
                    </button>
                    <button
                      title={TT("Ribbons.Duplicate", "کپی", "Duplicate")}
                      onClick={() => selectedRow && handleDuplicate(selectedRow)}
                      disabled={!selectedRow}
                      className={`${iconBtn} bg-yellow-50 hover:bg-yellow-100 text-yellow-600 ${
                        !selectedRow ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <FiCopy size={20} />
                    </button>
                  </div>
                </div>

                <div style={{ height: "300px", overflowY: "auto", marginTop: "-15px" }}>
                  <DataTable
                    direction={i18n.dir()}
                    columnDefs={columnDefsWithFaAndExtra}
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

                <div className="mt-2 p-4 border rounded bg-gray-50 shadow-inner">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <DynamicInput
                            name={
                              !isFaMode
                                ? TT("Forms.PersianName", "نام فارسی", "Persian Name")
                                : TT("Ribbons.Name", "نام", "Name")
                            }
                            type="text"
                            value={
                              !isFaMode
                                ? (formData.PersianName ?? "")
                                : (formData.Name ?? "")
                            }
                            placeholder={
                              !isFaMode
                                ? TT("Forms.PersianName", "نام فارسی", "Persian Name")
                                : TT("Ribbons.Name", "نام", "Name")
                            }
                            onChange={(e) => {
                              const v = e.target.value;
                              setFormData((prev) =>
                                !isFaMode
                                  ? { ...prev, PersianName: v }
                                  : { ...prev, Name: v }
                              );
                            }}
                          />
                        </div>
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
                              ? TT(
                                  "Ribbons.SwitchToEnglish",
                                  "تغییر به انگلیسی",
                                  "Switch to English"
                                )
                              : TT(
                                  "Ribbons.SwitchToPersian",
                                  "تغییر به فارسی",
                                  "Switch to Persian"
                                )
                          }
                        >
                          {isFaMode ? "FA" : "EN"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <DynamicInput
                        name={TT("Ribbons.Description", "شرح", "Description")}
                        type="text"
                        value={formData.Description || ""}
                        placeholder={TT("Ribbons.Description", "شرح", "Description")}
                        onChange={(e) =>
                          handleInputChange("Description", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <DynamicInput
                        name={TT("Ribbons.Order", "ترتیب", "Order")}
                        type="number"
                        value={formData.Order || 0}
                        placeholder={TT("Ribbons.Order", "ترتیب", "Order")}
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
                        name={TT("Ribbons.HelpText", "متن راهنما", "Help Text")}
                        type="text"
                        value={formData.HelpText || ""}
                        placeholder=""
                        onChange={(e) =>
                          handleInputChange("HelpText", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                        <DynamicInput
                          name={TT(
                            "Ribbons.WindowsAppCommand",
                            "فرمان windows application",
                            "Windows App Command"
                          )}
                          type="text"
                          value={formData.Command || ""}
                          placeholder=""
                          onChange={(e) =>
                            handleInputChange("Command", e.target.value)
                          }
                          className="w-full"
                        />
                        <button
                          type="button"
                          title="cmd"
                          onClick={() => setCommandModalOpen(true)}
                          className="h-9 px-3 text-sm leading-none bg-purple-600 hover:bg-purple-800 text-white rounded-md font-medium shrink-0 self-end"
                        >
                          cmd
                        </button>
                      </div>
                    </div>

                    <div>
                      <DynamicInput
                        name={TT(
                          "Ribbons.WindowsWebCommand",
                          "دستور وب ویندوز",
                          "Web App Command"
                        )}
                        type="text"
                        value={formData.CommandWeb || ""}
                        placeholder=""
                        onChange={(e) =>
                          handleInputChange("CommandWeb", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <DynamicInput
                        name={TT(
                          "Ribbons.MobileAppCommand",
                          "فرمان mobile application",
                          "Mobile App Command"
                        )}
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
                        name={TT("Ribbons.KeyTip", "نکته کلیدی", "Key Tip")}
                        type="text"
                        value={formData.KeyTip || ""}
                        placeholder=""
                        onChange={(e) =>
                          handleInputChange("KeyTip", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-lg font-medium">
                        {TT("Ribbons.Size", "اندازه:", "Size:")}
                      </span>
                      <label className="flex items-center text-lg">
                        <input
                          type="radio"
                          name="size"
                          value="0"
                          checked={selectedSize === "0"}
                          onChange={() => handleRadioChange("0")}
                        />
                        {TT("Ribbons.Large", "بزرگ", "Larg")}
                      </label>
                      <label className="flex items-center text-lg">
                        <input
                          type="radio"
                          name="size"
                          value="1"
                          checked={selectedSize === "1"}
                          onChange={() => handleRadioChange("1")}
                        />
                        {TT("Ribbons.Medium", "متوسط", "Middle")}
                      </label>
                      <label className="flex items-center text-lg">
                        <input
                          type="radio"
                          name="size"
                          value="2"
                          checked={selectedSize === "2"}
                          onChange={() => handleRadioChange("2")}
                        />
                        {TT("Ribbons.Small", "کوچک", "Small")}
                      </label>
                    </div>

                    <div className="w-full sm:w-96">
                      <p className="text-sm text-gray-500 mb-1">
                        {TT(
                          "Ribbons.BestIconSize",
                          "بهترین اندازه برای آیکن ها ۱۶×۱۶ می باشد",
                          "The best size for icons is 16×16"
                        )}
                      </p>
                      <FileUploadHandler
                        selectedFileId={iconImageId}
                        onUploadSuccess={handleUploadSuccess}
                        resetCounter={resetCounter}
                        onReset={() => setResetCounter((prev) => prev + 1)}
                        isEditMode={!!selectedRow}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500">
                Please select a Menu Group in Accordion2 so the Menu Items will
                be displayed.
              </p>
            )}
          </div>
        )}

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