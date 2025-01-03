// src/components/Accordion3.tsx

import React, { useState, useMemo, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import DynamicInput from "../../../utilities/DynamicInput";
import { FaSearch } from "react-icons/fa";
import {
  FiCopy,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useSubTabDefinitions } from "../../../../context/SubTabDefinitionsContext";
import AppServices, { MenuItem } from "../../../../services/api.services"; // اطمینان حاصل کنید که مسیر صحیح است

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
  Description: string;
  Order: number;
  IsVisible?: boolean;
  LastModified?: string | null;
  ModifiedById?: string | null;
  // می‌توانید سایر فیلدهای مورد نیاز را اضافه کنید
}

const Accordion3: React.FC<Accordion3Props> = ({
  selectedMenuGroupId,
  onRowDoubleClick,
  isOpen,
  toggleAccordion,
}) => {
  const { subTabDefinitions, fetchDataForSubTab } = useSubTabDefinitions();
  const [selectedRow, setSelectedRow] = useState<RowData3 | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [rowData, setRowData] = useState<RowData3[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<RowData3>>({});

  // تعریف ستون‌ها و اضافه کردن ستون عملیات
  const columnDefs: ColDef<RowData3>[] = [
    ...(subTabDefinitions["MenuItem"]?.columnDefs || []),
    {
      headerName: "عملیات",
      field: "operations",
      sortable: false,
      filter: false,
      width: 150,
      cellRendererFramework: (params: any) => (
        <div className="flex space-x-2">
          <button
            className="text-yellow-600 hover:text-yellow-800 transition"
            onClick={() => handleDuplicate(params.data)}
            title="کپی"
          >
            <FiCopy size={20} />
          </button>
          <button
            className="text-blue-600 hover:text-blue-800 transition"
            onClick={() => handleEdit(params.data)}
            title="ویرایش"
          >
            <FiEdit size={20} />
          </button>
          <button
            className="text-red-600 hover:text-red-800 transition"
            onClick={() => handleDelete(params.data)}
            title="حذف"
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (isOpen && selectedMenuGroupId !== null) {
      setIsLoading(true);
      fetchDataForSubTab("MenuItem", { ID: selectedMenuGroupId }) // ارسال id
        .then((data: RowData3[]) => {
          // اطمینان حاصل کنید که ModifiedById به جای رشته خالی، null باشد
          const sanitizedData = data.map((item) => ({
            ...item,
            ModifiedById: item.ModifiedById === "" ? null : item.ModifiedById,
          }));
          setRowData(sanitizedData);
        })
        .catch((error: any) => {
          console.error("خطا در دریافت MenuItems:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setRowData([]);
      setSelectedRow(null);
      setIsEditing(false);
      setIsAdding(false);
      setFormData({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedMenuGroupId]);

  const filteredRowData = useMemo(() => {
    if (!searchText) return rowData;
    return rowData.filter(
      (row) =>
        row.Name.toLowerCase().includes(searchText.toLowerCase()) ||
        row.Command.toLowerCase().includes(searchText.toLowerCase()) ||
        row.Description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, rowData]);

  const handleRowClick = (event: any) => {
    const row = event.data as RowData3;
    // اطمینان از اینکه ModifiedById خالی نیست
    const sanitizedRow = {
      ...row,
      ModifiedById: row.ModifiedById === "" ? null : row.ModifiedById,
    };
    setSelectedRow(sanitizedRow);
    setFormData(sanitizedRow);
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleRowDoubleClickEvent = (event: any) => {
    const row = event.data as RowData3;
    onRowDoubleClick(row.ID);
  };

  // عملیات
  const handleDuplicate = (row: RowData3) => {
    const duplicatedRow: RowData3 = {
      ...row,
      ID: 0, // فرض بر این است که ID=0 نشان‌دهنده یک ردیف جدید است و Backend ID جدید اختصاص می‌دهد
      Name: `${row.Name} (کپی)`,
      ModifiedById: null, // اطمینان از اینکه مقدار null است
    };
    setFormData(duplicatedRow);
    setIsAdding(true);
    setIsEditing(false);
    setSelectedRow(null);
  };

  const handleEdit = (row: RowData3) => {
    setSelectedRow(row);
    setFormData(row);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleDelete = async (row: RowData3) => {
    const confirmDelete = window.confirm(
      `آیا از حذف MenuItem "${row.Name}" مطمئن هستید؟`
    );
    if (!confirmDelete) return;

    try {
      await AppServices.deleteMenuItem(row.ID);
      setRowData((prev) => prev.filter((r) => r.ID !== row.ID));
      setSelectedRow(null);
      setFormData({});
      alert("حذف با موفقیت انجام شد.");
    } catch (error: any) {
      console.error("خطا در حذف MenuItem:", error);
      alert("حذف با خطا مواجه شد.");
    }
  };

  const handleAddNew = () => {
    if (selectedMenuGroupId === null) {
      alert("لطفاً یک Menu Group را انتخاب کنید.");
      return;
    }
    const newRow: RowData3 = {
      ID: 0, // Backend باید ID واقعی را اختصاص دهد
      Name: "",
      Command: "",
      Description: "",
      Order: 0,
      IsVisible: true,
      LastModified: null,
      ModifiedById: null,
    };
    setSelectedRow(null);
    setFormData(newRow);
    setIsAdding(true);
    setIsEditing(false);
  };

  const handleInputChange = (
    name: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleFormSubmit با formData:", formData);
    if (!formData.Name || !formData.Command) {
      alert("لطفاً نام و دستور را وارد کنید.");
      return;
    }

    // اطمینان از اینکه ModifiedById خالی نیست
    const sanitizedFormData = {
      ...formData,
      ModifiedById:
        formData.ModifiedById && formData.ModifiedById.trim() !== ""
          ? formData.ModifiedById
          : null,
    };

    if (isAdding) {
      // افزودن MenuItem جدید
      try {
        const newMenuItem: MenuItem = {
          ID: 0, // Backend باید ID واقعی را اختصاص دهد
          Name: sanitizedFormData.Name!,
          Command: sanitizedFormData.Command!,
          Description: sanitizedFormData.Description || "",
          Order: sanitizedFormData.Order || 0,
          nMenuGroupId: selectedMenuGroupId!,
          IsVisible: sanitizedFormData.IsVisible ?? true,
          LastModified: null,
          ModifiedById: sanitizedFormData.ModifiedById,
          IconImageId: null,
          CommandWeb: "",
          CommandMobile: "",
          HelpText: "",
          KeyTip: "",
          Size: 0,
          // سایر فیلدهای مورد نیاز را اضافه کنید
        };
        console.log("درج MenuItem جدید:", newMenuItem);
        const result = await AppServices.insertMenuItem(newMenuItem);
        setRowData((prev) => [result, ...prev]);
        setIsAdding(false);
        setFormData({});
        alert("افزودن با موفقیت انجام شد.");
      } catch (error: any) {
        console.error("خطا در افزودن MenuItem:", error);
        alert("افزودن با خطا مواجه شد.");
      }
    } else if (isEditing) {
      // ویرایش MenuItem موجود
      if (sanitizedFormData.ID === undefined || sanitizedFormData.ID === null) {
        alert("شناسه MenuItem وجود ندارد.");
        return;
      }
      try {
        const updatedMenuItem: MenuItem = {
          ID: sanitizedFormData.ID,
          Name: sanitizedFormData.Name!,
          Command: sanitizedFormData.Command!,
          Description: sanitizedFormData.Description || "",
          Order: sanitizedFormData.Order || 0,
          nMenuGroupId: selectedMenuGroupId!,
          IsVisible: sanitizedFormData.IsVisible ?? true,
          LastModified: sanitizedFormData.LastModified || null,
          ModifiedById: sanitizedFormData.ModifiedById,
          IconImageId: null,
          CommandWeb: "",
          CommandMobile: "",
          HelpText: "",
          KeyTip: "",
          Size: 0,
          // سایر فیلدهای مورد نیاز را اضافه کنید
        };
        console.log("به‌روزرسانی MenuItem:", updatedMenuItem);
        const result = await AppServices.updateMenuItem(updatedMenuItem);
        setRowData((prev) =>
          prev.map((row) => (row.ID === result.ID ? result : row))
        );
        setIsEditing(false);
        setFormData({});
        alert("ویرایش با موفقیت انجام شد.");
      } catch (error: any) {
        console.error("خطا در ویرایش MenuItem:", error);
        alert("ویرایش با خطا مواجه شد.");
      }
    }
  };

  const handleFormCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setFormData({});
    setSelectedRow(null);
  };

  return (
    <div
      className={`collapse bg-base-200 mb-4 ${isOpen ? "collapse-open" : ""}`}
    >
      <div
        className="collapse-title text-xl font-medium cursor-pointer flex justify-between items-center"
        onClick={toggleAccordion}
      >
        <span>Menu Items</span>
        {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </div>
      <div className="collapse-content">
        {isOpen && selectedMenuGroupId !== null ? (
          <>
            {/* نوار جستجو و دکمه‌های عملیات */}
            <div className="flex items-center justify-between mb-4">
              <div className="relative max-w-sm">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="جستجو..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="search-input w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  style={{ fontFamily: "inherit" }}
                />
              </div>

              {/* دکمه‌های Add، Edit، Delete و Duplicate در یک خط */}
              <div className="flex items-center space-x-4">
                <button
                  className="text-green-600 hover:text-green-800 transition"
                  title="افزودن"
                  onClick={handleAddNew}
                >
                  <FiPlus size={25} />
                </button>
                <button
                  className="text-yellow-600 hover:text-yellow-800 transition"
                  title="کپی"
                  onClick={() => {
                    if (selectedRow) {
                      handleDuplicate(selectedRow);
                    } else {
                      alert("لطفاً یک ردیف را برای کپی انتخاب کنید.");
                    }
                  }}
                  disabled={!selectedRow}
                >
                  <FiCopy size={25} />
                </button>
                <button
                  className="text-blue-600 hover:text-blue-800 transition"
                  title="ویرایش"
                  onClick={() => {
                    if (selectedRow) {
                      handleEdit(selectedRow);
                    } else {
                      alert("لطفاً یک ردیف را برای ویرایش انتخاب کنید.");
                    }
                  }}
                  disabled={!selectedRow}
                >
                  <FiEdit size={25} />
                </button>
                <button
                  className="text-red-600 hover:text-red-800 transition"
                  title="حذف"
                  onClick={() => {
                    if (selectedRow) {
                      handleDelete(selectedRow);
                    } else {
                      alert("لطفاً یک ردیف را برای حذف انتخاب کنید.");
                    }
                  }}
                  disabled={!selectedRow}
                >
                  <FiTrash2 size={25} />
                </button>
              </div>
            </div>

            {/* جدول داده‌ها */}
            <div
              className="ag-theme-quartz"
              style={{ height: "300px", width: "100%" }}
            >
              <AgGridReact<RowData3>
                columnDefs={columnDefs}
                rowData={filteredRowData}
                pagination={true}
                paginationPageSize={5}
                onRowClicked={handleRowClick}
                onRowDoubleClicked={handleRowDoubleClickEvent}
                rowSelection="single"
                animateRows={true}
                overlayLoadingTemplate='<span class="ag-overlay-loading-center">در حال بارگذاری...</span>'
                loadingOverlayComponentParams={{
                  loadingMessage: "در حال بارگذاری...",
                }}
              />
            </div>

            {/* فرم ویرایش یا افزودن */}
            {(isEditing || isAdding) && formData && (
              <form
                onSubmit={handleFormSubmit}
                className="mt-4 p-4 border rounded bg-white"
              >
                <h3 className="text-lg font-semibold mb-4">
                  {isAdding
                    ? "افزودن MenuItem جدید"
                    : isEditing
                    ? "ویرایش MenuItem"
                    : ""}
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <DynamicInput
                    name="Name"
                    type="text"
                    value={formData.Name || ""}
                    placeholder="نام"
                    onChange={(e) => handleInputChange("Name", e.target.value)}
                    className="mt-2"
                  />
                  <DynamicInput
                    name="Command"
                    type="text"
                    value={formData.Command || ""}
                    placeholder="Command"
                    onChange={(e) =>
                      handleInputChange("Command", e.target.value)
                    }
                    className="mt-2"
                  />
                  <DynamicInput
                    name="Description"
                    type="text"
                    value={formData.Description || ""}
                    placeholder="توضیحات"
                    onChange={(e) =>
                      handleInputChange("Description", e.target.value)
                    }
                    className="mt-2"
                  />
                  <DynamicInput
                    name="Order"
                    type="number"
                    value={formData.Order || 0}
                    placeholder="ترتیب"
                    onChange={(e) =>
                      handleInputChange(
                        "Order",
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    className="mt-2"
                  />
                  {/* اگر فیلدهای دیگری نیاز دارید می‌توانید آنها را اضافه کنید */}
                </div>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                    onClick={handleFormCancel}
                  >
                    لغو
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    {isAdding ? "افزودن" : "ذخیره تغییرات"}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          isOpen && (
            <p className="text-gray-500">
              لطفاً یک Menu Group در Accordion2 انتخاب کنید تا Menu Items نمایش
              داده شوند.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default Accordion3;
