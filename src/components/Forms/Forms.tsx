import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
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
import DynamicSwitcher from "../utilities/DynamicSwitcher";

import { useAddEditDelete } from "../../context/AddEditDeleteContext";
import { useApi } from "../../context/ApiContext";
import { showAlert } from "../utilities/Alert/DynamicAlert";
import apiService from "../../services/api.services";
import fileService from "../../services/api.servicesFile";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";

interface IFormData {
  ID: string;
  Name: string;
  PersianName?: string;
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
  IsGlobal: boolean;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface FormsCommand1Props {
  selectedRow: any;
}

const columnTypeMapping: { [key: string]: number } = {
  component1: 15,
  component2: 1,
  component3: 2,
  component4: 3,
  component5: 4,
  component6: 21,
  component7: 5,
  component8: 19,
  component9: 34,
  component10: 35,
  component11: 17,
  component12: 30,
  component13: 6,
  component14: 9,
  component15: 26,
  component16: 10,
  component17: 16,
  component18: 20,
  component19: 22,
  component20: 24,
  component21: 25,
  component22: 27,
  component23: 29,
  component24: 32,
  component25: 28,
  component26: 36,
  component27: 7,
  component28: 8,
  component29: 11,
  component30: 12,
  component31: 13,
  component32: 14,
  component33: 18,
  component34: 23,
  component35: 37,
  component36: 38, // Inventory
  component37: 39, // InventoryField

};

const typeOfInformationOptions = [
  { value: "component1", label: "Text" },
  { value: "component2", label: "RichText" },
  { value: "component3", label: "Choice" },
  { value: "component4", label: "Number" },
  { value: "component5", label: "Date Time" },
  { value: "component6", label: "Persian Date" },
  { value: "component7", label: "Lookup" },
  { value: "component27", label: "Hyper Link" },
  { value: "component8", label: "Post PickerList" },
  { value: "component9", label: "Lookup RealValue" },
  { value: "component10", label: "Lookup AdvanceTable" },
  { value: "component26", label: "Advance Lookup AdvanceTable" },
  { value: "component12", label: "Lookup Image" },
  { value: "component28", label: "Select User In Post" },
  { value: "component13", label: "Yes No" },
  { value: "component14", label: "Attach File" },
  { value: "component15", label: "Picture Box" },
  { value: "component16", label: "Table" },
  { value: "component17", label: "Pfi Lookup" },
  { value: "component18", label: "Seqnial Number" },
  { value: "component19", label: "Advance Table" },
  { value: "component20", label: "Word Panel" },
  { value: "component21", label: "Excel Panel" },
  { value: "component22", label: "Calculated Field" },
  { value: "component23", label: "Excel Calculator" },
  { value: "component24", label: "Tab" },
  { value: "component25", label: "Map" },
  { value: "component29", label: "Title" },
  { value: "component30", label: "Section" },
  { value: "component31", label: "Sub Section" },
  { value: "component32", label: "New Line" },
  { value: "component33", label: "Mepost Selector" },
  { value: "component34", label: "Advance WF" },
  { value: "component35", label: "LookupImage RealValue" },
  { value: "component36", label: "Inventory" },
  { value: "component37", label: "Inventory Field" },
];

/**
 * تابع کمکی برای واکشی نام فایل با استفاده از FileID
 */
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

/**
 * کامپوننت اصلی: FormsCommand1
 */
const FormsCommand1 = forwardRef(({ selectedRow }: FormsCommand1Props, ref) => {
  const { t, i18n } = useTranslation();
  const { handleSaveForm } = useAddEditDelete();
  const api = useApi();

  // تشخیص حالت ویرایش یا جدید
  const isEditMode = Boolean(selectedRow?.ID);

  // استیت شناسه کاربر
  const [userId, setUserId] = useState<string | null>(null);

  // استیت اصلی فرم
  const [formData, setFormData] = useState<IFormData>({
    ID: "",
    Name: "",
    PersianName: "",
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
    IsGlobal: true,
  });

  // نام فایل‌های ورد و اکسل (جهت نمایش و دانلود)
  const [wordFileName, setWordFileName] = useState<string>("");
  const [excelFileName, setExcelFileName] = useState<string>("");

  const [isFaMode, setIsFaMode] = useState(false); // EN=false, FA=true


  // داده‌های پروژه (جهت انتخاب پروژه)
  const [projectData, setProjectData] = useState<
    { ID: string; Name: string }[]
  >([]);

  // استیت فیلدهای انتیتی
  const [entityFields, setEntityFields] = useState<any[]>([]);

  // مدیریت نمایش مودال‌های مختلف
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSelector, setCurrentSelector] = useState<"A" | "B" | null>(
    null
  );
  const [selectedRowData, setSelectedRowData] = useState<any>(null);

  // مودال افزودن/ویرایش ستون
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);

