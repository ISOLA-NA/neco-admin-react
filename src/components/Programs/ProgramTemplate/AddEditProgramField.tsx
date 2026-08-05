// src/components/Programs/ProgramTemplate/AddEditProgramField.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import DynamicModal from "../../utilities/DynamicModal";
import DynamicInput from "../../utilities/DynamicInput";
import DynamicSelector from "../../utilities/DynamicSelector";
import ListSelector from "../../ListSelector/ListSelector";
import AddColumnForm from "../../Forms/AddForm";
import {
  SinglePFI,
  PFIType,
  ChangeMode,
  ProgramDesignerRow,
  FormCondition,
} from "../../../services/programDesigner/types";
import type { EntityField } from "../../../services/api.services";
import { useProgramDesigner } from "../../../context/ProgramDesignerContext";
import { useApi } from "../../../context/ApiContext";
import TreePfiSelectorModal, {
  PredecessorKind,
} from "./TreePfiSelectorModal";

type ModalTab = "details" | "predecessors" | "conditions";

type SelectOption = { value: string; label: string };

interface PredecessorItem {
  GPIC: string;
  ID: string;
  Name: string;
}

interface MetaFieldItem {
  ID: string;
  Name: string;
}

type ConditionOperatorValue = "and" | "or";

interface AddEditProgramFieldProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  mainProgramId: number;
  parentGPIC?: string | null;
  parentPfiId?: number | null;
  initialData?: SinglePFI | null;
  onSaved: () => void;
  /**
   * وضعیت Global بودن و پروژه‌های خودِ Program Template (سطح بالاتر).
   * فقط برای فیلتر کردن لیست Approval Flow (WFTemplate) استفاده می‌شود:
   * اگر Program Template خودش Global نباشد و پروژه داشته باشد، فقط
   * WFTemplate هایی نشان داده می‌شوند که خودشان Global باشند یا حداقل
   * یک پروژه‌ی مشترک با Program Template داشته باشند.
   */
  isProgramGlobal?: boolean;
  programProjectsStr?: string | null;
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
  metaJson: null,
  SubProgramMetaDataColumn: null,
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
};

const parsePredecessorString = (str: string | null | undefined): string[] => {
  if (!str) return [];
  return str.split("|").filter(Boolean);
};

const buildPredecessorString = (gpics: string[]): string => {
  if (gpics.length === 0) return "";
  return gpics.join("|") + "|";
};

const parseMetaColumnString = (str: string | null | undefined): string[] => {
  if (!str) return [];
  return str.split("|").filter(Boolean);
};

const buildMetaColumnString = (ids: string[]): string => {
  if (ids.length === 0) return "";
  return ids.join("|") + "|";
};

