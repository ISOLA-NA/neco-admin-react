import React, { useState, useEffect, useRef, useMemo } from "react";
import DataTable from "../../../TableDynamic/DataTable";
import DynamicInput from "../../../utilities/DynamicInput";
import {
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiTrash2,
  FiEdit,
} from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import { useSubTabDefinitions } from "../../../../context/SubTabDefinitionsContext";
import AppServices, { MenuGroup } from "../../../../services/api.services";
import DynamicConfirm from "../../../utilities/DynamicConfirm";
import { showAlert } from "../../../utilities/Alert/DynamicAlert";
import FileUploadHandler, {
  InsertModel,
} from "../../../../services/FileUploadHandler";
import { useTranslation } from "react-i18next";

interface Accordion2Props {
  selectedMenuTabId: number | null;
  selectedMenuTabName?: string | null;
  onRowClick: (row: any) => void;
  onRowDoubleClick: (menuGroupId: number) => void;
  isOpen: boolean;
  toggleAccordion: () => void;
}

interface RowData2 {
  ID: number;
  Name: string;
  PersianName?: string | null;
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
  selectedMenuTabName,
  onRowClick,
  onRowDoubleClick,
  isOpen,
  toggleAccordion,
}) => {
  const { subTabDefinitions, fetchDataForSubTab } = useSubTabDefinitions();
  const [rowData, setRowData] = useState<RowData2[]>([]);
  const [selectedRow, setSelectedRow] = useState<RowData2 | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [iconImageId, setIconImageId] = useState<string | null>(null);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const { t, i18n } = useTranslation();
  const TT = (key: string, fa: string, en: string) =>
    t(key, {
      defaultValue: i18n.language === "fa" ? fa : en,
    });

  const [formData, setFormData] = useState<Partial<RowData2>>({
    ID: 0,
    Name: "",
    PersianName: "",
    Description: "",
    Order: 0,
    IconImageId: null,
  });

  const accordionTitle = useMemo(() => {
    const baseName =
      (selectedMenuTabName || "").trim() ||
      TT("Ribbons.SelectedMenuTabFallback", "تب انتخاب شده", "Selected Tab");

    return i18n.language === "fa"
      ? `لیست بخش ها برای تب ${baseName}`
      : `Sections List For Tab ${baseName}`;
  }, [selectedMenuTabName, i18n.language]);

  const [searchText, setSearchText] = useState<string>("");
  const [confirmInsertOpen, setConfirmInsertOpen] = useState<boolean>(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState<boolean>(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [suppressSelection, setSuppressSelection] = useState<boolean>(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const columnDefs = subTabDefinitions["MenuGroup"]?.columnDefs || [];
  const [isFaMode, setIsFaMode] = useState(true);

  const loadRowData = async () => {
    if (isOpen && selectedMenuTabId !== null) {
      setIsLoading(true);
      try {
        const data: RowData2[] = await fetchDataForSubTab("MenuGroup", {
          ID: selectedMenuTabId,
        });
        setRowData(data);
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
      setFormData({ ID: 0, Name: "", PersianName: "", Description: "", Order: 0 });
    }
  };

  useEffect(() => {
    loadRowData();
  }, [isOpen, selectedMenuTabId, fetchDataForSubTab]);

  const filteredRowData = useMemo(() => {
    if (!searchText) return rowData;
    const q = searchText.toLowerCase();
    return rowData.filter(
      (row) =>
        (row.Name || "").toLowerCase().includes(q) ||
        (row.PersianName || "").toLowerCase().includes(q) ||
        (row.Description || "").toLowerCase().includes(q) ||
        row.Order.toString().includes(searchText)
    );
  }, [searchText, rowData]);

  const handleSetSelectedRowData = (row: RowData2 | null) => {
    if (suppressSelection) return;
    setSelectedRow(row);
    onRowClick(row);
    if (row) {
      setFormData({ ...row });
      setIconImageId(row.IconImageId || null);
    }
  };

  const handleRowDoubleClick = (row: RowData2) => {
    setSelectedRow(row);
    onRowDoubleClick(row.ID);
  };

  const handleNew = () => {
    const newId =
      rowData.length > 0 ? Math.max(...rowData.map((r) => r.ID)) + 1 : 1;
    setSelectedRow(null);
    setFormData({
      ID: newId,
      Name: "",
      PersianName: "",
      Description: "",
      Order: 0,
      IconImageId: null,
    });
    setIconImageId(null);
    onRowClick(null);
    setIsFaMode(true);
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

  const handleDeleteClick = () => {
    if (!selectedRow) return;
    setConfirmDeleteOpen(true);
  };

  const nameTrim = (formData.Name || "").trim();
  const pNameTrim = (formData.PersianName || "").trim();

  const confirmInsert = async () => {
    try {
      const newMenuGroup: MenuGroup = {
        ID: formData.ID!,
        Name: nameTrim || pNameTrim,
        PersianName: pNameTrim || null,
        Description: formData.Description || "",
        Order: formData.Order || 0,
        nMenuTabId: selectedMenuTabId!,
        IsVisible: true,
        ModifiedById: null,
        LastModified: null,
        IconImageId: iconImageId || null,
      };
      await AppServices.insertMenuGroup(newMenuGroup);
      showAlert(
        "success",
        null,
        "",
        TT("Alerts.Added.MenuGroup", "با موفقیت اضافه شد", "Added successfully")
      );
      await loadRowData();

      const newId =
        rowData.length > 0 ? Math.max(...rowData.map((r) => r.ID)) + 1 : 1;

      setFormData({
        ID: newId,
        Name: "",
        PersianName: "",
        Description: "",
        Order: 0,
      });
      setSelectedRow(null);
      onRowClick(null);
      setIconImageId(null);
      setIsFaMode(true);
      setResetCounter((prev) => prev + 1);

      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
      }
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
    try {
      const updatedMenuGroup: MenuGroup = {
        ID: formData.ID!,
        Name: nameTrim || pNameTrim,
        PersianName: (formData.PersianName || "").trim() || null,
        Description: formData.Description || "",
        Order: formData.Order || 0,
        nMenuTabId: formData.nMenuTabId || selectedMenuTabId!,
        IsVisible: true,
        ModifiedById: null,
        LastModified: null,
        IconImageId: iconImageId || null,
      };
      await AppServices.updateMenuGroup(updatedMenuGroup);
      showAlert(
        "success",
        null,
        "",
        TT("Alerts.Updated.MenuGroup", "با موفقیت ویرایش شد", "Updated successfully")
      );
      await loadRowData();
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
      await AppServices.deleteMenuGroup(selectedRow.ID);
      setSuppressSelection(true);
      await loadRowData();
      setSelectedRow(null);
      onRowClick(null);
      setFormData({ ID: 0, Name: "", PersianName: "", Description: "", Order: 0 });
      setTimeout(() => setSuppressSelection(false), 500);
      showAlert(
        "success",
        null,
        "",
        TT("Alerts.Deleted.MenuGroup", "با موفقیت حذف شد", "Deleted successfully")
      );
    } catch (error) {
      console.error("Error deleting MenuGroup:", error);
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  const handleUploadSuccess = (insertModel: InsertModel) => {
    setIconImageId(insertModel.ID || null);
    setFormData((prev) => ({
      ...prev,
      IconImageId: insertModel.ID || null,
    }));
  };

  const columnDefsWithFa = useMemo(() => {
    const defs = Array.isArray(columnDefs) ? [...columnDefs] : [];
    const hasFa = defs.some((c: any) => (c.field ?? "").toString() === "PersianName");
    if (hasFa) return defs;

    const faCol = {
      headerName: TT(
        "DataTable.Headers.PersianName",
        "نام فارسی",
        "Persian Name"
      ),
      field: "PersianName",
      sortable: true,
      filter: true,
      resizable: true,
    };

    const nameIdx = defs.findIndex(
      (c: any) => (c.field ?? "").toString().toLowerCase() === "name"
    );
    if (nameIdx === -1) return [...defs, faCol];

    return [...defs.slice(0, nameIdx + 1), faCol, ...defs.slice(nameIdx + 1)];
  }, [columnDefs, t, i18n.language]);

  const iconBtn =
    "rounded-full p-2 transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none";

  return (
    <div className="mb-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 transition-all duration-300">
      <div
        className="flex justify-between items-center p-4 bg-white border-b border-gray-300 rounded-t-lg cursor-pointer"
        onClick={toggleAccordion}
      >
        <span className="text-xl font-medium mt-5">{accordionTitle}</span>
        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mt-5">
          {isOpen ? <FiChevronUp className="text-gray-700" size={20} /> : <FiChevronDown className="text-gray-700" size={20} />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-white rounded-b-lg">
          {selectedMenuTabId !== null ? (
            <>
              <div className="flex items-center justify-between mb-4 gap-4">
                <div className="relative max-w-sm w-full">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder={TT(
                      "Ribbons.SearchPlaceholder",
                      "جستجو...",
                      "Search..."
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
                </div>
              </div>

              <div
                style={{ height: "300px", overflowY: "auto", marginTop: "-15px" }}
                ref={tableContainerRef}
              >
                <DataTable
                  direction={i18n.dir()}
                  columnDefs={columnDefsWithFa}
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
                  onEdit={handleSave}
                  onDelete={handleDeleteClick}
                  onDuplicate={() => {}}
                  isLoading={isLoading}
                  showSearch={false}
                  domLayout="normal"
                />
              </div>

              <div className="mt-2 p-4 border rounded bg-gray-50 shadow-inner">
                <div className="flex gap-4">
                  <div className="flex items-end gap-2 flex-1">
                    <div className="flex-1">
                      <DynamicInput
                        name={
                          !isFaMode
                            ? TT("Forms.PersianName", "نام فارسی", "Persian Name")
                            : TT("Ribbons.Name", "نام", "Name")
                        }
                        type="text"
                        value={!isFaMode ? (formData.PersianName ?? "") : (formData.Name ?? "")}
                        placeholder={
                          !isFaMode
                            ? TT("Forms.PersianName", "نام فارسی", "Persian Name")
                            : TT("Ribbons.Name", "نام", "Name")
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          setFormData((prev) =>
                            !isFaMode ? { ...prev, PersianName: v } : { ...prev, Name: v }
                          );
                        }}
                        className="mt-2 flex-1"
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

                  <DynamicInput
                    name={TT("Ribbons.Description", "شرح", "Description")}
                    type="text"
                    value={formData.Description || ""}
                    placeholder={TT("Ribbons.Description", "شرح", "Description")}
                    onChange={(e) =>
                      setFormData({ ...formData, Description: e.target.value })
                    }
                    className="mt-2 flex-1"
                  />
                </div>

                <div className="mt-4">
                  <DynamicInput
                    name={TT("Ribbons.Order", "ترتیب", "Order")}
                    type="number"
                    value={formData.Order || 0}
                    placeholder={TT("Ribbons.Order", "ترتیب", "Order")}
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
                    isEditMode={!!selectedRow}
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

      <DynamicConfirm
        isOpen={confirmInsertOpen}
        title="Insert Confirmation"
        message="Are you sure you want to add this Menu Group?"
        onConfirm={confirmInsert}
        onClose={() => setConfirmInsertOpen(false)}
        variant="add"
      />
      <DynamicConfirm
        isOpen={confirmUpdateOpen}
        title="Update Confirmation"
        message="Are you sure you want to update this Menu Group?"
        onConfirm={confirmUpdate}
        onClose={() => setConfirmUpdateOpen(false)}
        variant="edit"
      />
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