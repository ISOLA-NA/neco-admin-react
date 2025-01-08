import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from "react";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import DynamicInput from "../utilities/DynamicInput";
import CustomTextarea from "../utilities/DynamicTextArea";
import DynamicSelector from "../utilities/DynamicSelector";
import DynamicModal from "../utilities/DynamicModal";
import TableSelector from "../General/Configuration/TableSelector";
import ListSelector from "../ListSelector/ListSelector";
import { showAlert } from "../utilities/Alert/DynamicAlert";
import { useApi } from "../../context/ApiContext";

// ------ تایپ‌های کمکی ------
export interface IODP {
  ID?: number;
  Name: string;
  Description: string;
  Address: string;
  nProgramTemplateID: number | null; // همان Program Template
  nEntityTypeID: number | null; // همان Form Template
  nWFTemplateID: number | null; // همان Approval Flow Template
  IsVisible?: boolean;
  ModifiedById?: number | null;
  LastModified?: string;

  // فیلد جدید برای ذخیره پروژه‌های مرتبط به‌شکل رشته‌ای (در صورت نیاز در دیتابیس)
  ProjectsStr?: string;
}

export interface OdpWithExtra {
  ID?: number;
  Name: string;
  Description: string;
  Address: string;
  nProgramTemplateID: number | null;
  nEntityTypeID: number | null;
  nWFTemplateID: number | null;
  IsVisible?: boolean;
  ModifiedById?: number | null;
  LastModified?: string;
  ProjectsStr?: string;

  // فیلدهای اضافه:
  EntityTypeName?: string;
  ProgramTemplateIDName?: string;
  WFTemplateName?: string;
}

// اگر IODP از OdpWithExtra به درستی ارث‌بری کرده باشد، نیازی به تعریف مجدد آن نیست
// export interface IODP extends OdpWithExtra {}

export interface OdpHandle {
  save: () => Promise<boolean>;
}

interface OdpProps {
  selectedRow: IODP | null;
}

// تعریف Option
interface Option {
  value: string;
  label: string;
}

interface ItemType {
  ID: number;
  Name: string;
}

// ---- توابع کمکی برای پردازش رشته‌های جداشده با "|" ----
const parseIds = (idsStr?: string | null): string[] => {
  if (!idsStr) return [];
  return idsStr.split("|").filter(Boolean);
};

const getAssociatedProjects = (
  projectsStr?: string | null,
  projectsData?: Array<{ ID: string; Name: string }>
) => {
  const projectIds = parseIds(projectsStr);
  return (projectsData || []).filter((project) =>
    projectIds.includes(String(project.ID))
  );
};

