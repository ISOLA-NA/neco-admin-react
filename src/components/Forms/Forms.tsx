// src/components/FormsCommand1.tsx
import React, { useState, useEffect } from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import DynamicSelector from "../utilities/DynamicSelector";
import ListSelector from "../ListSelector/ListSelector";
import DynamicModal from "../utilities/DynamicModal";
import TableSelector from "../General/Configuration/TableSelector";
import HandlerUplodeExcellAccess from "../utilities/HandlerUplodeExcellAccess";
import DataTable from "../TableDynamic/DataTable";
import AddForm from "./AddForm"; // فرض بر این است که این کامپوننت وجود دارد
import { subTabDataMapping, SubForm } from "../Views/tab/tabData"; // وارد کردن داده‌ها

// یک چک‌باکس ساده
const CheckBox = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  return (
    <div className="flex items-center space-x-2 mb-6">
      <input
        type="checkbox"
        className="form-checkbox h-4 w-4 text-purple-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        id={label}
      />
      <label htmlFor={label} className="text-gray-800 text-sm">
        {label}
      </label>
    </div>
  );
};

interface FormsCommand1Props {
  selectedRow: any; // اطلاعات سطر انتخاب شده
}

// داده‌های نمونه برای دسته‌بندی‌ها
const aCategoryOptions = [
  { value: "1", label: "Category A1" },
  { value: "2", label: "Category A2" },
  { value: "3", label: "Category A3" },
];

const bCategoryOptions = [
  { value: "1", label: "Category B1" },
  { value: "2", label: "Category B2" },
  { value: "3", label: "Category B3" },
];

// داده‌های نمونه برای پروژه‌ها
const projectData = [
  { ID: "101", Name: "Project A" },
  { ID: "102", Name: "Project B" },
  { ID: "103", Name: "Project C" },
  // می‌توانید پروژه‌های بیشتری اضافه کنید
];

// تابع برای استخراج شناسه پروژه‌ها از رشته
const extractProjectIds = (projectsStr: string): string[] => {
  if (!projectsStr) return [];
  return projectsStr.split("|").filter(Boolean);
};

