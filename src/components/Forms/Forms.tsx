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
import DataTable from "../TableDynamic/DataTable";
import AddColumnForm from "./AddForm";
import FormGeneratorView from "./FormGeneratorView/FormGeneratorView";
import UploadFilesPanel from "./UploadFilesPanel";

import { useAddEditDelete } from "../../context/AddEditDeleteContext";
import { useApi } from "../../context/ApiContext";
import { showAlert } from "../utilities/Alert/DynamicAlert";

import apiService from "../../services/api.services";
import fileService from "../../services/api.servicesFile";
import { v4 as uuidv4 } from "uuid";

// نوع (interface) فیلدهای فرم:
interface IFormData {
  ID: string;
  Name: string;
  Code: string;
  IsDoc: boolean;
  IsGlobal: boolean;
  IsVisible: boolean;
  LastModified: string;
  ModifiedById: number | null;
  ProjectsStr: string;
  TemplateDocID: string | null;   // شناسه فایل ورد
  TemplateExcelID: string | null; // شناسه فایل اکسل
  nEntityCateAID: number | null;
  nEntityCateBID: number | null;
}

// برای نمایش چک‌باکس
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

// آپشن‌های انتخابی برای دو دسته (A, B)
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

// تابع کمکی برای جدا کردن Project IDs از استرینگ
const extractProjectIds = (projectsStr: string): string[] => {
  if (!projectsStr) return [];
  return projectsStr.split("|").filter(Boolean);
};

interface FormsCommand1Props {
  selectedRow: any; // اطلاعات ردیف انتخاب شده (برای حالت ویرایش)
}

// تغییر تابع واکشی نام فایل جهت استفاده از getFile
async function fetchFileNameById(fileId: string) {
  if (!fileId) return "";
  try {
    const response = await fileService.getFile(fileId);
    if (response && response.status === 200 && response.data) {
      return response.data.FileName || "";
    }
  } catch (error) {
    console.error("Error fetching file info:", error);
  }
  return "";
}