const OdpComp: ForwardRefRenderFunction<OdpHandle, OdpProps> = (
  { selectedRow },
  ref
) => {
  const api = useApi();

  const formTemplateOptions: Option[] = [
    { value: "1", label: "Form Template 1" },
    { value: "2", label: "Form Template 2" },
    { value: "3", label: "Form Template 3" },
  ];

  const approvalFlowTemplateOptions: Option[] = [
    { value: "1", label: "Approval Flow 1" },
    { value: "2", label: "Approval Flow 2" },
    { value: "3", label: "Approval Flow 3" },
  ];

  // تشخیص حالت افزودن یا ویرایش
  const isEditMode = Boolean(selectedRow?.ID);

  // ----- استیت اصلی داده‌های ODP -----
  const [OdpData, setOdpData] = useState<IODP>({
    Name: "",
    Description: "",
    Address: "",
    nProgramTemplateID: null,
    nEntityTypeID: null,
    nWFTemplateID: null,
    IsVisible: true,
    ModifiedById: null,
    ProjectsStr: "",
  });

  // ----------------------------------------------------------------
  // 1) گرفتن لیست Program Template از API
  // ----------------------------------------------------------------
  const [programTemplates, setProgramTemplates] = useState<ItemType[]>([]);
  const [loadingProgramTemplates, setLoadingProgramTemplates] = useState(false);

  useEffect(() => {
    const fetchProgramTemplates = async () => {
      try {
        setLoadingProgramTemplates(true);
        const res = await api.getAllProgramTemplates();
        const items: ItemType[] = res.map((pt) => ({
          ID: pt.ID!, // فرض بر این که ID همیشه وجود دارد
          Name: pt.Name,
        }));
        setProgramTemplates(items);
      } catch (error) {
        console.error("Error fetching Program Templates:", error);
        showAlert(
          "error",
          null,
          "خطا",
          "دریافت Program Templates با مشکل مواجه شد."
        );
      } finally {
        setLoadingProgramTemplates(false);
      }
    };
    fetchProgramTemplates();
  }, [api]);

  // ساخت options برای DynamicSelector مربوط به Program Template
  const programTemplateOptions: Option[] = programTemplates.map((item) => ({
    value: item.ID.toString(),
    label: item.Name,
  }));

  // ----------------------------------------------------------------
  // 2) گرفتن لیست پروژه‌ها از API تا برای Relate Project استفاده شوند
  // ----------------------------------------------------------------
  const [projectsData, setProjectsData] = useState<ItemType[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await api.getAllProject();
        const items: ItemType[] = res.map((proj) => ({
          ID: proj.ID!,
          Name: proj.ProjectName,
        }));
        setProjectsData(items);
      } catch (error) {
        console.error("Error fetching projects:", error);
        showAlert("error", null, "خطا", "دریافت پروژه‌ها با مشکل مواجه شد.");
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [api]);

  // تعریف ستون‌های جدول برای پروژه‌ها
  const projectColumnDefs = [{ field: "Name", headerName: "Project Name" }];

  // آماده‌سازی داده‌ها برای ListSelector (فرمت دهی پروژه‌ها به {ID, Name})
  const projectsListData = projectsData.map((proj) => ({
    ID: proj.ID,
    Name: proj.Name,
  }));

  // آماده‌سازی پروژه‌های انتخاب‌شده برای نمایش در مودال
  const selectedProjectsForModal = getAssociatedProjects(
    OdpData.ProjectsStr ?? undefined,
    projectsListData.map((p) => ({ ID: String(p.ID), Name: p.Name }))
  );

  // ----------------------------------------------------------------
  // 3) مدیریت حالت انتخابی (Edit) یا جدید (Add)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (selectedRow) {
      setOdpData({
        ID: selectedRow.ID,
        Name: selectedRow.Name,
        Description: selectedRow.Description,
        Address: selectedRow.Address,
        nProgramTemplateID: selectedRow.nProgramTemplateID,
        nEntityTypeID: selectedRow.nEntityTypeID,
        nWFTemplateID: selectedRow.nWFTemplateID,
        IsVisible: selectedRow.IsVisible ?? true,
        ModifiedById: selectedRow.ModifiedById,
        LastModified: selectedRow.LastModified,
        ProjectsStr: selectedRow.ProjectsStr ?? "",
      });

      // Parse and set selected project IDs
      const existingProjectIds = parseIds(selectedRow.ProjectsStr ?? undefined);
      setSelectedProjectIds(existingProjectIds);
      console.log("Existing Project IDs:", existingProjectIds);
    } else {
      setOdpData({
        Name: "",
        Description: "",
        Address: "",
        nProgramTemplateID: null,
        nEntityTypeID: null,
        nWFTemplateID: null,
        IsVisible: true,
        ModifiedById: null,
        ProjectsStr: "",
      });
      setSelectedProjectIds([]);
      console.log("Creating a new ODP");
    }
  }, [selectedRow, projectsData]);

  // ----------------------------------------------------------------
  // 4) تابع کمکی تغییر فیلدها
  // ----------------------------------------------------------------
  const handleChange = (field: keyof IODP, value: any) => {
    setOdpData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ----------------------------------------------------------------
  // 5) مدیریت پروژه‌های مرتبط (Related Projects) مشابه RoleGroups
  // ----------------------------------------------------------------
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isGlobalProjects, setIsGlobalProjects] = useState(false);

  const handleProjectsChange = (selectedIds: (string | number)[]) => {
    setSelectedProjectIds(selectedIds.map(String));
    console.log("Projects selected:", selectedIds);
  };

  const handleGlobalProjectsChange = (isGlobal: boolean) => {
    setIsGlobalProjects(isGlobal);
    console.log("IsGlobalProjects changed to:", isGlobal);
  };

  // ----------------------------------------------------------------
  // 6) مدیریت مودال‌های مربوط به Program Template, Form Template, Approval Flow
  // ----------------------------------------------------------------
  // Program Template
  const [isProgramTemplateModalOpen, setIsProgramTemplateModalOpen] =
    useState(false);
  const [selectedProgramTemplateRow, setSelectedProgramTemplateRow] =
    useState<ItemType | null>(null);

  const handleOpenProgramTemplateModal = () =>
    setIsProgramTemplateModalOpen(true);
  const handleCloseProgramTemplateModal = () => {
    setSelectedProgramTemplateRow(null);
    setIsProgramTemplateModalOpen(false);
  };
  const handleProgramTemplateRowClick = (data: ItemType) => {
    setSelectedProgramTemplateRow(data);
  };
  const handleProgramTemplateRowDoubleClick = (data: ItemType) => {
    handleChange("nProgramTemplateID", data.ID);
    handleCloseProgramTemplateModal();
  };
  const handleSelectProgramTemplateFromModal = () => {
    if (selectedProgramTemplateRow) {
      handleChange("nProgramTemplateID", selectedProgramTemplateRow.ID);
    }
    handleCloseProgramTemplateModal();
  };

  // Form Template (فقط در حالت ویرایش)
  const [isFormTemplateModalOpen, setIsFormTemplateModalOpen] = useState(false);
  const [selectedFormTemplateRow, setSelectedFormTemplateRow] =
    useState<ItemType | null>(null);

  const handleOpenFormTemplateModal = () => setIsFormTemplateModalOpen(true);
  const handleCloseFormTemplateModal = () => {
    setSelectedFormTemplateRow(null);
    setIsFormTemplateModalOpen(false);
  };
  const handleFormTemplateRowClick = (data: ItemType) => {
    setSelectedFormTemplateRow(data);
  };
  const handleFormTemplateRowDoubleClick = (data: ItemType) => {
    handleChange("nEntityTypeID", data.ID);
    handleCloseFormTemplateModal();
  };
  const handleSelectFormTemplateFromModal = () => {
    if (selectedFormTemplateRow) {
      handleChange("nEntityTypeID", selectedFormTemplateRow.ID);
    }
    handleCloseFormTemplateModal();
  };

  // Approval Flow Template (فقط در حالت ویرایش)
  const [isApprovalFlowModalOpen, setIsApprovalFlowModalOpen] = useState(false);
  const [selectedApprovalFlowRow, setSelectedApprovalFlowRow] =
    useState<ItemType | null>(null);

  const handleOpenApprovalFlowModal = () => setIsApprovalFlowModalOpen(true);
  const handleCloseApprovalFlowModal = () => {
    setSelectedApprovalFlowRow(null);
    setIsApprovalFlowModalOpen(false);
  };
  const handleApprovalFlowRowClick = (data: ItemType) => {
    setSelectedApprovalFlowRow(data);
  };
  const handleApprovalFlowRowDoubleClick = (data: ItemType) => {
    handleChange("nWFTemplateID", data.ID);
    handleCloseApprovalFlowModal();
  };
  const handleSelectApprovalFlowFromModal = () => {
    if (selectedApprovalFlowRow) {
      handleChange("nWFTemplateID", selectedApprovalFlowRow.ID);
    }
    handleCloseApprovalFlowModal();
  };

  const columnDefs = [
    { headerName: "ID", field: "ID" },
    { headerName: "Name", field: "Name" },
  ];

  // ----------------------------------------------------------------
  // 7) تابع save که از طریق ref به والد ارسال می‌شود
  // ----------------------------------------------------------------
  const save = async (): Promise<boolean> => {
    try {
      if (!OdpData.Name.trim()) {
        showAlert("warning", null, "توجه", "نام ODP نمی‌تواند خالی باشد.");
        return false;
      }
      if (!OdpData.Address.trim()) {
        showAlert("warning", null, "توجه", "آدرس نمی‌تواند خالی باشد.");
        return false;
      }

      const finalRelateProjectsStr =
        selectedProjectIds.join("|") +
        (selectedProjectIds.length > 0 ? "|" : "");

      const dataToSave: IODP = {
        ...OdpData,
        ProjectsStr: finalRelateProjectsStr,
        LastModified: new Date().toISOString(),
        IsVisible: OdpData.IsVisible ?? true,
      };

      if (isEditMode && OdpData.ID) {
        await api.updateOdp(dataToSave);
        showAlert("success", null, "موفقیت", "ODP با موفقیت به‌روزرسانی شد.");
      } else {
        await api.insertOdp(dataToSave);
        showAlert("success", null, "موفقیت", "ODP با موفقیت اضافه شد.");
      }
      return true;
    } catch (error) {
      console.error("Error saving ODP:", error);
      showAlert("error", null, "خطا", "ذخیره ODP با شکست مواجه شد.");
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    save,
  }));

  // ----------------------------------------------------------------
  // 8) رندر JSX کامپوننت با توجه به شرایط و تغییرات درخواستی
  // ----------------------------------------------------------------

  // تعریف selectors برای حالت ویرایش
  const editModeSelectors = isEditMode ? (
    <>
      {/* Form Template Selector - Disabled in Edit Mode */}
      <DynamicSelector
        options={formTemplateOptions}
        selectedValue={OdpData.nEntityTypeID?.toString() ?? ""}
        onChange={(e: { target: { value: any } }) => {
          const val = e.target.value;
          const idNumber = val ? parseInt(val, 10) : null;
          handleChange("nEntityTypeID", idNumber);
        }}
        label="Form Template"
        showButton={true}
        onButtonClick={handleOpenFormTemplateModal}
        disabled={true} // Disabled as per requirement
      />

      {/* Approval Flow Template Selector - Disabled in Edit Mode */}
      <DynamicSelector
        options={approvalFlowTemplateOptions}
        selectedValue={OdpData.nWFTemplateID?.toString() ?? ""}
        onChange={(e: { target: { value: any } }) => {
          const val = e.target.value;
          const idNumber = val ? parseInt(val, 10) : null;
          handleChange("nWFTemplateID", idNumber);
        }}
        label="Approval Flow Template"
        showButton={true}
        onButtonClick={handleOpenApprovalFlowModal}
        disabled={true} // Disabled as per requirement
      />
    </>
  ) : null;

  // تعریف selectors برای حالت افزودن (Add Mode)
  // در حالت افزودن، این selectors نشان داده نمی‌شوند
  const addModeSelectors = null; // چون در کد شما در حالت افزودن نیازی به این selectors نیست

  // تعریف توابع رندر مودال‌ها
  const renderProgramTemplateModal = () => (
    <DynamicModal
      isOpen={isProgramTemplateModalOpen}
      onClose={handleCloseProgramTemplateModal}
    >
      <TableSelector
        columnDefs={columnDefs}
        rowData={programTemplates}
        onRowDoubleClick={handleProgramTemplateRowDoubleClick}
        onRowClick={handleProgramTemplateRowClick}
        selectedRow={selectedProgramTemplateRow}
        onSelectButtonClick={handleSelectProgramTemplateFromModal}
        isSelectDisabled={false}
      />
      <button onClick={handleSelectProgramTemplateFromModal}>انتخاب</button>
    </DynamicModal>
  );

  const renderFormTemplateModal = () => (
    <DynamicModal
      isOpen={isFormTemplateModalOpen}
      onClose={handleCloseFormTemplateModal}
    >
      <TableSelector
        columnDefs={columnDefs}
        rowData={programTemplateOptions.map((opt) => ({
          ID: Number(opt.value),
          Name: opt.label,
        }))}
        onRowDoubleClick={handleFormTemplateRowDoubleClick}
        onRowClick={handleFormTemplateRowClick}
        selectedRow={selectedFormTemplateRow}
        onSelectButtonClick={handleSelectFormTemplateFromModal}
        isSelectDisabled={false}
      />
      <button onClick={handleSelectFormTemplateFromModal}>انتخاب</button>
    </DynamicModal>
  );

  const renderApprovalFlowModal = () => (
    <DynamicModal
      isOpen={isApprovalFlowModalOpen}
      onClose={handleCloseApprovalFlowModal}
    >
      <TableSelector
        columnDefs={columnDefs}
        rowData={approvalFlowTemplateOptions.map((opt) => ({
          ID: Number(opt.value),
          Name: opt.label,
        }))}
        onRowDoubleClick={handleApprovalFlowRowDoubleClick}
        onRowClick={handleApprovalFlowRowClick}
        selectedRow={selectedApprovalFlowRow}
        onSelectButtonClick={handleSelectApprovalFlowFromModal}
        isSelectDisabled={false}
      />
      <button onClick={handleSelectApprovalFlowFromModal}>انتخاب</button>
    </DynamicModal>
  );

  return (
    <>
      <TwoColumnLayout>
        <DynamicInput
          name="Odp Name"
          type="text"
          value={OdpData.Name}
          placeholder="نام ODP را وارد کنید"
          onChange={(e: {
            target: { value: string | number | boolean | null };
          }) => handleChange("Name", e.target.value)}
          required={true}
          className="mb-4"
        />

        <CustomTextarea
          name="Description"
          value={OdpData.Description}
          placeholder="توضیحات را وارد کنید"
          onChange={(e: {
            target: { value: string | number | boolean | null };
          }) => handleChange("Description", e.target.value)}
          className="mb-4"
        />

        <DynamicInput
          name="Address"
          type="text"
          value={OdpData.Address}
          placeholder="آدرس را وارد کنید"
          onChange={(e: {
            target: { value: string | number | boolean | null };
          }) => handleChange("Address", e.target.value)}
          required={true}
          className="mb-4"
        />

        <DynamicSelector
          options={programTemplateOptions}
          selectedValue={OdpData.nProgramTemplateID?.toString() ?? ""}
          onChange={(e: { target: { value: any } }) => {
            const val = e.target.value;
            const idNumber = val ? parseInt(val, 10) : null;
            handleChange("nProgramTemplateID", idNumber);
          }}
          label="Program Template"
          showButton={true}
          onButtonClick={handleOpenProgramTemplateModal}
          disabled={false}
          className="mb-4"
        />

        {editModeSelectors}
        {addModeSelectors}

        <ListSelector
          title="Related Projects"
          className="mt-4"
          columnDefs={projectColumnDefs}
          rowData={projectsListData}
          selectedIds={selectedProjectIds}
          onSelectionChange={handleProjectsChange}
          showSwitcher={true}
          isGlobal={isGlobalProjects}
          onGlobalChange={handleGlobalProjectsChange}
          loading={loadingProjects}
          ModalContentComponent={TableSelector}
          modalContentProps={{
            columnDefs: projectColumnDefs,
            rowData: projectsListData,
            selectedRows: selectedProjectsForModal,
            onRowDoubleClick: (row: any) => {
              if (!selectedProjectIds.includes(String(row.ID))) {
                handleProjectsChange([...selectedProjectIds, String(row.ID)]);
              }
            },
            selectionMode: "multiple", // تغییر به "multiple" برای انتخاب چند پروژه
          }}
        />
      </TwoColumnLayout>

      {/* رندر مودال‌ها تنها در حالت ویرایش */}
      {isEditMode && renderProgramTemplateModal()}
      {isEditMode && renderFormTemplateModal()}
      {isEditMode && renderApprovalFlowModal()}
    </>
  );
};

// تبدیل کامپوننت به forwardRef
export default forwardRef(OdpComp);