const FormsCommand1: React.FC<FormsCommand1Props> = ({ selectedRow }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Declare state for modal

  const [formData, setFormData] = useState<{
    ID: string | number;
    FormName: string;
    IsDoc: boolean;
    IsGlobal: boolean;
    ProjectsStr: string;
    EntityCateAName: string;
    EntityCateBName: string;
    Code: string;
  }>({
    ID: "",
    FormName: "",
    IsDoc: false,
    IsGlobal: false,
    ProjectsStr: "",
    EntityCateAName: "",
    EntityCateBName: "",
    Code: "",
  });

  const [subForms, setSubForms] = useState<SubForm[]>([]); // حالت برای ساب‌فرم‌ها

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        ID: selectedRow.ID || "",
        FormName: selectedRow.Name || "",
        IsDoc: selectedRow.IsDoc || false,
        IsGlobal: selectedRow.IsGlobal || false,
        ProjectsStr: selectedRow.ProjectsStr || "",
        EntityCateAName: selectedRow.EntityCateAName || "",
        EntityCateBName: selectedRow.EntityCateBName || "",
        Code: selectedRow.Code || "",
      });

      // دریافت ساب‌فرم‌ها بر اساس ID انتخاب شده
      const selectedID = selectedRow.ID;
      const fetchedSubForms =
        subTabDataMapping.Forms.subForms?.[selectedID] || [];
      setSubForms(fetchedSubForms);
    } else {
      setFormData({
        ID: "",
        FormName: "",
        IsDoc: false,
        IsGlobal: false,
        ProjectsStr: "",
        EntityCateAName: "",
        EntityCateBName: "",
        Code: "",
      });
      setSubForms([]); // خالی کردن ساب‌فرم‌ها
    }
  }, [selectedRow]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProjectSelectionChange = (selectedIds: (string | number)[]) => {
    const selectedIdsStr = selectedIds.map(String).join("|") + "|";
    handleChange("ProjectsStr", selectedIdsStr);
  };

  const handleGlobalChange = (val: boolean) => {
    handleChange("IsGlobal", val);
  };

  const handleACategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange("EntityCateAName", e.target.value);
  };

  const handleBCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange("EntityCateBName", e.target.value);
  };

  // مدیریت وضعیت مدال برای دسته‌بندی‌ها
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<"A" | "B" | null>(
    null
  );
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  const handleOpenModal = (selector: "A" | "B") => {
    setCurrentSelector(selector);
    setSelectedRowData(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentSelector(null);
    setSelectedRowData(null);
  };

  const handleRowClick = (row: any) => {
    setSelectedRowData(row);
  };

  const handleSelectButtonClick = () => {
    if (selectedRowData && currentSelector) {
      const field =
        currentSelector === "A" ? "EntityCateAName" : "EntityCateBName";
      handleChange(field, selectedRowData.label);
      handleCloseModal();
    }
  };

  const getRowData = (selector: "A" | "B" | null) => {
    if (selector === "A") {
      return aCategoryOptions.map((option) => ({
        value: option.value,
        label: option.label,
      }));
    } else if (selector === "B") {
      return bCategoryOptions.map((option) => ({
        value: option.value,
        label: option.label,
      }));
    }
    return [];
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false); // Close the modal
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true); // Open the modal
  };

  // داده‌های جزئیات مرتبط (اصلاح شده برای نمایش ساب‌فرم‌ها)
  const relatedDetailData = subForms.map((sub) => ({
    ID: sub.SubID,
    FormName: sub.Name,
    Description: sub.Description,
    Status: sub.Status,
    CreatedDate: sub.CreatedDate,
  }));

  // مدیریت آپلود فایل ورد و اکسل
  const [, setWordFile] = useState<File | null>(null);
  const [, setExcelFile] = useState<File | null>(null);

  const handleWordUpload = (file: File) => {
    setWordFile(file);
    console.log("Word file selected:", file);
  };

  const handleExcelUpload = (file: File) => {
    setExcelFile(file);
    console.log("Excel file selected:", file);
  };

  return (
    <div>
      <TwoColumnLayout>
        {/* فرم اصلی */}
        <TwoColumnLayout.Item span={1}>
          <DynamicInput
            name="Form Name"
            type="text"
            value={formData.FormName}
            placeholder="Enter form name"
            onChange={(e) => handleChange("FormName", e.target.value)}
            required={true}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicInput
            name="Code"
            type="text"
            value={formData.Code}
            placeholder="Enter code"
            onChange={(e) => handleChange("Code", e.target.value)}
            required={true}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSelector
            options={aCategoryOptions}
            selectedValue={formData.EntityCateAName}
            onChange={handleACategoryChange}
            label="Category A"
            showButton={true}
            onButtonClick={() => handleOpenModal("A")}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSelector
            options={bCategoryOptions}
            selectedValue={formData.EntityCateBName}
            onChange={handleBCategoryChange}
            label="Category B"
            showButton={true}
            onButtonClick={() => handleOpenModal("B")}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <CheckBox
            label="Is Document"
            checked={formData.IsDoc}
            onChange={(val) => handleChange("IsDoc", val)}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <CheckBox
            label="Is Global"
            checked={formData.IsGlobal}
            onChange={handleGlobalChange}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={2}>
          <ListSelector
            title="Related Projects"
            columnDefs={[{ field: "Name", headerName: "Project Name" }]}
            rowData={projectData}
            selectedIds={extractProjectIds(formData.ProjectsStr)}
            onSelectionChange={handleProjectSelectionChange}
            showSwitcher={true}
            isGlobal={formData.IsGlobal}
            onGlobalChange={handleGlobalChange}
            className="-mt-5"
            ModalContentComponent={TableSelector}
            modalContentProps={{
              columnDefs: [{ field: "Name", headerName: "Project Name" }],
              rowData: projectData,
              selectedRow: selectedRowData,
              onRowDoubleClick: () => {
                if (selectedRowData) {
                  const newSelection = [
                    ...extractProjectIds(formData.ProjectsStr),
                    selectedRowData.ID,
                  ];
                  handleProjectSelectionChange(newSelection);
                }
              },
              onRowClick: handleRowClick,
              onSelectButtonClick: () => {
                if (selectedRowData) {
                  const newSelection = [
                    ...extractProjectIds(formData.ProjectsStr),
                    selectedRowData.ID,
                  ];
                  handleProjectSelectionChange(newSelection);
                }
              },
              isSelectDisabled: !selectedRowData,
            }}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={2}>
          <HandlerUplodeExcellAccess
            onWordUpload={handleWordUpload}
            onExcelUpload={handleExcelUpload}
          />
        </TwoColumnLayout.Item>

        {/* بخش جزئیات با استفاده از DataTable */}
        <TwoColumnLayout.Item span={2}>
          <div className="-mt-12">
            <DataTable
              columnDefs={[
                {
                  headerName: "Sub ID",
                  field: "ID",
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: "Name",
                  field: "FormName",
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: "Description",
                  field: "Description",
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: "Status",
                  field: "Status",
                  sortable: true,
                  filter: true,
                },
                {
                  headerName: "Created Date",
                  field: "CreatedDate",
                  sortable: true,
                  filter: true,
                },
              ]}
              rowData={relatedDetailData}
              onRowDoubleClick={() => {
                /* اعمال دلخواه برای دوبل کلیک */
              }}
              setSelectedRowData={() => {
                /* مدیریت انتخاب ردیف اگر نیاز است */
              }}
              showDuplicateIcon={false}
              showEditIcon={true}
              showAddIcon={true} // فعال کردن دکمه Add
              showDeleteIcon={true}
              onAdd={handleAddClick} // اتصال به تابع باز کردن مودال
              onEdit={() => {
                /* تابع ویرایش */
                console.log("Edit clicked");
              }}
              onDelete={() => {
                /* تابع حذف */
                console.log("Delete clicked");
              }}
              onDuplicate={() => {
                /* تابع تکرار */
                console.log("Duplicate clicked");
              }}
              domLayout="autoHeight"
              isRowSelected={false} // می‌توانید این را بر اساس نیاز تغییر دهید
              showSearch={true} // فعال کردن جستجو در جزئیات
            />
          </div>
        </TwoColumnLayout.Item>
      </TwoColumnLayout>

      {/* مدال داینامیک برای انتخاب دسته‌بندی */}
      <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
        <TableSelector
          columnDefs={[{ headerName: "Name", field: "label" }]}
          rowData={getRowData(currentSelector)}
          selectedRow={selectedRowData}
          onRowDoubleClick={handleSelectButtonClick}
          onRowClick={handleRowClick}
          onSelectButtonClick={handleSelectButtonClick}
          isSelectDisabled={!selectedRowData}
        />
      </DynamicModal>

      {/* مودال داینامیک برای افزودن فرم جدید */}
      <DynamicModal isOpen={isAddModalOpen} onClose={handleAddModalClose}>
        <AddForm />
      </DynamicModal>
    </div>
  );
};

export default FormsCommand1;
