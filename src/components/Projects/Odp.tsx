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
import type { OdpWithExtra } from "../../services/api.services";
import { useTranslation } from "react-i18next";

// Types
export interface IODP {
  ID?: number;
  Name: string;
  PersianName?: string;
  Description: string;
  Address: string;
  nProgramTemplateID: number | null;
  nEntityTypeID: number | null;
  nWFTemplateID: number | null;
  IsVisible?: boolean;
  ModifiedById?: number | null;
  LastModified?: string;
  ProjectsStr?: string;
}

export interface OdpHandle {
  save: () => Promise<boolean>;
}

interface OdpProps {
  selectedRow: IODP | null;
}

interface Option {
  value: string;
  label: string;
}

interface ItemType {
  ID: number;
  Name: string;
}

// Helpers
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
  const { t } = useTranslation();
  const api = useApi();

  const isEditMode = Boolean(selectedRow?.ID);

  // State for ODP data
  const [OdpData, setOdpData] = useState<IODP>({
    Name: "",
    PersianName: "",
    Description: "",
    Address: "",
    nProgramTemplateID: null,
    nEntityTypeID: null,
    nWFTemplateID: null,
    IsVisible: true,
    ModifiedById: null,
    ProjectsStr: "",
  });

  // --- Form Template Data (from API)
  const [formTemplates, setFormTemplates] = useState<ItemType[]>([]);
  const [loadingFormTemplates, setLoadingFormTemplates] = useState(false);
  const [isFaMode, setIsFaMode] = useState(false); // EN=false, FA=true

  useEffect(() => {
    if (!isEditMode) return;
    const fetchFormTemplates = async () => {
      try {
        setLoadingFormTemplates(true);
        const res = await api.getTableTransmittal();
        setFormTemplates(
          res.map((item: any) => ({
            ID: item.ID,
            Name: item.Name,
          }))
        );
      } catch (error) {
        showAlert("error", null, "Error", "Fetching Form Templates failed.");
      } finally {
        setLoadingFormTemplates(false);
      }
    };
    fetchFormTemplates();
  }, [api, isEditMode]);

  // --- Approval Flow Data (from API)
  const [approvalFlows, setApprovalFlows] = useState<ItemType[]>([]);
  const [loadingApprovalFlows, setLoadingApprovalFlows] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    const fetchApprovalFlows = async () => {
      try {
        setLoadingApprovalFlows(true);
        const res = await api.getAllWfTemplate();
        setApprovalFlows(
          res.map((item: any) => ({
            ID: item.ID,
            Name: item.Name,
          }))
        );
      } catch (error) {
        showAlert("error", null, "Error", "Fetching Approval Flows failed.");
      } finally {
        setLoadingApprovalFlows(false);
      }
    };
    fetchApprovalFlows();
  }, [api, isEditMode]);

  const [programTemplates, setProgramTemplates] = useState<ItemType[]>([]);
  const [loadingProgramTemplates, setLoadingProgramTemplates] = useState(false);

  useEffect(() => {
    const fetchProgramTemplates = async () => {
      try {
        setLoadingProgramTemplates(true);
        const res = await api.getAllProgramTemplates();
        setProgramTemplates(
          res.map((pt: any) => ({
            ID: pt.ID,
            Name: pt.Name,
          }))
        );
      } catch (error) {
        showAlert("error", null, "Error", "Fetching Program Templates failed.");
      } finally {
        setLoadingProgramTemplates(false);
      }
    };
    fetchProgramTemplates();
  }, [api]);

  // Modal state for Program Template TableSelector
  const [isProgramTemplateModalOpen, setIsProgramTemplateModalOpen] =
    useState(false);
  const [selectedProgramTemplateRow, setSelectedProgramTemplateRow] =
    useState<ItemType | null>(null);

  // Projects for Relate Project
  const [projectsData, setProjectsData] = useState<ItemType[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await api.getAllProject();
        setProjectsData(
          res.map((proj: any) => ({
            ID: proj.ID,
            Name: proj.ProjectName,
          }))
        );
      } catch (error) {
        showAlert("error", null, "Error", "Fetching projects failed.");
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [api]);

  const projectColumnDefs = [{ field: "Name", headerName: "Project Name" }];
  const projectsListData = projectsData.map((proj) => ({
    ID: proj.ID,
    Name: proj.Name,
  }));
  const selectedProjectsForModal = getAssociatedProjects(
    OdpData.ProjectsStr ?? undefined,
    projectsListData.map((p) => ({ ID: String(p.ID), Name: p.Name }))
  );

  // Handle form state on edit/add
  useEffect(() => {
    if (selectedRow) {
      setOdpData({
        ID: selectedRow.ID,
        Name: selectedRow.Name,
        PersianName: selectedRow.PersianName ?? "",
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
      const existingProjectIds = parseIds(selectedRow.ProjectsStr ?? undefined);
      setSelectedProjectIds(existingProjectIds);
    } else {
      setOdpData({
        Name: "",
        PersianName: "",
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
    }
  }, [selectedRow, projectsData]);

  const handleChange = (field: keyof IODP, value: any) => {
    setOdpData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isGlobalProjects, setIsGlobalProjects] = useState(false);

  const handleProjectsChange = (selectedIds: (string | number)[]) => {
    setSelectedProjectIds(selectedIds.map(String));
  };

  const handleGlobalProjectsChange = (isGlobal: boolean) => {
    setIsGlobalProjects(isGlobal);
  };

  // --- Program Template Modal handlers
  const handleOpenProgramTemplateModal = () =>
    setIsProgramTemplateModalOpen(true);
  const handleCloseProgramTemplateModal = () => {
    setSelectedProgramTemplateRow(null);
    setIsProgramTemplateModalOpen(false);
  };
  const handleProgramTemplateRowClick = (data: ItemType) =>
    setSelectedProgramTemplateRow(data);
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

  // --- Save Function (with correct type for API) ---
  const save = async (): Promise<boolean> => {
    try {
      if (!OdpData.Name.trim()) {
        showAlert("warning", null, "", t("ODP.Alerts.Messages.NameRequired"));
        return false;
      }
      if (!OdpData.Address.trim()) {
        showAlert(
          "warning",
          null,
          "",
          t("ODP.Alerts.Messages.AddressRequired")
        );
        return false;
      }

      const finalRelateProjectsStr =
        selectedProjectIds.join("|") +
        (selectedProjectIds.length > 0 ? "|" : "");

      const { ID, ...restOdp } = OdpData;

      const dataToSave: OdpWithExtra = {
        ID: isEditMode ? selectedRow!.ID! : 0,
        ...restOdp,
        ModifiedById:
          OdpData.ModifiedById != null ? String(OdpData.ModifiedById) : null,
        PersianName: (OdpData.PersianName ?? "").trim(),
        ProjectsStr: finalRelateProjectsStr,
        LastModified: new Date().toISOString(),
        IsVisible: OdpData.IsVisible ?? true,
        EntityTypeName: "",
        ProgramTemplateIDName: "",
        WFTemplateName: "",
        nEntityTypeID: OdpData.nEntityTypeID,
        nProgramTemplateID: OdpData.nProgramTemplateID,
        nWFTemplateID: OdpData.nWFTemplateID,
      };

      if (isEditMode && typeof dataToSave.ID === "number") {
        await api.updateOdp(dataToSave);
        // showAlert("success", null, "Success", "ODP updated successfully.");/
      } else {
        await api.insertOdp(dataToSave);
        console.log("ODP payload about to save:", dataToSave);

        // showAlert("success", null, "Success", "ODP added successfully.");
      }
      return true;
    } catch (error) {
      showAlert("error", null, "Error", "Saving ODP failed.");
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    save,
  }));

  // --- Program Template Modal render
  const renderProgramTemplateModal = () => (
    <DynamicModal
      isOpen={isProgramTemplateModalOpen}
      onClose={handleCloseProgramTemplateModal}
    >
      <TableSelector
        columnDefs={[{ headerName: "Name", field: "Name" }]}
        rowData={programTemplates}
        onRowDoubleClick={handleProgramTemplateRowDoubleClick}
        onRowClick={handleProgramTemplateRowClick}
        onSelectButtonClick={handleSelectProgramTemplateFromModal}
        isSelectDisabled={selectedProgramTemplateRow == null}
      />
    </DynamicModal>
  );

  // Form Template & Approval Flow Selectors
  const formTemplateSelector = isEditMode ? (
    <DynamicSelector
      options={formTemplates.map((item) => ({
        value: item.ID.toString(),
        label: item.Name,
      }))}
      selectedValue={OdpData.nEntityTypeID?.toString() ?? ""}
      onChange={() => {}}
      label="Form Template"
      disabled
      loading={loadingFormTemplates}
      className="mb-4"
    />
  ) : (
    <></>
  );

  const approvalFlowSelector = isEditMode ? (
    <DynamicSelector
      options={approvalFlows.map((item) => ({
        value: item.ID.toString(),
        label: item.Name,
      }))}
      selectedValue={OdpData.nWFTemplateID?.toString() ?? ""}
      onChange={() => {}}
      label="Approval Flow Template"
      disabled
      loading={loadingApprovalFlows}
      className="mb-4"
    />
  ) : (
    <></>
  );

  // --- UI ---
  return (
    <>
      <TwoColumnLayout>
        {/* Name / PersianName + سوئیچر */}
        {/* Name / PersianName + سوئیچر */}
        {/* Name / PersianName + سوئیچر */}
        <div className="flex items-end gap-2 mb-4">
          {" "}
          {/* ← فاصله را به کانتینر دادیم */}
          <div className="flex-1">
            <DynamicInput
              name={isFaMode ? "PersianName" : t("ODP.ODPName")}
              type="text"
              value={isFaMode ? OdpData.PersianName ?? "" : OdpData.Name}
              placeholder=""
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange(isFaMode ? "PersianName" : "Name", e.target.value)
              }
              required={!isFaMode}
              className="mb-0"
              labelClassName="text-gray-700 font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsFaMode((p) => !p)}
            className={[
              "shrink-0 inline-flex items-center justify-center",
              "h-8 px-3 rounded-lg self-end mb-1" ,
              "bg-gradient-to-r from-fuchsia-500 to-pink-500",
              "text-white text-xs font-semibold tracking-wide",
              "shadow shadow-pink-200/50",
              "transition-all duration-200",
              "hover:from-fuchsia-600 hover:to-pink-600 hover:shadow-md hover:scale-[1.01]",
              "active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-pink-300",
            ].join(" ")}
            title={
              isFaMode ? "Switch to EN (Name)" : "Switch to FA (PersianName)"
            }
          >
            {isFaMode ? "FA" : "EN"}
          </button>
        </div>

        <CustomTextarea
          name={t("ODP.Description")}
          value={OdpData.Description}
          placeholder=""
          onChange={(e: {
            target: { value: string | number | boolean | null };
          }) => handleChange("Description", e.target.value)}
          className="mb-4"
        />

        <DynamicInput
          name={t("ODP.Address")}
          type="text"
          value={OdpData.Address}
          placeholder=""
          onChange={(e: {
            target: { value: string | number | boolean | null };
          }) => handleChange("Address", e.target.value)}
          required={true}
          className="mb-4"
        />

        <DynamicSelector
          options={programTemplates.map((item) => ({
            value: item.ID.toString(),
            label: item.Name,
          }))}
          selectedValue={OdpData.nProgramTemplateID?.toString() ?? ""}
          onChange={(e: { target: { value: any } }) => {
            const val = e.target.value;
            const idNumber = val ? parseInt(val, 10) : null;
            handleChange("nProgramTemplateID", idNumber);
          }}
          label={t("ODP.ProgramTemplate")}
          showButton={true}
          onButtonClick={handleOpenProgramTemplateModal} // اینجا مودال باز می‌شود!
          disabled={false}
          className="mb-4"
        />

        {/* فقط همین دوتا متغیر 👇 */}
        {formTemplateSelector}
        {approvalFlowSelector}

        <ListSelector
          title={t("ODP.RelatedProjects")}
          className="mt-4"
          columnDefs={projectColumnDefs}
          rowData={projectsListData}
          selectedIds={selectedProjectIds}
          onSelectionChange={handleProjectsChange}
          showSwitcher={true}
          isGlobal={!!isGlobalProjects}
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
            selectionMode: "multiple",
          }}
        />
      </TwoColumnLayout>

      {/* Modal Program Template */}
      {renderProgramTemplateModal()}
    </>
  );
};

export default forwardRef(OdpComp);