/** پارس کردن رشته‌ی "id1|id2|" به آرایه‌ی id ها (برای مقایسه‌ی پروژه‌ها) */
const parseProjectsStr = (str: string | null | undefined): string[] => {
  if (!str) return [];
  return str.split("|").filter(Boolean);
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
  isProgramGlobal = true,
  programProjectsStr = null,
}) => {
  const {
    addOneProgramFieldTemplate,
    updateOneProgramFieldTemplate,
    getRootRows,
    getChildRows,
    getSinglePFI,
  } = useProgramDesigner();
  const api = useApi();
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState<ModalTab>("details");
  const [form, setForm] = useState<Partial<SinglePFI>>(
    initialData ?? emptyForm
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ================== نمایش/عدم‌نمایش تب‌های Predecessors و Conditions ==================
  // موقع افزودن یک ردیف ریشه (+Add Row ساده، بدون parentGPIC)، این دو تب
  // معنی ندارند و نباید نشان داده شوند. در حالت ویرایش یا افزودن زیرمجموعه
  // (Add Row For InFPP، که parentGPIC دارد) این دو تب مثل قبل فعال هستند.
  const isRootAdd = mode === "add" && !parentGPIC;

  useEffect(() => {
    if (isOpen && isRootAdd) {
      setActiveTab("details");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isRootAdd]);

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

        // ✅ فیلتر تمام Entity هایی که IsGlobal + ProjectsStr دارند و در همین
        // فرم استفاده می‌شوند (WFTemplate/Approval Flow, EntityType/Form Name,
        // EntityCollection/Procedure, ProgramTemplate) بر اساس پروژه‌های
        // Program Template جاری. اگر خودِ Program Template Global باشد،
        // هیچ فیلتری اعمال نمی‌شود.
        const programProjectIds = parseProjectsStr(programProjectsStr);
        const filterByProject = <T extends { IsGlobal?: boolean; ProjectsStr?: string | null }>(
          items: T[]
        ): T[] => {
          if (isProgramGlobal) return items;
          return items.filter((item) => {
            if (item.IsGlobal) return true;
            const itemProjectIds = parseProjectsStr(item.ProjectsStr);
            return itemProjectIds.some((id) =>
              programProjectIds.includes(id)
            );
          });
        };

        const filteredWfData = filterByProject(wfData);
        const filteredFormsData = filterByProject(formsData as any[]);
        const filteredProceduresData = filterByProject(proceduresData as any[]);
        const filteredProgramTemplateData = filterByProject(
          programTemplateData as any[]
        );

        setWfTemplates(
          filteredWfData.map((w: any) => ({
            value: String(w.ID),
            label: w.Name,
          }))
        );
        setProgramTypes(
          programTypeData.map((p: any) => ({
            value: String(p.ID),
            label: p.Name,
          }))
        );
        setProgramTemplates(
          filteredProgramTemplateData.map((p: any) => ({
            value: String(p.ID),
            label: p.Name,
          }))
        );
        setForms(
          filteredFormsData.map((f: any) => ({
            value: String(f.ID),
            label: f.Name,
          }))
        );
        setProcedures(
          filteredProceduresData.map((p: any) => ({
            value: String(p.ID),
            label: p.Name,
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to load selector options:", err);
      })
      .finally(() => setIsLoadingOptions(false));
  }, [isOpen, api, isProgramGlobal, programProjectsStr]);

  // ================== تب Predecessors ==================
  const [predecessorInItems, setPredecessorInItems] = useState<PredecessorItem[]>([]);
  const [predecessorInSubs, setPredecessorInSubs] = useState<PredecessorItem[]>([]);
  const [isLoadingPredecessorNames, setIsLoadingPredecessorNames] =
    useState<boolean>(false);
  const [treeSelectorOpen, setTreeSelectorOpen] = useState<boolean>(false);

  const buildFullGpicIdNameMap = useCallback(
    async (
      programTemplateId: number
    ): Promise<Record<string, { ID: string; Name: string }>> => {
      const map: Record<string, { ID: string; Name: string }> = {};

      const walk = async (row: ProgramDesignerRow) => {
        map[row.GPIC] = { ID: row.ID, Name: row["Activity Name"] };
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
      const gpicMap = await buildFullGpicIdNameMap(mainProgramId);

      const itemGpics = parsePredecessorString(form.PredecessorInItem);
      const subGpics = parsePredecessorString(form.PredecessorInSub);

      setPredecessorInItems(
        itemGpics.map(
          (gpic: string): PredecessorItem => ({
            GPIC: gpic,
            ID: gpicMap[gpic]?.ID ?? "",
            Name: gpicMap[gpic]?.Name || "آیتم حذف‌شده / نامعتبر",
          })
        )
      );
      setPredecessorInSubs(
        subGpics.map(
          (gpic: string): PredecessorItem => ({
            GPIC: gpic,
            ID: gpicMap[gpic]?.ID ?? "",
            Name: gpicMap[gpic]?.Name || "آیتم حذف‌شده / نامعتبر",
          })
        )
      );
    } finally {
      setIsLoadingPredecessorNames(false);
    }
  }, [
    buildFullGpicIdNameMap,
    mainProgramId,
    form.PredecessorInItem,
    form.PredecessorInSub,
  ]);

  useEffect(() => {
    if (isOpen) {
      loadPredecessorNames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ================== تب Conditions ==================
  const [conditionOperator, setConditionOperator] =
    useState<ConditionOperatorValue>("and");
  const [conditionOperatorInForms, setConditionOperatorInForms] =
    useState<ConditionOperatorValue>("and");
  const [approvalStatusTexts, setApprovalStatusTexts] = useState<string[]>(
    []
  );

  // ---- Form Conditions (شرط بر اساس فیلد فرم یک Predecessor) ----
  const [formConditions, setFormConditions] = useState<FormCondition[]>([]);
  const [isAddingFormCondition, setIsAddingFormCondition] = useState(false);
  const [conditionPredecessorId, setConditionPredecessorId] =
    useState<string>("");
  const [conditionEntityTypeId, setConditionEntityTypeId] = useState<
    number | null
  >(null);
  const [conditionEntityFields, setConditionEntityFields] = useState<
    EntityField[]
  >([]);
  const [isLoadingConditionFields, setIsLoadingConditionFields] =
    useState(false);
  const [conditionFieldId, setConditionFieldId] = useState<string>("");
  const [conditionValueText, setConditionValueText] = useState<string>("");
  // کش کامل فیلدهای هر Form/EntityType (نه فقط اسم یک فیلد) تا هر ردیف
  // بتواند یک Field Selector واقعی و قابل ویرایش داشته باشد.
  const [entityFieldsByEntityType, setEntityFieldsByEntityType] = useState<
    Record<number, EntityField[]>
  >({});
  const [loadingEntityTypeIds, setLoadingEntityTypeIds] = useState<
    Set<number>
  >(new Set());

  useEffect(() => {
    if (!isOpen) return;
    if (form.metaJson) {
      try {
        const parsed = JSON.parse(form.metaJson);
        setConditionOperator(
          parsed.ConditionOperator === "or" ? "or" : "and"
        );
        setConditionOperatorInForms(
          parsed.ConditionOperatorInForms === "or" ? "or" : "and"
        );
        setApprovalStatusTexts(parsed.ApprovalStatusTexts || []);
        setFormConditions(parsed.FormFieldsAndValues || []);
      } catch (e) {
        console.error("Failed to parse metaJson:", e);
      }
    } else {
      setConditionOperator("and");
      setConditionOperatorInForms("and");
      setApprovalStatusTexts([]);
      setFormConditions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // برای هر entityTypeId موجود در شرط‌های فرمی، لیست کامل فیلدهای آن فرم را
  // می‌گیریم تا در خودِ ردیف بتوان Field را دوباره از Selector انتخاب/تغییر داد.
  useEffect(() => {
    if (!isOpen || formConditions.length === 0) return;
    const neededIds = Array.from(
      new Set(formConditions.map((fc) => fc.entityTypeId))
    ).filter(
      (id) => !(id in entityFieldsByEntityType) && !loadingEntityTypeIds.has(id)
    );
    if (neededIds.length === 0) return;

    setLoadingEntityTypeIds((prev) => new Set([...prev, ...neededIds]));

    Promise.all(
      neededIds.map((id) =>
        api
          .getEntityFieldByEntityTypeId(id)
          .then((fields: EntityField[]) => ({ id, fields }))
          .catch(() => ({ id, fields: [] as EntityField[] }))
      )
    ).then((results) => {
      setEntityFieldsByEntityType((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          next[r.id] = r.fields;
        });
        return next;
      });
      setLoadingEntityTypeIds((prev) => {
        const next = new Set(prev);
        results.forEach((r) => next.delete(r.id));
        return next;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formConditions]);

  // ================== Meta Data (تب Details) ==================
  // متادیتا: فیلدهایی از فرم انتخاب‌شده (nEntityTypeID) که قراره به‌عنوان
  // ستون‌های کلیدی به زیرمجموعه‌ها (Inherit Columns/Values) منتقل شوند.
  const [metaValues, setMetaValues] = useState<MetaFieldItem[]>([]);
  const [selectedMetaIds, setSelectedMetaIds] = useState<string[]>([]);
  const [loadingMeta, setLoadingMeta] = useState<boolean>(false);

  // مقداردهی اولیه‌ی selectedMetaIds/metaValues از روی form.SubProgramMetaDataColumn
  useEffect(() => {
    if (!isOpen) return;

    if (!form.SubProgramMetaDataColumn) {
      setSelectedMetaIds([]);
      setMetaValues([]);
      return;
    }

    const ids = parseMetaColumnString(form.SubProgramMetaDataColumn);
    setSelectedMetaIds(ids);
    setLoadingMeta(true);

    Promise.all(
      ids.map((id) =>
        api
          .getEntityFieldById(Number(id))
          .then((res: any) => ({
            ID: String(res.ID),
            Name: res.DisplayName || res.Name || "",
          }))
          .catch((err: any) => {
            console.error("Error fetching meta field for ID:", id, err);
            return null;
          })
      )
    )
      .then((arr) => {
        const ok = (arr.filter(Boolean) || []) as MetaFieldItem[];
        setMetaValues(ok);
      })
      .finally(() => setLoadingMeta(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  // همگام‌سازی selectedMetaIds با form.SubProgramMetaDataColumn
  useEffect(() => {
    handleChange(
      "SubProgramMetaDataColumn",
      selectedMetaIds.length ? buildMetaColumnString(selectedMetaIds) : ""
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMetaIds]);

  const handleChange = (field: keyof SinglePFI, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPredecessor = (
    node: { GPIC: string; ID: string; Name: string },
    kind: PredecessorKind
  ) => {
    if (kind === "InItem") {
      if (
        predecessorInItems.some(
          (p: PredecessorItem) => p.GPIC === node.GPIC
        )
      )
        return;
      const updated: PredecessorItem[] = [
        ...predecessorInItems,
        { GPIC: node.GPIC, ID: node.ID, Name: node.Name },
      ];
      setPredecessorInItems(updated);
      handleChange(
        "PredecessorInItem",
        buildPredecessorString(updated.map((p: PredecessorItem) => p.GPIC))
      );
    } else {
      if (
        predecessorInSubs.some((p: PredecessorItem) => p.GPIC === node.GPIC)
      )
        return;
      const updated: PredecessorItem[] = [
        ...predecessorInSubs,
        { GPIC: node.GPIC, ID: node.ID, Name: node.Name },
      ];
      setPredecessorInSubs(updated);
      handleChange(
        "PredecessorInSub",
        buildPredecessorString(updated.map((p: PredecessorItem) => p.GPIC))
      );
    }
  };

  // ================== Form Conditions helpers ==================
  const combinedPredecessorOptions: SelectOption[] = [
    ...predecessorInItems,
    ...predecessorInSubs,
  ]
    .filter((p) => p.ID)
    .map((p) => ({ value: p.ID, label: p.Name }));

  const getPredecessorNameById = (id: number): string => {
    const found = [...predecessorInItems, ...predecessorInSubs].find(
      (p) => String(p.ID) === String(id)
    );
    return found?.Name || `#${id}`;
  };

  const handleSelectConditionPredecessor = async (
    predecessorIdStr: string
  ) => {
    setConditionPredecessorId(predecessorIdStr);
    setConditionFieldId("");
    setConditionEntityFields([]);
    setConditionEntityTypeId(null);

    if (!predecessorIdStr) return;

    setIsLoadingConditionFields(true);
    try {
      const pfi = await getSinglePFI(Number(predecessorIdStr));
      const entityTypeId = pfi.nEntityTypeID;
      setConditionEntityTypeId(entityTypeId ?? null);

      if (entityTypeId) {
        const fields = await api.getEntityFieldByEntityTypeId(entityTypeId);
        setConditionEntityFields(fields);
      } else {
        setConditionEntityFields([]);
      }
    } catch (err) {
      console.error("Failed to load predecessor form fields:", err);
      setConditionEntityFields([]);
    } finally {
      setIsLoadingConditionFields(false);
    }
  };

  const resetFormConditionMiniForm = () => {
    setIsAddingFormCondition(false);
    setConditionPredecessorId("");
    setConditionFieldId("");
    setConditionValueText("");
    setConditionEntityFields([]);
    setConditionEntityTypeId(null);
  };

  const handleAddFormCondition = () => {
    if (!conditionPredecessorId || !conditionFieldId || !conditionEntityTypeId)
      return;

    const newCondition: FormCondition = {
      FieldID: Number(conditionFieldId),
      ValueText: conditionValueText,
      entityTypeId: conditionEntityTypeId,
      predecessorId: Number(conditionPredecessorId),
    };
    setFormConditions((prev) => [...prev, newCondition]);

    // فیلدهایی که همین الان برای مینی‌فرم گرفتیم را در کش هم قرار می‌دهیم
    // تا نیازی به fetch دوباره برای نمایش/ویرایش این ردیف نباشد.
    setEntityFieldsByEntityType((prev) =>
      prev[conditionEntityTypeId]
        ? prev
        : { ...prev, [conditionEntityTypeId]: conditionEntityFields }
    );

    resetFormConditionMiniForm();
  };

  const handleRemoveFormCondition = (index: number) => {
    setFormConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateFormConditionField = (
    index: number,
    fieldIdStr: string
  ) => {
    setFormConditions((prev) =>
      prev.map((fc, i) =>
        i === index ? { ...fc, FieldID: Number(fieldIdStr) } : fc
      )
    );
  };

  const handleUpdateFormConditionValue = (index: number, value: string) => {
    setFormConditions((prev) =>
      prev.map((fc, i) => (i === index ? { ...fc, ValueText: value } : fc))
    );
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
      setSaveError(t("AddEditProgramField.Validation.MustSelectResponsiblePost"));
      return;
    }
    if (!form.nWFTemplateID) {
      setSaveError(t("AddEditProgramField.Validation.MustSelectApprovalFlow"));
      return;
    }
    if (!form.PFIType) {
      setSaveError(t("AddEditProgramField.Validation.MustSelectActivityType"));
      return;
    }
    if (form.PFIType === PFIType.Form && !form.nEntityTypeID) {
      setSaveError(t("AddEditProgramField.Validation.MustSelectFormName"));
      return;
    }
    if (form.PFIType === PFIType.FPP && !form.ActDuration) {
      setSaveError(t("AddEditProgramField.Validation.ProgramDurationNotZero"));
      return;
    }
    if (form.PFIType === PFIType.TPP && !form.subProgramTemplateID) {
      setSaveError(t("AddEditProgramField.Validation.MustSelectProgramTemplate"));
      return;
    }

    const conditionsPayload = {
      ConditionOperator: conditionOperator,
      ConditionOperatorInForms: conditionOperatorInForms,
      ApprovalStatusTexts: approvalStatusTexts.filter(
        (text) => text.trim() !== ""
      ),
      FormFieldsAndValues: formConditions,
    };

    const fullPfi: SinglePFI = {
      ID: mode === "edit" && initialData ? initialData.ID : 0,
      ...defaultsForMissingFields,
      ...form,
      GPIC: mode === "edit" ? initialData?.GPIC ?? null : null,
      ChangeMode: mode === "add" ? ChangeMode.Add : ChangeMode.Edit,
      metaJson: JSON.stringify(conditionsPayload),
    } as SinglePFI;

    const payload = {
      parentPfiId: mode === "add" ? parentPfiId : null,
      parentGPIC: parentGPIC,
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
        err?.response?.data?.toString() ||
          err?.message ||
          t("AddEditProgramField.Validation.SaveError")
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DynamicModal isOpen={isOpen} onClose={onClose} size="large">
      <div className="flex flex-col h-full" dir={i18n.dir()}>
        <div className="flex border-b border-purple-200 mb-4">
          {(
            [
              { key: "details", label: t("AddEditProgramField.Tabs.Details") },
              {
                key: "predecessors",
                label: t("AddEditProgramField.Tabs.ActivePredecessors"),
              },
              {
                key: "conditions",
                label: t("AddEditProgramField.Tabs.Conditions"),
              },
            ] as { key: ModalTab; label: string }[]
          )
            .filter((tab) => !isRootAdd || tab.key === "details")
            .map((tab) => (
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
                label={t("AddEditProgramField.ActivityName")}
                type="text"
                value={form.Name}
                onChange={(e) => handleChange("Name", e.target.value)}
              />

              <DynamicInput
                name="persianActivityName"
                label={t("AddEditProgramField.PersianActivityName")}
                type="text"
                value={form.PersianName}
                onChange={(e) => handleChange("PersianName", e.target.value)}
              />

              <DynamicSelector
                name="responsiblePost"
                label={t("AddEditProgramField.ResponsiblePost")}
                options={roles}
                selectedValue={form.ActorId ?? ""}
                onChange={(e) => handleChange("ActorId", e.target.value)}
                showButton
                loading={isLoadingOptions}
              />

              <DynamicSelector
                name="approvalFlow"
                label={t("AddEditProgramField.ApprovalFlow")}
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
                label={t("AddEditProgramField.Duration")}
                type="number"
                value={form.ActDuration}
                onChange={(e) =>
                  handleChange("ActDuration", Number(e.target.value))
                }
              />

              <DynamicInput
                name="lag"
                label={t("AddEditProgramField.Lag")}
                type="number"
                value={form.DelayTime}
                onChange={(e) =>
                  handleChange("DelayTime", Number(e.target.value))
                }
              />

              <DynamicSelector
                name="programType"
                label={t("AddEditProgramField.ProgramType")}
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
                label={t("AddEditProgramField.ProgramTemplate")}
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
                label={t("AddEditProgramField.ActivityType")}
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
                label={t("AddEditProgramField.FormName")}
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
                  {t("AddEditProgramField.InheritColumns")}
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
                  {t("AddEditProgramField.InheritValues")}
                </label>
              </div>

              <div className="mt-2 rounded-md">
                <ListSelector
                  title={t("AddEditProgramField.MetaData")}
                  columnDefs={[{ field: "Name", headerName: "Name" }]}
                  rowData={metaValues.map((m) => ({
                    ID: String(m.ID),
                    Name: m.Name,
                  }))}
                  selectedIds={selectedMetaIds}
                  onSelectionChange={(ids) =>
                    setSelectedMetaIds(ids.map(String))
                  }
                  showSwitcher={false}
                  isGlobal={false}
                  loading={loadingMeta}
                  ModalContentComponent={AddColumnForm}
                  modalContentProps={{
                    onSave: (newField: { ID: number; Name: string }) => {
                      if (!newField) return;
                      const id = String(newField.ID);
                      setSelectedMetaIds((prev) =>
                        prev.includes(id) ? prev : [...prev, id]
                      );
                      setMetaValues((prev) =>
                        prev.find((m) => m.ID === id)
                          ? prev
                          : [...prev, { ID: id, Name: newField.Name }]
                      );
                    },
                    entityTypeId: form.nEntityTypeID
                      ? String(form.nEntityTypeID)
                      : undefined,
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <DynamicInput
                name="activityCode"
                label={t("AddEditProgramField.ActivityCode")}
                type="text"
                value={form.Code}
                onChange={(e) => handleChange("Code", e.target.value)}
              />

              <DynamicInput
                name="order"
                label={t("AddEditProgramField.Order")}
                type="number"
                value={form.Order}
                onChange={(e) =>
                  handleChange("Order", Number(e.target.value))
                }
              />

              <DynamicSelector
                name="procedure"
                label={t("AddEditProgramField.Procedure")}
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
                label={t("AddEditProgramField.Weight")}
                type="number"
                value={form.Weight}
                onChange={(e) =>
                  handleChange("Weight", Number(e.target.value))
                }
              />

              <DynamicInput
                name="address"
                label={t("AddEditProgramField.Address")}
                type="text"
                value={form.Address}
                onChange={(e) => handleChange("Address", e.target.value)}
              />

              {/*
                ⚠️ اصلاح مهم (کشف‌شده با تست Import/Export و فیدلر):
                فیلد form.SubDuration در واقع معادل "Program Duration" است
                (سقف مجاز Duration فرزندهای این InFPP)، نه "Af Duration".
                قبلاً این دو لیبل برعکس/اشتباه گذاشته شده بودند.
              */}
              <DynamicInput
                name="programDuration"
                label={t("AddEditProgramField.ProgramDuration")}
                type="number"
                value={form.SubDuration}
                onChange={(e) =>
                  handleChange("SubDuration", Number(e.target.value))
                }
              />

              <div>
                <label className="block mb-1 text-xs text-gray-600">
                  {t("AddEditProgramField.AfDuration")}
                </label>
                <input
                  type="text"
                  disabled
                  placeholder={t(
                    "AddEditProgramField.ProgramDurationPlaceholder"
                  )}
                  className="w-full text-xs h-9 border border-gray-300 rounded px-2 bg-gray-100 text-gray-400"
                />
              </div>

              <DynamicInput
                name="approvalExecutionWeight"
                label={t("AddEditProgramField.ApprovalExecutionWeight")}
                type="number"
                value={form.WeightWF}
                onChange={(e) =>
                  handleChange("WeightWF", Number(e.target.value))
                }
              />

              <DynamicInput
                name="activityBudget"
                label={t("AddEditProgramField.ActivityBudget")}
                type="number"
                value={form.PCostAct}
                onChange={(e) =>
                  handleChange("PCostAct", Number(e.target.value))
                }
              />

              <DynamicInput
                name="approvalBudget"
                label={t("AddEditProgramField.ApprovalBudget")}
                type="number"
                value={form.PCostAprov}
                onChange={(e) =>
                  handleChange("PCostAprov", Number(e.target.value))
                }
              />

              <DynamicInput
                name="programExecutionBudget"
                label={t("AddEditProgramField.ProgramExecutionBudget")}
                type="number"
                value={form.PCostSubAct}
                onChange={(e) =>
                  handleChange("PCostSubAct", Number(e.target.value))
                }
              />

              <DynamicInput
                name="programApprovalBudget"
                label={t("AddEditProgramField.ProgramApprovalBudget")}
                type="number"
                value={form.PCostSubAprov}
                onChange={(e) =>
                  handleChange("PCostSubAprov", Number(e.target.value))
                }
              />

              <DynamicInput
                name="programToPlanWeight"
                label={t("AddEditProgramField.ProgramToPlanWeight")}
                type="number"
                value={form.WeightSubProg}
                onChange={(e) =>
                  handleChange("WeightSubProg", Number(e.target.value))
                }
              />

              <div className="mt-2">
                <label className="block mb-1 text-xs text-gray-600">
                  {t("AddEditProgramField.ProgramTemplateIdLabel")}
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
                  {t(
                    "AddEditProgramField.Predecessors.PlanningActivityPredecessors"
                  )}
                </h4>
                <div className="min-h-[300px] bg-blue-50 rounded p-2 space-y-2">
                  {isLoadingPredecessorNames ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                      {t("AddEditProgramField.Loading")}
                    </div>
                  ) : predecessorInItems.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                      {t("AddEditProgramField.NoItemsFound")}
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
                  {t(
                    "AddEditProgramField.Predecessors.SubProgramPredecessors"
                  )}
                </h4>
                <div className="min-h-[300px] bg-blue-50 rounded p-2 space-y-2">
                  {isLoadingPredecessorNames ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                      {t("AddEditProgramField.Loading")}
                    </div>
                  ) : predecessorInSubs.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                      {t("AddEditProgramField.NoItemsFound")}
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
                {t("AddEditProgramField.Predecessors.AddPredecessor")}
              </button>
            </div>
          </div>
        )}

        {activeTab === "conditions" && (
          <div className="p-2">
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                {t("AddEditProgramField.Conditions.BetweenTwoTypesMustBe")}
              </p>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="conditionOperator"
                    checked={conditionOperator === "and"}
                    onChange={() => setConditionOperator("and")}
                    className="accent-purple-600"
                  />
                  {t("AddEditProgramField.Conditions.And")}
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="conditionOperator"
                    checked={conditionOperator === "or"}
                    onChange={() => setConditionOperator("or")}
                    className="accent-purple-600"
                  />
                  {t("AddEditProgramField.Conditions.Or")}
                </label>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                {t("AddEditProgramField.Conditions.BetweenFormsMustBe")}
              </p>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="conditionOperatorInForms"
                    checked={conditionOperatorInForms === "and"}
                    onChange={() => setConditionOperatorInForms("and")}
                    className="accent-purple-600"
                  />
                  {t("AddEditProgramField.Conditions.And")}
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="conditionOperatorInForms"
                    checked={conditionOperatorInForms === "or"}
                    onChange={() => setConditionOperatorInForms("or")}
                    className="accent-purple-600"
                  />
                  {t("AddEditProgramField.Conditions.Or")}
                </label>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {approvalStatusTexts.map((text, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-blue-50 p-2 rounded"
                >
                  <span className="text-sm text-gray-700 flex-1">
                    {t("AddEditProgramField.Conditions.IfStatusTextEqualTo")}
                  </span>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => {
                      const updated = [...approvalStatusTexts];
                      updated[idx] = e.target.value;
                      setApprovalStatusTexts(updated);
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1 w-40"
                  />
                  <span className="text-sm text-gray-700">
                    {t("AddEditProgramField.Conditions.ThenExecuteThisItem")}
                  </span>
                  <button
                    onClick={() => {
                      setApprovalStatusTexts(
                        approvalStatusTexts.filter((_, i) => i !== idx)
                      );
                    }}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mb-6">
              <button
                onClick={() =>
                  setApprovalStatusTexts([...approvalStatusTexts, ""])
                }
                className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
              >
                {t("AddEditProgramField.Conditions.AddApprovalCondition")}
              </button>
            </div>

            {/* ================== Form Conditions ================== */}
            <div className="border-t border-purple-100 pt-4">
              <p className="text-sm text-gray-700 mb-2 font-medium">
                {t("AddEditProgramField.Conditions.FormFieldConditionsTitle")}
              </p>

              <div className="space-y-2 mb-4">
                {formConditions.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-2">
                    {t("AddEditProgramField.NoItemsFound")}
                  </div>
                ) : (
                  formConditions.map((fc, idx) => {
                    const fields = entityFieldsByEntityType[fc.entityTypeId] || [];
                    const isLoadingThisRow = loadingEntityTypeIds.has(
                      fc.entityTypeId
                    );
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 flex-wrap bg-blue-50 p-2 rounded"
                      >
                        <span className="text-xs text-purple-600 font-semibold shrink-0">
                          [{getPredecessorNameById(fc.predecessorId)}]
                        </span>
                        <span className="text-sm text-gray-700 shrink-0">
                          {t("AddEditProgramField.Conditions.IfValueOfField")}
                        </span>
                        <select
                          value={fc.FieldID}
                          onChange={(e) =>
                            handleUpdateFormConditionField(
                              idx,
                              e.target.value
                            )
                          }
                          disabled={isLoadingThisRow}
                          className="text-xs border border-gray-300 rounded px-2 py-1 min-w-[140px] bg-white disabled:opacity-50"
                        >
                          {isLoadingThisRow && (
                            <option>{t("AddEditProgramField.Loading")}</option>
                          )}
                          {fields.map((f) => (
                            <option key={f.ID} value={f.ID}>
                              {f.DisplayName}
                            </option>
                          ))}
                        </select>
                        <span className="text-sm text-gray-700 shrink-0">
                          {t("AddEditProgramField.Conditions.IsEqualTo")}
                        </span>
                        <input
                          type="text"
                          value={fc.ValueText}
                          onChange={(e) =>
                            handleUpdateFormConditionValue(
                              idx,
                              e.target.value
                            )
                          }
                          className="text-xs border border-gray-300 rounded px-2 py-1 w-32"
                        />
                        <span className="text-sm text-gray-700 shrink-0">
                          {t("AddEditProgramField.Conditions.ThenExecuteThisItem")}
                        </span>
                        <button
                          onClick={() => handleRemoveFormCondition(idx)}
                          className="text-red-500 hover:text-red-700 text-xs ms-auto"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {isAddingFormCondition ? (
                <div className="border border-purple-200 rounded p-3 space-y-3 bg-white">
                  <DynamicSelector
                    name="conditionPredecessor"
                    label={t("AddEditProgramField.Conditions.PredecessorLabel")}
                    options={combinedPredecessorOptions}
                    selectedValue={conditionPredecessorId}
                    onChange={(e) =>
                      handleSelectConditionPredecessor(e.target.value)
                    }
                  />

                  <DynamicSelector
                    name="conditionField"
                    label={t("AddEditProgramField.Conditions.FieldLabel")}
                    options={conditionEntityFields.map((f) => ({
                      value: String(f.ID),
                      label: f.DisplayName,
                    }))}
                    selectedValue={conditionFieldId}
                    onChange={(e) => setConditionFieldId(e.target.value)}
                    loading={isLoadingConditionFields}
                  />

                  <DynamicInput
                    name="conditionValueText"
                    label={t("AddEditProgramField.Conditions.ValueLabel")}
                    type="text"
                    value={conditionValueText}
                    onChange={(e) => setConditionValueText(e.target.value)}
                  />

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={resetFormConditionMiniForm}
                      className="px-4 py-1.5 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                    >
                      {t("AddEditProgramField.Conditions.Cancel")}
                    </button>
                    <button
                      onClick={handleAddFormCondition}
                      disabled={!conditionPredecessorId || !conditionFieldId}
                      className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("AddEditProgramField.Conditions.Confirm")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsAddingFormCondition(true)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
                  >
                    {t("AddEditProgramField.Conditions.AddFormCondition")}
                  </button>
                </div>
              )}
            </div>
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
            {t("AddEditProgramField.Cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isSaving ? t("AddEditProgramField.Loading") : t("AddEditProgramField.Save")}
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