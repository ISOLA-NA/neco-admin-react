// src/components/Accordion2.tsx

import React, { useState, useMemo, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import DynamicInput from "../../../utilities/DynamicInput";
import { FaSearch } from "react-icons/fa";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useSubTabDefinitions } from "../../../../context/SubTabDefinitionsContext";
import AppServices, { MenuGroup } from "../../../../services/api.services"; // اطمینان حاصل کنید که مسیر صحیح است

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
  const [selectedRow, setSelectedRow] = useState<RowData2 | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [rowData, setRowData] = useState<RowData2[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<RowData2>>({});

  // تعریف ستون‌ها و اضافه کردن ستون عملیات
  const columnDefs: ColDef<RowData2>[] = [
    ...(subTabDefinitions["MenuGroup"]?.columnDefs || []),
    {
      headerName: "عملیات",
      field: "operations",
      sortable: false,
      filter: false,
      width: 100,
      cellRendererFramework: (params: any) => (
        <div className="flex space-x-2">
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
    if (isOpen && selectedMenuTabId !== null) {
      setIsLoading(true);
      // ارسال پارامتر صحیح با نام ID
      fetchDataForSubTab("MenuGroup", { ID: selectedMenuTabId })
        .then((data: RowData2[]) => {
          setRowData(data);
        })
        .catch((error: any) => {
          console.error("Error fetching MenuGroups:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setRowData([]);
      setSelectedRow(null);
      onRowClick(null);
      setIsEditing(false);
      setIsAdding(false);
      setFormData({});
    }
  }, [
    isOpen,
    selectedMenuTabId,
    fetchDataForSubTab,
    subTabDefinitions,
    onRowClick,
  ]);

  const filteredRowData = useMemo(() => {
    if (!searchText) return rowData;
    return rowData.filter((row) =>
      row.Name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, rowData]);

  const handleRowClick = (event: any) => {
    const row = event.data as RowData2;
    setSelectedRow(row);
    onRowClick(row);
    setFormData(row);
  };

  const handleRowDoubleClickEvent = () => {
    if (selectedRow) {
      onRowDoubleClick(selectedRow.ID);
    }
  };

  const handleEdit = (row: RowData2) => {
    setSelectedRow(row);
    setFormData(row);
    setIsEditing(true);
    setIsAdding(false);
    onRowClick(row);
  };

  const handleDelete = async (row: RowData2) => {
    const confirmDelete = window.confirm(
      `آیا از حذف MenuGroup "${row.Name}" مطمئن هستید؟`
    );
    if (!confirmDelete) return;

    try {
      await AppServices.deleteMenuGroup(row.ID);
      setRowData((prev) => prev.filter((r) => r.ID !== row.ID));
      setSelectedRow(null);
      onRowClick(null);
      alert("حذف موفقیت‌آمیز بود.");
    } catch (error: any) {
      console.error("Error deleting MenuGroup:", error);
      alert("حذف با خطا مواجه شد.");
    }
  };

  const handleAddNew = () => {
    if (selectedMenuTabId === null) {
      alert("لطفاً یک Menu Tab را انتخاب کنید.");
      return;
    }
    const newRow: RowData2 = {
      ID: 0, // فرض بر این است که ID=0 نشان‌دهنده یک ردیف جدید است
      Name: "",
      Description: "",
      Order: 0,
      nMenuTabId: selectedMenuTabId,
      IsVisible: true,
      LastModified: null,
      ModifiedById: null,
    };
    setSelectedRow(null);
    setFormData(newRow);
    setIsAdding(true);
    setIsEditing(false);
    onRowClick(null);
  };

  const handleInputChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleFormSubmit called with formData:", formData);
    if (!formData.Name) {
      alert("لطفاً نام را وارد کنید.");
      return;
    }

    if (isAdding) {
      // افزودن MenuGroup جدید
      try {
        const newMenuGroup: MenuGroup = {
          ID: 0, // Backend باید ID واقعی را اختصاص دهد
          Name: formData.Name,
          Description: formData.Description || "",
          Order: formData.Order || 0,
          nMenuTabId: formData.nMenuTabId || selectedMenuTabId!,
          IsVisible: formData.IsVisible ?? true,
          ModifiedById: null, // جایگزین با شناسه کاربر واقعی
          LastModified: null,
        };
        console.log("Inserting MenuGroup:", newMenuGroup);
        const result = await AppServices.insertMenuGroup(newMenuGroup);
        setRowData((prev) => [...prev, result]);
        setIsAdding(false);
        setFormData({});
        alert("اضافه کردن با موفقیت انجام شد.");
      } catch (error: any) {
        console.error("Error inserting MenuGroup:", error);
        alert("اضافه کردن با خطا مواجه شد.");
      }
    } else if (isEditing) {
      // ویرایش MenuGroup موجود
      if (!formData.ID) {
        alert("شناسه MenuGroup وجود ندارد.");
        return;
      }
      try {
        const updatedMenuGroup: MenuGroup = {
          ID: formData.ID,
          Name: formData.Name,
          Description: formData.Description || "",
          Order: formData.Order || 0,
          nMenuTabId: formData.nMenuTabId || selectedMenuTabId!,
          IsVisible: formData.IsVisible ?? true,
          ModifiedById: null, // جایگزین با شناسه کاربر واقعی
          LastModified: null,
        };
        console.log("Updating MenuGroup:", updatedMenuGroup);
        const result = await AppServices.updateMenuGroup(updatedMenuGroup);
        setRowData((prev) =>
          prev.map((row) => (row.ID === result.ID ? result : row))
        );
        setIsEditing(false);
        setFormData({});
        alert("ویرایش با موفقیت انجام شد.");
      } catch (error: any) {
        console.error("Error updating MenuGroup:", error);
        alert("ویرایش با خطا مواجه شد.");
      }
    }
  };

  const handleFormCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setFormData({});
    setSelectedRow(null);
    onRowClick(null);
  };

  return (
    <div
      className={`mb-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 transition-all duration-300`}
    >
      <div
        className={`flex justify-between items-center p-4 bg-white border-b border-gray-300 rounded-t-lg cursor-pointer`}
        onClick={toggleAccordion}
      >
        <span className="text-xl font-medium">Menu Groups</span>
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
          {selectedMenuTabId !== null ? (
            <>
              {/* نوار جستجو و دکمه‌های عملیات */}
              <div className="flex items-center justify-between mb-4 bg-red-100 p-2 rounded-md">
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

                {/* دکمه‌های Add، Edit و Delete در یک خط */}
                <div className="flex items-center space-x-4">
                  <button
                    className="text-green-600 hover:text-green-800 transition"
                    title="افزودن"
                    onClick={handleAddNew}
                  >
                    <FiPlus size={25} />
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
                className="ag-theme-quartz rounded-md border overflow-hidden -mt-5"
                style={{ height: "300px", width: "100%" }}
              >
                <AgGridReact<RowData2>
                  columnDefs={columnDefs}
                  rowData={filteredRowData}
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
                  className="mt-4 p-4 border rounded bg-gray-50 shadow-inner"
                >
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
                  </div>
                  <div className="flex justify-center space-x-4 mt-12">
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
            <p className="text-gray-500">
              لطفاً یک Menu Tab در Accordion1 انتخاب کنید تا Menu Groups نمایش داده شوند.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Accordion2;
