import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
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
import DynamicSwitcher from "../utilities/DynamicSwitcher";

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
  IsMegaForm: boolean;
  IsVisible: boolean;
  LastModified: string;
  ModifiedById: number | null;
  ProjectsStr: string;
  TemplateDocID: string | null;
  TemplateExcelID: string | null;
  nEntityCateAID: number | null;
  nEntityCateBID: number | null;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface FormsCommand1Props {
  selectedRow: any;
}

// واکشی نام فایل جهت استفاده از getFile
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
  console.log("Selected Row:", selectedRow);

  const { handleSaveForm } = useAddEditDelete();
  const api = useApi();

  // تشخیص حالت ویرایش
  const isEditMode = Boolean(selectedRow?.ID);

  const [userId, setUserId] = useState<string | null>(null);

  // استیت اصلی فرم
  const [formData, setFormData] = useState<IFormData>({
    ID: "",
    Name: "",
    Code: "",
    IsDoc: false,
    IsMegaForm: false,
    IsVisible: true,
    LastModified: new Date().toISOString(),
    ModifiedById: null,
    ProjectsStr: "",
    TemplateDocID: null,
    TemplateExcelID: null,
    nEntityCateAID: null,
    nEntityCateBID: null,
  });

  const [wordFileName, setWordFileName] = useState<string>("");
  const [excelFileName, setExcelFileName] = useState<string>("");

  const [projectData, setProjectData] = useState<{ ID: string; Name: string }[]>([]);
  const [entityFields, setEntityFields] = useState<any[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<"A" | "B" | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);

  // state for Category options fetched from API
  const [catAOptions, setCatAOptions] = useState<CategoryOption[]>([]);
  const [catBOptions, setCatBOptions] = useState<CategoryOption[]>([]);

  // واکشی شناسه کاربر
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

  // واکشی گزینه‌های Category A از API
  useEffect(() => {
    const fetchCatAOptions = async () => {
      try {
        const response = await apiService.getAllCatA();
        // تبدیل داده به فرمت مورد نیاز
        const options = response.map((cat: any) => ({
          value: cat.ID?.toString() || "",
          label: cat.Name,
        }));
        setCatAOptions(options);
      } catch (error) {
        console.error("Error fetching Category A options:", error);
      }
    };
    fetchCatAOptions();
  }, []);

  // واکشی گزینه‌های Category B از API
  useEffect(() => {
    const fetchCatBOptions = async () => {
      try {
        const response = await apiService.getAllCatB();
        // تبدیل داده به فرمت مورد نیاز
        const options = response.map((cat: any) => ({
          value: cat.ID?.toString() || "",
          label: cat.Name,
        }));
        setCatBOptions(options);
      } catch (error) {
        console.error("Error fetching Category B options:", error);
      }
    };
    fetchCatBOptions();
  }, []);

  // گرفتن لیست پروژه‌ها از سرور
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

  // در صورت ویرایش selectedRow را در فرم بریز و مقادیر را لاگ کن
  useEffect(() => {
    const updateFormDataAndFiles = async () => {
      if (selectedRow) {
        setFormData({
          ID: selectedRow.ID || "",
          Name: selectedRow.Name || "",
          Code: selectedRow.Code || "",
          IsDoc: !!selectedRow.IsDoc,
          IsVisible: !!selectedRow.IsVisible,
          IsMegaForm: !!selectedRow.IsMegaForm,
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
        // حالت درج (بدون selectedRow)
        setFormData({
          ID: "",
          Name: "",
          Code: "",
          IsDoc: false,
          IsMegaForm: false,
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

  // لاگ گرفتن مقادیر selectedRow (برای اشکال‌زدایی)
  useEffect(() => {
    if (selectedRow) {
      console.log("Selected Row:", selectedRow);
    }
  }, [selectedRow]);

  // لاگ گرفتن مقادیر فرم در حالت ویرایش
  useEffect(() => {
    if (isEditMode) {
      console.log("Edit mode formData:", formData);
    }
  }, [formData, isEditMode]);

  // واکشی نام فایل‌ها هنگام تغییر TemplateDocID/TemplateExcelID
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

  // واکشی فیلدهای انتیتی در صورت وجود formData.ID
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

  // متد تغییر فیلدهای فرم
  const handleChange = (field: keyof IFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Selector دسته A یا B
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
        handleChange("nEntityCateAID", selectedRowData.value ? parseInt(selectedRowData.value) : null);
      } else {
        handleChange("nEntityCateBID", selectedRowData.value ? parseInt(selectedRowData.value) : null);
      }
      handleCloseModal();
    }
  };

  // آپلود / حذف فایل
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

  // دانلود فایل (ورد / اکسل)
  const handleDownloadFile = async (templateId: string | null) => {
    if (!templateId) {
      showAlert("error", undefined, "خطا", "فایلی انتخاب نشده است.");
      return;
    }
    try {
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

  // افزودن/ویرایش/حذف فیلدهای انتیتی
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

  // متد ذخیره (فراخوانی از والد)
  useImperativeHandle(ref, () => ({
    save: async () => {
      try {
        console.log("Saving formData:", JSON.stringify(formData));
        const payload = { ...formData };
        await handleSaveForm(payload);
        showAlert("success", undefined, "Success", "Form saved successfully!");
      } catch (error) {
        console.error("Error saving form:", error);
        showAlert("error", undefined, "Error", "Failed to save form.");
      }
    },
  }));

  // داده‌های جدول برای نمایش فیلدها
  const entityFieldData = entityFields.map((field) => ({
    ...field,
    display_IsShowGrid: field.IsShowGrid ? "Yes" : "No",
    display_IsEditableInWF: field.IsEditableInWF ? "Yes" : "No",
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
            name="Command"
            type="text"
            value={formData.Code}
            placeholder="Enter command"
            onChange={(e) => handleChange("Code", e.target.value)}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSelector
            options={catAOptions}
            selectedValue={formData.nEntityCateAID ? formData.nEntityCateAID.toString() : ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              handleChange("nEntityCateAID", e.target.value ? parseInt(e.target.value) : null);
            }}
            label="Category A"
            showButton={true}
            onButtonClick={() => handleOpenModal("A")}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSelector
            options={catBOptions}
            selectedValue={formData.nEntityCateBID ? formData.nEntityCateBID.toString() : ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              handleChange("nEntityCateBID", e.target.value ? parseInt(e.target.value) : null);
            }}
            label="Category B"
            showButton={true}
            onButtonClick={() => handleOpenModal("B")}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSwitcher
            isChecked={formData.IsDoc}
            onChange={() => handleChange("IsDoc", !formData.IsDoc)}
            leftLabel="Transmitaal"
            rightLabel=""
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={1}>
          <DynamicSwitcher
            isChecked={formData.IsMegaForm}
            onChange={() => {
              if (!isEditMode) {
                handleChange("IsMegaForm", !formData.IsMegaForm);
              } else {
                console.log("Edit mode: IsMegaForm remains", formData.IsMegaForm);
              }
            }}
            leftLabel="Is Mega Form"
            rightLabel=""
            disabled={isEditMode}
          />
        </TwoColumnLayout.Item>

        <TwoColumnLayout.Item span={2} className="mt-5">
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

        <TwoColumnLayout.Item span={1} className="mt-10">
          <ListSelector
            title="Related Projects"
            columnDefs={[{ field: "Name", headerName: "Project Name" }]}
            rowData={projectData}
            selectedIds={formData.ProjectsStr.split("|").filter(Boolean)}
            onSelectionChange={(selectedIds) => {
              const str = selectedIds.map(String).join("|") + "|";
              handleChange("ProjectsStr", str);
            }}
            showSwitcher={true}
            isGlobal={formData.IsVisible}
            onGlobalChange={(val) => handleChange("IsVisible", val)}
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
            onRowDoubleClick={(rowData) => handleEditClick(rowData)}
          />
        </TwoColumnLayout.Item>
      </TwoColumnLayout>

      {/* مدال انتخاب Category A / B */}
      <DynamicModal isOpen={modalOpen} onClose={handleCloseModal}>
        <TableSelector
          columnDefs={[{ headerName: "Name", field: "label" }]}
          rowData={
            currentSelector === "A"
              ? catAOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))
              : currentSelector === "B"
              ? catBOptions.map((opt) => ({
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

      {/* مدال افزودن/ویرایش فیلد */}
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

      {/* مدال نمایش فرم جنریت شده */}
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
