// src/components/ProgramTemplate/ProgramTemplate.tsx
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import DynamicInput from "../../utilities/DynamicInput";
import ListSelector from "../../ListSelector/ListSelector";
import DynamicSelector from "../../utilities/DynamicSelector";
import DynamicModal from "../../ApprovalFlows/MainApproval/ModalApprovalFlow";
import TableSelector from "../../General/Configuration/TableSelector";
import DataTable from "../../TableDynamic/DataTable";
import AddProgramTemplate from "./AddProgramTemplate";
import { useApi } from "../../../context/ApiContext";
import type { ProgramTemplateField } from "../../../services/api.services";
import { showAlert } from "../../utilities/Alert/DynamicAlert";
import {
  ProgramTemplateItem,
  Project,
  ProgramType,
} from "../../../services/api.services";
import DynamicConfirm from "../../utilities/DynamicConfirm";
import AddColumnForm from "../../Forms/AddForm"; // برای انتخاب متادیتا

/* ---------- types ---------- */
export interface ProgramTemplateHandle {
  save: () => Promise<boolean>;
}
interface ProgramTemplateProps {
  selectedRow: ProgramTemplateItem | null;
}

/* ===================================================================== */
/*                              COMPONENT                                */
/* ===================================================================== */
const ProgramTemplate = forwardRef<ProgramTemplateHandle, ProgramTemplateProps>(
  ({ selectedRow }, ref) => {
    const api = useApi();

    /* ---------------- state اصلی ---------------- */
    const [programTemplateData, setProgramTemplateData] =
      useState<ProgramTemplateItem>({
        ID: selectedRow?.ID,
        ModifiedById: selectedRow?.ModifiedById,
        Name: selectedRow?.Name || "",
        MetaColumnName: selectedRow?.MetaColumnName || "",
        Duration: selectedRow?.Duration || "",
        nProgramTypeID: selectedRow?.nProgramTypeID || null,
        PCostAct: selectedRow?.PCostAct || 0, // Activity Budget
        PCostAprov: selectedRow?.PCostAprov || 0, // Af Budget
        IsGlobal: selectedRow?.IsGlobal ?? true,
        ProjectsStr: selectedRow?.ProjectsStr || "",
        IsVisible: selectedRow?.IsVisible ?? true,
        LastModified: selectedRow?.LastModified,
      });

    /* ---------------- state کمکی ---------------- */
    const [projectsData, setProjectsData] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);

    const [programTypes, setProgramTypes] = useState<ProgramType[]>([]);
    const [loadingProgramTypes, setLoadingProgramTypes] = useState(false);

    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
      programTemplateData.ProjectsStr
        ? programTemplateData.ProjectsStr.split("|").filter(Boolean)
        : []
    );
    const [selectedProgramTypeId, setSelectedProgramTypeId] = useState<string>(
      programTemplateData.nProgramTypeID
        ? String(programTemplateData.nProgramTypeID)
        : ""
    );

    /* ------------ جدول جزئیات ------------ */
    const [programTemplateField, setProgramTemplateField] = useState<
      ProgramTemplateField[]
    >([]);
    const [roles, setRoles] = useState<{ ID: string; Name: string }[]>([]);
    const [wfTemplates, setWfTemplates] = useState<
      { ID: number; Name: string }[]
    >([]);
    const [activityTypes, setActivityTypes] = useState<
      { value: string; label: string }[]
    >([]);
    const [forms, setForms] = useState<{ ID: string; Name: string }[]>([]);
    const [programTemplates, setProgramTemplates] = useState<
      { ID: number; Name: string }[]
    >([]);
    const [loadingFields, setLoadingFields] = useState(false);

    const [editingRow, setEditingRow] = useState<any | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDetailRow, setSelectedDetailRow] = useState<any | null>(
      null
    );
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const isEditMode = Boolean(selectedRow);

    /* ------------ متادیتا (لیست سلکتور) ------------ */
    const [metaValues, setMetaValues] = useState<{ ID: string; Name: string }[]>(
      []
    );
    const [metaNames, setMetaNames] = useState<{ ID: string; Name: string }[]>(
      []
    );
    const [selectedMetaIds, setSelectedMetaIds] = useState<string[]>(
      programTemplateData.MetaColumnName
        ? programTemplateData.MetaColumnName.split("|").filter(Boolean)
        : []
    );
    const [loadingMeta, setLoadingMeta] = useState(false);

    /* ================================================================= */
    /*                             FETCHES                               */
    /* ================================================================= */
    /* --- projects --- */
    useEffect(() => {
      setLoadingProjects(true);
      api
        .getAllProject()
        .then(setProjectsData)
        .catch(() =>
          showAlert("error", null, "Error", "Failed to fetch projects.")
        )
        .finally(() => setLoadingProjects(false));
    }, [api]);

    /* --- program types --- */
    useEffect(() => {
      setLoadingProgramTypes(true);
      api
        .getAllProgramType()
        .then(setProgramTypes)
        .catch(() =>
          showAlert("error", null, "Error", "Failed to fetch program types.")
        )
        .finally(() => setLoadingProgramTypes(false));
    }, [api]);

    /* --- template list for grid mapping --- */
    useEffect(() => {
      api.getAllProgramTemplates().then(setProgramTemplates).catch(console.error);
    }, [api]);

    /* --- forms, roles, wf templates, enum --- */
    useEffect(() => {
      api.getTableTransmittal().then(setForms).catch(console.error);
      api.getAllRoles().then(setRoles).catch(console.error);
      api.getAllWfTemplate().then(setWfTemplates).catch(console.error);
      api
        .getEnum({ str: "PFIType" })
        .then((r) =>
          setActivityTypes(
            Object.entries(r).map(([k, v]) => ({ value: k, label: v }))
          )
        )
        .catch(console.error);
    }, [api]);

    /* --- detail grid data --- */
    useEffect(() => {
      if (!selectedRow?.ID) return;
      setLoadingFields(true);
      api
        .getProgramTemplateField(selectedRow.ID)
        .then(setProgramTemplateField)
        .catch(() =>
          showAlert("error", null, "Error", "Could not load entity fields")
        )
        .finally(() => setLoadingFields(false));
    }, [selectedRow?.ID, api]);

    /* --- initialise meta selector --- */
    useEffect(() => {
      if (!programTemplateData.MetaColumnName) {
        setSelectedMetaIds([]);
        setMetaNames([]);
        return;
      }
      const ids = programTemplateData.MetaColumnName.split("|").filter(Boolean);
      setSelectedMetaIds(ids);
      setLoadingMeta(true);
      Promise.all(
        ids.map((id) =>
          api
            .getEntityFieldById(Number(id))
            .then((res) => ({
              ID: String(res.ID),
              Name: res.DisplayName || res.Name || "",
            }))
            .catch(() => null)
        )
      )
        .then((arr) => {
          const ok = (arr.filter(Boolean) || []) as { ID: string; Name: string }[];
          setMetaValues(ok);
          setMetaNames(ok);
        })
        .finally(() => setLoadingMeta(false));
    }, [programTemplateData.MetaColumnName, api]);

    /* --- sync MetaColumnName on selection change --- */
    useEffect(() => {
      handleChange(
        "MetaColumnName",
        selectedMetaIds.length ? selectedMetaIds.join("|") + "|" : ""
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMetaIds]);

    /* ================================================================= */
    /*                           HELPERS / MAPPINGS                      */
    /* ================================================================= */
    const handleChange = (field: keyof ProgramTemplateItem, value: any) =>
      setProgramTemplateData((p) => ({ ...p, [field]: value }));

    const projectColumnDefs = [{ field: "Name", headerName: "Project Name" }];
    const projectsListData = projectsData.map((p) => ({
      ID: p.ID,
      Name: p.ProjectName,
    }));
    const programTypeOptions = programTypes.map((t) => ({
      value: String(t.ID),
      label: t.Name,
    }));

    /* ---- grid-friendly data ---- */
    const enhancedTemplateField = useMemo(() => {
      return programTemplateField.map((item) => ({
        ...item,
        nPostName: roles.find((r) => String(r.ID) === String(item.nPostId))
          ?.Name,
        nWFTemplateName: wfTemplates.find(
          (w) => String(w.ID) === String(item.nWFTemplateID)
        )?.Name,
        nEntityTypeName: forms.find(
          (f) => String(f.ID) === String(item.nEntityTypeID)
        )?.Name,
        nProgramTemplateName: programTemplates.find(
          (p) => String(p.ID) === String(item.nProgramTemplateID)
        )?.Name,
      }));
    }, [programTemplateField, roles, wfTemplates, forms, programTemplates]);

    const detailColumnDefs = [
      { headerName: "Order", field: "Order", flex: 1, minWidth: 80 },
      { headerName: "Activity Name", field: "Name", flex: 3, minWidth: 150 },
      { headerName: "Code", field: "Code", flex: 1, minWidth: 100 },
      { headerName: "Duration", field: "ActDuration", flex: 1, minWidth: 100 },
      { headerName: "Start", field: "Top", flex: 1, minWidth: 80 },
      { headerName: "End", field: "Left", flex: 1, minWidth: 80 },
      { headerName: "Responsible Post", field: "nPostName", flex: 3, minWidth: 150 },
      { headerName: "Approval Flow", field: "nWFTemplateName", flex: 3, minWidth: 150 },
      { headerName: "Activity Type", field: "PFIType", flex: 2, minWidth: 150 },
      { headerName: "Form Name", field: "nEntityTypeName", flex: 3, minWidth: 150 },
      { headerName: "Weight", field: "Weight1", flex: 1, minWidth: 80 },
      { headerName: "Activity Budget", field: "PCostAct", flex: 1, minWidth: 80 },
      { headerName: "Program Template", field: "nProgramTemplateName", flex: 3, minWidth: 150 },
      { headerName: "Program Duration", field: "WFDuration", flex: 1, minWidth: 80 },
      { headerName: "Program Execution Budget", field: "PCostAprov", flex: 1, minWidth: 80 },
      { headerName: "Program to plan", field: "WeightWF", flex: 1, minWidth: 80 },
    ];

    /* ================================================================= */
    /*                          SAVE (forwardRef)                        */
    /* ================================================================= */
    useImperativeHandle(ref, () => ({
      save: async () => {
        try {
          const body: ProgramTemplateItem = {
            ...programTemplateData,
            nProgramTypeID: selectedProgramTypeId
              ? parseInt(selectedProgramTypeId)
              : null,
            ProjectsStr: selectedProjectIds.length
              ? selectedProjectIds.join("|") + "|"
              : "",
          };
          if (selectedRow) await api.updateProgramTemplate(body);
          else await api.insertProgramTemplate(body);

          showAlert(
            "success",
            null,
            selectedRow ? "Updated" : "Saved",
            `Program Template ${selectedRow ? "updated" : "added"} successfully.`
          );
          return true;
        } catch (err) {
          console.error(err);
          showAlert("error", null, "Error", "Failed to save program template.");
          return false;
        }
      },
    }));

    /* ================================================================= */
    /*                               UI                                  */
    /* ================================================================= */
    return (
      <>
        {/* ============================= فرم اصلی ============================= */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
          {/* ---------------- ستون چپ (ورودی‌ها) ---------------- */}
          <div className="flex flex-col gap-10">
            <DynamicInput
              name="Program Name"
              type="text"
              value={programTemplateData.Name}
              placeholder="Enter program name"
              onChange={(e) => handleChange("Name", e.target.value)}
              required
            />

            <DynamicInput
              name="Duration"
              type="number"
              value={programTemplateData.Duration}
              placeholder="Enter duration"
              onChange={(e) => handleChange("Duration", Number(e.target.value))}
              required
            />

            {/* Activity & Af budgets در یک ردیف */}
            <div className="grid grid-cols-2 gap-6">
              <DynamicInput
                name="Activity Budget"
                type="number"
                value={programTemplateData.PCostAct}
                placeholder="Activity budget"
                onChange={(e) =>
                  handleChange("PCostAct", Number(e.target.value))
                }
              />
              <DynamicInput
                name="Af Budget"
                type="number"
                value={programTemplateData.PCostAprov}
                placeholder="Af budget"
                onChange={(e) =>
                  handleChange("PCostAprov", Number(e.target.value))
                }
              />
            </div>

            {/* نوع برنامه (در تصویر پایین ستون چپ) */}
            <DynamicSelector
              label="Type"
              options={programTypeOptions}
              selectedValue={selectedProgramTypeId}
              onChange={(e) => {
                setSelectedProgramTypeId(e.target.value);
                handleChange(
                  "nProgramTypeID",
                  e.target.value ? parseInt(e.target.value) : null
                );
              }}
              loading={loadingProgramTypes}
              showButton={false}
            />
          </div>

          {/* ---------------- ستون راست (لیست سلکتورها) ---------------- */}
          <div className="flex flex-col gap-10">
            {/* Related projects + سوییچ Global */}
            <ListSelector
              title="Related Projects"
              columnDefs={projectColumnDefs}
              rowData={projectsListData}
              selectedIds={selectedProjectIds}
              onSelectionChange={(ids) =>
                setSelectedProjectIds(ids.map(String))
              }
              showSwitcher
              isGlobal={programTemplateData.IsGlobal}
              onGlobalChange={(v) => handleChange("IsGlobal", v)}
              loading={loadingProjects}
              ModalContentComponent={TableSelector}
              modalContentProps={{
                columnDefs: projectColumnDefs,
                rowData: projectsListData,
                selectedRow: null,
                onRowDoubleClick: () => {},
                onRowClick: () => {},
                onSelectButtonClick: () => {},
                isSelectDisabled: true,
              }}
            />

            {/* Meta-data selector */}
            <ListSelector
              title="Meta Data"
              columnDefs={[{ field: "Name", headerName: "Name" }]}
              rowData={metaNames.map((m) => ({ ID: m.ID, Name: m.Name }))}
              selectedIds={selectedMetaIds}
              onSelectionChange={(ids) =>
                setSelectedMetaIds(ids.map(String))
              }
              showSwitcher={false}
              isGlobal={false}
              loading={loadingMeta}
              ModalContentComponent={AddColumnForm}
              modalContentProps={{
                onSave: (nf: { ID: number; Name: string }) => {
                  if (!nf) return;
                  const id = String(nf.ID);
                  if (!selectedMetaIds.includes(id))
                    setSelectedMetaIds((p) => [...p, id]);
                  if (!metaValues.find((x) => x.ID === id))
                    setMetaValues((p) => [...p, { ID: id, Name: nf.Name }]);
                },
                onSuccessAdd: (nf: { ID: number; Name: string }) => {
                  if (!nf) return;
                  const id = String(nf.ID);
                  if (!selectedMetaIds.includes(id))
                    setSelectedMetaIds((p) => [...p, id]);
                  if (!metaValues.find((x) => x.ID === id))
                    setMetaValues((p) => [...p, { ID: id, Name: nf.Name }]);
                },
                entityTypeId: null,
              }}
            />
          </div>
        </div>

        {/* ============================= جدول جزئیات ============================= */}
        <div className="mt-10">
          <div className="h-[400px] w-full overflow-x-auto">
            <DataTable
              columnDefs={detailColumnDefs}
              rowData={enhancedTemplateField}
              onRowClick={(r) => setSelectedDetailRow(r)}
              onRowDoubleClick={(r) => {
                setEditingRow(r);
                setIsAddModalOpen(true);
              }}
              setSelectedRowData={setSelectedDetailRow}
              showAddIcon
              showEditIcon
              showDeleteIcon
              showDuplicateIcon={false}
              onAdd={() => {
                setEditingRow(null);
                setIsAddModalOpen(true);
              }}
              onEdit={() =>
                selectedDetailRow
                  ? (setEditingRow(selectedDetailRow),
                    setIsAddModalOpen(true))
                  : showAlert(
                      "warning",
                      null,
                      "No selection",
                      "Please select a row to edit."
                    )
              }
              onDelete={() => setShowDeleteConfirm(true)}
              onDuplicate={() => {}}
              showSearch
              isLoading={loadingFields}
              domLayout="normal"
              gridOptions={{
                rowSelection: "single",
                onGridReady: (p) => {
                  p.api.sizeColumnsToFit();
                  window.addEventListener("resize", () =>
                    p.api.sizeColumnsToFit()
                  );
                },
              }}
              isEditMode={isEditMode}
            />
          </div>
        </div>

        {/* ============================= مودال افزودن/ویرایش ============================= */}
        <DynamicModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingRow(null);
          }}
        >
          <AddProgramTemplate
            selectedRow={selectedRow}
            editingRow={editingRow}
            onSaved={async () => {
              if (selectedRow?.ID) {
                const r = await api.getProgramTemplateField(selectedRow.ID);
                setProgramTemplateField(r);
              }
              setIsAddModalOpen(false);
              setEditingRow(null);
            }}
            onCancel={() => {
              setIsAddModalOpen(false);
              setEditingRow(null);
            }}
          />
        </DynamicModal>

        {/* ============================= تأیید حذف ============================= */}
        <DynamicConfirm
          isOpen={showDeleteConfirm}
          onConfirm={async () => {
            try {
              if (!selectedDetailRow) return;
              await api.deleteProgramTemplateField(selectedDetailRow.ID);
              setProgramTemplateField((p) =>
                p.filter((x) => x.ID !== selectedDetailRow.ID)
              );
              setSelectedDetailRow(null);
              setShowDeleteConfirm(false);
              showAlert("success", null, "Deleted", "Row deleted successfully.");
            } catch (err) {
              console.error(err);
              showAlert("error", null, "Error", "Failed to delete the row.");
              setShowDeleteConfirm(false);
            }
          }}
          onClose={() => setShowDeleteConfirm(false)}
          variant="delete"
          title="Delete Confirmation"
          message="Are you sure you want to delete this program field?"
        />
      </>
    );
  }
);

export default ProgramTemplate;