const FormsCommand1 = forwardRef(({ selectedRow }: FormsCommand1Props, ref) => {
  const { handleSaveForm } = useAddEditDelete();
  const api = useApi();

  // شناسه کاربر برای آپلود فایل:
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await apiService.getIdByUserToken();
        if (res && res.length > 0) {
          setUserId(res[0].ID.toString());
        }
      } catch (err) {
        console.error("Error fetching user id:", err);
      }
    };
    fetchUserId();
  }, []);

  // داده‌های اصلی فرم
  const [formData, setFormData] = useState<IFormData>({
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

  // برای نمایش نام فایل ورد و اکسل در رابط کاربری:
  const [wordFileName, setWordFileName] = useState<string>("");
  const [excelFileName, setExcelFileName] = useState<string>("");

  // مثال: لیست پروژه‌ها
  const [projectData, setProjectData] = useState<{ ID: string; Name: string }[]>([]);
  
  // داده‌های جدولی (مانند فیلدهای انتیتی)
  const [entityFields, setEntityFields] = useState<any[]>([]);

  // برای کنترل مدال انتخاب Category A/B
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<"A" | "B" | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  // برای کنترل مدال افزودن/ویرایش فیلد
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);

  // برای نمایش فرم جنریت شده
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // ----------------------------------------------------------------------------
  // 1) گرفتن لیست پروژه‌ها از سرور
  // ----------------------------------------------------------------------------
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await api.getAllProject();
        const mappedProjects = projects.map((p: any) => ({
          ID: p.ID,
          Name: p.ProjectName,
        }));
        setProjectData(mappedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, [api]);

  // ----------------------------------------------------------------------------
  // 2) اگر در حالت ادیت هستیم، مقادیر را در state بریزیم و نام فایل‌ها را واکشی کنیم
  // ----------------------------------------------------------------------------
  useEffect(() => {
    const updateFormDataAndFiles = async () => {
      if (selectedRow) {
        setFormData({
          ID: selectedRow.ID || "",
          Name: selectedRow.Name || "",
          Code: selectedRow.Code || "",
          IsDoc: selectedRow.IsDoc || false,
          IsGlobal: selectedRow.IsGlobal || false,
          IsVisible: selectedRow.IsVisible ?? true,
          LastModified: selectedRow.LastModified || new Date().toISOString(),
          ModifiedById: selectedRow.ModifiedById || null,
          ProjectsStr: selectedRow.ProjectsStr || "",
          TemplateDocID: selectedRow.TemplateDocID || null,
          TemplateExcelID: selectedRow.TemplateExcelID || null,
          nEntityCateAID: selectedRow.nEntityCateAID || null,
          nEntityCateBID: selectedRow.nEntityCateBID || null,
        });
        if (selectedRow.TemplateDocID) {
          const name = await fetchFileNameById(selectedRow.TemplateDocID);
          setWordFileName(name);
        } else {
          setWordFileName("");
        }
        if (selectedRow.TemplateExcelID) {
          const name = await fetchFileNameById(selectedRow.TemplateExcelID);
          setExcelFileName(name);
        } else {
          setExcelFileName("");
        }
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
        setWordFileName("");
        setExcelFileName("");
      }
    };
    updateFormDataAndFiles();
  }, [selectedRow]);

  // ----------------------------------------------------------------------------
  // 3) واکشی نام فایل‌ها هنگام تغییر TemplateDocID و TemplateExcelID
  // ----------------------------------------------------------------------------
  useEffect(() => {
    const getDocName = async () => {
      if (formData.TemplateDocID) {
        const name = await fetchFileNameById(formData.TemplateDocID);
        setWordFileName(name);
      } else {
        setWordFileName("");
      }
    };
    getDocName();
  }, [formData.TemplateDocID]);

  useEffect(() => {
    const getExcelName = async () => {
      if (formData.TemplateExcelID) {
        const name = await fetchFileNameById(formData.TemplateExcelID);
        setExcelFileName(name);
      } else {
        setExcelFileName("");
      }
    };
    getExcelName();
  }, [formData.TemplateExcelID]);

  // ----------------------------------------------------------------------------
  // 4) واکشی فیلدهای انتیتی در صورت وجود formData.ID
  // ----------------------------------------------------------------------------
  const refreshEntityFields = async () => {
    if (formData.ID) {
      try {
        const fields = await api.getEntityFieldByEntityTypeId(formData.ID);
        setEntityFields(fields);
      } catch (error) {
        console.error("Error fetching entity fields:", error);
      }
    } else {
      setEntityFields([]);
    }
  };

  useEffect(() => {
    refreshEntityFields();
  }, [formData.ID, api]);

  // ----------------------------------------------------------------------------
  // 5) متد تغییر مقادیر فرم
  // ----------------------------------------------------------------------------
  const handleChange = (field: keyof IFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ----------------------------------------------------------------------------
  // 6) Selector دسته A یا B (نمایش مدال)
  // ----------------------------------------------------------------------------
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
      if (currentSelector === "A") {
        handleChange("nEntityCateAID", parseInt(selectedRowData.value));
      } else {
        handleChange("nEntityCateBID", parseInt(selectedRowData.value));
      }
      handleCloseModal();
    }
  };

  // ----------------------------------------------------------------------------
  // 7) توابع آپلود و حذف فایل
  // ----------------------------------------------------------------------------
  const handleFileUpload = async (file: File, allowedExtensions: string[]) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new Error(
        `تنها فایل‌های با پسوند ${allowedExtensions.join(", ")} مجاز هستند.`
      );
    }
    const ID = uuidv4();
    const FileIQ = uuidv4();
    const folderName = new Date().toISOString().split("T")[0];
    const generatedFileName = `${FileIQ}.${fileExtension}`;

    const formDataFile = new FormData();
    formDataFile.append("FileName", generatedFileName);
    formDataFile.append("FolderName", folderName);
    formDataFile.append("file", file);

    const uploadRes = await fileService.uploadFile(formDataFile);
    if (uploadRes && uploadRes.status === 200) {
      const { FileSize } = uploadRes.data;
      const insertModel = {
        ID,
        FileIQ,
        FileName: generatedFileName,
        FileSize: FileSize || file.size,
        FolderName: folderName,
        IsVisible: true,
        LastModified: null,
        SenderID: userId,
        FileType: `.${fileExtension}`,
      };
      const insertRes = await fileService.insert(insertModel);
      if (insertRes && insertRes.status === 200) {
        return insertRes.data;
      }
      throw new Error("خطا در درج رکورد فایل در دیتابیس.");
    } else {
      throw new Error("آپلود فایل با خطا مواجه شد.");
    }
  };

  const handleWordUpload = async (file: File) => {
    try {
      const result = await handleFileUpload(file, ["doc", "docx"]);
      handleChange("TemplateDocID", result.ID);
      setWordFileName(result.FileName);
      showAlert("success", undefined, "موفقیت", "فایل ورد با موفقیت آپلود شد.");
    } catch (error: any) {
      showAlert(
        "error",
        undefined,
        "خطا",
        error.message || "آپلود فایل ورد با خطا مواجه شد."
      );
    }
  };

  const handleExcelUpload = async (file: File) => {
    try {
      const result = await handleFileUpload(file, ["xls", "xlsx"]);
      handleChange("TemplateExcelID", result.ID);
      setExcelFileName(result.FileName);
      showAlert("success", undefined, "موفقیت", "فایل اکسل با موفقیت آپلود شد.");
    } catch (error: any) {
      showAlert(
        "error",
        undefined,
        "خطا",
        error.message || "آپلود فایل اکسل با خطا مواجه شد."
      );
    }
  };

  const handleDeleteWord = () => {
    handleChange("TemplateDocID", null);
    setWordFileName("");
  };

  const handleDeleteExcel = () => {
    handleChange("TemplateExcelID", null);
    setExcelFileName("");
  };

  // ----------------------------------------------------------------------------
  // 8) توابع دانلود فایل (ورد و اکسل)
  // ----------------------------------------------------------------------------
  const handleDownloadFile = async (templateId: string | null) => {
    if (!templateId) {
      showAlert("error", undefined, "خطا", "فایلی انتخاب نشده است.");
      return;
    }
    try {
      // ابتدا اطلاعات فایل را واکشی می‌کنیم
      const fileInfoRes = await fileService.getFile(templateId);
      if (fileInfoRes && fileInfoRes.status === 200 && fileInfoRes.data) {
        const { FileIQ, FileType, FolderName, FileName } = fileInfoRes.data;
        const model = { FileName: FileIQ + FileType, FolderName };
        const downloadRes = await fileService.download(model);
        const blob = new Blob([downloadRes.data], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = FileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      showAlert("error", undefined, "خطا", "دانلود فایل با خطا مواجه شد.");
    }
  };

  const handleDownloadWord = () => {
    handleDownloadFile(formData.TemplateDocID);
  };

  const handleDownloadExcel = () => {
    handleDownloadFile(formData.TemplateExcelID);
  };

  // ----------------------------------------------------------------------------
  // 9) توابع افزودن/ویرایش/حذف فیلدهای انتیتی
  // ----------------------------------------------------------------------------
  const handleAddClick = () => {
    setEditingData(null);
    setIsAddModalOpen(true);
  };
  const handleEditClick = (rowData: any) => {
    setEditingData(rowData);
    setIsAddModalOpen(true);
  };
  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    setEditingData(null);
  };

  // ----------------------------------------------------------------------------
  // 10) متد ذخیره که از والد صدا می‌شود
  // ----------------------------------------------------------------------------
  useImperativeHandle(ref, () => ({
    save: async () => {
      try {
        console.log("[FormsCommand1.save] formData =>", formData);
        await handleSaveForm(formData);
        showAlert("success", undefined, "Success", "Form saved successfully!");
      } catch (error) {
        console.error("Error saving form:", error);
        showAlert("error", undefined, "Error", "Failed to save form.");
      }
    },
  }));

  // ----------------------------------------------------------------------------
  // 11) داده‌های جدول برای نمایش فیلدها
  // ----------------------------------------------------------------------------
  const entityFieldData = entityFields.map((field) => ({
    ...field,
    display_IsShowGrid: field.IsShowGrid ? "Yes" : "No",
    display_IsEditableInWF: field.IsEditableInWF ? "Yes" : "No",
  }));

  // ----------------------------------------------------------------------------
  // رندر کامپوننت
  // ----------------------------------------------------------------------------
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
                (option) => +option.value === formData.nEntityCateAID
              )?.label || ""
            }
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const selectedOption = aCategoryOptions.find(
                (opt) => opt.label === e.target.value
              );
              handleChange(
                "nEntityCateAID",
                selectedOption ? parseInt(selectedOption.value) : null
              );
            }}
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
                (option) => +option.value === formData.nEntityCateBID
              )?.label || ""
            }
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const selectedOption = bCategoryOptions.find(
                (opt) => opt.label === e.target.value
              );
              handleChange(
                "nEntityCateBID",
                selectedOption ? parseInt(selectedOption.value) : null
              );
            }}
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
            onChange={(val) => handleChange("IsGlobal", val)}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <ListSelector
            title="Related Projects"
            columnDefs={[{ field: "Name", headerName: "Project Name" }]}
            rowData={projectData}
            selectedIds={extractProjectIds(formData.ProjectsStr)}
            onSelectionChange={(selectedIds) => {
              const str = selectedIds.map(String).join("|") + "|";
              handleChange("ProjectsStr", str);
            }}
            showSwitcher={true}
            isGlobal={formData.IsGlobal}
            onGlobalChange={(val) => handleChange("IsGlobal", val)}
            className="-mt-5"
            ModalContentComponent={TableSelector}
            modalContentProps={{
              columnDefs: [{ headerName: "Project Name", field: "Name" }],
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
          <UploadFilesPanel
            onWordUpload={handleWordUpload}
            onExcelUpload={handleExcelUpload}
            wordFileName={wordFileName}
            excelFileName={excelFileName}
            onDeleteWord={handleDeleteWord}
            onDeleteExcel={handleDeleteExcel}
            onDownloadWord={handleDownloadWord}
            onDownloadExcel={handleDownloadExcel}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={2}>
          <DataTable
            columnDefs={[
              { headerName: "ID", field: "ID", sortable: true, filter: true },
              {
                headerName: "Display Name",
                field: "DisplayName",
                sortable: true,
                filter: true,
              },
              {
                headerName: "Column Type",
                field: "ColumnType",
                sortable: true,
                filter: true,
              },
              {
                headerName: "Show Grid",
                field: "display_IsShowGrid",
                sortable: true,
                filter: true,
              },
              {
                headerName: "Editable in WF",
                field: "display_IsEditableInWF",
                sortable: true,
                filter: true,
              },
              {
                headerName: "Last Modified",
                field: "LastModified",
                sortable: true,
                filter: true,
              },
            ]}
            rowData={entityFieldData}
            setSelectedRowData={setSelectedRowData}
            onAdd={handleAddClick}
            onEdit={() => {
              if (selectedRowData) {
                handleEditClick(selectedRowData);
              } else {
                showAlert("error", undefined, "Error", "No row is selected!");
              }
            }}
            onDelete={async () => {
              if (!selectedRowData) {
                showAlert("error", undefined, "Error", "No row selected for deletion");
                return;
              }
              try {
                await api.deleteEntityField(selectedRowData.ID);
                showAlert("success", undefined, "Success", "Deleted successfully");
                setSelectedRowData(null);
                refreshEntityFields();
              } catch (error) {
                showAlert("error", undefined, "Error", "Delete failed!");
              }
            }}
            showDuplicateIcon={false}
            showEditIcon={true}
            showAddIcon={true}
            showDeleteIcon={true}
            showViewIcon={true}
            onView={() => setViewModalOpen(true)}
            domLayout="autoHeight"
            showSearch={true}
            onRowDoubleClick={(rowData) => {
              // امکان ویرایش با دابل کلیک روی ردیف
            }}
          />
        </TwoColumnLayout.Item>
      </TwoColumnLayout>

      <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
        <TableSelector
          columnDefs={[{ headerName: "Name", field: "label" }]}
          rowData={
            currentSelector === "A"
              ? aCategoryOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))
              : currentSelector === "B"
              ? bCategoryOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))
              : []
          }
          selectedRow={selectedRowData}
          onRowClick={handleRowClick}
          onRowDoubleClick={handleSelectButtonClick}
          onSelectButtonClick={handleSelectButtonClick}
          isSelectDisabled={!selectedRowData}
        />
      </DynamicModal>

      <DynamicModal isOpen={isAddModalOpen} onClose={handleAddModalClose}>
        <AddColumnForm
          existingData={editingData}
          isEdit={!!editingData}
          entityTypeId={formData.ID}
          onClose={handleAddModalClose}
          onSave={() => {
            refreshEntityFields();
            handleAddModalClose();
          }}
        />
      </DynamicModal>

      <FormGeneratorView
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        entityFields={entityFields}
        selectedRow={selectedRow}
      />
    </div>
  );
});

FormsCommand1.displayName = "FormsCommand1";
export default FormsCommand1;
