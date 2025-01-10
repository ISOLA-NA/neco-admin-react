// src/components/FormsCommand1.tsx

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import DynamicSelector from "../utilities/DynamicSelector";
import ListSelector from "../ListSelector/ListSelector";
import DynamicModal from "../utilities/DynamicModal";
import TableSelector from "../General/Configuration/TableSelector";
import HandlerUplodeExcellAccess from "../utilities/HandlerUplodeExcellAccess";
import DataTable from "../TableDynamic/DataTable";
import AddColumnForm from "./AddForm";
import { subTabDataMapping, SubForm } from "../TabHandler/tab/tabData";
import { useAddEditDelete } from "../../context/AddEditDeleteContext"; // وارد کردن کانتکست AddEditDelete
import { useApi } from "../../context/ApiContext"; // وارد کردن کانتکست ApiContext

// تعریف Interface برای Checkbox
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
  selectedRow: any; // اطلاعات ردیف انتخاب شده
}

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

// تابع استخراج شناسه پروژه‌ها از رشته
const extractProjectIds = (projectsStr: string): string[] => {
  if (!projectsStr) return [];
  return projectsStr.split("|").filter(Boolean);
};

const FormsCommand1: React.FC<FormsCommand1Props> = forwardRef(
  ({ selectedRow }, ref) => {
    const { handleSaveForm } = useAddEditDelete(); // دسترسی به متد handleSaveForm از کانتکست AddEditDelete
    const api = useApi(); // دسترسی به کانتکست ApiContext

    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // وضعیت باز بودن مودال افزودن

    const [formData, setFormData] = useState<{
      ID: string | number;
      Name: string;
      Code: string;
      IsDoc: boolean;
      IsGlobal: boolean;
      IsVisible: boolean;
      LastModified: string;
      ModifiedById: string | null;
      ProjectsStr: string;
      TemplateDocID: string | null;
      TemplateExcelID: string | null;
      nEntityCateAID: number | null;
      nEntityCateBID: number | null;
    }>({
      ID: "",
      Name: "",
      Code: "",
      IsDoc: false,
      IsGlobal: false,
      IsVisible: true, // فرض بر این است که فرم جدید به طور پیش‌فرض قابل مشاهده است
      LastModified: new Date().toISOString(),
      ModifiedById: null,
      ProjectsStr: "",
      TemplateDocID: null,
      TemplateExcelID: null,
      nEntityCateAID: null,
      nEntityCateBID: null,
    });

    const [subForms, setSubForms] = useState<SubForm[]>([]); // وضعیت زیرفرم‌ها

    const [projectData, setProjectData] = useState<
      { ID: string; Name: string }[]
    >([]);

    // واکشی پروژه‌ها هنگام بارگذاری کامپوننت
    useEffect(() => {
      const fetchProjects = async () => {
        try {
          const projects = await api.getAllProject(); // فراخوانی متد getAllProject از ApiContext
          // تبدیل داده‌ها به شکل مورد نیاز ListSelector (فقط ID و Name)
          const mappedProjects = projects.map((project) => ({
            ID: project.ID,
            Name: project.ProjectName, // فرض بر این است که ProjectName در داده‌های API وجود دارد
          }));
          setProjectData(mappedProjects);
        } catch (error) {
          console.error("Error fetching projects:", error);
          // نمایش پیغام خطا به کاربر (در صورت نیاز)
        }
      };
      fetchProjects();
    }, [api]);

    // تنظیم داده‌های فرم بر اساس ردیف انتخاب شده
    useEffect(() => {
      if (selectedRow) {
        setFormData({
          ID: selectedRow.ID || "",
          Name: selectedRow.Name || "",
          Code: selectedRow.Code || "",
          IsDoc: selectedRow.IsDoc || false,
          IsGlobal: selectedRow.IsGlobal || false,
          IsVisible: selectedRow.IsVisible || true,
          LastModified: selectedRow.LastModified || new Date().toISOString(),
          ModifiedById: selectedRow.ModifiedById || null,
          ProjectsStr: selectedRow.ProjectsStr || "",
          TemplateDocID: selectedRow.TemplateDocID || null,
          TemplateExcelID: selectedRow.TemplateExcelID || null,
          nEntityCateAID: selectedRow.nEntityCateAID || null,
          nEntityCateBID: selectedRow.nEntityCateBID || null,
        });

        // واکشی زیرفرم‌ها بر اساس ID انتخاب شده
        const selectedID = selectedRow.ID;
        const fetchedSubForms =
          subTabDataMapping.Forms.subForms?.[selectedID] || [];
        setSubForms(fetchedSubForms);
      } else {
        setFormData({
          ID: "",
          Name: "",
          Code: "",
          IsDoc: false,
          IsGlobal: false,
          IsVisible: true,
          LastModified: new Date().toISOString(),
          ModifiedById: null,
          ProjectsStr: "",
          TemplateDocID: null,
          TemplateExcelID: null,
          nEntityCateAID: null,
          nEntityCateBID: null,
        });
        setSubForms([]); // پاکسازی زیرفرم‌ها
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
      const selectedOption = aCategoryOptions.find(
        (option) => option.label === e.target.value
      );
      handleChange(
        "nEntityCateAID",
        selectedOption ? parseInt(selectedOption.value) : null
      );
    };

    const handleBCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOption = bCategoryOptions.find(
        (option) => option.label === e.target.value
      );
      handleChange(
        "nEntityCateBID",
        selectedOption ? parseInt(selectedOption.value) : null
      );
    };

    // وضعیت مودال انتخاب دسته‌بندی
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
          currentSelector === "A" ? "nEntityCateAID" : "nEntityCateBID";
        handleChange(field, selectedRowData.value); // فرض بر این است که `value` شامل ID است
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
      setIsAddModalOpen(false);
    };

    const handleAddClick = () => {
      setIsAddModalOpen(true);
    };

    // داده‌های زیرجزئیات برای DataTable
    const relatedDetailData = subForms.map((sub) => ({
      ID: sub.SubID,
      FormName: sub.Name,
      Description: sub.Description,
      Status: sub.Status,
      CreatedDate: sub.CreatedDate,
    }));

    // مدیریت آپلود فایل‌های Word و Excel
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

    // تعریف متد save که توسط FormsHandle فراخوانی می‌شود
    useImperativeHandle(ref, () => ({
      save: async () => {
        try {
          console.log("Form Data to Save:", formData); // لاگ داده‌های فرم
          await handleSaveForm(formData); // فراخوانی متد handleSaveForm از کانتکست AddEditDelete
          alert("Form saved successfully!");
        } catch (error) {
          console.error("Error saving form:", error);
          alert("Failed to save form.");
        }
      },
      // می‌توانید متدهای دیگر را نیز اضافه کنید
    }));

    return (
      <div>
        <TwoColumnLayout>
          {/* فرم اصلی */}
          <TwoColumnLayout.Item span={1}>
            <DynamicInput
              name="Name"
              type="text"
              value={formData.Name}
              placeholder="Enter form name"
              onChange={(e) => handleChange("Name", e.target.value)}
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
              selectedValue={
                aCategoryOptions.find(
                  (option) => option.value === String(formData.nEntityCateAID)
                )?.label || ""
              }
              onChange={handleACategoryChange}
              label="Category A"
              showButton={true}
              onButtonClick={() => handleOpenModal("A")}
            />
          </TwoColumnLayout.Item>

          <TwoColumnLayout.Item span={1}>
            <DynamicSelector
              options={bCategoryOptions}
              selectedValue={
                bCategoryOptions.find(
                  (option) => option.value === String(formData.nEntityCateBID)
                )?.label || ""
              }
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
                onRowDoubleClick: handleSelectButtonClick,
                onRowClick: handleRowClick,
                onSelectButtonClick: handleSelectButtonClick,
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
            <div className="-mt-4">
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
                  /* عمل دلخواه برای دوبل کلیک */
                }}
                setSelectedRowData={() => {
                  /* مدیریت انتخاب ردیف در صورت نیاز */
                }}
                showDuplicateIcon={false}
                showEditIcon={true}
                showAddIcon={true} // فعال‌سازی دکمه افزودن
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
                showSearch={true} // فعال‌سازی جستجو در جزئیات
              />
            </div>
          </TwoColumnLayout.Item>
        </TwoColumnLayout>

        {/* مودال پویا برای انتخاب دسته‌بندی */}
        <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
          <TableSelector
            columnDefs={[{ headerName: "Name", field: "Name" }]} // تغییر فیلد به "Name"
            rowData={getRowData(currentSelector)}
            selectedRow={selectedRowData}
            onRowDoubleClick={handleSelectButtonClick}
            onRowClick={handleRowClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelectDisabled={!selectedRowData}
          />
        </DynamicModal>

        {/* مودال پویا برای افزودن ستون جدید */}
        <DynamicModal isOpen={isAddModalOpen} onClose={handleAddModalClose}>
          <AddColumnForm onClose={handleAddModalClose} />
        </DynamicModal>
      </div>
    );
  }
);

export default FormsCommand1;