  // مودال نمایش فرم جنریت شده
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // state برای Category A و B که از API گرفته می‌شود
  const [catAOptions, setCatAOptions] = useState<CategoryOption[]>([]);
  const [catBOptions, setCatBOptions] = useState<CategoryOption[]>([]);

  const [isLoadingFields, setIsLoadingFields] = useState<boolean>(false); // ← استیت جدید

  const [addModalKey, setAddModalKey] = useState(0);

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

  /**
   * واکشی گزینه‌های Category A
   */
  useEffect(() => {
    const fetchCatAOptions = async () => {
      try {
        const response = await apiService.getAllCatA();
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

  /**
   * واکشی گزینه‌های Category B
   */
  useEffect(() => {
    const fetchCatBOptions = async () => {
      try {
        const response = await apiService.getAllCatB();
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

  /**
   * واکشی لیست پروژه‌ها
   */
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

  /**
   * در صورت ویرایش، فرم را با داده‌های انتخاب‌شده به‌روزرسانی می‌کند
   * و همچنین نام فایل‌های ورد و اکسل را می‌گیرد
   */
  useEffect(() => {
    const updateFormDataAndFiles = async () => {
      if (selectedRow) {
        setFormData({
          ID: selectedRow.ID || "",
          Name: selectedRow.Name || "",
          PersianName: selectedRow.PersianName ?? "",
          Code: selectedRow.Code || "",
          IsDoc: !!selectedRow.IsDoc,
          IsMegaForm: !!selectedRow.IsMegaForm,
          IsVisible: !!selectedRow.IsVisible,
          LastModified: selectedRow.LastModified || new Date().toISOString(),
          ModifiedById: selectedRow.ModifiedById || null,
          ProjectsStr: selectedRow.ProjectsStr || "",
          TemplateDocID: selectedRow.TemplateDocID || null,
          TemplateExcelID: selectedRow.TemplateExcelID || null,
          nEntityCateAID: selectedRow.nEntityCateAID || null,
          nEntityCateBID: selectedRow.nEntityCateBID || null,
          IsGlobal:
            selectedRow.IsGlobal !== undefined ? selectedRow.IsGlobal : true,
        });

        console.log("rrrrrr", selectedRow.IsGlobal);

        // واکشی نام فایل ورد
        if (selectedRow.TemplateDocID) {
          const name = await fetchFileNameById(selectedRow.TemplateDocID);
          setWordFileName(name);
        } else {
          setWordFileName("");
        }

        // واکشی نام فایل اکسل
        if (selectedRow.TemplateExcelID) {
          const name = await fetchFileNameById(selectedRow.TemplateExcelID);
          setExcelFileName(name);
        } else {
          setExcelFileName("");
        }
      } else {
        // اگر حالت جدید باشد
        setFormData({
          ID: "",
          Name: "",
          PersianName: "",
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
          IsGlobal: true,
        });
        setWordFileName("");
        setExcelFileName("");
      }
    };
    updateFormDataAndFiles();
  }, [selectedRow]);

  /**
   * در صورت تغییر TemplateDocID، نام فایل ورد را مجدد می‌گیرد
   */
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

  /**
   * در صورت تغییر TemplateExcelID، نام فایل اکسل را مجدد می‌گیرد
   */
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

  /**
   * در صورت وجود ID فرم، فیلدهای انتیتی را واکشی می‌کند
   */
  const refreshEntityFields = useCallback(async () => {
    const parsedId = Number(formData.ID);
    if (!parsedId || isNaN(parsedId)) {
      setEntityFields([]);
      return;
    }

    setIsLoadingFields(true);
    try {
      const fields = await api.getEntityFieldByEntityTypeId(parsedId);
      const normalized = (fields || []).map((f: any) => ({
        ...f,
        PersianName: f.PersianName ?? "", // ← تضمین وجود property
      }));
      setEntityFields(normalized);
    } catch (error) {
      console.error("❌ Error fetching entity fields:", error);
      setEntityFields([]);
    } finally {
      setIsLoadingFields(false);
    }
  }, [api, formData.ID]);


  const newColumnDefs = React.useMemo(() => ([
    {
      headerName: t("Forms.Columns.Order"),
      field: "orderValue",
      editable: true,
      sortable: true,
      filter: true,
      flex: 0.6,
      minWidth: 90,
    },
    {
      headerName: t("Forms.Columns.ColumnName"),
      field: "DisplayName",
      editable: true,
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 180,
    },
    // ستون سوم: Persian ColumnName
    {
      headerName: t("DataTable.Headers.PersianColumnName") || "Persian ColumnName",
      field: "PersianName",
      editable: true,
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 180,
    },
    // Type
    {
      headerName: t("Forms.Columns.Type"),
      field: "ColumnType",
      editable: false,
      sortable: true,
      filter: true,
      flex: 1.3,
      minWidth: 150,
      valueGetter: (params: any) => {
        const opt = typeOfInformationOptions.find(
          (o) => columnTypeMapping[o.value] === params.data.ColumnType
        );
        return opt ? opt.label : params.data.ColumnType;
      },
    },
    // Command
    {
      headerName: t("Forms.Columns.Command"),
      field: "Code",
      editable: true,
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 130,
    },
    // چک‌باکس‌ها
    ...[
      { headerNameKey: "ShowInList", field: "IsShowGrid" },
      { headerNameKey: "Required", field: "IsRequire" },
      { headerNameKey: "MainColumn", field: "IsMainColumn" },
      { headerNameKey: "IsRtl", field: "IsRTL" },
      { headerNameKey: "CountInReject", field: "CountInReject" },
    ].map((c) => ({
      headerName: t(`Forms.Columns.${c.headerNameKey}`),
      field: c.field,
      editable: true,
      sortable: true,
      filter: true,
      flex: 0.9,
      minWidth: 110,
      cellRendererFramework: (p: any) => (
        <input type="checkbox" checked={!!p.value} readOnly style={{ margin: 0 }} />
      ),
      cellEditor: "agCheckboxCellEditor",
      cellEditorParams: {
        checkboxTrueValue: true,
        checkboxFalseValue: false,
      },
    })),
  ]), [t]);



  useEffect(() => {
    refreshEntityFields();
  }, [refreshEntityFields]);

  /**
   * تابع هندل تغییر در فرم
   */
  const handleChange = (field: keyof IFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * بازکردن مدال انتخاب برای Category A یا B
   */
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
        handleChange(
          "nEntityCateAID",
          selectedRowData.value ? parseInt(selectedRowData.value) : null
        );
      } else {
        handleChange(
          "nEntityCateBID",
          selectedRowData.value ? parseInt(selectedRowData.value) : null
        );
      }
      handleCloseModal();
    }
  };

  /**
   * تابع کمکی آپلود فایل و ذخیره رکورد آن در دیتابیس
   */
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

  /**
   * آپلود فایل ورد
   */
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

  /**
   * آپلود فایل اکسل
   */
  const handleExcelUpload = async (file: File) => {
    try {
      const result = await handleFileUpload(file, ["xls", "xlsx"]);
      handleChange("TemplateExcelID", result.ID);
      setExcelFileName(result.FileName);
      showAlert(
        "success",
        undefined,
        "موفقیت",
        "فایل اکسل با موفقیت آپلود شد."
      );
    } catch (error: any) {
      showAlert(
        "error",
        undefined,
        "خطا",
        error.message || "آپلود فایل اکسل با خطا مواجه شد."
      );
    }
  };

  /**
   * حذف فایل ورد
   */
  const handleDeleteWord = () => {
    handleChange("TemplateDocID", null);
    setWordFileName("");
  };

  /**
   * حذف فایل اکسل
   */
  const handleDeleteExcel = () => {
    handleChange("TemplateExcelID", null);
    setExcelFileName("");
  };

  /**
   * دانلود فایل (ورد یا اکسل)
   */
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

        const blob = new Blob([downloadRes.data], {
          type: "application/octet-stream",
        });
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

  /**
   * رویدادهای افزودن، ویرایش و حذف فیلدهای انتیتی
   */
  const handleAddClick = () => {
    setEditingData(null);
    setAddModalKey((k) => k + 1);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (rowData: any) => {
    const dataToEdit = selectedRowData || rowData;
    setEditingData(dataToEdit);
    setAddModalKey((k) => k + 1);
    setIsAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    setEditingData(null);
    setSelectedRowData(null);
  };

  /**
   * در این متد فقط مقدار در state آپدیت می‌شود
   * تا تغییرات در جدول نمایش داده شود
   * ولی فراخوانی آپدیت سرور انجام نمی‌دهیم.
   */
  const handleCellValueChanged = async (params: any) => {
    if (!params?.data || !params.colDef?.field) return;

    const updatedFieldName = params.colDef.field;
    const updatedFieldValue = params.newValue;

    const updatedData = { ...params.data, [updatedFieldName]: updatedFieldValue };

    // به‌روزرسانی در state
    const rowIndex = entityFields.findIndex((f) => f.ID === updatedData.ID);
    if (rowIndex !== -1) {
      const newFields = [...entityFields];
      newFields[rowIndex] = updatedData;
      setEntityFields(newFields);
    }
    setSelectedRowData(updatedData);

    // ← اختیاری: ارسال به سرور
    try {
      // مثال: اگر API شما updateEntityField دارد
      // await api.updateEntityField(updatedData);
    } catch (e) {
      console.error(e);
      showAlert("error", undefined, "Error", "Failed to update on server.");
    }
  };


  /**
   * متد اصلی ذخیره فرم (برای فراخوانی از والد، چون این کامپوننت با forwardRef فرستاده شده)
   */
  useImperativeHandle(ref, () => ({

    save: async () => {
      try {
        const payload = {
          ...formData,
          ID: formData.ID ? Number(formData.ID) : 0,
          PersianName: (formData.PersianName || "").trim(),
          ModifiedById: formData.ModifiedById
            ? formData.ModifiedById.toString()
            : null,
        };

        const nameTrim = (formData.Name || "").trim();
        const pNameTrim = (formData.PersianName || "").trim();

        if (!nameTrim && pNameTrim) {
          showAlert("warning", undefined, "Warning", "Please fill Name.");
          return false;
        }
        if (!nameTrim) {
          showAlert("error", undefined, "Error", "Name cannot be empty.");
          return false;
        }

        console.log("FORMS SAVE payload =>", payload);

        await handleSaveForm(payload);

        // showAlert("success", undefined, "Success", "Form saved successfully!");
        return true; // ✅ فرم با موفقیت ذخیره شد
      } catch (error) {
        console.error("Error saving form:", error);
        // showAlert("error", undefined, "Error", "Failed to save form.");
        return false; // ❌ ذخیره با خطا مواجه شد
      }
    },
  }));



  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>



      <TwoColumnLayout>
        {/* Name Field */}
        {/* <TwoColumnLayout.Item span={1}>
          <DynamicInput
            name={t("Forms.Name")}
            type="text"
            value={formData.Name}
            onChange={(e) => handleChange("Name", e.target.value)}
            required
          />
        </TwoColumnLayout.Item> */}

        <TwoColumnLayout.Item span={1}>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <DynamicInput
                name={isFaMode ? "PersianName" : t("Forms.Name")}
                type="text"
                value={isFaMode ? (formData.PersianName ?? "") : formData.Name}
                onChange={(e) =>
                  handleChange(isFaMode ? "PersianName" : "Name", e.target.value)
                }
                required={!isFaMode}
              />
            </div>

            {/* دکمه EN/FA با استایل گرادیانی */}
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
              title={isFaMode ? "Switch to EN (Name)" : "Switch to FA (PersianName)"}
            >
              {isFaMode ? "FA" : "EN"}
            </button>
          </div>
        </TwoColumnLayout.Item>



        {/* Command Field */}
        <TwoColumnLayout.Item span={1}>
          <DynamicInput
            name={t("Forms.Command")}
            type="text"
            value={formData.Code}
            onChange={(e) => handleChange("Code", e.target.value)}
          />
        </TwoColumnLayout.Item>

        {/* Category A Selector */}
        <TwoColumnLayout.Item span={1}>
          <DynamicSelector
            options={catAOptions}
            selectedValue={formData.nEntityCateAID?.toString() || ""}
            onChange={(e) =>
              handleChange(
                "nEntityCateAID",
                e.target.value ? parseInt(e.target.value, 10) : null
              )
            }
            label={t("Forms.CategoryA")}
            showButton
            onButtonClick={() => handleOpenModal("A")}
          />
        </TwoColumnLayout.Item>

        {/* Category B Selector */}
        <TwoColumnLayout.Item span={1}>
          <DynamicSelector
            options={catBOptions}
            selectedValue={formData.nEntityCateBID?.toString() || ""}
            onChange={(e) =>
              handleChange(
                "nEntityCateBID",
                e.target.value ? parseInt(e.target.value, 10) : null
              )
            }
            label={t("Forms.CategoryB")}
            showButton
            onButtonClick={() => handleOpenModal("B")}
          />
        </TwoColumnLayout.Item>

        {/* IsDoc Switcher */}
        <TwoColumnLayout.Item span={1}>
          <DynamicSwitcher
            isChecked={formData.IsDoc}
            onChange={() => handleChange("IsDoc", !formData.IsDoc)}
            leftLabel={t("Forms.Transmittal")}
            rightLabel=""
          />
        </TwoColumnLayout.Item>

        {/* IsMegaForm Switcher */}
        <TwoColumnLayout.Item span={1}>
          <DynamicSwitcher
            isChecked={formData.IsMegaForm}
            onChange={() => {
              if (!isEditMode) {
                handleChange("IsMegaForm", !formData.IsMegaForm);
              }
            }}
            leftLabel={t("Forms.IsMegaForm")}
            rightLabel=""
            disabled={isEditMode}
          />
        </TwoColumnLayout.Item>

        {/* Upload panel + ListSelector */}
        <TwoColumnLayout.Item span={2} className="mt-5 flex items-start gap-4">
          {/* UploadFilesPanel container (half width) */}
          <div className="w-1/2 flex flex-wrap items-center gap-2 min-w-0">
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
          </div>

          {/* ListSelector (half width) */}
          <div className="w-1/2">
            <ListSelector
              title={t("Forms.RelatedProjects")}
              columnDefs={[{ field: "Name", headerName: "Project Name" }]}
              rowData={projectData}
              selectedIds={formData.ProjectsStr.split("|").filter(Boolean)}
              onSelectionChange={(ids) =>
                handleChange("ProjectsStr", ids.map(String).join("|") + "|")
              }
              showSwitcher
              isGlobal={formData.IsGlobal}
              onGlobalChange={(val) => handleChange("IsGlobal", val)}
              /* className="-mt-5" حذف شد */
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
          </div>
        </TwoColumnLayout.Item>

        {/* DataTable */}
        <TwoColumnLayout.Item span={2}>
          <div className="overflow-x-auto pb-2">
            <div className="h-[400px] min-w-full flex flex-col justify-end">
              <DataTable
                columnDefs={newColumnDefs}
                rowData={entityFields}
                setSelectedRowData={setSelectedRowData}
                gridOptions={{
                  singleClickEdit: true,
                  rowSelection: "single",
                  onGridReady: (p) => {
                    p.api.sizeColumnsToFit();
                    window.addEventListener("resize", () =>
                      p.api.sizeColumnsToFit()
                    );
                  },
                }}
                onCellValueChanged={handleCellValueChanged}
                showAddIcon
                showEditIcon
                showDeleteIcon
                showViewIcon
                showDuplicateIcon={false}
                onAdd={handleAddClick}
                onEdit={() =>
                  selectedRowData
                    ? handleEditClick(selectedRowData)
                    : showAlert(
                      "error",
                      undefined,
                      "Error",
                      "No row is selected!"
                    )
                }
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
                  } catch {
                    showAlert("error", undefined, "Error", "Delete failed!");
                  }
                }}
                onView={() => setViewModalOpen(true)}
                onRowDoubleClick={(row) => handleEditClick(row)}
                domLayout="normal"
                showSearch
                isEditMode={isEditMode}
                isLoading={isLoadingFields}
                direction={i18n.dir()}
              />
            </div>
          </div>
        </TwoColumnLayout.Item>
      </TwoColumnLayout>

      {/* Category A/B Modal */}
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
          onRowClick={handleRowClick}
          onRowDoubleClick={handleSelectButtonClick}
          onSelectButtonClick={handleSelectButtonClick}
          isSelectDisabled={!selectedRowData}
        />
      </DynamicModal>

      {/* Add/Edit Field Modal */}
      <DynamicModal isOpen={isAddModalOpen} onClose={handleAddModalClose} >
        <AddColumnForm
          key={addModalKey}
          existingData={editingData}
          isEdit={!!editingData}
          entityTypeId={formData.ID}
          onClose={handleAddModalClose}
          
          onSave={() => {
            refreshEntityFields();
            handleAddModalClose();
          }}
          srcFields={entityFields.map((f: any) => ({
            ID: f.ID,
            DisplayName: f.DisplayName ?? f.Name ?? "",
          }))}
          srcEntityTypeId={formData.ID}
        />
      </DynamicModal>

      {/* Form Generator View Modal */}
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
