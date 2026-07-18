// src/components/Programs/ProgramTemplate/AddEditProgramField.tsx

import React, { useState, useEffect, useCallback } from "react";
import DynamicModal from "../../utilities/DynamicModal";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import {
  SinglePFI,
  PFIType,
  ChangeMode,
  ProgramDesignerRow,
} from "../../../services/programDesigner/types";
import { useProgramDesigner } from "../../../context/ProgramDesignerContext";
import { useApi } from "../../../context/ApiContext";
import TreePfiSelectorModal, {
  PredecessorKind,
} from "./TreePfiSelectorModal";

type ModalTab = "details" | "predecessors" | "conditions";

type SelectOption = { value: string; label: string };

interface PredecessorItem {
  GPIC: string;
  Name: string;
}

interface AddEditProgramFieldProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  mainProgramId: number;
  parentGPIC?: string | null;
  parentPfiId?: number | null;
  initialData?: SinglePFI | null;
  onSaved: () => void;
}

const emptyForm: Partial<SinglePFI> = {
  Name: "",
  PersianName: "",
  Address: "",
  Code: "",
  Order: 0,
  Weight: 0,
  WeightWF: 0,
  WeightSubProg: 0,
  PCostAct: 0,
  PCostAprov: 0,
  PCostSubAct: 0,
  PCostSubAprov: 0,
  ActDuration: 0,
  SubDuration: 0,
  DelayTime: 0,
  ActorId: null,
  nWFTemplateID: null,
  nProgramTypeID: null,
  subProgramTemplateID: null,
  PFIType: undefined,
  nEntityTypeID: null,
  nEntityCollectionID: null,
  IsInheritMetaColumns: true,
  IsInheritMetaValues: true,
  PredecessorInItem: "",
  PredecessorInSub: "",
};

const defaultsForMissingFields: Partial<SinglePFI> = {
  GPIC: null,
  nCalendarID: null,
  PredecessorOutItem: "",
  PredecessorOutSub: "",
  DatePlanStart: null,
  DatePlanEnd: null,
  DateMostStart: null,
  SubProgramMetaDataColumn: null,
  subProgramID: null,
  IsHistory: null,
  metaJson: null,
};

const parsePredecessorString = (str: string | null | undefined): string[] => {
  if (!str) return [];
  return str.split("|").filter(Boolean);
};

const buildPredecessorString = (gpics: string[]): string => {
  if (gpics.length === 0) return "";
  return gpics.join("|") + "|";
};

