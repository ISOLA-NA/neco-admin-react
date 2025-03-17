import React, { useState, useEffect, useRef, useMemo } from "react";
import DynamicInput from "../../../utilities/DynamicInput";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaSave, FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { useSubTabDefinitions } from "../../../../context/SubTabDefinitionsContext";
import AppServices, { MenuTab } from "../../../../services/api.services";
import DataTable from "../../../TableDynamic/DataTable";
import DynamicConfirm from "../../../utilities/DynamicConfirm";

interface Accordion1Props {
  onRowClick: (row: any) => void;
  onRowDoubleClick: (menuTabId: number) => void;
  isOpen: boolean;
  toggleAccordion: () => void;
  selectedMenuId: number | null;
}

interface RowData1 {
  ID: number;
  Name: string;
  Description: string;
  Order: number;
}

// تعریف نوع فرم که فیلد Order می‌تواند عدد یا رشته باشد
type FormDataType = {
  ID: number;
  Name: string;
  Description: string;
  Order: number | string;
};

const Accordion1: React.FC<Accordion1Props> = ({
  onRowClick,
  onRowDoubleClick,
  isOpen,
  toggleAccordion,
  selectedMenuId,
}) => {
  const { subTabDefinitions, fetchDataForSubTab } = useSubTabDefinitions();
  const [rowData, setRowData] = useState<RowData1[]>([]);
  const [selectedRow, setSelectedRow] = useState<RowData1 | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // فرم: ذخیره داده‌های فرم
  const [formData, setFormData] = useState<FormDataType>({
    ID: 0,
    Name: "",
    Description: "",
    Order: "",
  });

  // حالت‌های نمایش DynamicConfirm برای عملیات‌های مختلف
  const [confirmInsertOpen, setConfirmInsertOpen] = useState<boolean>(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState<boolean>(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [errorConfirmOpen, setErrorConfirmOpen] = useState<boolean>(false);

  // حالت جستجو
  const [searchText, setSearchText] = useState<string>("");

  const columnDefs = subTabDefinitions["MenuTab"]?.columnDefs || [];

  // مرجع برای container جدول جهت اسکرول
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // بارگذاری داده‌ها
  const loadRowData = async () => {
    if (isOpen) {
      setIsLoading(true);
      if (selectedMenuId !== null) {
        try {
          const data: RowData1[] = await fetchDataForSubTab("MenuTab", {
            ID: selectedMenuId,
          });
          // مرتب‌سازی داده‌ها بر اساس فیلد Order به صورت صعودی
          const sortedData = data.sort((a, b) => a.Order - b.Order);
          setRowData(sortedData);
        } catch (error) {
          console.error("Error fetching MenuTabs:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.warn("selectedMenuId is null");
        setRowData([]);
        setIsLoading(false);
      }
    } else {
      setRowData([]);
      setSelectedRow(null);
      onRowClick(null);
      setFormData({ ID: 0, Name: "", Description: "", Order: "" });
    }
  };

  useEffect(() => {
    loadRowData();
  }, [isOpen, selectedMenuId, fetchDataForSubTab]);

  // فیلتر کردن داده‌های جدول بر اساس متن جستجو (نام، توضیحات و ترتیب)
  const filteredRowData = useMemo(() => {
    if (!searchText) return rowData;
    return rowData.filter((row) =>
      row.Name.toLowerCase().includes(searchText.toLowerCase()) ||
      row.Description.toLowerCase().includes(searchText.toLowerCase()) ||
      row.Order.toString().includes(searchText)
    );
  }, [searchText, rowData]);

  // وقتی ردیف انتخاب می‌شود، formData به‌روز می‌شود
  const handleSetSelectedRowData = (row: RowData1 | null) => {
    setSelectedRow(row);
    onRowClick(row);
    if (row) {
      setFormData({ ...row });
    }
  };

  // دوبار کلیک روی ردیف
  const handleRowDoubleClick = (row: RowData1) => {
    setSelectedRow(row);
    onRowDoubleClick(row.ID);
  };

  // دکمه New: پاک کردن فرم و آماده‌سازی حالت افزودن جدید
  const handleNew = () => {
    const newId = rowData.length > 0 ? Math.max(...rowData.map((r) => r.ID)) + 1 : 1;
    setSelectedRow(null);
    setFormData({
      ID: newId,
      Name: "",
      Description: "",
      Order: "",
    });
    onRowClick(null);
  };

  // بررسی صحت فرم: اگر Name خالی باشد، دیالوگ خطا نمایش داده می‌شود
  const validateForm = (): boolean => {
    if (!formData.Name || formData.Name.trim() === "") {
      setErrorConfirmOpen(true);
      return false;
    }
    return true;
  };

  // هنگام کلیک روی دکمه Save
  const handleInsert = () => {
    if (!validateForm()) return;
    setConfirmInsertOpen(true);
  };

  // هنگام کلیک روی دکمه Update
  const handleUpdate = () => {
    if (!selectedRow) return;
    if (!validateForm()) return;
    setConfirmUpdateOpen(true);
  };

  // دکمه Delete: نمایش دیالوگ تایید حذف
  const handleDeleteClick = () => {
    if (!selectedRow) return;
    setConfirmDeleteOpen(true);
  };

  // عملیات insert پس از تایید دیالوگ
  const confirmInsert = async () => {
    try {
      const newMenuTab: MenuTab = {
        ID: formData.ID!,
        Name: formData.Name!,
        Description: formData.Description || "",
        Order: formData.Order === "" ? 0 : (formData.Order as number),
        nMenuId: selectedMenuId!,
        IsVisible: true,
        ModifiedById: null,
        LastModified: null,
      };
      console.log("Inserting MenuTab:", newMenuTab);
      await AppServices.insertMenuTab(newMenuTab);
      await loadRowData();
      // اسکرول به انتهای جدول پس از بارگذاری مجدد
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
      }
      const newId = rowData.length > 0 ? Math.max(...rowData.map((r) => r.ID)) + 1 : 1;
      setFormData({
        ID: newId,
        Name: "",
        Description: "",
        Order: "",
      });
      setSelectedRow(null);
      onRowClick(null);
    } catch (error) {
      console.error("Error inserting MenuTab:", error);
    } finally {
      setConfirmInsertOpen(false);
    }
  };

  // عملیات update پس از تایید دیالوگ
  const confirmUpdate = async () => {
    try {
      const updatedMenuTab: MenuTab = {
        ID: formData.ID!,
        Name: formData.Name!,
        Description: formData.Description || "",
        Order: formData.Order === "" ? 0 : (formData.Order as number),
        nMenuId: selectedMenuId!,
        IsVisible: true,
        ModifiedById: null,
        LastModified: null,
      };
      console.log("Updating MenuTab:", updatedMenuTab);
      await AppServices.updateMenuTab(updatedMenuTab);
      alert("ویرایش با موفقیت انجام شد.");
      await loadRowData();
    } catch (error) {
      console.error("Error updating MenuTab:", error);
      alert("ویرایش با خطا مواجه شد.");
    } finally {
      setConfirmUpdateOpen(false);
    }
  };

  // عملیات delete پس از تایید دیالوگ
  const confirmDelete = async () => {
    try {
      await AppServices.deleteMenuTab(selectedRow!.ID);
      await loadRowData();
      setSelectedRow(null);
      onRowClick(null);
    } catch (error) {
      console.error("Error deleting MenuTab:", error);
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  // بستن دیالوگ خطا (برای Name خالی)
  const closeErrorConfirm = () => {
    setErrorConfirmOpen(false);
  };

  return (
    <div className="mb-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 transition-all duration-300">
      {/* هدر آکاردئون */}
      <div
        className="flex justify-between items-center p-4 bg-white border-b border-gray-300 rounded-t-lg cursor-pointer"
        onClick={toggleAccordion}
      >
        <span className="text-xl font-medium mt-5">Menu Tabs</span>
        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mt-5">
          {isOpen ? (
            <FiChevronUp className="text-gray-700" size={20} />
          ) : (
            <FiChevronDown className="text-gray-700" size={20} />
          )}
        </div>
      </div>

      {/* محتوای داخلی آکاردئون */}
      {isOpen && (
        <div className="p-4 bg-white rounded-b-lg">
          {/* بخش جستجو */}
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

          {/* بخش جدول با ارتفاع ثابت و اسکرول */}
          <div style={{ height: "300px", overflowY: "auto"  ,marginTop:'-15px'}} ref={tableContainerRef}>
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
              onEdit={handleUpdate}
              onDelete={handleDeleteClick}
              onDuplicate={() => {}}
              isLoading={isLoading}
              showSearch={false}
              domLayout="normal"
            />
          </div>

          {/* فرم و دکمه‌ها (همواره نمایش داده می‌شود) */}
          <div className="mt-4 p-4 border rounded bg-gray-50 shadow-inner">
            <div className="flex gap-4">
              <DynamicInput
                name="Name"
                type="text"
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                className="mt-2 flex-1"
              />
              <DynamicInput
                name="Description"
                type="text"
                value={formData.Description}
                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                className="mt-2 flex-1"
              />
            </div>
            <div className="mt-4">
              <DynamicInput
                name="Order"
                type="number"
                value={formData.Order}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    Order: val === "" ? "" : parseInt(val, 10),
                  });
                }}
                className="mt-2"
              />
            </div>
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
        </div>
      )}

      {/* DynamicConfirm برای عملیات Insert */}
      <DynamicConfirm
        isOpen={confirmInsertOpen}
        title="Insert Confirmation"
        message="Are you sure you want to save this new entry?"
        onConfirm={confirmInsert}
        onClose={() => setConfirmInsertOpen(false)}
        variant="add"
      />

      {/* DynamicConfirm برای عملیات Update */}
      <DynamicConfirm
        isOpen={confirmUpdateOpen}
        title="Update Confirmation"
        message="Are you sure you want to update this entry?"
        onConfirm={confirmUpdate}
        onClose={() => setConfirmUpdateOpen(false)}
        variant="edit"
      />

      {/* DynamicConfirm برای عملیات Delete */}
      <DynamicConfirm
        isOpen={confirmDeleteOpen}
        title="Delete Confirmation"
        message={`آیا از حذف MenuTab "${selectedRow?.Name}" مطمئن هستید؟`}
        onConfirm={confirmDelete}
        onClose={() => setConfirmDeleteOpen(false)}
        variant="delete"
      />

      {/* DynamicConfirm برای خطا (Name خالی) */}
      <DynamicConfirm
        isOpen={errorConfirmOpen}
        title="Error"
        message="Name cannot empty"
        onConfirm={closeErrorConfirm}
        onClose={closeErrorConfirm}
        variant="error"
        hideCancelButton={true}
      />
    </div>
  );
};

export default Accordion1;
