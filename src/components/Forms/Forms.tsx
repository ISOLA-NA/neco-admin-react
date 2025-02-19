// src/components/FormsCommand1.tsx
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle
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
import { useAddEditDelete } from "../../context/AddEditDeleteContext";
import { useApi } from "../../context/ApiContext";
import { EntityField } from "../../services/api.services";
import { showAlert } from "../utilities/Alert/DynamicAlert";
import ColumnViewModal from "./ColumnViewModal";

// تعریف کامپوننت CheckBox
const CheckBox: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
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

interface FormsCommand1Props {
  selectedRow: any; // اطلاعات ردیف انتخاب شده (مثلاً فرم اصلی یا نوع فرم)
}

const aCategoryOptions = [
  { value: "1", label: "Category A1" },
  { value: "2", label: "Category A2" },
  { value: "3", label: "Category A3" }
];

const bCategoryOptions = [
  { value: "1", label: "Category B1" },
  { value: "2", label: "Category B2" },
  { value: "3", label: "Category B3" }
];

// تابع استخراج شناسه پروژه‌ها از رشته
const extractProjectIds = (projectsStr: string): string[] => {
  if (!projectsStr) return [];
  return projectsStr.split("|").filter(Boolean);
};

const FormsCommand1 = forwardRef(({ selectedRow }: FormsCommand1Props, ref) => {
  const { handleSaveForm } = useAddEditDelete();
  const api = useApi();

  // state مربوط به فرم اصلی
  const [formData, setFormData] = useState({
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
    nEntityCateBID: null
  });

  // state زیرفرم‌ها
  const [subForms, setSubForms] = useState<SubForm[]>([]);
  // state مربوط به پروژه‌ها برای ListSelector
  const [projectData, setProjectData] = useState<
    { ID: string; Name: string }[]
  >([]);
  // state داده‌های EntityField دریافتی از API جدید
  const [entityFields, setEntityFields] = useState<EntityField[]>([]);
  // state داده ستون انتخاب شده جهت ویرایش در مودال AddColumnForm
  const [editingData, setEditingData] = useState<any>(null);
  // state مربوط به مودال انتخاب دسته‌بندی
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<"A" | "B" | null>(null);
  // state مربوط به ردیف انتخاب شده از جدول (برای استفاده در مودال انتخاب دسته‌بندی یا سایر موارد)
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  // state مربوط به مودال افزودن/ویرایش ستون
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // state مربوط به مودال نمایش اطلاعات (View)
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // state مربوط به فایل‌های آپلود شده
  const [, setWordFile] = useState<File | null>(null);
  const [, setExcelFile] = useState<File | null>(null);

  // واکشی پروژه‌ها
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await api.getAllProject();
        const mappedProjects = projects.map((project: any) => ({
          ID: project.ID,
          Name: project.ProjectName
        }));
        setProjectData(mappedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, [api]);

  // واکشی داده‌های EntityField بر اساس selectedRow.ID
  const refreshEntityFields = async () => {
    try {
      if (selectedRow && selectedRow.ID) {
        const fields = await api.getEntityFieldByEntityTypeId(selectedRow.ID);
        setEntityFields(fields);
      } else {
        setEntityFields([]);
      }
    } catch (error) {
      console.error("Error fetching entity fields:", error);
    }
  };

  useEffect(() => {
    refreshEntityFields();
  }, [api, selectedRow]);

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
        nEntityCateBID: selectedRow.nEntityCateBID || null
      });
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
        nEntityCateBID: null
      });
      setSubForms([]);
    }
  }, [selectedRow]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      handleChange(field, selectedRowData.value);
      handleCloseModal();
    }
  };

  // حالت افزودن ستون جدید (Add)
  const handleAddClick = () => {
    setEditingData(null);
    setIsAddModalOpen(true);
  };

  // حالت ویرایش ستون (Edit)
  const handleEditClick = (rowData: any) => {
    setEditingData(rowData);
    setIsAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    setEditingData(null);
  };

  const handleWordUpload = (file: File) => {
    setWordFile(file);
    console.log("Word file selected:", file);
  };

  const handleExcelUpload = (file: File) => {
    setExcelFile(file);
    console.log("Excel file selected:", file);
  };

  // آماده‌سازی داده‌های EntityField جهت نمایش در DataTable
  const entityFieldData = entityFields.map((field) => ({
    ...field, // تمام خصوصیات اصلی
    display_IsShowGrid: field.IsShowGrid ? "Yes" : "No",
    display_IsEditableInWF: field.IsEditableInWF ? "Yes" : "No"
  }));

  // ارائه متد save به صورت imperative (برای فراخوانی از خارج از کامپوننت)
  useImperativeHandle(ref, () => ({
    save: async () => {
      try {
        console.log("Form Data to Save:", formData);
        await handleSaveForm(formData);
        showAlert("success", undefined, "Success", "Form saved successfully!");
      } catch (error) {
        console.error("Error saving form:", error);
        showAlert("error", undefined, "Error", "Failed to save form.");
      }
    }
  }));

  return (
    <div>
      <TwoColumnLayout>
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
        <TwoColumnLayout.Item span={1}>
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
              isSelectDisabled: !selectedRowData
            }}
          />
        </TwoColumnLayout.Item>
        <TwoColumnLayout.Item span={2}>
          <HandlerUplodeExcellAccess
            onWordUpload={handleWordUpload}
            onExcelUpload={handleExcelUpload}
          />
        </TwoColumnLayout.Item>
        <TwoColumnLayout.Item span={2}>
          <div className="-mt-4">
            <DataTable
              columnDefs={[
                { headerName: "ID", field: "ID", sortable: true, filter: true },
                {
                  headerName: "Display Name",
                  field: "DisplayName",
                  sortable: true,
                  filter: true
                },
                {
                  headerName: "Column Type",
                  field: "ColumnType",
                  sortable: true,
                  filter: true
                },
                {
                  headerName: "Show Grid",
                  field: "display_IsShowGrid",
                  sortable: true,
                  filter: true
                },
                {
                  headerName: "Editable in WF",
                  field: "display_IsEditableInWF",
                  sortable: true,
                  filter: true
                },
                {
                  headerName: "Last Modified",
                  field: "LastModified",
                  sortable: true,
                  filter: true
                }
              ]}
              rowData={entityFieldData}
              onEdit={() => {
                if (selectedRowData) {
                  handleEditClick(selectedRowData);
                } else {
                  console.warn("هیچ ردیفی انتخاب نشده است");
                }
              }}
              // دکمه View همیشه فعال است؛ با کلیک روی آن مودال باز می‌شود
              showViewIcon={true}
              onView={() => {
                setViewModalOpen(true);
              }}
              setSelectedRowData={setSelectedRowData}
              showDuplicateIcon={false}
              showEditIcon={true}
              showAddIcon={true}
              showDeleteIcon={true}
              onAdd={handleAddClick}
              onDelete={async () => {
                if (!selectedRowData) {
                  showAlert(
                    "error",
                    undefined,
                    "Error",
                    "No row selected for deletion"
                  );
                  return;
                }
                try {
                  await api.deleteEntityField(selectedRowData.ID);
                  showAlert(
                    "success",
                    undefined,
                    "Success",
                    "Deleted successfully"
                  );
                  setSelectedRowData(null);
                  refreshEntityFields();
                } catch (error) {
                  console.error("Error deleting entity field: ", error);
                  showAlert(
                    "error",
                    undefined,
                    "Error",
                    "Something wrong occurred"
                  );
                }
              }}
              onDuplicate={() => {
                console.log("Duplicate clicked for entity field");
              }}
              domLayout="autoHeight"
              showSearch={true}
              onRowDoubleClick={function (data: any): void {
                throw new Error("Function not implemented.");
              }}
            />
          </div>
        </TwoColumnLayout.Item>
      </TwoColumnLayout>

      {/* مودال انتخاب دسته‌بندی */}
      <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
        <TableSelector
          columnDefs={[{ headerName: "Name", field: "Name" }]}
          rowData={
            currentSelector === "A"
              ? aCategoryOptions.map((option) => ({
                  value: option.value,
                  label: option.label
                }))
              : currentSelector === "B"
              ? bCategoryOptions.map((option) => ({
                  value: option.value,
                  label: option.label
                }))
              : []
          }
          selectedRow={selectedRowData}
          onRowDoubleClick={handleSelectButtonClick}
          onRowClick={handleRowClick}
          onSelectButtonClick={handleSelectButtonClick}
          isSelectDisabled={!selectedRowData}
        />
      </DynamicModal>

      {/* مودال افزودن/ویرایش ستون */}
      <DynamicModal isOpen={isAddModalOpen} onClose={handleAddModalClose}>
        <AddColumnForm
          onClose={handleAddModalClose}
          onSave={refreshEntityFields}
          isEdit={!!editingData}
          existingData={editingData}
          entityTypeId={selectedRow?.ID} // اضافه کردن مقدار selectedRow.ID
        />
      </DynamicModal>

      {/* مودال نمایش اطلاعات (View) با استفاده از کامپوننت ColumnViewModal */}
      <ColumnViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        entityFields={entityFields}
      />
    </div>
  );
});

FormsCommand1.displayName = "FormsCommand1";
export default FormsCommand1;