const AddEditProgramField: React.FC<AddEditProgramFieldProps> = ({
  isOpen,
  onClose,
  mode,
  mainProgramId,
  parentGPIC = null,
  parentPfiId = null,
  initialData,
  onSaved,
}) => {
  const {
    addOneProgramFieldTemplate,
    updateOneProgramFieldTemplate,
    getRootRows,
    getChildRows,
  } = useProgramDesigner();
  const api = useApi();

  const [activeTab, setActiveTab] = useState<ModalTab>("details");
  const [form, setForm] = useState<Partial<SinglePFI>>(
    initialData ?? emptyForm
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ================== سلکتورهای تب Details ==================
  const [roles, setRoles] = useState<SelectOption[]>([]);
  const [wfTemplates, setWfTemplates] = useState<SelectOption[]>([]);
  const [programTypes, setProgramTypes] = useState<SelectOption[]>([]);
  const [programTemplates, setProgramTemplates] = useState<SelectOption[]>(
    []
  );
  const [forms, setForms] = useState<SelectOption[]>([]);
  const [procedures, setProcedures] = useState<SelectOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoadingOptions(true);
    Promise.all([
      api.getAllRoles(),
      api.getAllWfTemplate(),
      api.getAllProgramType(),
      api.getAllProgramTemplates(),
      api.getTableTransmittal(),
      api.getAllEntityCollection(),
    ])
      .then((results) => {
        const rolesData = results[0];
        const wfData = results[1];
        const programTypeData = results[2];
        const programTemplateData = results[3];
        const formsData = results[4];
        const proceduresData = results[5];

        setRoles(
          rolesData.map((r: any) => ({ value: String(r.ID), label: r.Name }))
        );
        setWfTemplates(
          wfData.map((w: any) => ({ value: String(w.ID), label: w.Name }))
        );
        setProgramTypes(
          programTypeData.map((p: any) => ({
            value: String(p.ID),
            label: p.Name,
          }))
        );
        setProgramTemplates(
          programTemplateData.map((p: any) => ({
            value: String(p.ID),
            label: p.Name,
          }))
        );
        setForms(
          formsData.map((f: any) => ({ value: String(f.ID), label: f.Name }))
        );
        setProcedures(
          proceduresData.map((p: any) => ({
            value: String(p.ID),
            label: p.Name,
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to load selector options:", err);
      })
      .finally(() => setIsLoadingOptions(false));
  }, [isOpen, api]);

  // ================== تب Predecessors ==================
  const [predecessorInItems, setPredecessorInItems] = useState<PredecessorItem[]>([]);
  const [predecessorInSubs, setPredecessorInSubs] = useState<PredecessorItem[]>([]);
  const [isLoadingPredecessorNames, setIsLoadingPredecessorNames] =
    useState<boolean>(false);
  const [treeSelectorOpen, setTreeSelectorOpen] = useState<boolean>(false);

  // گرفتن کل درخت به‌صورت بازگشتی (ریشه + همه‌ی فرزندهای InFPP در هر عمق)
  // و ساخت نگاشت GPIC -> Name به‌صورت مسطح (flat map)
  const buildFullGpicNameMap = useCallback(
    async (programTemplateId: number): Promise<Record<string, string>> => {
      const map: Record<string, string> = {};

      const walk = async (row: ProgramDesignerRow) => {
        map[row.GPIC] = row["Activity Name"];
        if (row["Activity Type"] === "InFPP") {
          const children = await getChildRows(row.GPIC);
          for (const child of children) {
            await walk(child);
          }
        }
      };

      const rootRows = await getRootRows(programTemplateId);
      for (const row of rootRows) {
        await walk(row);
      }

      return map;
    },
    [getRootRows, getChildRows]
  );

  const loadPredecessorNames = useCallback(async () => {
    setIsLoadingPredecessorNames(true);
    try {
      const gpicNameMap = await buildFullGpicNameMap(mainProgramId);

      const itemGpics = parsePredecessorString(form.PredecessorInItem);
      const subGpics = parsePredecessorString(form.PredecessorInSub);

      setPredecessorInItems(
        itemGpics.map(
          (gpic: string): PredecessorItem => ({
            GPIC: gpic,
            Name: gpicNameMap[gpic] || gpic,
          })
        )
      );
      setPredecessorInSubs(
        subGpics.map(
          (gpic: string): PredecessorItem => ({
            GPIC: gpic,
            Name: gpicNameMap[gpic] || gpic,
          })
        )
      );
    } finally {
      setIsLoadingPredecessorNames(false);
    }
  }, [buildFullGpicNameMap, mainProgramId, form.PredecessorInItem, form.PredecessorInSub]);

  useEffect(() => {
    if (isOpen && activeTab === "predecessors") {
      loadPredecessorNames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab]);

  const handleChange = (field: keyof SinglePFI, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPredecessor = (
    node: { GPIC: string; ID: string; Name: string },
    kind: PredecessorKind
  ) => {
    if (kind === "InItem") {
      if (predecessorInItems.some((p: PredecessorItem) => p.GPIC === node.GPIC)) return;
      const updated: PredecessorItem[] = [
        ...predecessorInItems,
        { GPIC: node.GPIC, Name: node.Name },
      ];
      setPredecessorInItems(updated);
      handleChange(
        "PredecessorInItem",
        buildPredecessorString(updated.map((p: PredecessorItem) => p.GPIC))
      );
    } else {
      if (predecessorInSubs.some((p: PredecessorItem) => p.GPIC === node.GPIC)) return;
      const updated: PredecessorItem[] = [
        ...predecessorInSubs,
        { GPIC: node.GPIC, Name: node.Name },
      ];
      setPredecessorInSubs(updated);
      handleChange(
        "PredecessorInSub",
        buildPredecessorString(updated.map((p: PredecessorItem) => p.GPIC))
      );
    }
  };

  const handleRemovePredecessor = (gpic: string, kind: PredecessorKind) => {
    if (kind === "InItem") {
      const updated: PredecessorItem[] = predecessorInItems.filter(
        (p: PredecessorItem) => p.GPIC !== gpic
      );
      setPredecessorInItems(updated);
      handleChange(
        "PredecessorInItem",
        buildPredecessorString(updated.map((p: PredecessorItem) => p.GPIC))
      );
    } else {
      const updated: PredecessorItem[] = predecessorInSubs.filter(
        (p: PredecessorItem) => p.GPIC !== gpic
      );
      setPredecessorInSubs(updated);
      handleChange(
        "PredecessorInSub",
        buildPredecessorString(updated.map((p: PredecessorItem) => p.GPIC))
      );
    }
  };

  const activityTypeOptions: SelectOption[] = [
    { value: String(PFIType.TPP), label: "TPP" },
    { value: String(PFIType.FPP), label: "FPP" },
    { value: String(PFIType.Form), label: "Form" },
    { value: String(PFIType.InFPP), label: "InFPP" },
  ];

  const handleSave = async () => {
    setSaveError(null);

    if (!form.ActorId) {
      setSaveError("Must select Responsible post.");
      return;
    }
    if (!form.nWFTemplateID) {
      setSaveError("Must select Approval flow.");
      return;
    }
    if (!form.PFIType) {
      setSaveError("Must select Activity Type.");
      return;
    }
    if (form.PFIType === PFIType.Form && !form.nEntityTypeID) {
      setSaveError("For Form Mode Must select Form Name.");
      return;
    }
    if (form.PFIType === PFIType.FPP && !form.ActDuration) {
      setSaveError("Program Duration Not Allow to Zero.");
      return;
    }
    if (form.PFIType === PFIType.TPP && !form.subProgramTemplateID) {
      setSaveError("For TPP Mode Must select Program Template.");
      return;
    }

    const fullPfi: SinglePFI = {
      ID: mode === "edit" && initialData ? initialData.ID : 0,
      ...defaultsForMissingFields,
      ...form,
      GPIC: mode === "edit" ? initialData?.GPIC ?? null : null,
      ChangeMode: mode === "add" ? ChangeMode.Add : ChangeMode.Edit,
    } as SinglePFI;

    const payload = {
      parentPfiId: mode === "add" ? parentPfiId : null,
      parentGPIC: mode === "add" ? parentGPIC : initialData?.GPIC ?? null,
      mainProgramId,
      pfi: fullPfi,
    };

    setIsSaving(true);
    try {
      if (mode === "add") {
        await addOneProgramFieldTemplate(payload);
      } else {
        await updateOneProgramFieldTemplate(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setSaveError(
        err?.response?.data?.toString() || err?.message || "خطا در ذخیره‌سازی"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DynamicModal isOpen={isOpen} onClose={onClose} size="large">
      <div className="flex flex-col h-full" dir="ltr">
        <div className="flex border-b border-purple-200 mb-4">
          {(
            [
              { key: "details", label: "Details" },
              { key: "predecessors", label: "Active Predecessors" },
              { key: "conditions", label: "Conditions" },
            ] as { key: ModalTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-purple-700 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-purple-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "details" && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-2 overflow-y-auto">
            <div className="flex flex-col gap-4">
              <DynamicInput
                name="activityName"
                label="Activity Name"
                type="text"
                value={form.Name}
                onChange={(e) => handleChange("Name", e.target.value)}
              />

              <DynamicInput
                name="persianActivityName"
                label="Persian Activity Name"
                type="text"
                value={form.PersianName}
                onChange={(e) => handleChange("PersianName", e.target.value)}
              />

              <DynamicSelector
                name="responsiblePost"
                label="Responsible Post"
                options={roles}
                selectedValue={form.ActorId ?? ""}
                onChange={(e) => handleChange("ActorId", e.target.value)}
                showButton
                loading={isLoadingOptions}
              />

              <DynamicSelector
                name="approvalFlow"
                label="Approval Flow"
                options={wfTemplates}
                selectedValue={String(form.nWFTemplateID ?? "")}
                onChange={(e) =>
                  handleChange(
                    "nWFTemplateID",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                showButton
                loading={isLoadingOptions}
              />

              <DynamicInput
                name="duration"
                label="Duration"
                type="number"
                value={form.ActDuration}
                onChange={(e) =>
                  handleChange("ActDuration", Number(e.target.value))
                }
              />

              <DynamicInput
                name="lag"
                label="Lag"
                type="number"
                value={form.DelayTime}
                onChange={(e) =>
                  handleChange("DelayTime", Number(e.target.value))
                }
              />

              <DynamicSelector
                name="programType"
                label="Program Type"
                options={programTypes}
                selectedValue={String(form.nProgramTypeID ?? "")}
                onChange={(e) =>
                  handleChange(
                    "nProgramTypeID",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                showButton
                loading={isLoadingOptions}
              />

              <DynamicSelector
                name="programTemplate"
                label="Program Template"
                options={programTemplates}
                selectedValue={String(form.subProgramTemplateID ?? "")}
                onChange={(e) =>
                  handleChange(
                    "subProgramTemplateID",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                showButton
                loading={isLoadingOptions}
              />

              <DynamicSelector
                name="activityType"
                label="Activity Type"
                options={activityTypeOptions}
                selectedValue={form.PFIType ? String(form.PFIType) : ""}
                onChange={(e) =>
                  handleChange(
                    "PFIType",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />

              <DynamicSelector
                name="formName"
                label="Form Name"
                options={forms}
                selectedValue={String(form.nEntityTypeID ?? "")}
                onChange={(e) =>
                  handleChange(
                    "nEntityTypeID",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                showButton
                loading={isLoadingOptions}
              />

              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.IsInheritMetaColumns ?? true}
                    onChange={(e) =>
                      handleChange("IsInheritMetaColumns", e.target.checked)
                    }
                    className="w-4 h-4 accent-purple-600"
                  />
                  Inherit Columns
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.IsInheritMetaValues ?? true}
                    onChange={(e) =>
                      handleChange("IsInheritMetaValues", e.target.checked)
                    }
                    className="w-4 h-4 accent-purple-600"
                  />
                  Inherit Values
                </label>
              </div>

              <div className="mt-2 text-xs text-gray-400">
                [Meta Data - قدم بعدی]
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <DynamicInput
                name="activityCode"
                label="Activity Code"
                type="text"
                value={form.Code}
                onChange={(e) => handleChange("Code", e.target.value)}
              />

              <DynamicInput
                name="order"
                label="Order"
                type="number"
                value={form.Order}
                onChange={(e) =>
                  handleChange("Order", Number(e.target.value))
                }
              />

              <DynamicSelector
                name="procedure"
                label="Procedure"
                options={procedures}
                selectedValue={String(form.nEntityCollectionID ?? "")}
                onChange={(e) =>
                  handleChange(
                    "nEntityCollectionID",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                showButton
                loading={isLoadingOptions}
              />

              <DynamicInput
                name="weight"
                label="Weight"
                type="number"
                value={form.Weight}
                onChange={(e) =>
                  handleChange("Weight", Number(e.target.value))
                }
              />

              <DynamicInput
                name="address"
                label="Address"
                type="text"
                value={form.Address}
                onChange={(e) => handleChange("Address", e.target.value)}
              />

              <DynamicInput
                name="afDuration"
                label="Af Duration"
                type="number"
                value={form.SubDuration}
                onChange={(e) =>
                  handleChange("SubDuration", Number(e.target.value))
                }
              />

              <div>
                <label className="block mb-1 text-xs text-gray-600">
                  Program Duration
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="نامشخص - نیاز به بررسی"
                  className="w-full text-xs h-9 border border-gray-300 rounded px-2 bg-gray-100 text-gray-400"
                />
              </div>

              <DynamicInput
                name="approvalExecutionWeight"
                label="Approval to execution Weight (%)"
                type="number"
                value={form.WeightWF}
                onChange={(e) =>
                  handleChange("WeightWF", Number(e.target.value))
                }
              />

              <DynamicInput
                name="activityBudget"
                label="Activity Budget"
                type="number"
                value={form.PCostAct}
                onChange={(e) =>
                  handleChange("PCostAct", Number(e.target.value))
                }
              />

              <DynamicInput
                name="approvalBudget"
                label="Approval Budget"
                type="number"
                value={form.PCostAprov}
                onChange={(e) =>
                  handleChange("PCostAprov", Number(e.target.value))
                }
              />

              <DynamicInput
                name="programExecutionBudget"
                label="FProgram Execution Budget"
                type="number"
                value={form.PCostSubAct}
                onChange={(e) =>
                  handleChange("PCostSubAct", Number(e.target.value))
                }
              />

              <DynamicInput
                name="programApprovalBudget"
                label="Program Approval Budget"
                type="number"
                value={form.PCostSubAprov}
                onChange={(e) =>
                  handleChange("PCostSubAprov", Number(e.target.value))
                }
              />

              <DynamicInput
                name="programToPlanWeight"
                label="Program to plan weight (%)"
                type="number"
                value={form.WeightSubProg}
                onChange={(e) =>
                  handleChange("WeightSubProg", Number(e.target.value))
                }
              />

              <div className="mt-2">
                <label className="block mb-1 text-xs text-gray-600">
                  ProgramTemplate ID
                </label>
                <input
                  type="text"
                  value={mainProgramId}
                  disabled
                  className="w-full text-xs h-9 border border-gray-300 rounded px-2 bg-gray-100 text-gray-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "predecessors" && (
          <div className="p-2">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Planning Activity Predecessors in this program
                </h4>
                <div className="min-h-[300px] bg-blue-50 rounded p-2 space-y-2">
                  {isLoadingPredecessorNames ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                      در حال بارگذاری...
                    </div>
                  ) : predecessorInItems.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                      موردی وجود ندارد
                    </div>
                  ) : (
                    predecessorInItems.map((p: PredecessorItem) => (
                      <div
                        key={p.GPIC}
                        className="flex justify-between items-center bg-white p-2 rounded shadow-sm"
                      >
                        <span className="text-sm text-gray-700">
                          {p.Name}
                        </span>
                        <button
                          onClick={() =>
                            handleRemovePredecessor(p.GPIC, "InItem")
                          }
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Sub Program Predecessors in this program
                </h4>
                <div className="min-h-[300px] bg-blue-50 rounded p-2 space-y-2">
                  {isLoadingPredecessorNames ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                      در حال بارگذاری...
                    </div>
                  ) : predecessorInSubs.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                      موردی وجود ندارد
                    </div>
                  ) : (
                    predecessorInSubs.map((p: PredecessorItem) => (
                      <div
                        key={p.GPIC}
                        className="flex justify-between items-center bg-white p-2 rounded shadow-sm"
                      >
                        <span className="text-sm text-gray-700">
                          {p.Name}
                        </span>
                        <button
                          onClick={() =>
                            handleRemovePredecessor(p.GPIC, "InSub")
                          }
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setTreeSelectorOpen(true)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
              >
                Add Predecessor
              </button>
            </div>
          </div>
        )}

        {activeTab === "conditions" && (
          <div className="p-4 text-gray-400 text-sm">
            [تب Conditions - قدم بعدی]
          </div>
        )}

        {saveError && (
          <div className="mx-2 mb-2 px-3 py-2 bg-red-50 border border-red-300 text-red-600 text-sm rounded">
            {saveError}
          </div>
        )}

        <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-purple-100">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isSaving ? "در حال ذخیره..." : "Save"}
          </button>
        </div>
      </div>

      <TreePfiSelectorModal
        isOpen={treeSelectorOpen}
        onClose={() => setTreeSelectorOpen(false)}
        programTemplateId={mainProgramId}
        onSelect={handleAddPredecessor}
      />
    </DynamicModal>
  );
};

export default AddEditProgramField;